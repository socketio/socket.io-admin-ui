<template>
  <v-app>
    <AppBar @update="showConnectionModal = true" />

    <NavigationDrawer />

    <v-main :class="backgroundColor">
      <v-container fluid>
        <component :is="transitionName" hide-on-leave>
          <router-view />
        </component>
      </v-container>
    </v-main>

    <ConnectionModal
      :is-open="showConnectionModal"
      :initial-server-url="serverUrl"
      :is-connecting="isConnecting"
      :error="connectionError"
      @submit="onSubmit"
    />
  </v-app>
</template>

<script>
import AppBar from "./components/AppBar";
import NavigationDrawer from "./components/NavigationDrawer";
import { io } from "socket.io-client";
import ConnectionModal from "./components/ConnectionModal";
import SocketHolder from "./SocketHolder";
import { mapState } from "vuex";
import {
  VSlideXTransition,
  VSlideXReverseTransition,
  VSlideYTransition,
  VSlideYReverseTransition,
} from "vuetify/lib";

export default {
  name: "App",

  components: {
    ConnectionModal,
    NavigationDrawer,
    AppBar,
    VSlideXTransition,
    VSlideXReverseTransition,
    VSlideYTransition,
    VSlideYReverseTransition,
  },

  data: () => ({
    showConnectionModal: false,
    isConnecting: false,
    connectionError: "",
    transitionName: "v-slide-x-reverse-transition",
  }),

  computed: {
    ...mapState({
      serverUrl: (state) => state.connection.serverUrl,
      backgroundColor: (state) =>
        state.config.darkTheme ? "" : "grey lighten-5",
    }),
  },

  watch: {
    $route(to, from) {
      if (to.meta.topLevel && from.meta.topLevel) {
        this.transitionName =
          to.meta.index > from.meta.index
            ? "v-slide-y-reverse-transition"
            : "v-slide-y-transition";
      } else {
        this.transitionName = to.meta.topLevel
          ? "v-slide-x-transition"
          : "v-slide-x-reverse-transition";
      }
    },
  },

  methods: {
    tryConnect(serverUrl, auth) {
      this.isConnecting = true;
      if (SocketHolder.socket) {
        SocketHolder.socket.disconnect();
        SocketHolder.socket.off("connect");
        SocketHolder.socket.off("connect_error");
        SocketHolder.socket.off("disconnect");
      }
      const socket = io(serverUrl, {
        forceNew: true,
        reconnection: false,
        withCredentials: true, // needed for cookie-based sticky-sessions
        auth,
      });
      socket.once("connect", () => {
        this.showConnectionModal = false;
        this.connectionError = "";
        this.isConnecting = false;

        socket.io.reconnection(true);
        this.$store.commit("connection/saveServerUrl", serverUrl);
        SocketHolder.socket = socket;
        this.registerEventListeners(socket);
      });
      socket.on("connect", () => {
        this.$store.commit("connection/connect");
      });
      socket.on("connect_error", (err) => {
        if (this.isConnecting || err.message === "invalid credentials") {
          this.showConnectionModal = true;
          this.connectionError = err.message;
          this.isConnecting = false;
        }
      });
      socket.on("disconnect", () => {
        this.$store.commit("connection/disconnect");
      });
    },

    registerEventListeners(socket) {
      socket.on("session", (sessionId) => {
        this.$store.commit("connection/saveSessionId", sessionId);
      });
      socket.on("config", (config) => {
        this.$store.commit("config/updateConfig", config);
      });
      socket.on("server_stats", (serverStats) => {
        this.$store.commit("servers/onServerStats", serverStats);
      });
      socket.on("all_sockets", (sockets) => {
        this.$store.commit("main/onAllSockets", sockets);
      });
      socket.on("socket_connected", (socket) => {
        this.$store.commit("main/onSocketConnected", socket);
      });
      socket.on("socket_updated", (socket) => {
        this.$store.commit("main/onSocketUpdated", socket);
      });
      socket.on("socket_disconnected", (nsp, id, reason) => {
        this.$store.commit("main/onSocketDisconnected", {
          nsp,
          id,
          reason,
        });
      });
      socket.on("room_joined", (nsp, room, id) => {
        this.$store.commit("main/onRoomJoined", { nsp, room, id });
      });
      socket.on("room_left", (nsp, room, id) => {
        this.$store.commit("main/onRoomLeft", { nsp, room, id });
      });
    },

    onSubmit(form) {
      this.tryConnect(form.serverUrl, {
        username: form.username,
        password: form.password,
      });
    },
  },

  created() {
    this.$vuetify.theme.dark = this.$store.state.config.darkTheme;

    if (this.serverUrl) {
      const sessionId = this.$store.state.connection.sessionId;
      this.tryConnect(this.serverUrl, {
        sessionId,
      });
    } else {
      this.showConnectionModal = true;
    }
  },
};
</script>
