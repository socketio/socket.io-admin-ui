<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import SocketHolder from "../../SocketHolder";

defineProps({
  sockets: Array,
});

const store = useStore();
const router = useRouter();
const { t } = useI18n();

const headers = computed(() => [
  {
    title: "#",
    key: "id",
    align: "start",
  },
  {
    title: t("namespace"),
    key: "nsp",
  },
  {
    key: "actions",
    align: "end",
    sortable: false,
  },
]);

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
    params: { nsp: socket.nsp, id: socket.id },
  });
};
</script>

<template>
  <v-card>
    <v-card-title>{{ $t("sockets.title") }}</v-card-title>

    <v-data-table
      :headers="headers"
      :items="sockets"
      density="compact"
      class="row-pointer"
      @click:row="(event, { item }) => displayDetails(item)"
    >
      <template v-slot:item.nsp="{ item }">
        <code>{{ item.nsp }}</code>
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
</template>

<style scoped></style>
