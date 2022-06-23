<template>
  <v-card v-if="room">
    <v-card-title>{{ $t("sockets.title") }}</v-card-title>

    <v-data-table
      :headers="headers"
      :items="room.sockets"
      :footer-props="footerProps"
      class="row-pointer"
      @click:row="displayDetails"
    >
      <template v-slot:item.transport="{ value }">
        <Transport :transport="value" />
      </template>
      <template v-slot:item.actions="{ item }">
        <v-tooltip bottom v-if="isSocketLeaveSupported && !room.isPrivate">
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
          <span>{{ $t("rooms.leave") }}</span>
        </v-tooltip>

        <v-tooltip bottom v-if="isSocketDisconnectSupported">
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-bind="attrs"
              v-on="on"
              @click="disconnect(item)"
              :disabled="isReadonly"
              small
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

<script>
import Transport from "../Transport";
import { mapGetters, mapState } from "vuex";
import SocketHolder from "../../SocketHolder";

export default {
  name: "RoomSockets",

  components: { Transport },

  props: {
    room: Object,
  },

  data() {
    return {
      footerProps: {
        "items-per-page-options": [20, 100, -1],
      },
    };
  },

  computed: {
    breadcrumbItems() {
      return [
        {
          text: this.$t("rooms.title"),
          to: { name: "rooms" },
        },
        {
          text: this.$t("rooms.details"),
          disabled: true,
        },
      ];
    },
    headers() {
      return [
        {
          text: this.$t("id"),
          value: "id",
          align: "start",
        },
        {
          text: this.$t("sockets.address"),
          value: "handshake.address",
        },
        {
          text: this.$t("sockets.transport"),
          value: "transport",
        },
        {
          value: "actions",
          align: "end",
          sortable: false,
        },
      ];
    },
    ...mapGetters("main", ["findRoomByName"]),
    ...mapState({
      isReadonly: (state) => state.config.readonly,
      isSocketLeaveSupported: (state) =>
        state.config.supportedFeatures.includes("LEAVE"),
      isSocketDisconnectSupported: (state) =>
        state.config.supportedFeatures.includes("DISCONNECT"),
    }),
  },

  methods: {
    leave(socket) {
      SocketHolder.socket.emit("leave", socket.nsp, this.room.name, socket.id);
    },
    disconnect(socket) {
      SocketHolder.socket.emit("_disconnect", socket.nsp, false, socket.id);
    },
    displayDetails(socket) {
      this.$router.push({
        name: "socket",
        params: { nsp: this.$route.params.nsp, id: socket.id },
      });
    },
  },
};
</script>

<style scoped>
.row-pointer >>> tbody > tr:hover {
  cursor: pointer;
}
</style>
