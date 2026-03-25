<script setup>
import { ref, computed } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import SocketHolder from "../../SocketHolder";
import { differenceBy } from "lodash-es";

const props = defineProps({
  socket: Object,
});

const store = useStore();
const router = useRouter();
const { t } = useI18n();

const newRoom = ref("");

const headers = computed(() => [
  {
    title: t("id"),
    key: "name",
    align: "start",
  },
  {
    key: "actions",
    align: "end",
    sortable: false,
  },
]);

const roomsAsObjects = computed(() =>
  props.socket.rooms
    .slice(0)
    .sort()
    .map((room) => ({
      name: room,
    })),
);

const availableRooms = computed(() =>
  differenceBy(
    store.getters["main/findRoomsByNamespace"](props.socket.nsp),
    roomsAsObjects.value,
    "name",
  ),
);

const isReadonly = computed(() => store.state.config.readonly);
const isSocketLeaveSupported = computed(() =>
  store.state.config.supportedFeatures.includes("LEAVE"),
);

const onSubmit = () => {
  SocketHolder.socket.emit(
    "join",
    props.socket.nsp,
    newRoom.value,
    props.socket.id,
  );
  newRoom.value = "";
};

const leave = (room) => {
  SocketHolder.socket.emit(
    "leave",
    props.socket.nsp,
    room.name,
    props.socket.id,
  );
};

const displayDetails = (room) => {
  router.push({
    name: "room",
    params: { nsp: props.socket.nsp, name: room.name },
  });
};
</script>

<template>
  <v-card class="fill-height">
    <v-card-title>{{ $t("rooms.title") }}</v-card-title>
    <v-data-table
      :headers="headers"
      :items="roomsAsObjects"
      density="compact"
      class="row-pointer"
      @click:row="(event, { item }) => displayDetails(item)"
    >
      <template v-slot:item.actions="{ item }">
        <v-tooltip location="bottom" v-if="isSocketLeaveSupported">
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
          <span>{{ $t("sockets.leave") }}</span>
        </v-tooltip>
      </template>
    </v-data-table>

    <v-card-text>
      <form @submit.prevent="onSubmit" class="d-flex align-center">
        <v-combobox
          v-model:search="newRoom"
          :label="$t('sockets.join-a-room')"
          :items="availableRooms"
          item-value="name"
          item-title="name"
          class="select-room d-inline-block mr-3"
          :disabled="isReadonly"
          :return-object="false"
          hide-details
        />

        <v-tooltip location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              type="submit"
              size="small"
              :disabled="isReadonly"
            >
              <v-icon>mdi-tag-plus-outline</v-icon>
            </v-btn>
          </template>
          <span>{{ $t("sockets.join") }}</span>
        </v-tooltip>
      </form>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.select-room {
  max-width: 200px;
}
</style>
