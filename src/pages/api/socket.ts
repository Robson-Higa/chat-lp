import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";
import { PrismaClient } from "@prisma/client";
import { NextApiResponseServerIO } from "../../types/next";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  if (!res.socket.server.io) {
    console.log("🔌 Iniciando Socket.IO");

    const io = new ServerIO(res.socket.server as any, {
      path: "/api/socket_io",
      addTrailingSlash: false,
    });

    io.on("connection", async (socket) => {
      console.log("🟢 Novo cliente conectado:", socket.id);

      // Envia histórico de mensagens
      try {
        const mensagens = await prisma.message.findMany({
          orderBy: { createdAt: "asc" },
        });
        socket.emit("mensagensAnteriores", mensagens);
        console.log(`📨 Enviadas ${mensagens.length} mensagens históricas`);
      } catch (err) {
        console.error("Erro ao buscar mensagens:", err);
      }

      // Entrar em uma sala
      socket.on("joinRoom", (room: string) => {
        socket.join(room);
        console.log(`Socket ${socket.id} entrou na sala ${room}`);
      });

      // Receber mensagem em sala específica
      socket.on(
        "sendMessage",
        async (msg: { userName: string; text: string; room: string }) => {
          try {
            const nova = await prisma.message.create({ data: msg });
            io.to(msg.room).emit("newMessage", nova);
            console.log("Mensagem enviada:", nova);
          } catch (err) {
            console.error("Erro ao criar mensagem:", err);
          }
        }
      );

      socket.on("disconnect", () => {
        console.log("🔴 Cliente desconectado:", socket.id);
      });
    });

    console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("DATABASE_URL:", process.env.DATABASE_URL);


    res.socket.server.io = io;
  }

  res.end();
}
