import { io, Socket } from "socket.io-client";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

export const socket: Socket = io(BACKEND_URL, {
  path: "/socket.io",
  autoConnect: true,
});

export default socket;
