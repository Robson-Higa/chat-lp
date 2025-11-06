import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import { compare } from "bcryptjs";

// Criamos o handler NextAuth
const authHandler = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const client = await clientPromise;
        const users = client.db().collection("users");

        const user = await users.findOne({ email: credentials.email });
        if (!user) throw new Error("Usuário não encontrado");

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) throw new Error("Senha incorreta");

        return { id: user._id.toString(), name: user.name, email: user.email };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) session.user.id = token.id as string;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

// 🔹 Export obrigatório para App Router
export const GET = authHandler;
export const POST = authHandler;
