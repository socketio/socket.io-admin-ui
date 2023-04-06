import { Namespace, RemoteSocket, Server, Socket } from "socket.io";
import {
  ClientEvents,
  Feature,
  NamespaceDetails,
  NamespaceEvent,
  SerializedSocket,
  ServerEvents,
} from "./typed-events";
import debugModule from "debug";
import { compare, getRounds } from "bcryptjs";
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
  /**
   * Whether to send all events or only aggregated events to the UI, for performance purposes.
   */
  mode: "development" | "production";
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

  const io = adminNamespace.server;

  const emitStats = () => {
    debug("emit stats");
    const namespaces: NamespaceDetails[] = [];
    io._nsps.forEach((namespace) => {
      namespaces.push({
        name: namespace.name,
        socketsCount: namespace.sockets.size,
      });
    });

    adminNamespace.emit(
      "server_stats",
      Object.assign({}, baseStats, {
        uptime: process.uptime(),
        clientsCount: io.engine?.clientsCount,
        pollingClientsCount: io._pollingClientsCount,
        aggregatedEvents: io._eventBuffer.getValuesAndClear(),
        namespaces,
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

const registerVerboseListeners = (
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

    const data = socket.data || {}; // could be set in a middleware

    socket.data = createProxy({
      _admin: {
        clientId: clientId.substring(0, 12), // this information is quite sensitive
        transport: socket.conn.transport.name,
      },
    });

    for (const key in data) {
      socket.data[key] = createProxy(data[key]);
    }

    adminNamespace.emit(
      "socket_connected",
      serialize(socket, nsp.name),
      new Date()
    );

    socket.conn.on("upgrade", (transport: any) => {
      socket.data._admin.transport = transport.name;
      adminNamespace.emit("socket_updated", {
        id: socket.id,
        nsp: nsp.name,
        transport: transport.name,
      });
    });

    if (nsp !== adminNamespace) {
      if (typeof socket.onAny === "function") {
        socket.onAny((...args: any[]) => {
          const withAck = typeof args[args.length - 1] === "function";
          if (withAck) {
            args = args.slice(0, -1);
          }
          adminNamespace.emit(
            "event_received",
            nsp.name,
            socket.id,
            args,
            new Date()
          );
        });
      }
      if (typeof socket.onAnyOutgoing === "function") {
        socket.onAnyOutgoing((...args: any[]) => {
          adminNamespace.emit(
            "event_sent",
            nsp.name,
            socket.id,
            args,
            new Date()
          );
        });
      }
    }

    socket.on("disconnect", (reason: string) => {
      adminNamespace.emit(
        "socket_disconnected",
        nsp.name,
        socket.id,
        reason,
        new Date()
      );
    });
  });

  nsp.adapter.on("join-room", (room: string, id: string) => {
    adminNamespace.emit("room_joined", nsp.name, room, id, new Date());
  });

  nsp.adapter.on("leave-room", (room: string, id: string) => {
    process.nextTick(() => {
      adminNamespace.emit("room_left", nsp.name, room, id, new Date());
    });
  });
};

const serialize = (
  socket: Socket | RemoteSocket<any, any>,
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

declare module "socket.io" {
  interface Server {
    _eventBuffer: EventBuffer;
    _pollingClientsCount: number;
  }
}

class EventBuffer {
  private buffer: Map<string, NamespaceEvent> = new Map();

  public push(type: string, subType?: string, count = 1) {
    const timestamp = new Date();
    timestamp.setMilliseconds(0);
    const key = `${timestamp.getTime()};${type};${subType}`;
    if (this.buffer.has(key)) {
      this.buffer.get(key)!.count += count;
    } else {
      this.buffer.set(key, {
        timestamp: timestamp.getTime(),
        type,
        subType,
        count,
      });
    }
  }

  public getValuesAndClear() {
    const values = [...this.buffer.values()];
    this.buffer.clear();
    return values;
  }
}

const registerEngineListeners = (io: Server) => {
  io._eventBuffer = new EventBuffer();
  io._pollingClientsCount = 0;

  const onConnection = (rawSocket: any) => {
    io._eventBuffer.push("rawConnection");

    if (rawSocket.transport.name === "polling") {
      io._pollingClientsCount++;

      const decr = () => {
        io._pollingClientsCount--;
      };

      rawSocket.once("upgrade", () => {
        rawSocket.removeListener("close", decr);
        decr();
      });

      rawSocket.once("close", decr);
    }

    rawSocket.on("packetCreate", ({ data }: { data: string | Buffer }) => {
      if (data) {
        io._eventBuffer.push("packetsOut", undefined);
        io._eventBuffer.push("bytesOut", undefined, Buffer.byteLength(data));
      }
    });

    rawSocket.on("packet", ({ data }: { data: string | Buffer }) => {
      if (data) {
        io._eventBuffer.push("packetsIn", undefined);
        io._eventBuffer.push("bytesIn", undefined, Buffer.byteLength(data));
      }
    });

    rawSocket.on("close", (reason: string) => {
      io._eventBuffer.push("rawDisconnection", reason);
    });
  };

  if (io.engine) {
    io.engine.on("connection", onConnection);
  } else {
    // io.engine might be undefined if instrument() is called before binding the Socket.IO server to the HTTP server
    process.nextTick(() => {
      if (io.engine) {
        io.engine.on("connection", onConnection);
      } else {
        debug("WARN: no engine");
      }
    });
  }
};

export function instrument(io: Server, opts: Partial<InstrumentOptions>) {
  const options: InstrumentOptions = Object.assign(
    {
      namespaceName: "/admin",
      auth: undefined,
      readonly: false,
      serverId: undefined,
      store: new InMemoryStore(),
      mode: process.env.NODE_ENV || "development",
    },
    opts
  );

  debug("options: %j", options);

  const adminNamespace: Namespace<ClientEvents, ServerEvents> = io.of(
    options.namespaceName
  );

  initAuthenticationMiddleware(adminNamespace, options);

  const supportedFeatures = options.readonly ? [] : detectSupportedFeatures(io);
  supportedFeatures.push(Feature.AGGREGATED_EVENTS);
  const isDevelopmentMode = options.mode === "development";
  if (isDevelopmentMode) {
    supportedFeatures.push(Feature.ALL_EVENTS);
  }
  debug("supported features: %j", supportedFeatures);

  adminNamespace.on("connection", async (socket) => {
    registerFeatureHandlers(io, socket, supportedFeatures);

    socket.emit("config", {
      supportedFeatures,
    });

    if (isDevelopmentMode) {
      socket.emit("all_sockets", await fetchAllSockets(io));
    }
  });

  registerEngineListeners(io);

  if (isDevelopmentMode) {
    const registerNamespaceListeners = (nsp: Namespace) => {
      registerVerboseListeners(adminNamespace, nsp);
    };
    io._nsps.forEach(registerNamespaceListeners);
    io.on("new_namespace", registerNamespaceListeners);
  }

  initStatsEmitter(adminNamespace, options.serverId);
}

export { InMemoryStore, RedisStore, RedisV4Store } from "./stores";
