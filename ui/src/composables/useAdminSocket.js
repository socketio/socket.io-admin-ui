import { ref } from "vue";
import { io } from "socket.io-client";
import msgpackParser from "socket.io-msgpack-parser";
import SocketHolder from "../SocketHolder";
import { useConfigStore } from "../stores/config";
import { useConnectionStore } from "../stores/connection";
import { useMainStore } from "../stores/main";
import { useServersStore } from "../stores/servers";

function defaultTimestamp() {
  return new Date().toISOString();
}

export function useAdminSocket() {
  const isConnecting = ref(false);
  const connectionError = ref("");
  const configStore = useConfigStore();
  const connectionStore = useConnectionStore();
  const mainStore = useMainStore();
  const serversStore = useServersStore();

  const registerEventListeners = (socket) => {
    socket.on("session", (sessionId) => {
      connectionStore.saveSessionId(sessionId);
    });
    socket.on("config", (config) => {
      configStore.updateConfig(config);
    });
    socket.on("server_stats", (serverStats) => {
      serversStore.onServerStats(serverStats);
      mainStore.onServerStats(serverStats);
    });
    socket.on("all_sockets", (sockets) => {
      mainStore.onAllSockets(sockets);
    });
    socket.on("socket_connected", (socketData, timestamp = defaultTimestamp()) => {
      mainStore.onSocketConnected({
        timestamp,
        socket: socketData,
      });
    });
    socket.on("socket_updated", (socketData) => {
      mainStore.onSocketUpdated(socketData);
    });
    socket.on(
      "socket_disconnected",
      (nsp, id, reason, timestamp = defaultTimestamp()) => {
        mainStore.onSocketDisconnected({
          timestamp,
          nsp,
          id,
          reason,
        });
      },
    );
    socket.on("room_joined", (nsp, room, id, timestamp = defaultTimestamp()) => {
      mainStore.onRoomJoined({ timestamp, nsp, room, id });
    });
    socket.on("room_left", (nsp, room, id, timestamp = defaultTimestamp()) => {
      mainStore.onRoomLeft({ timestamp, nsp, room, id });
    });
    socket.on("event_received", (nsp, id, args, timestamp) => {
      mainStore.onEventReceived({
        timestamp,
        nsp,
        id,
        args,
      });
    });
    socket.on("event_sent", (nsp, id, args, timestamp) => {
      mainStore.onEventSent({
        timestamp,
        nsp,
        id,
        args,
      });
    });
  };

  const connect = ({ serverUrl, namespace, auth, wsOnly, path, parser }) => {
    isConnecting.value = true;

    if (SocketHolder.socket) {
      SocketHolder.socket.disconnect();
      SocketHolder.socket.off("connect");
      SocketHolder.socket.off("connect_error");
      SocketHolder.socket.off("disconnect");
    }

    const socket = io(serverUrl + namespace, {
      forceNew: true,
      reconnection: false,
      withCredentials: true,
      transports: wsOnly ? ["websocket"] : ["polling", "websocket"],
      path,
      parser: parser === "msgpack" ? msgpackParser : undefined,
      auth,
    });

    socket.once("connect", () => {
      connectionError.value = "";
      isConnecting.value = false;
      socket.io.reconnection(true);
      connectionStore.saveConfig({
        serverUrl,
        wsOnly,
        path,
        namespace,
        parser,
      });
      SocketHolder.socket = socket;
      registerEventListeners(socket);
    });

    socket.on("connect", () => {
      connectionStore.connect();
    });

    socket.on("connect_error", (err) => {
      connectionError.value = err.message;
      isConnecting.value = false;
    });

    socket.on("disconnect", (reason) => {
      if (isConnecting.value) {
        connectionError.value = reason;
        isConnecting.value = false;
      }
      connectionStore.disconnect();
    });
  };

  return {
    connect,
    isConnecting,
    connectionError,
  };
}
