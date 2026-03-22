<template>
  <div class="mx-auto max-w-6xl px-6 pb-12 pt-7">
    <!-- Back link -->
    <router-link
      :to="{ name: 'sockets' }"
      class="mb-5 inline-flex items-center gap-1.5 text-xs font-medium text-[rgba(var(--v-theme-on-surface),0.45)] transition-colors hover:text-[rgb(var(--v-theme-primary))]"
    >
      <v-icon icon="mdi-arrow-left" size="14" />
      Back to Sockets
    </router-link>

    <!-- Not found -->
    <div
      v-if="!socket"
      class="flex flex-col items-center justify-center gap-3 py-24 text-center"
    >
      <v-icon icon="mdi-lan-disconnect" size="48" class="text-[rgba(var(--v-theme-on-surface),0.15)]" />
      <p class="text-sm text-[rgba(var(--v-theme-on-surface),0.4)]">Socket not found or disconnected</p>
      <v-btn
        variant="tonal"
        size="small"
        color="primary"
        :to="{ name: 'sockets' }"
      >
        View all sockets
      </v-btn>
    </div>

    <template v-if="socket">
      <!-- Header -->
      <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-3">
          <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(var(--v-theme-primary),0.1)]">
            <v-icon icon="mdi-power-plug-outline" size="20" color="primary" />
          </div>
          <div>
            <h1 class="text-lg font-bold tracking-tight my-0">Socket Details</h1>
            <code class="mt-0.5 text-xs text-[rgba(var(--v-theme-on-surface),0.45)] my-0">{{ socket.id }}</code>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span
            class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
            :class="socket.connected
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'bg-red-500/10 text-red-600 dark:text-red-400'"
          >
            <span
              class="size-1.5 rounded-full"
              :class="socket.connected ? 'bg-emerald-500' : 'bg-red-500'"
            />
            {{ socket.connected ? "Connected" : "Disconnected" }}
          </span>

          <v-btn
            v-if="isSocketDisconnectSupported && socket.connected"
            variant="tonal"
            color="error"
            size="x-small"
            :disabled="isReadonly"
            @click="disconnectSocket"
          >
            <v-icon icon="mdi-power-plug-off-outline" size="14" class="mr-1" />
            Disconnect
          </v-btn>
        </div>
      </div>

      <!-- Grid -->
      <div class="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <!-- ─── Client Info ─────────────────────────── -->
        <section
          class="overflow-hidden rounded-2xl border border-[rgba(var(--v-border-color),var(--v-border-opacity))] bg-[rgb(var(--v-theme-surface))]"
        >
          <div class="flex items-center gap-2 px-5 pt-4 pb-3">
            <v-icon icon="mdi-account-outline" size="16" class="text-[rgba(var(--v-theme-on-surface),0.4)]" />
            <h2 class="text-[13px] font-semibold tracking-wide">Client</h2>
          </div>
          <div class="space-y-0 px-5 pb-4">
            <DetailRow label="Client ID">
              <router-link
                v-if="client?.connected"
                :to="{ name: 'client', params: { id: client.id } }"
                class="font-mono text-xs text-[rgb(var(--v-theme-primary))] hover:underline"
              >
                {{ client.id }}
              </router-link>
              <span v-else-if="client" class="font-mono text-xs">{{ client.id }}</span>
              <span v-else class="text-xs text-[rgba(var(--v-theme-on-surface),0.3)]">—</span>
            </DetailRow>
            <DetailRow v-if="client" label="Status">
              <ConnectionStatus :connected="client.connected" />
            </DetailRow>
            <DetailRow label="Transport">
              <Transport :transport="socket.transport" />
            </DetailRow>
            <DetailRow label="IP Address" :value="socket.handshake?.address" />
          </div>
        </section>

        <!-- ─── Socket Info ─────────────────────────── -->
        <section
          class="overflow-hidden rounded-2xl border border-[rgba(var(--v-border-color),var(--v-border-opacity))] bg-[rgb(var(--v-theme-surface))]"
        >
          <div class="flex items-center gap-2 px-5 pt-4 pb-3">
            <v-icon icon="mdi-information-outline" size="16" class="text-[rgba(var(--v-theme-on-surface),0.4)]" />
            <h2 class="text-[13px] font-semibold tracking-wide">Socket</h2>
          </div>
          <div class="space-y-0 px-5 pb-4">
            <DetailRow label="Namespace">
              <code class="rounded-md bg-[rgba(var(--v-theme-primary),0.07)] px-2 py-0.5 font-mono text-xs text-[rgb(var(--v-theme-primary))]">
                {{ socket.nsp }}
              </code>
            </DetailRow>
            <DetailRow label="Socket ID" :value="socket.id" mono />
            <DetailRow v-if="socket.data && Object.keys(socket.data).length" label="Data">
              <pre class="max-h-32 overflow-auto rounded-lg bg-[rgba(var(--v-theme-on-surface),0.03)] p-2.5 font-mono text-[11px] leading-relaxed">{{ JSON.stringify(socket.data, null, 2) }}</pre>
            </DetailRow>
            <DetailRow v-if="creationDate" label="Created" :value="creationDate" />
          </div>
        </section>

        <!-- ─── Rooms ───────────────────────────────── -->
        <section
          class="overflow-hidden rounded-2xl border border-[rgba(var(--v-border-color),var(--v-border-opacity))] bg-[rgb(var(--v-theme-surface))]"
        >
          <div class="flex items-center gap-2 px-5 pt-4 pb-3">
            <v-icon icon="mdi-tag-multiple-outline" size="16" class="text-[rgba(var(--v-theme-on-surface),0.4)]" />
            <h2 class="text-[13px] font-semibold tracking-wide">Rooms</h2>
            <span class="ml-auto rounded-full bg-[rgba(var(--v-theme-on-surface),0.06)] px-2 py-0.5 text-[10px] font-semibold text-[rgba(var(--v-theme-on-surface),0.45)]">
              {{ sortedRooms.length }}
            </span>
          </div>
          <div class="px-0! pt-0! pb-4">
            <!-- Room list -->
            <ul v-if="sortedRooms.length" class="divide-y divide-[rgba(var(--v-border-color),calc(var(--v-border-opacity)*0.5))]">
              <li
                v-for="room in sortedRooms"
                :key="room"
                class="group flex items-center justify-between px-5 py-2.5 transition-colors hover:bg-[rgba(var(--v-theme-primary),0.03)]"
              >
                <router-link
                  :to="{ name: 'room', params: { nsp: socket.nsp, name: room } }"
                  class="truncate font-mono text-xs hover:text-[rgb(var(--v-theme-primary))]"
                >
                  {{ room }}
                </router-link>
                <v-btn
                  v-if="isSocketLeaveSupported"
                  variant="text"
                  size="x-small"
                  color="error"
                  :disabled="isReadonly"
                  class="opacity-0 transition-opacity group-hover:opacity-100"
                  @click="leaveRoom(room)"
                >
                  <v-icon icon="mdi-tag-off-outline" size="14" />
                </v-btn>
              </li>
            </ul>
            <p v-else class="px-5 py-6 text-center text-xs text-[rgba(var(--v-theme-on-surface),0.3)]">
              No rooms joined
            </p>

            <!-- Join form -->
            <form
              class="flex items-center gap-2 border-t border-[rgba(var(--v-border-color),var(--v-border-opacity))] px-4 pt-3 pb-3"
              @submit.prevent="joinRoom"
            >
              <v-combobox
                v-model="newRoom"
                :items="availableRooms"
                item-value="name"
                item-title="name"
                placeholder="Room name…"
                density="compact"
                variant="outlined"
                hide-details
                :disabled="isReadonly"
                :return-object="false"
                class="flex-1 text-xs"
              />
              <v-btn
                type="submit"
                variant="tonal"
                color="primary"
                size="small"
                :disabled="isReadonly || !newRoom"
              >
                <v-icon icon="mdi-tag-plus-outline" size="16" class="mr-1" />
                Join
              </v-btn>
            </form>
          </div>
        </section>
      </div>

      <!-- ─── HTTP Handshake ──────────────────────── -->
      <div
        v-if="hasHandshakeDetails"
        class="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2"
      >
        <!-- Headers -->
        <section
          v-if="handshakeHeaders.length"
          class="overflow-hidden rounded-2xl border border-[rgba(var(--v-border-color),var(--v-border-opacity))] bg-[rgb(var(--v-theme-surface))]"
        >
          <div class="flex items-center gap-2 px-5 pt-4 pb-3">
            <v-icon icon="mdi-web" size="16" class="text-[rgba(var(--v-theme-on-surface),0.4)]" />
            <h2 class="text-[13px] font-semibold tracking-wide">HTTP Headers</h2>
            <span class="ml-auto rounded-full bg-[rgba(var(--v-theme-on-surface),0.06)] px-2 py-0.5 text-[10px] font-semibold text-[rgba(var(--v-theme-on-surface),0.45)]">
              {{ handshakeHeaders.length }}
            </span>
          </div>
          <div class="px-0! pt-0! pb-4">
            <table class="w-full">
              <tbody>
                <tr
                  v-for="{ key, value } in handshakeHeaders"
                  :key="key"
                  class="border-b border-[rgba(var(--v-border-color),calc(var(--v-border-opacity)*0.4))] transition-colors last:border-b-0 hover:bg-[rgba(var(--v-theme-primary),0.02)]"
                >
                  <td
                    class="w-2/5 py-2 pl-5 pr-3 align-top font-mono text-[11px] font-medium text-[rgba(var(--v-theme-on-surface),0.45)]"
                  >
                    {{ key }}
                  </td>
                  <td class="break-all py-2 pr-5 font-mono text-[11px]">{{ value }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Query params -->
        <section
          v-if="handshakeQuery.length"
          class="overflow-hidden rounded-2xl border border-[rgba(var(--v-border-color),var(--v-border-opacity))] bg-[rgb(var(--v-theme-surface))]"
        >
          <div class="flex items-center gap-2 px-5 pt-4 pb-3">
            <v-icon icon="mdi-help-circle-outline" size="16" class="text-[rgba(var(--v-theme-on-surface),0.4)]" />
            <h2 class="text-[13px] font-semibold tracking-wide">Query Parameters</h2>
            <span class="ml-auto rounded-full bg-[rgba(var(--v-theme-on-surface),0.06)] px-2 py-0.5 text-[10px] font-semibold text-[rgba(var(--v-theme-on-surface),0.45)]">
              {{ handshakeQuery.length }}
            </span>
          </div>
          <div class="px-0! pt-0! pb-4">
            <table class="w-full">
              <tbody>
                <tr
                  v-for="{ key, value } in handshakeQuery"
                  :key="key"
                  class="border-b border-[rgba(var(--v-border-color),calc(var(--v-border-opacity)*0.4))] transition-colors last:border-b-0 hover:bg-[rgba(var(--v-theme-primary),0.02)]"
                >
                  <td
                    class="w-2/5 py-2 pl-5 pr-3 align-top font-mono text-[11px] font-medium text-[rgba(var(--v-theme-on-surface),0.45)]"
                  >
                    {{ key }}
                  </td>
                  <td class="break-all py-2 pr-5 font-mono text-[11px]">{{ value }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import Transport from "../components/Transport.vue";
import ConnectionStatus from "../components/ConnectionStatus.vue";
import DetailRow from "../components/DetailRow.vue";
import { useMainStore } from "../stores/main";
import { useConfigStore } from "../stores/config";
import { useConnectionStore } from "../stores/connection";

const route = useRoute();
const mainStore = useMainStore();
const configStore = useConfigStore();
const connectionStore = useConnectionStore();

// ── Data ─────────────────────────────────────────────────
const socket = computed(() =>
  mainStore.findSocketById(route.params.nsp, route.params.id),
);

const client = computed(() =>
  socket.value ? mainStore.findClientById(socket.value.clientId) : null,
);

const isReadonly = computed(() => configStore.readonly);
const isSocketDisconnectSupported = computed(() =>
  configStore.supportedFeatures?.includes("DISCONNECT"),
);
const isSocketLeaveSupported = computed(() =>
  configStore.supportedFeatures?.includes("LEAVE"),
);

// ── Rooms ────────────────────────────────────────────────
const sortedRooms = computed(() =>
  socket.value?.rooms ? [...socket.value.rooms].sort() : [],
);

const availableRooms = computed(() => {
  if (!socket.value) return [];
  const all = mainStore.findRoomsByNamespace?.(socket.value.nsp) ?? [];
  const joined = new Set(socket.value.rooms);
  return all.filter((r) => !joined.has(r.name));
});

const newRoom = ref("");

function joinRoom() {
  if (!newRoom.value || !socket.value) return;
  connectionStore.socket.emit("join", socket.value.nsp, newRoom.value, socket.value.id);
  newRoom.value = "";
}

function leaveRoom(room) {
  if (!socket.value) return;
  connectionStore.socket.emit("leave", socket.value.nsp, room, socket.value.id);
}

function disconnectSocket() {
  if (!socket.value) return;
  connectionStore.socket.emit("_disconnect", socket.value.nsp, false, socket.value.id);
}

// ── Handshake ────────────────────────────────────────────
const creationDate = computed(() => {
  const issued = socket.value?.handshake?.issued;
  if (!issued) return null;
  return new Date(issued).toISOString();
});

function objectToSorted(obj) {
  if (!obj || typeof obj !== "object") return [];
  return Object.keys(obj)
    .sort()
    .map((key) => ({ key, value: obj[key] }));
}

const handshakeHeaders = computed(() =>
  objectToSorted(socket.value?.handshake?.headers),
);

const handshakeQuery = computed(() =>
  objectToSorted(socket.value?.handshake?.query),
);

const hasHandshakeDetails = computed(
  () => handshakeHeaders.value.length > 0 || handshakeQuery.value.length > 0,
);
</script>
