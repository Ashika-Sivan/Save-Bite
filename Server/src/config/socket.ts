import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { User } from "../models/user/user.model";
import { Logger } from "../utils/logger";
import { redisClient } from "./redis";

let io: Server;

export const initSocket = (httpServer: HttpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map(url => url.trim()) : ["http://localhost:5173", "http://localhost:3000"],
            credentials: true
        }
    });

    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth.token || socket.handshake.query.token;
            
            if (!token) {
                return next(new Error("Authentication error: Token missing"));
            }

            const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as { userId: string, role: string };
            socket.data.userId = decoded.userId;
            socket.data.role = decoded.role;
            socket.data.latitude = socket.handshake.auth.latitude;
            socket.data.longitude = socket.handshake.auth.longitude;
            next();
        } catch (error) {
            return next(new Error("Authentication error: Invalid token"));
        }
    });

    io.on("connection", async (socket: Socket) => {
        const userId = socket.data.userId;
        Logger.info(`User connected to socket: ${userId} with socketId: ${socket.id}`);
        
        try {
            // Store the mapping in Redis for 24 hours
            await redisClient.getClient().setEx(`socket:${userId}`, 86400, socket.id);
            
            // Update user location if provided
            if (socket.data.latitude !== undefined && socket.data.longitude !== undefined) {
                await User.findByIdAndUpdate(userId, {
                    location: {
                        type: "Point",
                        coordinates: [Number(socket.data.longitude), Number(socket.data.latitude)]
                    }
                });
                Logger.info(`Updated location for user ${userId}`);
            }
        } catch (err) {
            Logger.error("Error setting socket data:", err);
        }

        socket.on("disconnect", async () => {
            Logger.info(`User disconnected from socket: ${userId}`);
            try {
                await redisClient.getClient().del(`socket:${userId}`);
            } catch (err) {
                Logger.error("Redis Error deleting socket:", err);
            }
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io has not been initialized!");
    }
    return io;
};

// Helper to get socket ID for a specific user from Redis
export const getUserSocketId = async (userId: string): Promise<string | undefined> => {
    try {
        const socketId = await redisClient.getClient().get(`socket:${userId}`);
        return socketId || undefined;
    } catch (err) {
        Logger.error("Redis Error getting socket:", err);
        return undefined;
    }
};
