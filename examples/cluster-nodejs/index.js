import cluster from "cluster";
import { createServer } from "http";
import { setupMaster, setupWorker } from "@socket.io/sticky";
import { createAdapter, setupPrimary } from "@socket.io/cluster-adapter";
import { Server } from "socket.io";
import { instrument } from "../../dist/index.js";
import { cpus } from "os";

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  const httpServer = createServer();

  setupMaster(httpServer, {
    loadBalancingMethod: "least-connection",
  });

  setupPrimary();

  httpServer.listen(3000);

  for (let i = 0; i < cpus().length; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  console.log(`Worker ${process.pid} started`);

  const httpServer = createServer();

  const io = new Server(httpServer, {
    cors: {
      origin: ["https://admin.socket.io", "http://localhost:8080"],
      credentials: true,
    },
  });

  io.adapter(createAdapter());
  setupWorker(io);

  instrument(io, {
    auth: false,
  });
}
