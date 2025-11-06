import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const mensagens = await prisma.message.findMany({
      where: { room: { not: "" } }, 
      orderBy: { createdAt: "asc" },
    });
    return new Response(JSON.stringify(mensagens), { status: 200 });
  } catch (err) {
    console.error("Erro GET /api/messages:", err);
    return new Response(JSON.stringify({ error: "Erro ao carregar mensagens" }), { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userName, text, room } = await req.json();
    if (!userName || !text) {
      return new Response(JSON.stringify({ error: "Dados incompletos" }), { status: 400 });
    }

    const newMessage = await prisma.message.create({
      data: {
        userName,
        text,
        room: room || "general",
      },
    });

    return new Response(JSON.stringify(newMessage), { status: 201 });
  } catch (err) {
    console.error("Erro POST /api/messages:", err);
    return new Response(JSON.stringify({ error: "Erro ao criar mensagem" }), { status: 500 });
  }
}
