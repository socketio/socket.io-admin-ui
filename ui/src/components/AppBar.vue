<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import { useDisplay } from "vuetify";
import ConnectionStatus from "./ConnectionStatus.vue";

const store = useStore();
const display = useDisplay();

const emit = defineEmits(["update"]);

const version = __APP_VERSION__;

const logoSrc = computed(() =>
  store.state.config.darkTheme
    ? new URL("../assets/logo-dark.svg", import.meta.url).href
    : new URL("../assets/logo-light.svg", import.meta.url).href,
);
const serverUrl = computed(() => store.state.connection.serverUrl);
const connected = computed(() => store.state.connection.connected);

const linkToReleaseNotes = computed(
  () =>
    "https://github.com/socketio/socket.io-admin-ui/releases/tag/" + version,
);

const extensionHeight = computed(() => {
  switch (display.name.value) {
    case "xs":
    case "sm":
    case "md":
      return 96;
    case "lg":
    case "xl":
    default:
      return 0;
  }
});

const onUpdate = () => {
  emit("update");
};

const toggleNavigationDrawer = () => {
  store.commit("config/toggleNavigationDrawer");
};
</script>

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
