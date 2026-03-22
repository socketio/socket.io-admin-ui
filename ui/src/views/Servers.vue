<template>
  <div class="mx-auto max-w-[1360px] px-6 py-7">
    <header class="mb-4">
      <div>
        <h1 class="text-lg font-bold tracking-tight">{{ $t("servers.title") }}</h1>
        <p class="mt-0.5 text-xs font-medium text-[rgba(var(--v-theme-on-surface),0.45)]">
          Cluster nodes, uptime, and health for this admin session
        </p>
      </div>
    </header>

    <div
      v-if="!serversStore.servers.length"
      class="flex flex-col items-center justify-center rounded-2xl border border-[rgba(var(--v-border-color),var(--v-border-opacity))] bg-[rgb(var(--v-theme-surface))] py-20"
    >
      <div class="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[rgba(var(--v-theme-primary),0.08)]">
        <v-icon icon="mdi-server-network-off" size="28" color="primary" />
      </div>
      <span class="text-sm font-semibold">No servers registered</span>
      <span class="mt-1 text-xs text-[rgba(var(--v-theme-on-surface),0.4)]">
        Connect the admin UI to a Socket.IO server to see nodes listed here
      </span>
    </div>

    <div
      v-else
      class="overflow-hidden rounded-2xl border border-[rgba(var(--v-border-color),var(--v-border-opacity))] bg-[rgb(var(--v-theme-surface))]"
    >
      <div class="flex items-center gap-3 border-b border-[rgba(var(--v-border-color),var(--v-border-opacity))] px-5 py-3">
        <v-icon icon="mdi-magnify" size="18" class="text-[rgba(var(--v-theme-on-surface),0.35)]" />
        <input
          v-model="search"
          type="text"
          placeholder="Filter by server ID or hostname…"
          class="flex-1 bg-transparent text-sm outline-none placeholder:text-[rgba(var(--v-theme-on-surface),0.3)]"
        />
        <span
          v-if="filteredServers.length !== sortedServers.length"
          class="rounded-full bg-[rgba(var(--v-theme-primary),0.1)] px-2.5 py-0.5 text-[11px] font-semibold text-[rgb(var(--v-theme-primary))]"
        >
          {{ filteredServers.length }} / {{ sortedServers.length }}
        </span>
      </div>

      <v-data-table
        :headers="headers"
        :items="filteredServers"
        :search="undefined"
        density="comfortable"
        hover
        items-per-page="25"
        class="servers-table"
      >
        <template #item.serverId="{ value }">
          <code class="rounded-md bg-[rgba(var(--v-theme-primary),0.06)] px-2 py-0.5 text-xs font-semibold text-[rgb(var(--v-theme-primary))]">
            {{ value }}
          </code>
        </template>
        <template #item.hostname="{ value }">
          <span class="text-sm font-medium">{{ value }}</span>
        </template>
        <template #item.uptime="{ value }">
          <span class="text-sm tabular-nums">{{ formatDuration(value) }}</span>
        </template>
        <template #item.lastPing="{ value }">
          <span class="text-sm tabular-nums text-[rgba(var(--v-theme-on-surface),0.65)]">{{ delaySinceLastPing(value) }}</span>
        </template>
        <template #item.healthy="{ value }">
          <ServerStatus :healthy="value" />
        </template>
        <template #item.actions="{ item }">
          <div class="flex justify-end">
            <button
              v-if="!item.healthy"
              class="flex size-8 items-center justify-center rounded-lg text-[rgba(var(--v-theme-on-surface),0.4)] transition-colors hover:bg-red-500/10 hover:text-red-500"
              title="Remove server from list"
              @click="serversStore.removeServer(item.serverId)"
            >
              <v-icon icon="mdi-delete-outline" size="16" />
            </button>
          </div>
        </template>
        <template #no-data>
          <div class="py-8 text-center text-sm text-[rgba(var(--v-theme-on-surface),0.35)]">
            No matching servers
          </div>
        </template>
      </v-data-table>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { sortBy } from "lodash-es";
import { formatDuration } from "../util";
import ServerStatus from "../components/ServerStatus.vue";
import { useServersStore } from "../stores/servers";

const serversStore = useServersStore();
const now = ref(Date.now());
const search = ref("");
let timer = null;

const headers = computed(() => [
  { title: "ID", key: "serverId", sortable: true },
  { title: "Hostname", key: "hostname", sortable: true },
  { title: "PID", key: "pid", sortable: true },
  { title: "Uptime", key: "uptime", sortable: true },
  { title: "Clients", key: "clientsCount", sortable: true },
  { title: "Last ping", key: "lastPing", sortable: true },
  { title: "Status", key: "healthy", sortable: true },
  { title: "", key: "actions", sortable: false, align: "end", width: "64px" },
]);

const sortedServers = computed(() => sortBy(serversStore.servers, "serverId"));

const filteredServers = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return sortedServers.value;
  return sortedServers.value.filter((s) => {
    const id = String(s.serverId ?? "").toLowerCase();
    const host = String(s.hostname ?? "").toLowerCase();
    return id.includes(q) || host.includes(q);
  });
});

function delaySinceLastPing(lastPing) {
  return `${formatDuration((now.value - lastPing) / 1000)} ago`;
}

onMounted(() => {
  timer = setInterval(() => {
    now.value = Date.now();
  }, 1000);
});

onUnmounted(() => {
  clearInterval(timer);
});
</script>

<style scoped>
.servers-table :deep(.v-data-table__thead th) {
  font-size: 0.7rem !important;
  font-weight: 600 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
  color: rgba(var(--v-theme-on-surface), 0.4) !important;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)) !important;
  white-space: nowrap;
}

.servers-table :deep(.v-data-table__tr) {
  transition: background 0.15s ease;
}

.servers-table :deep(.v-data-table__tr:hover) {
  background: rgba(var(--v-theme-primary), 0.03) !important;
}

.servers-table :deep(.v-data-table__tr td) {
  border-bottom: 1px solid rgba(var(--v-border-color), calc(var(--v-border-opacity) * 0.45)) !important;
  font-size: 0.82rem;
}

.servers-table :deep(.v-data-table-footer) {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  font-size: 0.78rem;
}
</style>
