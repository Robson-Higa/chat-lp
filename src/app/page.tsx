"use client";

import { useEffect, useState, useRef } from "react";

type Message = {
  id: string;
  userName: string;
  text: string;
  room: string;
  createdAt: string;
};

export default function ChatPage() {
  const [userName, setUserName] = useState("");
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const room = "general";

  const fetchMessages = async () => {
    const res = await fetch("/api/messages");
    const data = await res.json();
    setMessages(data);
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 2000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const enviarMensagem = async () => {
    if (!userName.trim() || !text.trim()) return;
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName, text, room }),
    });
    setText("");
    fetchMessages();
  };

  return (
    <main style={{ padding: 20, maxWidth: 600, margin: "auto" }}>
      <h1>💬 Chat Fullstack</h1>

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
