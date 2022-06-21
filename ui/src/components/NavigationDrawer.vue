<template>
  <v-navigation-drawer
    v-model="$store.state.config.showNavigationDrawer"
    app
    clipped
    class="elevation-3"
  >
    <v-list dense nav>
      <v-list-item
        v-for="item in items"
        :key="item.title"
        :to="item.to"
        :exact="item.exact"
      >
        <v-list-item-icon>
          <v-icon>{{ item.icon }}</v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item-content>
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

<script>
import LangSelector from "./LangSelector";
import ThemeSelector from "./ThemeSelector";
import ReadonlyToggle from "./ReadonlyToggle";
import { mapGetters } from "vuex";
export default {
  name: "NavigationDrawer",

  components: { ReadonlyToggle, ThemeSelector, LangSelector },

  computed: {
    ...mapGetters("config", ["developmentMode"]),
    items() {
      if (this.developmentMode) {
        return [
          {
            title: this.$t("dashboard.title"),
            icon: "mdi-home-outline",
            to: { name: "dashboard" },
            exact: true,
          },
          {
            title: this.$t("sockets.title"),
            icon: "mdi-ray-start-arrow",
            to: { name: "sockets" },
          },
          {
            title: this.$t("rooms.title"),
            icon: "mdi-tag-outline",
            to: { name: "rooms" },
          },
          {
            title: this.$t("clients.title"),
            icon: "mdi-account-circle-outline",
            to: { name: "clients" },
          },
          {
            title: this.$t("events.title"),
            icon: "mdi-calendar-text-outline",
            to: { name: "events" },
          },
          {
            title: this.$t("servers.title"),
            icon: "mdi-server",
            to: { name: "servers" },
          },
        ];
      } else {
        return [
          {
            title: this.$t("dashboard.title"),
            icon: "mdi-home-outline",
            to: { name: "dashboard" },
            exact: true,
          },
          {
            title: this.$t("servers.title"),
            icon: "mdi-server",
            to: { name: "servers" },
          },
        ];
      }
    },
  },
};
</script>
