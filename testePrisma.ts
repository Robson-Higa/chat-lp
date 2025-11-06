import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const messages = await prisma.message.findMany();
  console.log(messages);
}

main().catch(console.error);
