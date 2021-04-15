<template>
  <v-card class="fill-height">
    <v-card-title>{{ $t("details") }}</v-card-title>

    <v-simple-table dense>
      <template>
        <tbody>
          <tr>
            <td class="key-column">{{ $t("id") }}</td>
            <td>
              {{ client.id }}
            </td>
            <td></td>
          </tr>
          <tr>
            <td class="key-column">{{ $t("status") }}</td>
            <td>
              <ConnectionStatus :connected="client.connected" />
            </td>
            <td align="right">
              <v-tooltip
                bottom
                v-if="isSocketDisconnectSupported && client.connected"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    v-bind="attrs"
                    v-on="on"
                    @click="disconnectClient()"
                    :disabled="isReadonly"
                    small
                  >
                    <v-icon>mdi-logout</v-icon>
                  </v-btn>
                </template>
                <span>{{ $t("clients.disconnect") }}</span>
              </v-tooltip>
            </td>
          </tr>
          <tr>
            <td class="key-column">{{ $t("sockets.transport") }}</td>
            <td><Transport :transport="socket.transport" /></td>
            <td></td>
          </tr>
          <tr>
            <td class="key-column">{{ $t("sockets.address") }}</td>
            <td>{{ socket.handshake.address }}</td>
            <td></td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
  </v-card>
</template>

<script>
import Transport from "../Transport";
import ConnectionStatus from "../ConnectionStatus";
import { mapState } from "vuex";
import SocketHolder from "../../SocketHolder";

export default {
  name: "ClientDetails",

  components: { ConnectionStatus, Transport },

  props: {
    client: Object,
    socket: Object,
  },

  computed: {
    ...mapState({
      isReadonly: (state) => state.config.readonly,
      isSocketDisconnectSupported: (state) =>
        state.config.supportedFeatures.includes("DISCONNECT"),
    }),
  },

  methods: {
    disconnectClient() {
      const socket = this.client.sockets[0];
      if (socket) {
        SocketHolder.socket.emit("_disconnect", socket.nsp, true, socket.id);
      }
    },
  },
};
</script>

<style scoped>
.key-column {
  width: 30%;
}
</style>
