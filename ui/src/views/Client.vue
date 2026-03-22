<template>
  <div class="mx-auto max-w-6xl px-6 pb-12 pt-7">
    <router-link
      :to="{ name: 'clients' }"
      class="mb-5 inline-flex items-center gap-1.5 text-xs font-medium text-[rgba(var(--v-theme-on-surface),0.45)] transition-colors hover:text-[rgb(var(--v-theme-primary))]"
    >
      <v-icon icon="mdi-arrow-left" size="14" />
      Back to Clients
    </router-link>

    <div
      v-if="!client"
      class="flex flex-col items-center justify-center gap-3 py-24 text-center"
    >
      <v-icon icon="mdi-account-off-outline" size="48" class="text-[rgba(var(--v-theme-on-surface),0.15)]" />
      <p class="text-sm text-[rgba(var(--v-theme-on-surface),0.4)]">Client not found or disconnected</p>
      <v-btn
        variant="tonal"
        size="small"
        color="primary"
        :to="{ name: 'clients' }"
      >
        View all clients
      </v-btn>
    </div>

    <template v-if="client">
      <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-3">
          <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(var(--v-theme-primary),0.1)]">
            <v-icon icon="mdi-account-outline" size="20" color="primary" />
          </div>
          <div>
            <h1 class="my-0 text-lg font-bold tracking-tight">Client Details</h1>
            <code class="my-0 mt-0.5 text-xs text-[rgba(var(--v-theme-on-surface),0.45)]">{{ client.id }}</code>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span
            class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
            :class="client.connected
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'bg-red-500/10 text-red-600 dark:text-red-400'"
          >
            <span
              class="size-1.5 rounded-full"
              :class="client.connected ? 'bg-emerald-500' : 'bg-red-500'"
            />
            {{ client.connected ? "Connected" : "Disconnected" }}
          </span>

          <v-btn
            v-if="isDisconnectSupported && client.connected"
            variant="tonal"
            color="error"
            size="x-small"
            :disabled="isReadonly"
            :title="$t('clients.disconnect')"
            @click="disconnectClient"
          >
            <v-icon icon="mdi-logout" size="14" class="mr-1" />
            Disconnect
          </v-btn>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(260px,300px)] lg:items-start">
        <!-- Main: details + HTTP -->
        <div class="flex min-w-0 flex-col gap-5">
          <section
            class="overflow-hidden rounded-2xl border border-[rgba(var(--v-border-color),var(--v-border-opacity))] bg-[rgb(var(--v-theme-surface))]"
          >
            <div class="flex items-center gap-2 border-b border-[rgba(var(--v-border-color),var(--v-border-opacity))] px-5 py-3">
              <v-icon icon="mdi-text-box-outline" size="16" class="text-[rgba(var(--v-theme-on-surface),0.4)]" />
              <h2 class="text-[13px] font-semibold tracking-wide">Details</h2>
            </div>
            <div class="space-y-0 px-5 pb-1 pt-0">
              <DetailRow label="ID" mono :value="client.id" />
              <DetailRow label="Status">
                <ConnectionStatus :connected="client.connected" />
              </DetailRow>
              <DetailRow v-if="referenceSocket" label="Transport">
                <Transport :transport="referenceSocket.transport" />
              </DetailRow>
              <DetailRow v-if="referenceSocket" label="IP address" :value="referenceSocket.handshake?.address" />
              <p
                v-if="referenceSocket && (transportsDiffer || addressesDiffer)"
                class="border-t border-[rgba(var(--v-border-color),calc(var(--v-border-opacity)*0.4))] py-2 text-[10px] text-[rgba(var(--v-theme-on-surface),0.4)]"
              >
                Transport or IP differs across this client's sockets; values shown are from one active socket.
              </p>
            </div>
          </section>

          <section
            v-if="hasHandshakeDetails"
            class="overflow-hidden rounded-2xl border border-[rgba(var(--v-border-color),var(--v-border-opacity))] bg-[rgb(var(--v-theme-surface))]"
          >
            <div class="flex items-center gap-2 border-b border-[rgba(var(--v-border-color),var(--v-border-opacity))] px-5 py-3">
              <v-icon icon="mdi-swap-vertical" size="16" class="text-[rgba(var(--v-theme-on-surface),0.4)]" />
              <h2 class="text-[13px] font-semibold tracking-wide">Initial HTTP request</h2>
            </div>

            <div v-if="handshakeHeaders.length" class="border-b border-[rgba(var(--v-border-color),calc(var(--v-border-opacity)*0.5))]">
              <div class="flex items-center gap-2 px-5 pt-4 pb-2">
                <h3 class="text-[11px] font-semibold uppercase tracking-wider text-[rgba(var(--v-theme-on-surface),0.45)]">
                  Headers
                </h3>
                <span class="ml-auto rounded-full bg-[rgba(var(--v-theme-on-surface),0.06)] px-2 py-0.5 text-[10px] font-semibold text-[rgba(var(--v-theme-on-surface),0.45)]">
                  {{ handshakeHeaders.length }}
                </span>
              </div>
              <div class="px-0 pb-4">
                <table class="w-full">
                  <tbody>
                    <tr
                      v-for="{ key, value } in handshakeHeaders"
                      :key="key"
                      class="border-t border-[rgba(var(--v-border-color),calc(var(--v-border-opacity)*0.35))] transition-colors hover:bg-[rgba(var(--v-theme-primary),0.02)]"
                    >
                      <td
                        class="w-[32%] py-2 pl-5 pr-3 align-top font-mono text-[11px] font-medium text-[rgba(var(--v-theme-on-surface),0.45)]"
                      >
                        {{ key }}
                      </td>
                      <td class="break-all py-2 pr-5 font-mono text-[11px]">{{ value }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div v-if="handshakeQuery.length">
              <div class="flex items-center gap-2 px-5 pt-4 pb-2">
                <h3 class="text-[11px] font-semibold uppercase tracking-wider text-[rgba(var(--v-theme-on-surface),0.45)]">
                  Query parameters
                </h3>
                <span class="ml-auto rounded-full bg-[rgba(var(--v-theme-on-surface),0.06)] px-2 py-0.5 text-[10px] font-semibold text-[rgba(var(--v-theme-on-surface),0.45)]">
                  {{ handshakeQuery.length }}
                </span>
              </div>
              <div class="px-0 pb-4">
                <table class="w-full">
                  <tbody>
                    <tr
                      v-for="{ key, value } in handshakeQuery"
                      :key="key"
                      class="border-t border-[rgba(var(--v-border-color),calc(var(--v-border-opacity)*0.35))] transition-colors hover:bg-[rgba(var(--v-theme-primary),0.02)]"
                    >
                      <td
                        class="w-[32%] py-2 pl-5 pr-3 align-top font-mono text-[11px] font-medium text-[rgba(var(--v-theme-on-surface),0.45)]"
                      >
                        {{ key }}
                      </td>
                      <td class="break-all py-2 pr-5 font-mono text-[11px]">{{ value }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <p
            v-else-if="!referenceSocket"
            class="rounded-2xl border border-dashed border-[rgba(var(--v-border-color),var(--v-border-opacity))] px-5 py-8 text-center text-xs text-[rgba(var(--v-theme-on-surface),0.35)]"
          >
            No handshake data (no sockets on this client).
          </p>
        </div>

        <!-- Sidebar: sockets -->
        <aside
          class="overflow-hidden rounded-2xl border border-[rgba(var(--v-border-color),var(--v-border-opacity))] bg-[rgb(var(--v-theme-surface))] lg:sticky lg:top-6"
        >
          <div class="flex items-center gap-2 border-b border-[rgba(var(--v-border-color),var(--v-border-opacity))] px-4 py-3">
            <v-icon icon="mdi-lan-outline" size="16" class="text-[rgba(var(--v-theme-on-surface),0.4)]" />
            <h2 class="text-[13px] font-semibold tracking-wide">Sockets</h2>
            <span class="ml-auto rounded-full bg-[rgba(var(--v-theme-on-surface),0.06)] px-2 py-0.5 text-[10px] font-semibold text-[rgba(var(--v-theme-on-surface),0.45)]">
              {{ sortedSockets.length }}
            </span>
          </div>
          <ul
            v-if="sortedSockets.length"
            class="divide-y divide-[rgba(var(--v-border-color),calc(var(--v-border-opacity)*0.5))]"
          >
            <li
              v-for="sock in sortedSockets"
              :key="sock.id"
              class="flex items-start gap-2 px-4 py-3"
            >
              <div class="min-w-0 flex-1">
                <router-link
                  :to="{ name: 'socket', params: { nsp: sock.nsp, id: sock.id } }"
                  class="block truncate font-mono text-xs font-medium text-[rgb(var(--v-theme-primary))] hover:underline"
                >
                  {{ sock.id }}
                </router-link>
                <code class="mt-1 block truncate text-[10px] text-[rgba(var(--v-theme-on-surface),0.4)]">{{ sock.nsp }}</code>
                <span
                  class="mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  :class="sock.connected
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-[rgba(var(--v-theme-on-surface),0.06)] text-[rgba(var(--v-theme-on-surface),0.45)]'"
                >
                  <span
                    class="size-1 rounded-full"
                    :class="sock.connected ? 'bg-emerald-500' : 'bg-[rgba(var(--v-theme-on-surface),0.25)]'"
                  />
                  {{ sock.connected ? "Connected" : "Disconnected" }}
                </span>
              </div>
              <button
                v-if="isDisconnectSupported && sock.connected"
                type="button"
                :disabled="isReadonly"
                class="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg text-[rgba(var(--v-theme-on-surface),0.4)] transition-colors hover:bg-red-500/10 hover:text-red-500 disabled:pointer-events-none disabled:opacity-30"
                title="Disconnect this socket"
                @click="disconnectSocket(sock)"
              >
                <v-icon icon="mdi-power-plug-off-outline" size="16" />
              </button>
            </li>
          </ul>
          <p v-else class="px-4 py-8 text-center text-xs text-[rgba(var(--v-theme-on-surface),0.35)]">
            No sockets attached
          </p>
        </aside>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import Transport from "../components/Transport.vue";
import ConnectionStatus from "../components/ConnectionStatus.vue";
import DetailRow from "../components/DetailRow.vue";
import SocketHolder from "../SocketHolder";
import { useConfigStore } from "../stores/config";
import { useMainStore } from "../stores/main";

const route = useRoute();
const mainStore = useMainStore();
const configStore = useConfigStore();

const client = computed(() => mainStore.findClientById(route.params.id));

const isReadonly = computed(() => configStore.readonly);
const isDisconnectSupported = computed(() =>
  configStore.supportedFeatures?.includes("DISCONNECT"),
);

const sortedSockets = computed(() =>
  client.value?.sockets
    ? [...client.value.sockets].sort((a, b) => a.id.localeCompare(b.id))
    : [],
);

const referenceSocket = computed(() => {
  const list = sortedSockets.value;
  if (!list.length) return null;
  const connected = list.find((s) => s.connected);
  return connected ?? list[0];
});

const transportsDiffer = computed(() => {
  const list = sortedSockets.value;
  if (list.length < 2) return false;
  const first = list[0]?.transport;
  return list.some((s) => s.transport !== first);
});

const addressesDiffer = computed(() => {
  const list = sortedSockets.value;
  if (list.length < 2) return false;
  const first = list[0]?.handshake?.address;
  return list.some((s) => s.handshake?.address !== first);
});

function objectToSorted(obj) {
  if (!obj || typeof obj !== "object") return [];
  return Object.keys(obj)
    .sort()
    .map((key) => ({ key, value: obj[key] }));
}

const handshakeHeaders = computed(() =>
  objectToSorted(referenceSocket.value?.handshake?.headers),
);

const handshakeQuery = computed(() =>
  objectToSorted(referenceSocket.value?.handshake?.query),
);

const hasHandshakeDetails = computed(
  () => handshakeHeaders.value.length > 0 || handshakeQuery.value.length > 0,
);

function disconnectSocket(sock) {
  SocketHolder.socket?.emit("_disconnect", sock.nsp, false, sock.id);
}

function disconnectClient() {
  const socket = client.value?.sockets[0];
  if (socket) {
    SocketHolder.socket?.emit("_disconnect", socket.nsp, true, socket.id);
  }
}
</script>
