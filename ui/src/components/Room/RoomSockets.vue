<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import Transport from "../Transport.vue";
import SocketHolder from "../../SocketHolder";

const props = defineProps({
  room: Object,
});

const store = useStore();
const router = useRouter();
const route = useRoute();
const { t } = useI18n();

const headers = computed(() => [
  {
    title: t("id"),
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

const isReadonly = computed(() => store.state.config.readonly);
const isSocketLeaveSupported = computed(() =>
  store.state.config.supportedFeatures.includes("LEAVE"),
);
const isSocketDisconnectSupported = computed(() =>
  store.state.config.supportedFeatures.includes("DISCONNECT"),
);

const leave = (socket) => {
  SocketHolder.socket.emit("leave", socket.nsp, props.room.name, socket.id);
};

const disconnect = (socket) => {
  SocketHolder.socket.emit("_disconnect", socket.nsp, false, socket.id);
};

const displayDetails = (socket) => {
  router.push({
    name: "socket",
    params: { nsp: route.params.nsp, id: socket.id },
  });
};
</script>

<template>
  <v-card v-if="room">
    <v-card-title>{{ $t("sockets.title") }}</v-card-title>

    <v-data-table
      :headers="headers"
      :items="room.sockets"
      :items-per-page-options="[20, 100, -1]"
      class="row-pointer"
      @click:row="(event, { item }) => displayDetails(item)"
    >
      <template v-slot:item.transport="{ item }">
        <Transport :transport="item.transport" />
      </template>
      <template v-slot:item.actions="{ item }">
        <v-tooltip
          location="bottom"
          v-if="isSocketLeaveSupported && !room.isPrivate"
        >
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              @click.stop="leave(item)"
              :disabled="isReadonly"
              size="small"
              class="ml-3"
            >
              <v-icon>mdi-tag-off-outline</v-icon>
            </v-btn>
          </template>
          <span>{{ $t("rooms.leave") }}</span>
        </v-tooltip>

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
