import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import React from "react";
import { addNotification, removeNotificationByHotelId, setNotifications } from "../redux/notificationSlice";
import { CustomerNotificationService } from "../services/customerNotification.service";
import { VendorNotificationService } from "../services/vendorNotification.service";

interface RootState {
  auth: {
    user: {
      id: string;
      role: "user" | "vendor" | "admin";
    } | null;
    accessToken: string | null;
  };
}

export const useSocket = () => {
  const { user, accessToken } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Connect if the user is authenticated 
    if (!accessToken || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Fetch persistent notifications from the backend
    if (user.role === "user") {
      CustomerNotificationService.fetchNotifications()
        .then((notifications) => {
          // Normalize to match frontend structure if needed (ensure dates are numbers, etc.)
          const normalized = notifications.map(n => ({
            id: n.id,
            title: n.title,
            body: n.body,
            link: n.link,
            hotelId: n.hotelId || "system",
            vendorId: n.vendorId || "system",
            read: n.read,
            createdAt: new Date(n.createdAt).getTime()
          }));
          dispatch(setNotifications(normalized));
        })
        .catch((err) => console.error("Failed to fetch initial notifications:", err));
    } else if (user.role === "vendor") {
      VendorNotificationService.fetchNotifications()
        .then((notifications) => {
          const normalized = notifications.map(n => ({
            id: n.id,
            title: n.title,
            body: n.body,
            link: n.link,
            hotelId: n.hotelId || "system",
            vendorId: n.vendorId || "system",
            read: n.read,
            createdAt: new Date(n.createdAt).getTime()
          }));
          dispatch(setNotifications(normalized));
        })
        .catch((err) => console.error("Failed to fetch vendor notifications:", err));
    }

    // Connect to the Socket.io server
    // We use the full URL to ensure it hits the backend correctly during dev and prod
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://127.0.0.1:5000";

    const savedLocation = localStorage.getItem("customerLocation");
    const location = savedLocation ? JSON.parse(savedLocation) : null;

    const socket = io(SOCKET_URL, {
      auth: {
        token: accessToken,
        latitude: location?.latitude,
        longitude: location?.longitude
      },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to WebSockets for live alerts!");
      
      // Request permission for native browser push notifications
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
      }
    });

    // Listen for the "new_order" push notification (Vendor Side)
    socket.on("new_order", (data: { id?: string; title: string; body: string; link: string; orderId: string }) => {
      // Dispatch action to save notification
      dispatch(addNotification({
        id: data.id,
        title: data.title,
        body: data.body,
        link: "", // Removed redirection link
        hotelId: "system",
        vendorId: "system",
      }));

      // Show native browser push notification if permitted
      if ("Notification" in window && Notification.permission === "granted") {
        const notification = new Notification(data.title, {
          body: data.body,
          icon: "/favicon.ico", 
        });

        // Removed onclick redirection
        notification.onclick = () => {
          window.focus();
        };
      }
      
      // Show a toast notification
      toast.success(
        React.createElement("div", { className: "flex flex-col gap-1" },
          React.createElement("h4", { className: "font-bold text-gray-900" }, data.title),
          React.createElement("p", { className: "text-sm text-gray-600" }, data.body)
          // Removed View Order anchor tag
        ),
        {
          id: data.orderId, // Prevent duplicate toast
          duration: 10000,
          position: "top-right",
        }
      );
    });

    // Listen for the "business_live" push notification
    socket.on("business_live", (data: { title: string; body: string; link: string; hotelId: string; vendorId: string }) => {
      
      // Dispatch action to save notification
      dispatch(addNotification(data));

      // Show native browser push notification if permitted
      if ("Notification" in window && Notification.permission === "granted") {
        const notification = new Notification(data.title, {
          body: data.body,
          icon: "/favicon.ico", // Replace with your app's actual icon if different
        });

        // Optional: click native notification to focus window/navigate
        notification.onclick = () => {
          window.focus();
          window.location.href = data.link;
        };
      }
      // Show a toast notification
      toast.success(
        React.createElement("div", { className: "flex flex-col gap-1" },
          React.createElement("h4", { className: "font-bold text-gray-900" }, data.title),
          React.createElement("p", { className: "text-sm text-gray-600" }, data.body),
          React.createElement("a", {
            href: data.link,
            className: "mt-2 inline-block rounded-md bg-green-700 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-green-600 w-fit"
          }, "Order Now!")
        ),
        {
          id: data.hotelId, // Prevent duplicate toast
          duration: 10000,
          position: "top-center",
        }
      );
    });

   //triggr by backend cronjob
    socket.on("broadcast_notification", (data: { id?: string; title: string; body: string; link?: string; type?: string; targetRole?: string; createdAt?: string }) => {
      // Filter out notifications not meant for this user's role
      const expectedRole = user.role === "user" ? "customer" : user.role;
      if (data.targetRole && data.targetRole !== "all" && data.targetRole !== expectedRole && data.targetRole !== user.role) {
        return;
      }

      const linkUrl = data.link || "/home";
      dispatch(addNotification({
        title: data.title,
        body: data.body,
        link: user.role === "vendor" ? "" : linkUrl,
        hotelId: "system",
        vendorId: "system",
      }));

      if ("Notification" in window && Notification.permission === "granted") {
        const notification = new Notification(data.title, {
          body: data.body,
          icon: "/favicon.ico",
        });
        notification.onclick = () => {
          window.focus();
          if (user.role !== "vendor") {
            window.location.href = linkUrl;
          }
        };
      }

      toast.success(
        React.createElement("div", { className: "flex flex-col gap-1" },
          React.createElement("h4", { className: "font-bold text-gray-900" }, data.title),
          React.createElement("p", { className: "text-sm text-gray-600" }, data.body),
          user.role !== "vendor" ? React.createElement("a", {
            href: linkUrl,
            className: "mt-2 inline-block rounded-md bg-green-700 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-green-600 w-fit"
          }, "View Food Deals 🍕") : null
        ),
        { 
          id: data.id || data.title, // Prevent duplicate toast
          duration: 8000 
        }
      );
    });

    
    socket.on("business_live_ended", (data: { hotelId: string; vendorId: string }) => {
      dispatch(removeNotificationByHotelId(data.hotelId));
    });

    return () => {
      socket.off("connect");
      socket.off("new_order");
      socket.off("business_live");
      socket.off("broadcast_notification");
      socket.off("business_live_ended");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken, user, dispatch]);

};
