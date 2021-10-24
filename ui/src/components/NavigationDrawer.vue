<template>
  <v-navigation-drawer v-model="$store.state.navdrawer.drawer" app clipped class="elevation-3">
    <v-list dense nav>

      <v-list-item style="margin: 1rem 0rem;" class="d-lg-none" >
        <v-list-item-content>
          <div>{{ $t("connection.serverUrl") }}{{ $t("separator") }}</div>
          <v-list-item-title v-if="serverUrl" class="text-wrap" ><code>{{ serverUrl }}</code></v-list-item-title>
          <div class="mt-1" >
            <v-btn x-small @click="onUpdate" >{{ $t("update") }}</v-btn>
          </div>
        </v-list-item-content>
      </v-list-item>

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
import { mapState } from "vuex";
import LangSelector from "./LangSelector";
import ThemeSelector from "./ThemeSelector";
import ReadonlyToggle from "./ReadonlyToggle";
export default {
  name: "NavigationDrawer",

  components: { ReadonlyToggle, ThemeSelector, LangSelector },

  computed: {
    items() {
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
          title: this.$t("servers.title"),
          icon: "mdi-server",
          to: { name: "servers" },
        },
      ];
    },
    ...mapState({
      serverUrl: (state) => state.connection.serverUrl,
    })
  },

  methods: {
    onUpdate() {
      this.$emit("update");
    }
  }

};
</script>
