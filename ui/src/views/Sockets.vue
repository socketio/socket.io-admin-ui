<template>
  <div class="mx-auto max-w-[1360px] px-6 py-7">
    <!-- Header -->
    <header class="mb-4 flex items-end justify-between">
      <div>
        <h1 class="text-lg font-bold tracking-tight">Sockets</h1>
        <p class="mt-0.5 text-xs font-medium text-[rgba(var(--v-theme-on-surface),0.45)]">
          Active socket connections across namespaces
        </p>
      </div>
      <NamespaceSelector />
    </header>

    <!-- Empty state -->
    <div
      v-if="!mainStore.sockets.length"
      class="flex flex-col items-center justify-center rounded-2xl border border-[rgba(var(--v-border-color),var(--v-border-opacity))] bg-[rgb(var(--v-theme-surface))] py-20"
    >
      <div class="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[rgba(var(--v-theme-primary),0.08)]">
        <v-icon icon="mdi-lan-disconnect" size="28" color="primary" />
      </div>
      <span class="text-sm font-semibold">No sockets connected</span>
      <span class="mt-1 text-xs text-[rgba(var(--v-theme-on-surface),0.4)]">
        Sockets will appear here once clients connect to the selected namespace
      </span>
    </div>

    <!-- Table -->
    <div
      v-else
      class="overflow-hidden rounded-2xl border border-[rgba(var(--v-border-color),var(--v-border-opacity))] bg-[rgb(var(--v-theme-surface))]"
    >
      <!-- Search bar -->
      <div class="flex items-center gap-3 border-b border-[rgba(var(--v-border-color),var(--v-border-opacity))] px-5 py-3">
        <v-icon icon="mdi-magnify" size="18" class="text-[rgba(var(--v-theme-on-surface),0.35)]" />
        <input
          v-model="search"
          type="text"
          placeholder="Filter by ID or IP address…"
          class="flex-1 bg-transparent text-sm outline-none placeholder:text-[rgba(var(--v-theme-on-surface),0.3)]"
        />
        <span
          v-if="filteredSockets.length !== mainStore.sockets.length"
          class="rounded-full bg-[rgba(var(--v-theme-primary),0.1)] px-2.5 py-0.5 text-[11px] font-semibold text-[rgb(var(--v-theme-primary))]"
        >
          {{ filteredSockets.length }} / {{ mainStore.sockets.length }}
        </span>
      </div>

      <!-- Data table -->
      <v-data-table
        :headers="headers"
        :items="filteredSockets"
        :search="undefined"
        density="comfortable"
        hover
        items-per-page="25"
        class="sockets-table"
        @click:row="onRowClick"
      >
        <!-- ID column -->
        <template #item.id="{ value }">
          <code class="rounded-md bg-[rgba(var(--v-theme-primary),0.06)] px-2 py-0.5 text-xs font-semibold text-[rgb(var(--v-theme-primary))]">
            {{ value }}
          </code>
        </template>

        <!-- Address column -->
        <template #item.handshake.address="{ value }">
          <span class="text-sm tabular-nums">{{ value || "—" }}</span>
        </template>

        <!-- Transport column -->
        <template #item.transport="{ value }">
          <span
            class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
            :class="value === 'websocket'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'"
          >
            <span
              class="size-1.5 rounded-full"
              :class="value === 'websocket' ? 'bg-emerald-500' : 'bg-amber-500'"
            />
            {{ value === "websocket" ? "WebSocket" : "Polling" }}
          </span>
        </template>

        <!-- Actions column -->
        <template #item.actions="{ item }">
          <div class="flex justify-end">
            <button
              v-if="disconnectSupported"
              :disabled="configStore.readonly"
              class="flex size-8 items-center justify-center rounded-lg text-[rgba(var(--v-theme-on-surface),0.4)] transition-colors hover:bg-red-500/10 hover:text-red-500 disabled:pointer-events-none disabled:opacity-30"
              title="Disconnect socket"
              @click.stop="disconnect(item)"
            >
              <v-icon icon="mdi-connection" size="16" />
            </button>
          </div>
        </template>

        <!-- No data -->
        <template #no-data>
          <div class="py-8 text-center text-sm text-[rgba(var(--v-theme-on-surface),0.35)]">
            No matching sockets
          </div>
        </template>
      </v-data-table>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import NamespaceSelector from "../components/NamespaceSelector.vue";
import SocketHolder from "../SocketHolder";
import { useConfigStore } from "../stores/config";
import { useMainStore } from "../stores/main";

const router = useRouter();
const configStore = useConfigStore();
const mainStore = useMainStore();

const search = ref("");

const disconnectSupported = computed(() =>
  configStore.supportedFeatures.includes("DISCONNECT"),
);

const headers = computed(() => [
  { title: "Socket ID", key: "id", sortable: true },
  { title: "IP Address", key: "handshake.address", sortable: true },
  { title: "Transport", key: "transport", sortable: true },
  { title: "", key: "actions", sortable: false, align: "end", width: "64px" },
]);

const filteredSockets = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return mainStore.sockets;
  return mainStore.sockets.filter((s) =>
    s.id.toLowerCase().includes(q)
    || (s.handshake?.address ?? "").toLowerCase().includes(q),
  );
});

function disconnect(socket) {
  SocketHolder.socket?.emit("_disconnect", socket.nsp, false, socket.id);
}

function onRowClick(_event, { item }) {
  if (!mainStore.selectedNamespace) return;
  router.push({
    name: "socket",
    params: { nsp: mainStore.selectedNamespace.name, id: item.id },
  });
}
</script>

<style scoped>
.sockets-table :deep(.v-data-table__thead th) {
  font-size: 0.7rem !important;
  font-weight: 600 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
  color: rgba(var(--v-theme-on-surface), 0.4) !important;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)) !important;
  white-space: nowrap;
}

.sockets-table :deep(.v-data-table__tr) {
  cursor: pointer;
  transition: background 0.15s ease;
}

.sockets-table :deep(.v-data-table__tr:hover) {
  background: rgba(var(--v-theme-primary), 0.03) !important;
}

.sockets-table :deep(.v-data-table__tr td) {
  border-bottom: 1px solid rgba(var(--v-border-color), calc(var(--v-border-opacity) * 0.45)) !important;
  font-size: 0.82rem;
}

.sockets-table :deep(.v-data-table-footer) {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  font-size: 0.78rem;
}
</style>