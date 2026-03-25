<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import Transport from "../Transport.vue";
import ConnectionStatus from "../ConnectionStatus.vue";
import SocketHolder from "../../SocketHolder";

const props = defineProps({
  client: Object,
  socket: Object,
});

const store = useStore();

const isReadonly = computed(() => store.state.config.readonly);
const isSocketDisconnectSupported = computed(() =>
  store.state.config.supportedFeatures.includes("DISCONNECT"),
);

const disconnectClient = () => {
  const socket = props.client.sockets[0];
  if (socket) {
    SocketHolder.socket.emit("_disconnect", socket.nsp, true, socket.id);
  }
};
</script>

<template>
  <v-card class="fill-height">
    <v-card-title>{{ $t("details") }}</v-card-title>

    <v-table density="compact">
      <template v-slot:default>
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
                location="bottom"
                v-if="isSocketDisconnectSupported && client.connected"
              >
                <template v-slot:activator="{ props }">
                  <v-btn
                    v-bind="props"
                    @click="disconnectClient()"
                    :disabled="isReadonly"
                    size="small"
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
    </v-table>
  </v-card>
</template>

<style scoped>
.key-column {
  width: 30%;
}
</style>
