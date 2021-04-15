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

<script>
import { mapGetters } from "vuex";
import SocketRooms from "../components/Socket/SocketRooms";
import SocketDetails from "../components/Socket/SocketDetails";
import InitialRequest from "../components/Socket/InitialRequest";

export default {
  name: "Socket",

  components: { InitialRequest, SocketDetails, SocketRooms },

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
          text: this.$t("sockets.title"),
          to: { name: "sockets" },
        },
        {
          text: this.$t("sockets.details"),
          disabled: true,
        },
      ];
    },
    ...mapGetters("main", ["findSocketById", "findClientById"]),
  },

  mounted() {
    this.socket = this.findSocketById(
      this.$route.params.nsp,
      this.$route.params.id
    );
    if (this.socket) {
      this.client = this.findClientById(this.socket.clientId);
    }
  },
};
</script>

<style scoped></style>
