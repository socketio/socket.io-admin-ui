import { Server } from "socket.io";
import { instrument } from "../../dist/index.js";

const io = new Server(3000, {
  cors: {
    origin: ["https://admin.socket.io", "http://localhost:8080"],
    credentials: true,
  },
});

instrument(io, {
  auth: false,
});
