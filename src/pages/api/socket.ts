import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";
import { PrismaClient } from "@prisma/client";
import { NextApiResponseServerIO } from "../../types/next"; // criaremos este tipo
const prisma = new PrismaClient();
export default async function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
// Se já existir, apenas encerra a rota (Socket já inicializado)
if (!res.socket.server.io) {
console.log("Iniciando Socket.IO");
const io = new ServerIO(res.socket.server as any, {
path: "/api/socket_io",
addTrailingSlash: false,
});
io.on("connection", async (socket) => {
console.log("Novo cliente conectado!");
// Enviar mensagens anteriores
const mensagens = await prisma.message.findMany({
orderBy: { createdAt: "asc" },
});
socket.emit("mensagensAnteriores", mensagens);
// Receber nova mensagem e salvar
socket.on("novaMensagem", async (msg) => {
const nova = await prisma.message.create({ data: msg });
io.emit("chegouMensagemNova", nova);
});
});
res.socket.server.io = io;
}
res.end();
}