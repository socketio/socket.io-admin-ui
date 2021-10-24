<template>
  <v-app-bar app clipped-left :extension-height="extensionHeight">
    <v-app-bar-nav-icon
      class="d-lg-none"
      @click.stop="toggleNavigationDrawer"
    />

    <v-img :src="logoSrc" alt="logo" max-height="40" max-width="40" />
    <v-toolbar-title class="ml-3">Socket.IO Admin UI</v-toolbar-title>
    <v-btn small class="pa-0 ml-2 elevation-0" :href="linkToReleaseNotes">{{
      version
    }}</v-btn>

    <v-spacer />

    <div class="d-none d-lg-flex">
      <div>
        <div>
          {{ $t("connection.serverUrl") }}{{ $t("separator")
          }}<code v-if="serverUrl">{{ serverUrl }}</code>
        </div>
        <div>
          {{ $t("status") }}{{ $t("separator")
          }}<ConnectionStatus :connected="connected" />
        </div>
      </div>

      <v-btn outlined @click="onUpdate" class="ml-3 align-self-center">{{
        $t("update")
      }}</v-btn>
    </div>

    <template v-slot:extension>
      <div class="d-flex flex-column d-lg-none">
        <div class="mt-3">
          {{ $t("connection.serverUrl") }}{{ $t("separator")
          }}<code v-if="serverUrl">{{ serverUrl }}</code>
        </div>
        <div class="mt-3 mb-3">
          {{ $t("status") }}{{ $t("separator")
          }}<ConnectionStatus :connected="connected" />
          <v-btn small outlined @click="onUpdate" class="ml-3">{{
            $t("update")
          }}</v-btn>
        </div>
      </div>
    </template>
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

    extensionHeight() {
      switch (this.$vuetify.breakpoint.name) {
        case "xs":
        case "sm":
        case "md":
          return 96;
        case "lg":
        case "xl":
        default:
          return 0;
      }
    },
  },

  methods: {
    onUpdate() {
      this.$emit("update");
    },
    toggleNavigationDrawer() {
      this.$store.commit("config/toggleNavigationDrawer");
    },
  },
};
</script>
