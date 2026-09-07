import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { Logger } from "../utils/logger";

// We use an in-memory map to store the mapping between userId and socketId
const userSocketMap = new Map<string, string>();

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

            const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as { id: string, role: string };
            socket.data.userId = decoded.id;
            socket.data.role = decoded.role;
            next();
        } catch (error) {
            return next(new Error("Authentication error: Invalid token"));
        }
    });

    io.on("connection", (socket: Socket) => {
        const userId = socket.data.userId;
        Logger.info(`User connected to socket: ${userId} with socketId: ${socket.id}`);
        
        // Store the mapping
        userSocketMap.set(userId, socket.id);

        socket.on("disconnect", () => {
            Logger.info(`User disconnected from socket: ${userId}`);
            userSocketMap.delete(userId);
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

// Helper to get socket ID for a specific user
export const getUserSocketId = (userId: string): string | undefined => {
    return userSocketMap.get(userId);
};
