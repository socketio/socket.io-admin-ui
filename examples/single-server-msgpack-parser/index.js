import { Server } from "socket.io";
import { instrument } from "../../dist/index.js";
import parser from "socket.io-msgpack-parser";

const io = new Server(3000, {
  cors: {
    origin: ["https://admin.socket.io", "http://localhost:8080"],
    credentials: true,
  },
  parser,
});

instrument(io, {
  auth: false,
});
