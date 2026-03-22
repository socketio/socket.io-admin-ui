<template>
  <div class="mx-auto max-w-[1360px] px-6 py-7">
    <header class="mb-4">
      <div>
        <h1 class="text-lg font-bold tracking-tight">{{ $t("clients.title") }}</h1>
        <p class="mt-0.5 text-xs font-medium text-[rgba(var(--v-theme-on-surface),0.45)]">
          Unique clients grouped by engine session
        </p>
      </div>
    </header>

    <div
      v-if="!mainStore.clients.length"
      class="flex flex-col items-center justify-center rounded-2xl border border-[rgba(var(--v-border-color),var(--v-border-opacity))] bg-[rgb(var(--v-theme-surface))] py-20"
    >
      <div class="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[rgba(var(--v-theme-primary),0.08)]">
        <v-icon icon="mdi-account-group-outline" size="28" color="primary" />
      </div>
      <span class="text-sm font-semibold">No clients yet</span>
      <span class="mt-1 text-xs text-[rgba(var(--v-theme-on-surface),0.4)]">
        Clients appear when socket connections use the same engine session
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
          placeholder="Filter by client ID or IP address…"
          class="flex-1 bg-transparent text-sm outline-none placeholder:text-[rgba(var(--v-theme-on-surface),0.3)]"
        />
        <span
          v-if="filteredClients.length !== mainStore.clients.length"
          class="rounded-full bg-[rgba(var(--v-theme-primary),0.1)] px-2.5 py-0.5 text-[11px] font-semibold text-[rgb(var(--v-theme-primary))]"
        >
          {{ filteredClients.length }} / {{ mainStore.clients.length }}
        </span>
      </div>

      <v-data-table
        :headers="headers"
        :items="filteredClients"
        :search="undefined"
        density="comfortable"
        hover
        items-per-page="25"
        class="clients-table"
        @click:row="onRowClick"
      >
        <template #item.id="{ value }">
          <code class="rounded-md bg-[rgba(var(--v-theme-primary),0.06)] px-2 py-0.5 text-xs font-semibold text-[rgb(var(--v-theme-primary))]">
            {{ value }}
          </code>
        </template>
        <template #item.address="{ item }">
          <span class="text-sm tabular-nums">{{ item.sockets[0]?.handshake?.address || "—" }}</span>
        </template>
        <template #item.transport="{ item }">
          <span
            class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
            :class="item.sockets[0]?.transport === 'websocket'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'"
          >
            <span
              class="size-1.5 rounded-full"
              :class="item.sockets[0]?.transport === 'websocket' ? 'bg-emerald-500' : 'bg-amber-500'"
            />
            {{ item.sockets[0]?.transport === "websocket" ? "WebSocket" : item.sockets[0]?.transport === "polling" ? "Polling" : (item.sockets[0]?.transport || "—") }}
          </span>
        </template>
        <template #item.sockets="{ item }">
          <span class="text-sm tabular-nums font-medium">{{ item.sockets.length }}</span>
        </template>
        <template #item.actions="{ item }">
          <div class="flex justify-end">
            <button
              v-if="disconnectSupported"
              :disabled="configStore.readonly"
              class="flex size-8 items-center justify-center rounded-lg text-[rgba(var(--v-theme-on-surface),0.4)] transition-colors hover:bg-red-500/10 hover:text-red-500 disabled:pointer-events-none disabled:opacity-30"
              :title="$t('clients.disconnect')"
              @click.stop="disconnect(item)"
            >
              <v-icon icon="mdi-logout" size="16" />
            </button>
          </div>
        </template>
        <template #no-data>
          <div class="py-8 text-center text-sm text-[rgba(var(--v-theme-on-surface),0.35)]">
            No matching clients
          </div>
        </template>
      </v-data-table>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import SocketHolder from "../SocketHolder";
import { useConfigStore } from "../stores/config";
import { useMainStore } from "../stores/main";

const router = useRouter();
const configStore = useConfigStore();
const mainStore = useMainStore();
const search = ref("");

const disconnectSupported = computed(() => configStore.supportedFeatures.includes("DISCONNECT"));

const headers = computed(() => [
  { title: "Client ID", key: "id", sortable: true },
  { title: "IP Address", key: "address", sortable: false },
  { title: "Transport", key: "transport", sortable: false },
  { title: "Sockets", key: "sockets", sortable: true },
  { title: "", key: "actions", sortable: false, align: "end", width: "64px" },
]);

const filteredClients = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return mainStore.clients;
  return mainStore.clients.filter((c) => {
    const id = String(c.id ?? "").toLowerCase();
    const addr = (c.sockets[0]?.handshake?.address ?? "").toLowerCase();
    return id.includes(q) || addr.includes(q);
  });
});

function disconnect(client) {
  const socket = client.sockets[0];
  if (socket) {
    SocketHolder.socket?.emit("_disconnect", socket.nsp, true, socket.id);
  }
}

function onRowClick(_event, { item }) {
  router.push({ name: "client", params: { id: item.id } });
}
</script>

<style scoped>
.clients-table :deep(.v-data-table__thead th) {
  font-size: 0.7rem !important;
  font-weight: 600 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
  color: rgba(var(--v-theme-on-surface), 0.4) !important;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)) !important;
  white-space: nowrap;
}

.clients-table :deep(.v-data-table__tr) {
  cursor: pointer;
  transition: background 0.15s ease;
}

.clients-table :deep(.v-data-table__tr:hover) {
  background: rgba(var(--v-theme-primary), 0.03) !important;
}

.clients-table :deep(.v-data-table__tr td) {
  border-bottom: 1px solid rgba(var(--v-border-color), calc(var(--v-border-opacity) * 0.45)) !important;
  font-size: 0.82rem;
}

.clients-table :deep(.v-data-table-footer) {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  font-size: 0.78rem;
}
</style>
