<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import { sortBy } from "lodash-es";
import { formatDuration } from "../util";
import ServerStatus from "../components/ServerStatus.vue";

const store = useStore();
const { t } = useI18n();

const now = ref(Date.now());
let interval;

onMounted(() => {
  interval = setInterval(() => {
    now.value = Date.now();
  }, 1000);
});

onUnmounted(() => {
  clearInterval(interval);
});

const breadcrumbItems = computed(() => [
  {
    title: t("servers.title"),
    disabled: true,
  },
]);

const headers = computed(() => [
  {
    title: t("id"),
    key: "serverId",
  },
  {
    title: t("servers.hostname"),
    key: "hostname",
  },
  {
    title: t("servers.pid"),
    key: "pid",
  },
  {
    title: t("servers.uptime"),
    key: "uptime",
  },
  {
    title: t("servers.clients-count"),
    key: "clientsCount",
  },
  {
    title: t("servers.last-ping"),
    key: "lastPing",
  },
  {
    title: t("status"),
    key: "healthy",
  },
  {
    key: "actions",
    align: "end",
    sortable: false,
  },
]);

const servers = computed(() => sortBy(store.state.servers.servers, "serverId"));

const delaySinceLastPing = (lastPing) => {
  const delay = now.value - lastPing;
  return `${formatDuration(delay / 1000)} ago`;
};

const removeServer = (item) => {
  store.commit("servers/removeServer", item.serverId);
};
</script>

<template>
  <div>
    <v-breadcrumbs :items="breadcrumbItems" />

    <v-card>
      <v-data-table
        :headers="headers"
        :items="servers"
        :items-per-page-options="[20, 100, -1]"
      >
        <template v-slot:item.uptime="{ item }">
          {{ formatDuration(item.uptime) }}
        </template>

        <template v-slot:item.lastPing="{ item }">
          {{ delaySinceLastPing(item.lastPing) }}
        </template>

        <template v-slot:item.healthy="{ item }">
          <ServerStatus :healthy="item.healthy" />
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn v-if="!item.healthy" @click="removeServer(item)" size="small">
            <v-icon>mdi-delete-outline</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>
