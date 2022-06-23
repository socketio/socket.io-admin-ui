<template>
  <v-card class="fill-height">
    <v-card-title>{{ $t("rooms.title") }}</v-card-title>
    <v-data-table
      :headers="headers"
      :items="roomsAsObjects"
      dense
      class="row-pointer"
      @click:row="displayDetails"
    >
      <template v-slot:item.actions="{ item }">
        <v-tooltip bottom v-if="isSocketLeaveSupported">
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-bind="attrs"
              v-on="on"
              @click="leave(item)"
              :disabled="isReadonly"
              small
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
      <form @submit.prevent="onSubmit">
        <v-combobox
          :search-input.sync="newRoom"
          :label="$t('sockets.join-a-room')"
          :items="availableRooms"
          item-value="name"
          item-text="name"
          class="select-room d-inline-block mr-3"
          :disabled="isReadonly"
          :return-object="false"
        />

        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-bind="attrs"
              v-on="on"
              type="submit"
              small
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

<script>
import { mapGetters, mapState } from "vuex";
import SocketHolder from "../../SocketHolder";
import { differenceBy } from "lodash-es";

export default {
  name: "SocketRooms",

  props: {
    socket: Object,
  },

  data() {
    return {
      newRoom: "",
    };
  },

  computed: {
    headers() {
      return [
        {
          text: this.$t("id"),
          value: "name",
          align: "start",
        },
        {
          value: "actions",
          align: "end",
          sortable: false,
        },
      ];
    },
    roomsAsObjects() {
      return this.socket.rooms
        .slice(0)
        .sort()
        .map((room) => ({
          name: room,
        }));
    },
    availableRooms() {
      return differenceBy(
        this.findRoomsByNamespace(this.socket.nsp),
        this.roomsAsObjects,
        "name"
      );
    },
    ...mapState({
      selectedNamespace: (state) => state.main.selectedNamespace,
      isReadonly: (state) => state.config.readonly,
      isSocketLeaveSupported: (state) =>
        state.config.supportedFeatures.includes("LEAVE"),
      isSocketDisconnectSupported: (state) =>
        state.config.supportedFeatures.includes("DISCONNECT"),
    }),
    ...mapGetters("main", ["findRoomsByNamespace"]),
  },

  methods: {
    emit() {
      // TODO
    },
    onSubmit() {
      SocketHolder.socket.emit(
        "join",
        this.socket.nsp,
        this.newRoom,
        this.socket.id
      );
      this.newRoom = "";
    },
    leave(room) {
      SocketHolder.socket.emit(
        "leave",
        this.socket.nsp,
        room.name,
        this.socket.id
      );
    },
    disconnect() {
      SocketHolder.socket.emit(
        "_disconnect",
        this.socket.nsp,
        false,
        this.socket.id
      );
    },
    displayDetails(room) {
      this.$router.push({
        name: "room",
        params: { nsp: this.socket.nsp, name: room.name },
      });
    },
  },
};
</script>

<style scoped>
.select-room {
  max-width: 200px;
}
.row-pointer >>> tbody > tr:hover {
  cursor: pointer;
}
</style>
