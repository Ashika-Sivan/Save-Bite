import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import React from "react";
import { addNotification, removeNotificationByHotelId } from "../redux/notificationSlice";

// The shape of the Redux state
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
    // Only connect if the user is a logged-in customer
    if (!accessToken || !user || user.role !== "user") {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
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
          duration: 10000,
          position: "top-center",
        }
      );
    });

   //triggr by backend cronjob
    socket.on("broadcast_notification", (data: { id?: string; title: string; body: string; link?: string; type?: string; createdAt?: string }) => {
      const linkUrl = data.link || "/home";
      dispatch(addNotification({
        title: data.title,
        body: data.body,
        link: linkUrl,
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
          window.location.href = linkUrl;
        };
      }

      toast.success(
        React.createElement("div", { className: "flex flex-col gap-1" },
          React.createElement("h4", { className: "font-bold text-gray-900" }, data.title),
          React.createElement("p", { className: "text-sm text-gray-600" }, data.body),
          React.createElement("a", {
            href: linkUrl,
            className: "mt-2 inline-block rounded-md bg-green-700 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-green-600 w-fit"
          }, "View Food Deals 🍕")
        ),
        { duration: 8000 }
      );
    });

    // Listen for the "business_live_ended" push notification
    socket.on("business_live_ended", (data: { hotelId: string; vendorId: string }) => {
      // Remove all notifications and the live badge for this hotel
      dispatch(removeNotificationByHotelId(data.hotelId));
    });

    // Cleanup on unmount or when token changes
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken, user]);

  // eslint-disable-next-line
  return socketRef.current;
};
