"use client";

import { useEffect, useState, useRef } from "react";
import io, { Socket } from "socket.io-client";

type Message = {
  id: string;
  userName: string;
  text: string;
  createdAt: string;
};

export default function ChatPage() {
  const [userName, setUserName] = useState("");
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch("/api/socket");
    const socket = io({ path: "/api/socket_io" });
    socketRef.current = socket;

    socket.on("mensagensAnteriores", (msgs: Message[]) => setMessages(msgs));
    socket.on("chegouMensagemNova", (msg: Message) =>
      setMessages((prev) => [...prev, msg])
    );

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const enviarMensagem = () => {
    if (!userName.trim() || !text.trim()) return;
    socketRef.current?.emit("novaMensagem", { userName, text });
    setText("");
  };

  return (
    <main style={{ padding: 20, maxWidth: 600, margin: "auto" }}>
      <h1>💬 Chat em Tempo Real</h1>
      <input
        type="text"
        placeholder="Seu nome"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />
      <div
        style={{
          border: "1px solid #ccc",
          padding: 10,
          height: 300,
          overflowY: "auto",
          marginBottom: 10,
        }}
      >
        {messages.map((m) => (
          <div key={m.id}>
            <strong>{m.userName}:</strong> {m.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <input
        type="text"
        placeholder="Digite a mensagem..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && enviarMensagem()}
        style={{ width: "80%", marginRight: 10 }}
      />
      <button onClick={enviarMensagem}>Enviar</button>
    </main>
  );
}
