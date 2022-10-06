import { Server } from "socket.io";
import { createServer } from "http";
import { AddressInfo } from "net";
import { instrument } from "../lib";
import { io as ioc } from "socket.io-client";
import expect = require("expect.js");
import { createPartialDone } from "./util";

describe("events", () => {
  let port: number, io: Server;

  beforeEach((done) => {
    const httpServer = createServer();
    io = new Server(httpServer);

    httpServer.listen(() => {
      port = (httpServer.address() as AddressInfo).port;
      done();
    });
  });

  afterEach(() => {
    io.close();
  });

  it("should track events sent to the client", (done) => {
    instrument(io, {
      auth: false,
    });

    const adminSocket = ioc(`http://localhost:${port}/admin`);
    const clientSocket = ioc(`http://localhost:${port}`, {
      forceNew: true,
    });

    const partialDone = createPartialDone(2, () => {
      adminSocket.disconnect();
      clientSocket.disconnect();
      done();
    });

    io.on("connection", (socket) => {
      socket.emit("hello", 1, "2", Buffer.from([3]));
    });

    clientSocket.on("hello", partialDone);

    adminSocket.on("event_sent", (arg1, arg2, arg3, arg4) => {
      expect(arg1).to.eql("/");
      expect(arg2).to.eql(clientSocket.id);
      expect(arg3).to.eql(["hello", 1, "2", Buffer.from([3])]);
      expect(new Date(arg4).toISOString()).to.eql(arg4);

      partialDone();
    });
  });

  it("should track events sent to the client (with ack)", (done) => {
    instrument(io, {
      auth: false,
    });

    const adminSocket = ioc(`http://localhost:${port}/admin`);
    const clientSocket = ioc(`http://localhost:${port}`, {
      forceNew: true,
    });

    const partialDone = createPartialDone(2, () => {
      adminSocket.disconnect();
      clientSocket.disconnect();
      done();
    });

    io.on("connection", (socket) => {
      socket.emit("hello", (arg: string) => {
        expect(arg).to.eql("world");

        partialDone();
      });
    });

    clientSocket.on("hello", (cb) => {
      cb("world");
    });

    adminSocket.on("event_sent", (arg1, arg2, arg3, arg4) => {
      expect(arg1).to.eql("/");
      expect(arg2).to.eql(clientSocket.id);
      expect(arg3).to.eql(["hello"]);
      expect(new Date(arg4).toISOString()).to.eql(arg4);

      partialDone();
    });
  });

  it("should track events received from the client", (done) => {
    instrument(io, {
      auth: false,
    });

    const adminSocket = ioc(`http://localhost:${port}/admin`);
    const clientSocket = ioc(`http://localhost:${port}`, {
      forceNew: true,
    });

    const partialDone = createPartialDone(2, () => {
      adminSocket.disconnect();
      clientSocket.disconnect();
      done();
    });

    io.on("connection", (socket) => {
      socket.on("hello", partialDone);
    });

    adminSocket.on("event_received", (arg1, arg2, arg3, arg4) => {
      expect(arg1).to.eql("/");
      expect(arg2).to.eql(clientSocket.id);
      expect(arg3).to.eql(["hello", 1, "2", Buffer.from([3])]);
      expect(new Date(arg4).toISOString()).to.eql(arg4);

      partialDone();
    });

    clientSocket.emit("hello", 1, "2", Buffer.from([3]));
  });

  it("should track events received from the client (with ack)", (done) => {
    instrument(io, {
      auth: false,
    });

    const adminSocket = ioc(`http://localhost:${port}/admin`);
    const clientSocket = ioc(`http://localhost:${port}`, {
      forceNew: true,
    });

    const partialDone = createPartialDone(2, () => {
      adminSocket.disconnect();
      clientSocket.disconnect();
      done();
    });

    io.on("connection", (socket) => {
      socket.on("hello", (arg, cb) => {
        expect(arg).to.eql("world");

        cb("123");
      });
    });

    adminSocket.on("event_received", (arg1, arg2, arg3, arg4) => {
      expect(arg1).to.eql("/");
      expect(arg2).to.eql(clientSocket.id);
      expect(arg3).to.eql(["hello", "world"]);
      expect(new Date(arg4).toISOString()).to.eql(arg4);

      partialDone();
    });

    clientSocket.emit("hello", "world", (arg: string) => {
      expect(arg).to.eql("123");

      partialDone();
    });
  });
});
