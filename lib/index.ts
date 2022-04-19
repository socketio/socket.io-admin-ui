import { Namespace, RemoteSocket, Server, Socket } from "socket.io";
import {
  ClientEvents,
  Feature,
  SerializedSocket,
  ServerEvents,
} from "./typed-events";
import debugModule from "debug";
import { compare, getRounds } from "bcrypt";
import { isWorker } from "cluster";
import { InMemoryStore, Store } from "./stores";
import os = require("os");
import { randomBytes } from "crypto";

const debug = debugModule("socket.io-admin");
const randomId = () => randomBytes(8).toString("hex");

interface BasicAuthentication {
  type: "basic";
  username: string;
  password: string;
}

interface InstrumentOptions {
  /**
   * The name of the admin namespace
   *
   * @default "/admin"
   */
  namespaceName: string;
  /**
   * The authentication method
   */
  auth?: false | BasicAuthentication;
  /**
   * Whether updates are allowed
   * @default false
   */
  readonly: boolean;
  /**
   * The unique ID of the server
   * @default `require("os").hostname()`
   */
  serverId?: string;
  /**
   * The store
   */
  store: Store;
}

const initAuthenticationMiddleware = (
  namespace: Namespace<ClientEvents, ServerEvents>,
  options: InstrumentOptions
) => {
  if (options.auth === undefined) {
    throw new Error(
      "the `auth` option must be specified or explicitly set to `false`"
    );
  }

  if (options.auth === false) {
    debug("WARN: authentication is disabled, please use with caution");
  } else if (options.auth?.type === "basic") {
    debug("basic authentication is enabled");
    const basicAuth = options.auth as BasicAuthentication;

    try {
      getRounds(basicAuth.password);
    } catch (e) {
      throw new Error("the `password` field must be a valid bcrypt hash");
    }

    namespace.use(async (socket, next) => {
      const sessionId = socket.handshake.auth.sessionId;
      if (sessionId && (await options.store.doesSessionExist(sessionId))) {
        debug("authentication success with valid session ID");
        return next();
      }

      if (socket.handshake.auth.username === basicAuth.username) {
        const isMatching = await compare(
          socket.handshake.auth.password,
          basicAuth.password
        );
        if (isMatching) {
          debug("authentication success with valid credentials");

          const sessionId = randomId();
          options.store.saveSession(sessionId);
          socket.emit("session", sessionId);

          return next();
        }
      }
      debug("invalid credentials");
      next(new Error("invalid credentials"));
    });
  } else {
    throw new Error("invalid `auth` option, please check the documentation");
  }
};

const computeServerId = (serverId: string | undefined) => {
  if (serverId) {
    return serverId;
  } else if (isWorker) {
    return `${os.hostname()}#${process.pid}`;
  } else {
    return os.hostname();
  }
};

const initStatsEmitter = (
  adminNamespace: Namespace<{}, ServerEvents>,
  serverId: string | undefined
) => {
  const baseStats = {
    serverId: computeServerId(serverId),
    hostname: os.hostname(),
    pid: process.pid,
  };

  const emitStats = () => {
    debug("emit stats");
    // @ts-ignore private reference
    const clientsCount = adminNamespace.server.engine.clientsCount;

    adminNamespace.emit(
      "server_stats",
      Object.assign({}, baseStats, {
        uptime: process.uptime(),
        clientsCount,
      })
    );
  };

  const interval = setInterval(emitStats, 2000);
  interval.unref(); // so that the timer does not prevent the process from exiting
  emitStats();
};

const detectSupportedFeatures = (io: Server): Feature[] => {
  const supportedFeatures = [
    Feature.EMIT,
    Feature.JOIN,
    Feature.LEAVE,
    Feature.DISCONNECT,
  ];
  // added in Socket.IO v4.0.0
  if (typeof io.socketsJoin === "function") {
    supportedFeatures.push(Feature.MJOIN);
  }
  if (typeof io.socketsLeave === "function") {
    supportedFeatures.push(Feature.MLEAVE);
  }
  if (typeof io.disconnectSockets === "function") {
    supportedFeatures.push(Feature.MDISCONNECT);
  }
  return supportedFeatures;
};

const fetchAllSockets = async (io: Server): Promise<SerializedSocket[]> => {
  if (typeof io.fetchSockets === "function") {
    // Socket.IO v4
    const promises: Promise<SerializedSocket[]>[] = [];
    io._nsps.forEach((nsp) => {
      const promise = nsp.fetchSockets().then((sockets) => {
        return sockets.map((socket) => {
          return serialize(socket, nsp.name);
        });
      });
      promises.push(promise);
    });
    return (await Promise.all(promises)).reduce((acc, sockets) => {
      acc.push(...sockets);
      return acc;
    }, []);
  } else {
    // Socket.IO v3
    // Note: we only fetch local Socket instances, so this will not work with multiple Socket.IO servers
    const sockets: SerializedSocket[] = [];
    io._nsps.forEach((nsp) => {
      nsp.sockets.forEach((socket) => {
        sockets.push(serialize(socket, socket.nsp.name));
      });
    });
    return sockets;
  }
};

const registerFeatureHandlers = (
  io: Server,
  socket: Socket<ClientEvents, ServerEvents>,
  supportedFeatures: Feature[]
) => {
  if (supportedFeatures.includes(Feature.EMIT)) {
    socket.on("emit", (nsp, filter, ev, ...args) => {
      debug(
        `emit ${ev} to all socket instances in namespace ${nsp} and room ${filter}`
      );
      if (filter) {
        io.of(nsp)
          .in(filter)
          .emit(ev, ...args);
      } else {
        io.of(nsp).emit(ev, ...args);
      }
    });
  }

  if (supportedFeatures.includes(Feature.JOIN)) {
    if (typeof io.socketsJoin === "function") {
      // Socket.IO v4
      socket.on("join", (nsp, room, filter) => {
        if (filter) {
          debug(
            `make all socket instances in namespace ${nsp} and room ${filter} join room ${room}`
          );
          io.of(nsp).in(filter).socketsJoin(room);
        } else {
          debug(
            `make all socket instances in namespace ${nsp} join room ${room}`
          );
          io.of(nsp).socketsJoin(room);
        }
      });
    } else {
      // Socket.IO v3
      socket.on("join", (nsp, room, id) => {
        if (id) {
          debug(
            `make socket instance ${id} in namespace ${nsp} join room ${room}`
          );
          const socket = io.of(nsp).sockets.get(id);
          socket?.join(room);
        }
      });
    }
  }

  if (supportedFeatures.includes(Feature.LEAVE)) {
    if (typeof io.socketsLeave === "function") {
      // Socket.IO v4
      socket.on("leave", (nsp, room, filter) => {
        if (filter) {
          debug(
            `make all socket instances in namespace ${nsp} and room ${filter} leave room ${room}`
          );
          io.of(nsp).in(filter).socketsLeave(room);
        } else {
          debug(
            `make all socket instances in namespace ${nsp} leave room ${room}`
          );
          io.of(nsp).socketsLeave(room);
        }
      });
    } else {
      // Socket.IO v3
      socket.on("leave", (nsp, room, id) => {
        if (id) {
          debug(
            `make socket instance ${id} in namespace ${nsp} leave room ${room}`
          );
          const socket = io.of(nsp).sockets.get(id);
          socket?.leave(room);
        }
      });
    }
  }

  if (supportedFeatures.includes(Feature.DISCONNECT)) {
    if (typeof io.disconnectSockets === "function") {
      // Socket.IO v4
      socket.on("_disconnect", (nsp, close, filter) => {
        if (filter) {
          debug(
            `make all socket instances in namespace ${nsp} and room ${filter} disconnect`
          );
          io.of(nsp).in(filter).disconnectSockets(close);
        } else {
          debug(`make all socket instances in namespace ${nsp} disconnect`);
          io.of(nsp).disconnectSockets(close);
        }
      });
    } else {
      // Socket.IO v3
      socket.on("_disconnect", (nsp, close, id) => {
        if (id) {
          debug(`make socket instance ${id} in namespace ${nsp} disconnect`);
          const socket = io.of(nsp).sockets.get(id);
          socket?.disconnect(close);
        }
      });
    }
  }
};

const registerListeners = (
  adminNamespace: Namespace<{}, ServerEvents>,
  nsp: Namespace
) => {
  nsp.prependListener("connection", (socket) => {
    // @ts-ignore
    const clientId = socket.client.id;

    const createProxy = (obj: any) => {
      if (typeof obj !== "object") {
        return obj;
      }
      return new Proxy(obj, {
        set(target: any, p: string | symbol, value: any): boolean {
          target[p] = createProxy(value);

          adminNamespace.emit("socket_updated", {
            id: socket.id,
            nsp: nsp.name,
            data: serializeData(socket.data),
          });
          return true;
        },
      });
    };

    socket.data = createProxy({
      _admin: {
        clientId: clientId.substring(0, 12), // this information is quite sensitive
        transport: socket.conn.transport.name,
      },
    });

    adminNamespace.emit("socket_connected", serialize(socket, nsp.name));

    socket.conn.on("upgrade", (transport: any) => {
      socket.data._admin.transport = transport.name;
      adminNamespace.emit("socket_updated", {
        id: socket.id,
        nsp: nsp.name,
        transport: transport.name,
      });
    });

    socket.on("disconnect", (reason: string) => {
      adminNamespace.emit("socket_disconnected", nsp.name, socket.id, reason);
    });
  });

  nsp.adapter.on("join-room", (room: string, id: string) => {
    adminNamespace.emit("room_joined", nsp.name, room, id);
  });

  nsp.adapter.on("leave-room", (room: string, id: string) => {
    process.nextTick(() => {
      adminNamespace.emit("room_left", nsp.name, room, id);
    });
  });
};

const serialize = (
  socket: Socket | RemoteSocket<any>,
  nsp: string
): SerializedSocket => {
  const clientId = socket.data?._admin?.clientId;
  const transport = socket.data?._admin?.transport;
  const address =
    socket.handshake.headers["cf-connecting-ip"] ||
    socket.handshake.headers["x-forwarded-for"] ||
    socket.handshake.address;
  return {
    id: socket.id,
    clientId,
    transport,
    nsp,
    data: serializeData(socket.data),
    handshake: {
      address,
      headers: socket.handshake.headers,
      query: socket.handshake.query,
      issued: socket.handshake.issued,
      secure: socket.handshake.secure,
      time: socket.handshake.time,
      url: socket.handshake.url,
      xdomain: socket.handshake.xdomain,
      // ignore auth and other attributes like sessionStore
    },
    rooms: [...socket.rooms],
  };
};

const serializeData = (data: any) => {
  const { _admin, ...obj } = data;
  return obj;
};

export function instrument(io: Server, opts: Partial<InstrumentOptions>) {
  const options: InstrumentOptions = Object.assign(
    {
      namespaceName: "/admin",
      auth: undefined,
      readonly: false,
      serverId: undefined,
      store: new InMemoryStore(),
    },
    opts
  );

  debug("options: %j", options);

  const adminNamespace: Namespace<ClientEvents, ServerEvents> = io.of(
    options.namespaceName
  );

  initAuthenticationMiddleware(adminNamespace, options);

  const supportedFeatures = options.readonly ? [] : detectSupportedFeatures(io);
  debug("supported features: %j", supportedFeatures);

  initStatsEmitter(adminNamespace, options.serverId);

  adminNamespace.on("connection", async (socket) => {
    registerFeatureHandlers(io, socket, supportedFeatures);

    socket.emit("config", {
      supportedFeatures,
    });

    socket.emit("all_sockets", await fetchAllSockets(io));
  });

  io._nsps.forEach((nsp) => registerListeners(adminNamespace, nsp));
  io.on("new_namespace", (nsp) => registerListeners(adminNamespace, nsp));
}

export { InMemoryStore, RedisStore } from "./stores";
