<template>
  <div class="mx-auto max-w-[1360px] px-6 py-7">
    <header class="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-lg font-bold tracking-tight">{{ $t("events.title") }}</h1>
        <p class="mt-0.5 text-xs font-medium text-[rgba(var(--v-theme-on-surface),0.45)]">
          Realtime activity log for the selected namespace
        </p>
      </div>
      <NamespaceSelector />
    </header>

    <div
      v-if="!mainStore.events.length"
      class="flex flex-col items-center justify-center rounded-2xl border border-[rgba(var(--v-border-color),var(--v-border-opacity))] bg-[rgb(var(--v-theme-surface))] py-20"
    >
      <div class="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[rgba(var(--v-theme-primary),0.08)]">
        <v-icon icon="mdi-timeline-text-outline" size="28" color="primary" />
      </div>
      <span class="text-sm font-semibold">No events recorded</span>
      <span class="mt-1 max-w-sm text-center text-xs text-[rgba(var(--v-theme-on-surface),0.4)]">
        Select a namespace with traffic to see connections, rooms, and message activity here
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
          placeholder="Filter by socket ID, type, or payload…"
          class="flex-1 bg-transparent text-sm outline-none placeholder:text-[rgba(var(--v-theme-on-surface),0.3)]"
        />
        <span
          v-if="filteredEvents.length !== mainStore.events.length"
          class="rounded-full bg-[rgba(var(--v-theme-primary),0.1)] px-2.5 py-0.5 text-[11px] font-semibold text-[rgb(var(--v-theme-primary))]"
        >
          {{ filteredEvents.length }} / {{ mainStore.events.length }}
        </span>
      </div>

      <v-data-table
        :headers="headers"
        :items="filteredEvents"
        item-key="eventId"
        :sort-by="sortBy"
        :search="undefined"
        density="comfortable"
        hover
        items-per-page="25"
        class="events-table"
      >
        <template #item.type="{ value }">
          <EventType :type="value" />
        </template>
        <template #item.id="{ value }">
          <router-link
            class="rounded-md bg-[rgba(var(--v-theme-primary),0.06)] px-2 py-0.5 text-xs font-semibold text-[rgb(var(--v-theme-primary))] no-underline transition-opacity hover:opacity-90"
            :to="socketDetailsRoute(value)"
          >
            {{ value }}
          </router-link>
        </template>
        <template #item.args="{ item }">
          <span v-if="isExpandable(item)" class="text-sm">
            {{ $t("events.eventName") }}{{ $t("separator") }}<code class="rounded bg-[rgba(var(--v-theme-on-surface),0.06)] px-1.5 py-0.5 text-xs">{{ item.eventName }}</code>
          </span>
          <span v-else-if="item.type === 'disconnection'" class="text-sm">
            {{ $t("events.reason") }}{{ $t("separator") }}<code class="rounded bg-[rgba(var(--v-theme-on-surface),0.06)] px-1.5 py-0.5 text-xs">{{ item.args }}</code>
          </span>
          <span v-else-if="item.type === 'room_joined' || item.type === 'room_left'" class="text-sm">
            {{ $t("events.room") }}{{ $t("separator") }}<code class="rounded bg-[rgba(var(--v-theme-on-surface),0.06)] px-1.5 py-0.5 text-xs">{{ item.args }}</code>
          </span>
          <span v-else class="text-sm">{{ item.args }}</span>
        </template>
        <template #no-data>
          <div class="py-8 text-center text-sm text-[rgba(var(--v-theme-on-surface),0.35)]">
            No matching events
          </div>
        </template>
      </v-data-table>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import NamespaceSelector from "../components/NamespaceSelector.vue";
import EventType from "../components/EventType.vue";
import { useMainStore } from "../stores/main";

const mainStore = useMainStore();
const search = ref("");

const sortBy = [
  { key: "timestamp", order: "desc" },
  { key: "eventId", order: "desc" },
];

const headers = computed(() => [
  { title: "Timestamp", key: "timestamp", sortable: true },
  { title: "Socket", key: "id", sortable: false },
  { title: "Type", key: "type", sortable: false },
  { title: "Data", key: "args", sortable: false },
]);

const filteredEvents = computed(() => {
  const q = search.value.trim().toLowerCase();
  const list = mainStore.events;
  if (!q) return list;
  return list.filter((e) => {
    const id = String(e.id ?? "").toLowerCase();
    const type = String(e.type ?? "").toLowerCase();
    const args = String(e.args ?? "").toLowerCase();
    const name = String(e.eventName ?? "").toLowerCase();
    return id.includes(q) || type.includes(q) || args.includes(q) || name.includes(q);
  });
});

function socketDetailsRoute(id) {
  return {
    name: "socket",
    params: { nsp: mainStore.selectedNamespace?.name, id },
  };
}

function isExpandable(item) {
  return item.type === "event_received" || item.type === "event_sent";
}
</script>

<style scoped>
.events-table :deep(.v-data-table__thead th) {
  font-size: 0.7rem !important;
  font-weight: 600 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
  color: rgba(var(--v-theme-on-surface), 0.4) !important;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)) !important;
  white-space: nowrap;
}

.events-table :deep(.v-data-table__tr) {
  transition: background 0.15s ease;
}

.events-table :deep(.v-data-table__tr:hover) {
  background: rgba(var(--v-theme-primary), 0.03) !important;
}

.events-table :deep(.v-data-table__tr td) {
  border-bottom: 1px solid rgba(var(--v-border-color), calc(var(--v-border-opacity) * 0.45)) !important;
  font-size: 0.82rem;
}

.events-table :deep(.v-data-table-footer) {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  font-size: 0.78rem;
}
</style>
