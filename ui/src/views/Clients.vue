<template>
  <div>
    <v-breadcrumbs :items="breadcrumbItems" />

    <v-card>
      <v-data-table
        :headers="headers"
        :items="clients"
        :footer-props="footerProps"
        class="row-pointer"
        @click:row="displayDetails"
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
            <span>{{ $t("clients.disconnect") }}</span>
          </v-tooltip>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
import { mapState } from "vuex";
import SocketHolder from "../SocketHolder";
import Transport from "../components/Transport";

export default {
  name: "Clients",

  components: { Transport },

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
          text: this.$t("clients.title"),
          disabled: true,
        },
      ];
    },
    headers() {
      return [
        {
          text: "#",
          value: "id",
          align: "start",
        },
        {
          text: this.$t("sockets.address"),
          value: "address",
        },
        {
          text: this.$t("sockets.transport"),
          value: "transport",
        },
        {
          text: this.$t("clients.sockets-count"),
          value: "sockets",
        },
        {
          value: "actions",
          align: "end",
          sortable: false,
        },
      ];
    },
    ...mapState({
      clients: (state) => state.main.clients,
      isReadonly: (state) => state.config.readonly,
      isSocketDisconnectSupported: (state) =>
        state.config.supportedFeatures.includes("DISCONNECT"),
    }),
  },

  methods: {
    disconnect(client) {
      const socket = client.sockets[0];
      if (socket) {
        SocketHolder.socket.emit("_disconnect", socket.nsp, true, socket.id);
      }
    },
    displayDetails(client) {
      this.$router.push({ name: "client", params: { id: client.id } });
    },
  },
};
</script>

<style scoped>
.row-pointer >>> tbody > tr:hover {
  cursor: pointer;
}
</style>
