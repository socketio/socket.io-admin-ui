<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { sortBy } from "lodash-es";
import NamespaceSelector from "../components/NamespaceSelector.vue";
import SocketHolder from "../SocketHolder";
import RoomType from "../components/Room/RoomType.vue";

const store = useStore();
const router = useRouter();
const route = useRoute();
const { t } = useI18n();

const showPrivateRooms = ref(false);

const breadcrumbItems = computed(() => [
  {
    title: t("rooms.title"),
    disabled: true,
  },
]);

const headers = computed(() => [
  {
    title: t("id"),
    key: "name",
    align: "start",
  },
  {
    title: t("type"),
    key: "isPrivate",
  },
  {
    title: t("rooms.sockets-count"),
    key: "sockets",
  },
  {
    key: "actions",
    align: "end",
    sortable: false,
  },
]);

const rooms = computed(() => store.getters["main/rooms"]);
const selectedNamespace = computed(() => store.state.main.selectedNamespace);
const isReadonly = computed(() => store.state.config.readonly);
const isMultiLeaveSupported = computed(() =>
  store.state.config.supportedFeatures.includes("MLEAVE"),
);
const isMultiDisconnectSupported = computed(() =>
  store.state.config.supportedFeatures.includes("MDISCONNECT"),
);

const filteredRooms = computed(() => {
  const filtered = showPrivateRooms.value
    ? rooms.value
    : rooms.value.filter((room) => !room.isPrivate);
  return sortBy(filtered, "name");
});

const clear = (room) => {
  SocketHolder.socket.emit("leave", selectedNamespace.value.name, room.name);
};

const disconnect = (room) => {
  SocketHolder.socket.emit(
    "_disconnect",
    selectedNamespace.value.name,
    false,
    room.name,
  );
};

const displayDetails = (room) => {
  router.push({
    name: "room",
    params: { nsp: selectedNamespace.value.name, name: room.name },
  });
};

const onPrivateRoomsUpdate = (value) => {
  const query = value ? { p: 1 } : {};
  router.replace({
    name: "rooms",
    query,
  });
};

onMounted(() => {
  showPrivateRooms.value = route.query.p === "1";
});
</script>

<template>
  <div>
    <v-breadcrumbs :items="breadcrumbItems" />

    <v-card>
      <v-card-text class="d-flex">
        <NamespaceSelector />

        <v-switch
          v-model="showPrivateRooms"
          @update:modelValue="onPrivateRoomsUpdate"
          :label="$t('rooms.show-private')"
          class="ml-3"
          inset
          dense
        />
      </v-card-text>

      <v-data-table
        :headers="headers"
        :items="filteredRooms"
        :items-per-page-options="[20, 100, -1]"
        class="row-pointer"
        @click:row="(event, { item }) => displayDetails(item)"
      >
        <template v-slot:item.sockets="{ item }">
          {{ item.sockets.length }}
        </template>

        <template v-slot:item.isPrivate="{ item }">
          <RoomType :is-private="item.isPrivate" />
        </template>

        <template v-slot:item.actions="{ item }">
          <v-tooltip
            location="bottom"
            v-if="isMultiLeaveSupported && !item.isPrivate"
          >
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                @click.stop="clear(item)"
                :disabled="isReadonly"
                size="small"
                class="ml-3"
              >
                <v-icon>mdi-tag-off-outline</v-icon>
              </v-btn>
            </template>
            <span>{{ $t("rooms.clear") }}</span>
          </v-tooltip>

          <v-tooltip location="bottom" v-if="isMultiDisconnectSupported">
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
            <span>{{ $t("rooms.disconnect") }}</span>
          </v-tooltip>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>
