<template>
  <div class="mx-auto max-w-[1360px] px-6 py-7">
    <!-- Header -->
    <header class="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 class="text-lg font-bold tracking-tight">{{ $t("rooms.title") }}</h1>
        <p class="mt-0.5 text-xs font-medium text-[rgba(var(--v-theme-on-surface),0.45)]">
          Channels and broadcast groups in this namespace
        </p>
      </div>

      <div class="flex items-center gap-3">
        <NamespaceSelector />

        <!-- Compact private rooms toggle -->
        <button
          class="group flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
          :class="showPrivateRooms
            ? 'border-[rgba(var(--v-theme-primary),0.3)] bg-[rgba(var(--v-theme-primary),0.06)] text-[rgb(var(--v-theme-primary))]'
            : 'border-[rgba(var(--v-border-color),var(--v-border-opacity))] text-[rgba(var(--v-theme-on-surface),0.5)] hover:border-[rgba(var(--v-theme-on-surface),0.2)]'"
          @click="togglePrivateRooms"
        >
          <span
            class="relative inline-block h-3.5 w-6 rounded-full transition-colors"
            :class="showPrivateRooms ? 'bg-[rgb(var(--v-theme-primary))]' : 'bg-[rgba(var(--v-theme-on-surface),0.2)]'"
          >
            <span
              class="absolute top-0.5 left-0.5 size-2.5 rounded-full bg-white transition-transform"
              :class="showPrivateRooms ? 'translate-x-2.5' : 'translate-x-0'"
            />
          </span>
          {{ $t("rooms.show-private") }}
        </button>
      </div>
    </header>

    <!-- Empty state -->
    <div
      v-if="!mainStore.rooms.length"
      class="flex flex-col items-center justify-center rounded-2xl border border-[rgba(var(--v-border-color),var(--v-border-opacity))] bg-[rgb(var(--v-theme-surface))] py-20"
    >
      <div class="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[rgba(var(--v-theme-primary),0.08)]">
        <v-icon icon="mdi-door-sliding" size="28" color="primary" />
      </div>
      <span class="text-sm font-semibold">No rooms in this namespace</span>
      <span class="mt-1 text-xs text-[rgba(var(--v-theme-on-surface),0.4)]">
        Rooms appear when sockets join channels on the selected namespace
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
          placeholder="Filter by room name…"
          class="flex-1 bg-transparent text-sm outline-none placeholder:text-[rgba(var(--v-theme-on-surface),0.3)]"
        />
        <span
          v-if="displayedRooms.length !== baseRooms.length"
          class="rounded-full bg-[rgba(var(--v-theme-primary),0.1)] px-2.5 py-0.5 text-[11px] font-semibold text-[rgb(var(--v-theme-primary))]"
        >
          {{ displayedRooms.length }} / {{ baseRooms.length }}
        </span>
      </div>

      <v-data-table
        :headers="headers"
        :items="displayedRooms"
        :search="undefined"
        density="comfortable"
        hover
        items-per-page="25"
        class="rooms-table"
        @click:row="onRowClick"
      >
        <template #item.name="{ value }">
          <code class="rounded-md bg-[rgba(var(--v-theme-primary),0.06)] px-2 py-0.5 text-xs font-semibold text-[rgb(var(--v-theme-primary))]">
            {{ value }}
          </code>
        </template>

        <template #item.isPrivate="{ value }">
          <RoomType :is-private="value" />
        </template>

        <template #item.sockets="{ item }">
          <span class="text-sm font-medium tabular-nums">{{ item.sockets.length }}</span>
        </template>

        <template #item.actions="{ item }">
          <div class="flex justify-end gap-0.5">
            <button
              v-if="multiLeaveSupported && !item.isPrivate"
              :disabled="configStore.readonly"
              class="flex size-8 items-center justify-center rounded-lg text-[rgba(var(--v-theme-on-surface),0.4)] transition-colors hover:bg-amber-500/10 hover:text-amber-600 disabled:pointer-events-none disabled:opacity-30 dark:hover:text-amber-400"
              :title="$t('rooms.clear')"
              @click.stop="clear(item)"
            >
              <v-icon icon="mdi-tag-off-outline" size="16" />
            </button>
            <button
              v-if="multiDisconnectSupported"
              :disabled="configStore.readonly"
              class="flex size-8 items-center justify-center rounded-lg text-[rgba(var(--v-theme-on-surface),0.4)] transition-colors hover:bg-red-500/10 hover:text-red-500 disabled:pointer-events-none disabled:opacity-30"
              :title="$t('rooms.disconnect')"
              @click.stop="disconnect(item)"
            >
              <v-icon icon="mdi-logout" size="16" />
            </button>
          </div>
        </template>

        <template #no-data>
          <div class="py-8 text-center text-sm text-[rgba(var(--v-theme-on-surface),0.35)]">
            No matching rooms
          </div>
        </template>
      </v-data-table>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import NamespaceSelector from "../components/NamespaceSelector.vue";
import RoomType from "../components/Room/RoomType.vue";
import SocketHolder from "../SocketHolder";
import { useConfigStore } from "../stores/config";
import { useMainStore } from "../stores/main";

const route = useRoute();
const router = useRouter();
const configStore = useConfigStore();
const mainStore = useMainStore();

const showPrivateRooms = ref(route.query.p === "1");
const search = ref("");

const multiLeaveSupported = computed(() => configStore.supportedFeatures.includes("MLEAVE"));
const multiDisconnectSupported = computed(() => configStore.supportedFeatures.includes("MDISCONNECT"));

const headers = computed(() => [
  { title: "Room", key: "name", sortable: true },
  { title: "Type", key: "isPrivate", sortable: true },
  { title: "Sockets", key: "sockets", sortable: true },
  { title: "", key: "actions", sortable: false, align: "end", width: "88px" },
]);

const baseRooms = computed(() => {
  const rooms = showPrivateRooms.value
    ? mainStore.rooms
    : mainStore.rooms.filter((room) => !room.isPrivate);
  return [...rooms].sort((a, b) => a.name.localeCompare(b.name));
});

const displayedRooms = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return baseRooms.value;
  return baseRooms.value.filter((r) => r.name.toLowerCase().includes(q));
});

function togglePrivateRooms() {
  showPrivateRooms.value = !showPrivateRooms.value;

  const url = new URL(window.location.href);
  if (showPrivateRooms.value) {
    url.searchParams.set("p", "1");
  } else {
    url.searchParams.delete("p");
  }
  window.history.replaceState(history.state, "", url);
}

function clear(room) {
  SocketHolder.socket?.emit("leave", mainStore.selectedNamespace?.name, room.name);
}

function disconnect(room) {
  SocketHolder.socket?.emit(
    "_disconnect",
    mainStore.selectedNamespace?.name,
    false,
    room.name,
  );
}

function onRowClick(_event, { item }) {
  if (!mainStore.selectedNamespace) return;
  router.push({
    name: "room",
    params: { nsp: mainStore.selectedNamespace.name, name: item.name },
  });
}
</script>

<style scoped>
.rooms-table :deep(.v-data-table__thead th) {
  font-size: 0.7rem !important;
  font-weight: 600 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
  color: rgba(var(--v-theme-on-surface), 0.4) !important;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)) !important;
  white-space: nowrap;
}

.rooms-table :deep(.v-data-table__tr) {
  cursor: pointer;
  transition: background 0.15s ease;
}

.rooms-table :deep(.v-data-table__tr:hover) {
  background: rgba(var(--v-theme-primary), 0.03) !important;
}

.rooms-table :deep(.v-data-table__tr td) {
  border-bottom: 1px solid rgba(var(--v-border-color), calc(var(--v-border-opacity) * 0.45)) !important;
  font-size: 0.82rem;
}

.rooms-table :deep(.v-data-table-footer) {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  font-size: 0.78rem;
}
</style>