<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import LangSelector from "./LangSelector.vue";
import ThemeSelector from "./ThemeSelector.vue";
import ReadonlyToggle from "./ReadonlyToggle.vue";

const store = useStore();
const { t } = useI18n();

const showNavigationDrawer = computed({
  get: () => store.state.config.showNavigationDrawer,
  set: (val) => store.commit("config/toggleNavigationDrawer", val),
});

const developmentMode = computed(() => store.getters["config/developmentMode"]);

const items = computed(() => {
  if (developmentMode.value) {
    return [
      {
        title: t("dashboard.title"),
        icon: "mdi-home-outline",
        to: { name: "dashboard" },
        exact: true,
      },
      {
        title: t("sockets.title"),
        icon: "mdi-ray-start-arrow",
        to: { name: "sockets" },
      },
      {
        title: t("rooms.title"),
        icon: "mdi-tag-outline",
        to: { name: "rooms" },
      },
      {
        title: t("clients.title"),
        icon: "mdi-account-circle-outline",
        to: { name: "clients" },
      },
      {
        title: t("events.title"),
        icon: "mdi-calendar-text-outline",
        to: { name: "events" },
      },
      {
        title: t("servers.title"),
        icon: "mdi-server",
        to: { name: "servers" },
      },
    ];
  } else {
    return [
      {
        title: t("dashboard.title"),
        icon: "mdi-home-outline",
        to: { name: "dashboard" },
        exact: true,
      },
      {
        title: t("servers.title"),
        icon: "mdi-server",
        to: { name: "servers" },
      },
    ];
  }
});
</script>

<template>
  <v-navigation-drawer
    v-model="showNavigationDrawer"
    app
    clipped
    class="elevation-3"
  >
    <v-list density="compact" nav>
      <v-list-item
        v-for="item in items"
        :key="item.title"
        :to="item.to"
        :exact="item.exact"
        :prepend-icon="item.icon"
        :title="item.title"
      >
      </v-list-item>
    </v-list>

    <template v-slot:append>
      <v-divider />

      <div class="pa-3 pt-10">
        <LangSelector />
        <ThemeSelector />
        <ReadonlyToggle />
      </div>
    </template>
  </v-navigation-drawer>
</template>
