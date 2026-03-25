<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import Transport from "../Transport.vue";
import ConnectionStatus from "../ConnectionStatus.vue";
import SocketHolder from "../../SocketHolder";

const props = defineProps({
  socket: Object,
  client: Object,
});

const store = useStore();

const toClient = computed(() => ({
  name: "client",
  params: {
    id: props.client.id,
  },
}));

const creationDate = computed(() =>
  new Date(props.socket.handshake.issued).toISOString(),
);

const isReadonly = computed(() => store.state.config.readonly);
const isSocketDisconnectSupported = computed(() =>
  store.state.config.supportedFeatures.includes("DISCONNECT"),
);

const disconnectClient = () => {
  SocketHolder.socket.emit(
    "_disconnect",
    props.socket.nsp,
    true,
    props.socket.id,
  );
};

const disconnectSocket = () => {
  SocketHolder.socket.emit(
    "_disconnect",
    props.socket.nsp,
    false,
    props.socket.id,
  );
};
</script>

<template>
  <v-card class="fill-height">
    <v-card-title>{{ $t("details") }}</v-card-title>

    <v-card-text
      ><h4>{{ $t("sockets.client") }}</h4></v-card-text
    >

    <v-table density="compact">
      <template v-slot:default>
        <tbody>
          <tr>
            <td class="key-column">{{ $t("id") }}</td>
            <td>
              <router-link
                v-if="client.connected"
                class="link"
                :to="toClient"
                >{{ client.id }}</router-link
              >
              <span v-else>{{ client.id }}</span>
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

    <v-card-text
      ><h4>{{ $t("sockets.socket") }}</h4></v-card-text
    >

    <v-table density="compact">
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
                location="bottom"
                v-if="isSocketDisconnectSupported && socket.connected"
              >
                <template v-slot:activator="{ props }">
                  <v-btn
                    v-bind="props"
                    @click="disconnectSocket()"
                    :disabled="isReadonly"
                    size="small"
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
    </v-table>
  </v-card>
</template>

<style scoped>
.key-column {
  width: 30%;
}

.link {
  color: inherit;
}
</style>
