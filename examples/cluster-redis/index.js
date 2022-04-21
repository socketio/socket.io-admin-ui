import cluster from "cluster";
import { Server } from "socket.io";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";
import { instrument } from "../../dist/index.js";

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  cluster.fork({ port: 3000 });
  cluster.fork({ port: 3001 });
  cluster.fork({ port: 3002 });
  cluster.fork({ port: 3003 });
} else {
  console.log(`Worker ${process.pid} started`);

  const port = parseInt(process.env.port, 10);
  const io = new Server({
    cors: {
      origin: ["https://admin.socket.io", "http://localhost:8080"],
      credentials: true,
    },
  });

  const pubClient = createClient({ host: "localhost", port: 6379 });
  const subClient = pubClient.duplicate();

  Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
    io.adapter(createAdapter(pubClient, subClient));

    io.listen(port);

    instrument(io, {
      auth: false,
      serverId: `app${port}`,
    });
  });
}
