import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";

let io: SocketIOServer | null = null;

export function initializeSocket(httpServer: HTTPServer) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // 客戶端加入電視端房間
    socket.on("join-display", () => {
      socket.join("display");
      console.log(`[Socket.IO] Client ${socket.id} joined display room`);
    });

    // 客戶端加入管理端房間
    socket.on("join-admin", () => {
      socket.join("admin");
      console.log(`[Socket.IO] Client ${socket.id} joined admin room`);
    });

    socket.on("disconnect", () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
}

/**
 * 發送商品更新事件到電視端
 */
export function emitProductUpdate(eventType: "create" | "update" | "delete", productData: any) {
  if (!io) return;
  io.to("display").emit("product-update", {
    eventType,
    data: productData,
    timestamp: new Date().toISOString(),
  });
}

/**
 * 發送版面配置更新事件到電視端
 */
export function emitLayoutUpdate(layoutData: any) {
  if (!io) return;
  io.to("display").emit("layout-update", {
    data: layoutData,
    timestamp: new Date().toISOString(),
  });
}

/**
 * 發送跑馬燈更新事件到電視端
 */
export function emitMarqueeUpdate(marqueeData: any) {
  if (!io) return;
  io.to("display").emit("marquee-update", {
    data: marqueeData,
    timestamp: new Date().toISOString(),
  });
}

/**
 * 發送標籤更新事件到電視端
 */
export function emitTagUpdate(eventType: "create" | "update" | "delete", tagData: any) {
  if (!io) return;
  io.to("display").emit("tag-update", {
    eventType,
    data: tagData,
    timestamp: new Date().toISOString(),
  });
}

/**
 * 發送自定義欄位更新事件到電視端
 */
export function emitCustomFieldUpdate(eventType: "create" | "update" | "delete", fieldData: any) {
  if (!io) return;
  io.to("display").emit("custom-field-update", {
    eventType,
    data: fieldData,
    timestamp: new Date().toISOString(),
  });
}
