<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { useTheme, useDisplay } from "vuetify";
import { io } from "socket.io-client";
import msgpackParser from "socket.io-msgpack-parser";
import AppBar from "./components/AppBar.vue";
import NavigationDrawer from "./components/NavigationDrawer.vue";
import ConnectionModal from "./components/ConnectionModal.vue";
import SocketHolder from "./SocketHolder";
import {
  VSlideXTransition,
  VSlideXReverseTransition,
  VSlideYTransition,
  VSlideYReverseTransition,
} from "vuetify/components";

const store = useStore();
const route = useRoute();
const theme = useTheme();
const display = useDisplay();

const showConnectionModal = ref(false);
const isConnecting = ref(false);
const connectionError = ref("");
const transitionName = ref("v-slide-x-reverse-transition");

const serverUrl = computed(() => store.state.connection.serverUrl);
const wsOnly = computed(() => store.state.connection.wsOnly);
const path = computed(() => store.state.connection.path);
const namespace = computed(() => store.state.connection.namespace);
const parser = computed(() => store.state.connection.parser);
const backgroundColor = computed(() =>
  store.state.config.darkTheme ? "" : "grey lighten-5",
);

watch(route, (to, from) => {
  if (to.meta.topLevel && from.meta.topLevel) {
    transitionName.value =
      to.meta.index > from.meta.index
        ? "v-slide-y-reverse-transition"
        : "v-slide-y-transition";
  } else {
    transitionName.value = to.meta.topLevel
      ? "v-slide-x-transition"
      : "v-slide-x-reverse-transition";
  }
});

function defaultTimestamp() {
  return new Date().toISOString();
}

const registerEventListeners = (socket) => {
  socket.on("session", (sessionId) => {
    store.commit("connection/saveSessionId", sessionId);
  });
  socket.on("config", (config) => {
    store.commit("config/updateConfig", config);
  });
  socket.on("server_stats", (serverStats) => {
    store.commit("servers/onServerStats", serverStats);
    store.commit("main/onServerStats", serverStats);
  });
  socket.on("all_sockets", (sockets) => {
    store.commit("main/onAllSockets", sockets);
  });
  socket.on("socket_connected", (socket, timestamp = defaultTimestamp()) => {
    store.commit("main/onSocketConnected", {
      timestamp,
      socket,
    });
  });
  socket.on("socket_updated", (socket) => {
    store.commit("main/onSocketUpdated", socket);
  });
  socket.on(
    "socket_disconnected",
    (nsp, id, reason, timestamp = defaultTimestamp()) => {
      store.commit("main/onSocketDisconnected", {
        timestamp,
        nsp,
        id,
        reason,
      });
    },
  );
  socket.on("room_joined", (nsp, room, id, timestamp = defaultTimestamp()) => {
    store.commit("main/onRoomJoined", { timestamp, nsp, room, id });
  });
  socket.on("room_left", (nsp, room, id, timestamp = defaultTimestamp()) => {
    store.commit("main/onRoomLeft", { timestamp, nsp, room, id });
  });
  socket.on("event_received", (nsp, id, args, timestamp) => {
    store.commit("main/onEventReceived", {
      timestamp,
      nsp,
      id,
      args,
    });
  });
  socket.on("event_sent", (nsp, id, args, timestamp) => {
    store.commit("main/onEventSent", { timestamp, nsp, id, args });
  });
};

const tryConnect = (
  serverUrlValue,
  namespaceValue,
  auth,
  wsOnlyValue,
  pathValue,
  parserValue,
) => {
  isConnecting.value = true;
  if (SocketHolder.socket) {
    SocketHolder.socket.disconnect();
    SocketHolder.socket.off("connect");
    SocketHolder.socket.off("connect_error");
    SocketHolder.socket.off("disconnect");
  }
  const socket = io(serverUrlValue + namespaceValue, {
    forceNew: true,
    reconnection: false,
    withCredentials: true,
    transports: wsOnlyValue ? ["websocket"] : ["polling", "websocket"],
    path: pathValue,
    parser: parserValue === "msgpack" ? msgpackParser : null,
    auth,
  });
  socket.once("connect", () => {
    showConnectionModal.value = false;
    connectionError.value = "";
    isConnecting.value = false;

    socket.io.reconnection(true);
    store.commit("connection/saveConfig", {
      serverUrl: serverUrlValue,
      wsOnly: wsOnlyValue,
      path: pathValue,
      namespace: namespaceValue,
      parser: parserValue,
    });
    SocketHolder.socket = socket;
    registerEventListeners(socket);
  });
  socket.on("connect", () => {
    store.commit("connection/connect");
  });
  socket.on("connect_error", (err) => {
    if (isConnecting.value || err.message === "invalid credentials") {
      showConnectionModal.value = true;
      connectionError.value = err.message;
    }
    isConnecting.value = false;
  });
  socket.on("disconnect", (reason) => {
    if (isConnecting.value) {
      isConnecting.value = false;
      connectionError.value = reason;
    }
    store.commit("connection/disconnect");
  });
};

const onSubmit = (form) => {
  tryConnect(
    form.serverUrl,
    form.namespace,
    {
      username: form.username,
      password: form.password,
    },
    form.wsOnly,
    form.path,
    form.parser,
  );
};

onMounted(() => {
  theme.global.name.value = store.state.config.darkTheme ? "dark" : "light";
  if (display.lgAndUp.value) {
    store.commit("config/toggleNavigationDrawer");
  }

  if (serverUrl.value) {
    const sessionId = store.state.connection.sessionId;
    tryConnect(
      serverUrl.value,
      namespace.value,
      {
        sessionId,
      },
      wsOnly.value,
      path.value,
      parser.value,
    );
  } else {
    showConnectionModal.value = true;
  }
});
</script>

<template>
  <v-app>
    <AppBar @update="showConnectionModal = true" />

    <NavigationDrawer />

    <v-main :class="backgroundColor">
      <v-container fluid>
        <router-view v-slot="{ Component }">
          <transition :name="transitionName" hide-on-leave>
            <component :is="Component" />
          </transition>
        </router-view>
      </v-container>
    </v-main>

    <ConnectionModal
      :is-open="showConnectionModal"
      :initial-server-url="serverUrl"
      :initial-ws-only="wsOnly"
      :initial-path="path"
      :initial-namespace="namespace"
      :initial-parser="parser"
      :is-connecting="isConnecting"
      :error="connectionError"
      @submit="onSubmit"
    />
  </v-app>
</template>
