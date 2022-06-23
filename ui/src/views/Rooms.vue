<template>
  <div>
    <v-breadcrumbs :items="breadcrumbItems" />

    <v-card>
      <v-card-text class="d-flex">
        <NamespaceSelector />

        <v-switch
          v-model="showPrivateRooms"
          @change="onPrivateRoomsUpdate"
          :label="$t('rooms.show-private')"
          class="ml-3"
          inset
          dense
        />
      </v-card-text>

      <v-data-table
        :headers="headers"
        :items="filteredRooms"
        :footer-props="footerProps"
        class="row-pointer"
        @click:row="displayDetails"
      >
        <template v-slot:item.sockets="{ item }">
          {{ item.sockets.length }}
        </template>

        <template v-slot:item.isPrivate="{ value }">
          <RoomType :is-private="value" />
        </template>

        <template v-slot:item.actions="{ item }">
          <v-tooltip bottom v-if="isMultiLeaveSupported && !item.isPrivate">
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs"
                v-on="on"
                @click="clear(item)"
                :disabled="isReadonly"
                small
                class="ml-3"
              >
                <v-icon>mdi-tag-off-outline</v-icon>
              </v-btn>
            </template>
            <span>{{ $t("rooms.clear") }}</span>
          </v-tooltip>

          <v-tooltip bottom v-if="isMultiDisconnectSupported">
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
            <span>{{ $t("rooms.disconnect") }}</span>
          </v-tooltip>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
import { mapGetters, mapState } from "vuex";
import NamespaceSelector from "../components/NamespaceSelector";
import SocketHolder from "../SocketHolder";
import RoomType from "../components/Room/RoomType";
import { sortBy } from "lodash-es";

export default {
  name: "Rooms",

  components: { RoomType, NamespaceSelector },

  data() {
    return {
      showPrivateRooms: false,
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
          disabled: true,
        },
      ];
    },
    headers() {
      return [
        {
          text: this.$t("id"),
          value: "name",
          align: "start",
        },
        {
          text: this.$t("type"),
          value: "isPrivate",
        },
        {
          text: this.$t("rooms.sockets-count"),
          value: "sockets",
        },
        {
          value: "actions",
          align: "end",
          sortable: false,
        },
      ];
    },
    ...mapGetters("main", ["rooms"]),
    ...mapState({
      selectedNamespace: (state) => state.main.selectedNamespace,
      isReadonly: (state) => state.config.readonly,
      isMultiLeaveSupported: (state) =>
        state.config.supportedFeatures.includes("MLEAVE"),
      isMultiDisconnectSupported: (state) =>
        state.config.supportedFeatures.includes("MDISCONNECT"),
    }),
    filteredRooms() {
      const filteredRooms = this.showPrivateRooms
        ? this.rooms
        : this.rooms.filter((room) => !room.isPrivate);
      return sortBy(filteredRooms, "name");
    },
  },

  methods: {
    clear(room) {
      SocketHolder.socket.emit("leave", this.selectedNamespace.name, room.name);
    },
    disconnect(room) {
      SocketHolder.socket.emit(
        "_disconnect",
        this.selectedNamespace.name,
        false,
        room.name
      );
    },
    displayDetails(room) {
      this.$router.push({
        name: "room",
        params: { nsp: this.selectedNamespace.name, name: room.name },
      });
    },
    onPrivateRoomsUpdate(value) {
      const query = value ? { p: 1 } : {};
      this.$router.replace({
        name: "rooms",
        query,
      });
    },
  },

  mounted() {
    this.showPrivateRooms = this.$route.query.p === "1";
  },
};
</script>

<style scoped>
.row-pointer >>> tbody > tr:hover {
  cursor: pointer;
}
</style>
