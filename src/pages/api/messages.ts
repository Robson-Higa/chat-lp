import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const mensagens = await prisma.message.findMany({
        where: { room: { not: "" } }, // ✅ evita mensagens inválidas
        orderBy: { createdAt: "asc" },
      });
      return res.status(200).json(mensagens);
    } catch (err) {
      console.error("Erro GET /api/messages:", err);
      return res.status(500).json({ error: "Erro ao carregar mensagens" });
    }
  }

  if (req.method === "POST") {
    try {
      const { userName, text, room } = req.body;

      if (!text || !userName || !room) {
        return res.status(400).json({ error: "Dados incompletos" });
      }

      const newMessage = await prisma.message.create({
        data: { userName, text, room },
      });

      return res.status(201).json(newMessage);
    } catch (err) {
      console.error("Erro POST /api/messages:", err);
      return res.status(500).json({ error: "Erro ao criar mensagem" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
