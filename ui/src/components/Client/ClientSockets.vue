<template>
  <v-card>
    <v-card-title>{{ $t("sockets.title") }}</v-card-title>

    <v-data-table
      :headers="headers"
      :items="sockets"
      dense
      class="row-pointer"
      @click:row="displayDetails"
    >
      <template v-slot:item.nsp="{ value }">
        <code>{{ value }}</code>
      </template>

      <template v-slot:item.actions="{ item }">
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
import { mapState } from "vuex";
import SocketHolder from "../../SocketHolder";

export default {
  name: "ClientSockets",

  props: {
    sockets: Array,
  },

  computed: {
    headers() {
      return [
        {
          text: "#",
          value: "id",
          align: "start",
        },
        {
          text: this.$t("namespace"),
          value: "nsp",
        },
        {
          value: "actions",
          align: "end",
          sortable: false,
        },
      ];
    },
    ...mapState({
      isReadonly: (state) => state.config.readonly,
      isSocketDisconnectSupported: (state) =>
        state.config.supportedFeatures.includes("DISCONNECT"),
    }),
  },

  methods: {
    disconnect(socket) {
      SocketHolder.socket.emit("_disconnect", socket.nsp, false, socket.id);
    },
    displayDetails(socket) {
      this.$router.push({
        name: "socket",
        params: { nsp: socket.nsp, id: socket.id },
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
