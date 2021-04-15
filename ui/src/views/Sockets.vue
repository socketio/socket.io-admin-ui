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
        :footer-props="footerProps"
      >
        <template v-slot:item.transport="{ value }">
          <Transport :transport="value" />
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

          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs"
                v-on="on"
                @click="displayDetails(item)"
                small
                class="ml-3"
              >
                <v-icon>mdi-dots-horizontal</v-icon>
              </v-btn>
            </template>
            <span>{{ $t("sockets.displayDetails") }}</span>
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
import Transport from "../components/Transport";

export default {
  name: "Sockets",
  components: { Transport, NamespaceSelector },
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
          text: this.$t("sockets.title"),
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
    ...mapGetters("main", ["sockets"]),
    ...mapState({
      selectedNamespace: (state) => state.main.selectedNamespace,
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
        params: { nsp: this.selectedNamespace.name, id: socket.id },
      });
    },
  },
};
</script>
