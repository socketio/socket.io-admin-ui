<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import ClientDetails from "../components/Client/ClientDetails.vue";
import InitialRequest from "../components/Socket/InitialRequest.vue";
import ClientSockets from "../components/Client/ClientSockets.vue";

const store = useStore();
const route = useRoute();
const { t } = useI18n();

const socket = ref(null);
const client = ref(null);

const breadcrumbItems = computed(() => [
  {
    title: t("clients.title"),
    to: { name: "clients" },
    exact: true,
  },
  {
    title: t("clients.details"),
    disabled: true,
  },
]);

onMounted(() => {
  client.value = store.getters["main/findClientById"](route.params.id);
  if (client.value) {
    socket.value = client.value.sockets[0];
  }
});
</script>

<template>
  <div>
    <v-breadcrumbs :items="breadcrumbItems" />

    <v-container v-if="client" fluid>
      <v-row>
        <v-col sm="12" md="6" lg="4">
          <ClientDetails :client="client" :socket="socket" />
        </v-col>

        <v-col sm="12" md="6" lg="4">
          <InitialRequest :socket="socket" v-if="socket" />
        </v-col>

        <v-col sm="12" md="6" lg="4">
          <ClientSockets :sockets="client.sockets" />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
