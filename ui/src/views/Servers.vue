<template>
  <div>
    <v-breadcrumbs :items="breadcrumbItems" />

    <v-card>
      <v-data-table
        :headers="headers"
        :items="servers"
        :footer-props="footerProps"
      >
        <template v-slot:item.uptime="{ value }">
          {{ formatDuration(value) }}
        </template>

        <template v-slot:item.lastPing="{ value }">
          {{ delaySinceLastPing(value) }}
        </template>

        <template v-slot:item.healthy="{ value }">
          <ServerStatus :healthy="value" />
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn v-if="!item.healthy" @click="removeServer(item)" small>
            <v-icon>mdi-delete-outline</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
import { sortBy } from "lodash-es";
import { formatDuration } from "../util";
import { mapState } from "vuex";
import ServerStatus from "../components/ServerStatus";

export default {
  name: "Servers",

  components: { ServerStatus },

  data() {
    return {
      footerProps: {
        "items-per-page-options": [20, 100, -1],
      },
      now: Date.now(),
    };
  },

  created() {
    this.interval = setInterval(() => {
      this.now = Date.now();
    }, 1000);
  },

  beforeDestroy() {
    clearInterval(this.interval);
  },

  computed: {
    breadcrumbItems() {
      return [
        {
          text: this.$t("servers.title"),
          disabled: true,
        },
      ];
    },
    headers() {
      return [
        {
          text: this.$t("id"),
          value: "serverId",
        },
        {
          text: this.$t("servers.hostname"),
          value: "hostname",
        },
        {
          text: this.$t("servers.pid"),
          value: "pid",
        },
        {
          text: this.$t("servers.uptime"),
          value: "uptime",
        },
        {
          text: this.$t("servers.clients-count"),
          value: "clientsCount",
        },
        {
          text: this.$t("servers.last-ping"),
          value: "lastPing",
        },
        {
          text: this.$t("status"),
          value: "healthy",
        },
        {
          value: "actions",
          align: "end",
          sortable: false,
        },
      ];
    },
    ...mapState({
      servers: (state) => sortBy(state.servers.servers, "serverId"),
    }),
  },
  methods: {
    formatDuration,
    delaySinceLastPing(lastPing) {
      const delay = this.now - lastPing;
      return `${formatDuration(delay / 1000)} ago`;
    },
    removeServer(item) {
      this.$store.commit("servers/removeServer", item.serverId);
    },
  },
};
</script>
