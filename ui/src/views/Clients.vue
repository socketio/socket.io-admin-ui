<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import SocketHolder from "../SocketHolder";
import Transport from "../components/Transport.vue";

const store = useStore();
const router = useRouter();
const { t } = useI18n();

const breadcrumbItems = computed(() => [
  {
    title: t("clients.title"),
    disabled: true,
  },
]);

const headers = computed(() => [
  {
    title: "#",
    key: "id",
    align: "start",
  },
  {
    title: t("sockets.address"),
    key: "address",
  },
  {
    title: t("sockets.transport"),
    key: "transport",
  },
  {
    title: t("clients.sockets-count"),
    key: "sockets",
  },
  {
    key: "actions",
    align: "end",
    sortable: false,
  },
]);

const clients = computed(() => store.state.main.clients);
const isReadonly = computed(() => store.state.config.readonly);
const isSocketDisconnectSupported = computed(() =>
  store.state.config.supportedFeatures.includes("DISCONNECT"),
);

const disconnect = (client) => {
  const socket = client.sockets[0];
  if (socket) {
    SocketHolder.socket.emit("_disconnect", socket.nsp, true, socket.id);
  }
};

const displayDetails = (client) => {
  router.push({ name: "client", params: { id: client.id } });
};
</script>

<template>
  <div>
    <v-breadcrumbs :items="breadcrumbItems" />

    <v-card>
      <v-data-table
        :headers="headers"
        :items="clients"
        :items-per-page-options="[20, 100, -1]"
        class="row-pointer"
        @click:row="(event, { item }) => displayDetails(item)"
      >
        <template v-slot:item.address="{ item }">
          <span v-if="item.sockets.length">{{
            item.sockets[0].handshake.address
          }}</span>
        </template>

        <template v-slot:item.transport="{ item }">
          <Transport
            v-if="item.sockets.length"
            :transport="item.sockets[0].transport"
          />
        </template>

        <template v-slot:item.sockets="{ item }">
          {{ item.sockets.length }}
        </template>

        <template v-slot:item.actions="{ item }">
          <v-tooltip location="bottom" v-if="isSocketDisconnectSupported">
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                @click.stop="disconnect(item)"
                :disabled="isReadonly"
                size="small"
                class="ml-3"
              >
                <v-icon>mdi-logout</v-icon>
              </v-btn>
            </template>
            <span>{{ $t("clients.disconnect") }}</span>
          </v-tooltip>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>
