<template>
  <v-card class="fill-height">
    <v-card-title>{{ $t("details") }}</v-card-title>

    <v-card-text
      ><h4>{{ $t("sockets.client") }}</h4></v-card-text
    >

    <v-simple-table dense>
      <template>
        <tbody>
          <tr>
            <td class="key-column">{{ $t("id") }}</td>
            <td>
              {{ client.id }}
            </td>
            <td align="right">
              <v-tooltip bottom v-if="client.connected">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    v-bind="attrs"
                    v-on="on"
                    @click="navigateToClient()"
                    small
                    class="ml-3"
                  >
                    <v-icon>mdi-dots-horizontal</v-icon>
                  </v-btn>
                </template>
                <span>{{ $t("clients.displayDetails") }}</span>
              </v-tooltip>
            </td>
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

    <v-card-text
      ><h4>{{ $t("sockets.socket") }}</h4></v-card-text
    >

    <v-simple-table dense>
      <template v-slot:default>
        <tbody>
          <tr>
            <td class="key-column">{{ $t("namespace") }}</td>
            <td>
              <code>{{ socket.nsp }}</code>
            </td>
            <td></td>
          </tr>

          <tr>
            <td class="key-column">{{ $t("id") }}</td>
            <td>{{ socket.id }}</td>
            <td></td>
          </tr>

          <tr>
            <td class="key-column">{{ $t("data") }}</td>
            <td>
              <pre><code>{{ JSON.stringify(socket.data, null, 2) }}</code></pre>
            </td>
            <td></td>
          </tr>

          <tr>
            <td class="key-column">{{ $t("status") }}</td>
            <td>
              <ConnectionStatus :connected="socket.connected" />
            </td>
            <td align="right">
              <v-tooltip
                bottom
                v-if="isSocketDisconnectSupported && socket.connected"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    v-bind="attrs"
                    v-on="on"
                    @click="disconnectSocket()"
                    :disabled="isReadonly"
                    small
                    class="ml-3"
                  >
                    <v-icon>mdi-logout</v-icon>
                  </v-btn>
                </template>
                <span>{{ $t("sockets.disconnect") }}</span>
              </v-tooltip>
            </td>
          </tr>

          <tr>
            <td class="key-column">{{ $t("sockets.creation-date") }}</td>
            <td>{{ creationDate }}</td>
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
  name: "SocketDetails",

  components: { ConnectionStatus, Transport },

  props: {
    socket: Object,
    client: Object,
  },

  computed: {
    creationDate() {
      return new Date(this.socket.handshake.issued).toISOString();
    },
    ...mapState({
      isReadonly: (state) => state.config.readonly,
      isSocketDisconnectSupported: (state) =>
        state.config.supportedFeatures.includes("DISCONNECT"),
    }),
  },

  methods: {
    navigateToClient() {
      this.$router.push({
        name: "client",
        params: {
          id: this.client.id,
        },
      });
    },
    disconnectClient() {
      SocketHolder.socket.emit(
        "_disconnect",
        this.socket.nsp,
        true,
        this.socket.id
      );
    },
    disconnectSocket() {
      SocketHolder.socket.emit(
        "_disconnect",
        this.socket.nsp,
        false,
        this.socket.id
      );
    },
  },
};
</script>

<style scoped>
.key-column {
  width: 30%;
}
</style>
