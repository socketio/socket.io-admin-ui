<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import SocketRooms from "../components/Socket/SocketRooms.vue";
import SocketDetails from "../components/Socket/SocketDetails.vue";
import InitialRequest from "../components/Socket/InitialRequest.vue";

const store = useStore();
const route = useRoute();
const { t } = useI18n();

const socket = ref(null);
const client = ref(null);

const breadcrumbItems = computed(() => [
  {
    title: t("sockets.title"),
    to: { name: "sockets" },
  },
  {
    title: t("sockets.details"),
    disabled: true,
  },
]);

onMounted(() => {
  socket.value = store.getters["main/findSocketById"](
    route.params.nsp,
    route.params.id,
  );
  if (socket.value) {
    client.value = store.getters["main/findClientById"](socket.value.clientId);
  }
});
</script>

<template>
  <div>
    <v-breadcrumbs :items="breadcrumbItems" />

    <v-container v-if="socket" fluid>
      <v-row>
        <v-col sm="12" md="6" lg="4">
          <SocketDetails :socket="socket" :client="client" />
        </v-col>

        <v-col sm="12" md="6" lg="4">
          <InitialRequest :socket="socket" />
        </v-col>

        <v-col sm="12" md="6" lg="4">
          <SocketRooms :socket="socket" />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
