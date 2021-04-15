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

<script>
import { mapGetters } from "vuex";
import ClientDetails from "../components/Client/ClientDetails";
import InitialRequest from "../components/Socket/InitialRequest";
import ClientSockets from "../components/Client/ClientSockets";

export default {
  name: "Client",

  components: { ClientSockets, InitialRequest, ClientDetails },

  data() {
    return {
      socket: null,
      client: null,
    };
  },

  computed: {
    breadcrumbItems() {
      return [
        {
          text: this.$t("clients.title"),
          to: { name: "clients" },
          exact: true,
        },
        {
          text: this.$t("clients.details"),
          disabled: true,
        },
      ];
    },
    ...mapGetters("main", ["findClientById"]),
  },

  mounted() {
    this.client = this.findClientById(this.$route.params.id);
    if (this.client) {
      this.socket = this.client.sockets[0];
    }
  },
};
</script>

<style scoped></style>
