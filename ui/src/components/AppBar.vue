<template>
  <v-app-bar app clipped-left>
    <v-app-bar-nav-icon class="d-lg-none" @click.stop="toggleNavigationDrawer" ></v-app-bar-nav-icon>
    <v-img :src="logoSrc" alt="logo" max-height="40" max-width="40" />
    <v-toolbar-title class="ml-3 hidden-sm-and-down">Socket.IO Admin UI</v-toolbar-title>
    <v-btn small class="pa-0 ml-2 elevation-0" :href="linkToReleaseNotes">{{
      version
    }}</v-btn>

    <v-spacer />

    <div class="d-flex">
      <div>
        <div class="hidden-sm-and-down" >
          {{ $t("connection.serverUrl") }}{{ $t("separator")
          }}<code v-if="serverUrl">{{ serverUrl }}</code>
        </div>
        <div>
          {{ $t("status") }}{{ $t("separator")
          }}<ConnectionStatus :connected="connected" />
        </div>
      </div>

      <v-btn @click="onUpdate" class="ml-3 align-self-center hidden-sm-and-down">{{
        $t("update")
      }}</v-btn>
    </div>
  </v-app-bar>
</template>

<script>
import { mapState } from "vuex";
import ConnectionStatus from "./ConnectionStatus";

const version = process.env.VERSION;

export default {
  name: "AppBar",

  components: { ConnectionStatus },

  data() {
    return {
      version,
    };
  },

  computed: {
    ...mapState({
      logoSrc: (state) =>
        state.config.darkTheme
          ? require("../assets/logo-dark.svg")
          : require("../assets/logo-light.svg"),
      serverUrl: (state) => state.connection.serverUrl,
      connected: (state) => state.connection.connected,
    }),
    linkToReleaseNotes() {
      return (
        "https://github.com/socketio/socket.io-admin-ui/releases/tag/" + version
      );
    },
  },

  methods: {
    onUpdate() {
      this.$emit("update");
    },
    toggleNavigationDrawer(){
      this.$emit('toggleNavigationDrawer');
    }
  },
};
</script>
