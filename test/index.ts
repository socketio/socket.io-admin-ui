import { createServer } from "http";
import { Server } from "socket.io";
import { Server as ServerV3 } from "socket.io-v3";
import { io as ioc } from "socket.io-client";
import { AddressInfo } from "net";
import { instrument } from "../lib";
import expect = require("expect.js");

const waitFor = (emitter: any, event: string): Promise<any> => {
  return new Promise((resolve) => {
    emitter.once(event, (...args: any[]) => {
      resolve(args.length === 1 ? args[0] : args);
    });
  });
};

const sleep = (duration: number) =>
  new Promise((resolve) => setTimeout(resolve, duration));

describe("Socket.IO Admin (server instrumentation)", () => {
  (
    [
      ["v4", Server],
      ["v3", ServerV3],
    ] as [string, typeof Server][]
  ).forEach(([version, ServerConstructor]) => {
    describe(`Socket.IO ${version}`, () => {
      let port: number, io: Server;

      beforeEach((done) => {
        const httpServer = createServer();
        io = new ServerConstructor(httpServer);

        httpServer.listen(() => {
          port = (httpServer.address() as AddressInfo).port;
          done();
        });
      });

      afterEach(() => {
        io.close();
      });

      it("creates an admin namespace", (done) => {
        instrument(io, {
          auth: false,
        });

        const adminSocket = ioc(`http://localhost:${port}/admin`);

        adminSocket.on("connect", () => {
          adminSocket.disconnect();
          done();
        });
      });

      it("creates an admin namespace with custom name", (done) => {
        instrument(io, {
          auth: false,
          namespaceName: "/custom",
        });

        const adminSocket = ioc(`http://localhost:${port}/custom`);

        adminSocket.on("connect", () => {
          adminSocket.disconnect();
          done();
        });
      });

      it("should work with io.listen()", () => {
        const io = new Server();

        instrument(io, {
          auth: false,
        });

        io.listen(0);
        io.close();
      });

      describe("authentication", () => {
        it("prevents anonymous connection", (done) => {
          instrument(io, {
            auth: {
              type: "basic",
              username: "admin",
              password:
                "$2b$10$nu1FHRkuxkZkqID.31gz4uQsyERZAn.m4IIruysTsHDODBtrqS5Me", // "changeit"
            },
          });

          const adminSocket = ioc(`http://localhost:${port}/admin`);

          adminSocket.on("connect", () => {
            done(new Error("should not happen"));
          });

          adminSocket.on("connect_error", (err: any) => {
            expect(err.message).to.eql("invalid credentials");
            adminSocket.disconnect();
            done();
          });
        });

        it("allows connection with valid credentials", (done) => {
          instrument(io, {
            auth: {
              type: "basic",
              username: "admin",
              password:
                "$2b$10$nu1FHRkuxkZkqID.31gz4uQsyERZAn.m4IIruysTsHDODBtrqS5Me", // "changeit"
            },
          });

          const adminSocket = ioc(`http://localhost:${port}/admin`, {
            auth: {
              username: "admin",
              password: "changeit",
            },
          });

          adminSocket.on("connect", () => {
            adminSocket.disconnect();
            done();
          });
        });

        it("allows connection with a valid session ID", (done) => {
          instrument(io, {
            auth: {
              type: "basic",
              username: "admin",
              password:
                "$2b$10$nu1FHRkuxkZkqID.31gz4uQsyERZAn.m4IIruysTsHDODBtrqS5Me", // "changeit"
            },
          });

          const adminSocket = ioc(`http://localhost:${port}/admin`, {
            reconnectionDelay: 100,
            auth: {
              username: "admin",
              password: "changeit",
            },
          });

          adminSocket.on("session", (sessionId) => {
            adminSocket.auth = {
              sessionId,
            };
            adminSocket.on("connect", () => {
              adminSocket.disconnect();
              done();
            });
            adminSocket.disconnect().connect();
          });
        });

        it("prevents connection with an invalid session ID", (done) => {
          instrument(io, {
            auth: {
              type: "basic",
              username: "admin",
              password:
                "$2b$10$nu1FHRkuxkZkqID.31gz4uQsyERZAn.m4IIruysTsHDODBtrqS5Me", // "changeit"
            },
          });

          const adminSocket = ioc(`http://localhost:${port}/admin`, {
            auth: {
              sessionId: "1234",
            },
          });

          adminSocket.on("connect", () => {
            done(new Error("should not happen"));
          });

          adminSocket.on("connect_error", (err: any) => {
            expect(err.message).to.eql("invalid credentials");
            adminSocket.disconnect();
            done();
          });
        });
      });

      it("returns the list of supported features", (done) => {
        instrument(io, {
          auth: false,
        });

        const adminSocket = ioc(`http://localhost:${port}/admin`);

        adminSocket.on("config", (config: any) => {
          if (version === "v4") {
            expect(config.supportedFeatures).to.eql([
              "EMIT",
              "JOIN",
              "LEAVE",
              "DISCONNECT",
              "MJOIN",
              "MLEAVE",
              "MDISCONNECT",
              "AGGREGATED_EVENTS",
              "ALL_EVENTS",
            ]);
          } else {
            expect(config.supportedFeatures).to.eql([
              "EMIT",
              "JOIN",
              "LEAVE",
              "DISCONNECT",
              "AGGREGATED_EVENTS",
              "ALL_EVENTS",
            ]);
          }
          adminSocket.disconnect();
          done();
        });
      });

      it("returns an empty list of supported features when in readonly mode", (done) => {
        instrument(io, {
          auth: false,
          readonly: true,
        });

        const adminSocket = ioc(`http://localhost:${port}/admin`);

        adminSocket.on("config", (config: any) => {
          expect(config.supportedFeatures).to.eql([
            "AGGREGATED_EVENTS",
            "ALL_EVENTS",
          ]);
          adminSocket.disconnect();
          done();
        });
      });

      it("returns an empty list of supported features when in production mode", (done) => {
        instrument(io, {
          auth: false,
          readonly: true,
          mode: "production",
        });

        const adminSocket = ioc(`http://localhost:${port}/admin`);

        adminSocket.on("config", (config: any) => {
          expect(config.supportedFeatures).to.eql(["AGGREGATED_EVENTS"]);
          adminSocket.disconnect();
          done();
        });
      });

      it("returns the list of all sockets upon connection", async () => {
        instrument(io, {
          auth: false,
          readonly: true,
        });

        const clientSocket = ioc(`http://localhost:${port}`);
        await waitFor(clientSocket, "connect");

        const adminSocket = ioc(`http://localhost:${port}/admin`, {
          forceNew: true,
        });

        const sockets = await waitFor(adminSocket, "all_sockets");
        expect(sockets.length).to.eql(2);
        sockets.forEach((socket: any) => {
          if (socket.nsp === "/") {
            expect(socket.id).to.eql(clientSocket.id);
          } else {
            expect(socket.id).to.eql(adminSocket.id);
            expect(socket.nsp).to.eql("/admin");
          }
        });

        clientSocket.disconnect();
        adminSocket.disconnect();

        // FIXME without this, the process does not exit properly (?)
        await sleep(100);
      });

      it("emits administrative events", async () => {
        instrument(io, {
          auth: false,
        });

        const adminSocket = ioc(`http://localhost:${port}/admin`);

        await waitFor(adminSocket, "connect");

        const clientSocket = ioc(`http://localhost:${port}`, {
          forceNew: true,
        });

        // connect
        const serverSocket = await waitFor(io, "connection");
        const [socket] = await waitFor(adminSocket, "socket_connected");

        expect(socket.id).to.eql(serverSocket.id);
        expect(socket.nsp).to.eql("/");
        expect(socket.handshake).to.eql({
          address: serverSocket.handshake.address,
          headers: serverSocket.handshake.headers,
          query: serverSocket.handshake.query,
          issued: serverSocket.handshake.issued,
          secure: serverSocket.handshake.secure,
          time: serverSocket.handshake.time,
          url: serverSocket.handshake.url,
          xdomain: serverSocket.handshake.xdomain,
        });
        expect(socket.rooms).to.eql([...serverSocket.rooms]);

        // join
        serverSocket.join("room1");
        const [nsp, room, id] = await waitFor(adminSocket, "room_joined");

        expect(nsp).to.eql("/");
        expect(room).to.eql("room1");
        expect(id).to.eql(socket.id);

        // leave
        serverSocket.leave("room1");
        const [nsp2, room2, id2] = await waitFor(adminSocket, "room_left");

        expect(nsp2).to.eql("/");
        expect(room2).to.eql("room1");
        expect(id2).to.eql(socket.id);

        // disconnect
        serverSocket.disconnect();
        const [nsp3, id3] = await waitFor(adminSocket, "socket_disconnected");

        expect(nsp3).to.eql("/");
        expect(id3).to.eql(socket.id);

        adminSocket.disconnect();
      });

      it("emits event when socket.data is updated", async () => {
        instrument(io, {
          auth: false,
        });

        const adminSocket = ioc(`http://localhost:${port}/admin`);

        await waitFor(adminSocket, "connect");

        const clientSocket = ioc(`http://localhost:${port}`, {
          forceNew: true,
          transports: ["polling"],
        });

        io.use((socket, next) => {
          socket.data = socket.data || {};
          socket.data.count = 1;
          socket.data.array = [1];
          next();
        });

        const serverSocket = await waitFor(io, "connection");

        const [socket] = await waitFor(adminSocket, "socket_connected");
        expect(socket.data).to.eql({ count: 1, array: [1] });

        serverSocket.data.count++;

        const updatedSocket1 = await waitFor(adminSocket, "socket_updated");
        expect(updatedSocket1.data).to.eql({ count: 2, array: [1] });

        serverSocket.data.array.push(2);

        const updatedSocket2 = await waitFor(adminSocket, "socket_updated");
        expect(updatedSocket2.data).to.eql({ count: 2, array: [1, 2] });

        adminSocket.disconnect();
        clientSocket.disconnect();
      });

      it("performs administrative tasks", async () => {
        instrument(io, {
          auth: false,
        });

        const adminSocket = ioc(`http://localhost:${port}/admin`);
        await waitFor(adminSocket, "connect");

        const clientSocket = ioc(`http://localhost:${port}`, {
          forceNew: true,
        });

        const serverSocket = await waitFor(io, "connection");
        await waitFor(adminSocket, "room_joined");

        // emit
        adminSocket.emit("emit", "/", serverSocket.id, "hello", "world");
        const value = await waitFor(clientSocket, "hello");
        expect(value).to.eql("world");

        // join
        adminSocket.emit("join", "/", "room1", serverSocket.id);
        await waitFor(adminSocket, "room_joined");
        expect(serverSocket.rooms.has("room1")).to.eql(true);

        // leave
        adminSocket.emit("leave", "/", "room1", serverSocket.id);
        await waitFor(adminSocket, "room_left");
        expect(serverSocket.rooms.has("room1")).to.eql(false);

        // disconnect
        adminSocket.emit("_disconnect", "/", false, serverSocket.id);
        await waitFor(clientSocket, "disconnect");

        adminSocket.disconnect();
      });

      it("supports dynamic namespaces", async function () {
        // requires `socket.io>=4.1.0` with the "new_namespace" event
        if (version === "v3") {
          return this.skip();
        }
        instrument(io, {
          auth: false,
        });

        io.of(/\/dynamic-\d+/);

        const adminSocket = ioc(`http://localhost:${port}/admin`);
        await waitFor(adminSocket, "connect");

        const clientSocket = ioc(`http://localhost:${port}/dynamic-101`, {
          forceNew: true,
        });

        const [socket] = await waitFor(adminSocket, "socket_connected");

        expect(socket.nsp).to.eql("/dynamic-101");
        clientSocket.disconnect();
        adminSocket.disconnect();
      });
    });
  });
});
