<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import NamespaceSelector from "../components/NamespaceSelector.vue";
import SocketHolder from "../SocketHolder";
import Transport from "../components/Transport.vue";

const store = useStore();
const router = useRouter();
const { t } = useI18n();

const breadcrumbItems = computed(() => [
  {
    title: t("sockets.title"),
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
    key: "handshake.address",
  },
  {
    title: t("sockets.transport"),
    key: "transport",
  },
  {
    key: "actions",
    align: "end",
    sortable: false,
  },
]);

const sockets = computed(() => store.getters["main/sockets"]);
const selectedNamespace = computed(() => store.state.main.selectedNamespace);
const isReadonly = computed(() => store.state.config.readonly);
const isSocketDisconnectSupported = computed(() =>
  store.state.config.supportedFeatures.includes("DISCONNECT"),
);

const disconnect = (socket) => {
  SocketHolder.socket.emit("_disconnect", socket.nsp, false, socket.id);
};

const displayDetails = (socket) => {
  router.push({
    name: "socket",
    params: { nsp: selectedNamespace.value.name, id: socket.id },
  });
};
</script>

<template>
  <div>
    <v-breadcrumbs :items="breadcrumbItems" />

    <v-card>
      <v-card-text>
        <NamespaceSelector />
      </v-card-text>

      <v-data-table
        :headers="headers"
        :items="sockets"
        :items-per-page-options="[20, 100, -1]"
        class="row-pointer"
        @click:row="(event, { item }) => displayDetails(item)"
      >
        <template v-slot:item.transport="{ item }">
          <Transport :transport="item.transport" />
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
            <span>{{ $t("sockets.disconnect") }}</span>
          </v-tooltip>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>
