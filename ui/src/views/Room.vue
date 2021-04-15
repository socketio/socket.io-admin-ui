<template>
  <div>
    <v-breadcrumbs :items="breadcrumbItems" />

    <v-container v-if="room" fluid>
      <v-row>
        <v-col sm="12" md="4">
          <RoomDetails :room="room" :nsp="$route.params.nsp" />
        </v-col>

        <v-col sm="12" md="8">
          <RoomSockets :room="room" />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import RoomSockets from "../components/Room/RoomSockets";
import RoomDetails from "../components/Room/RoomDetails";

export default {
  name: "Sockets",

  components: { RoomDetails, RoomSockets },

  data() {
    return {
      room: null,
    };
  },

  computed: {
    breadcrumbItems() {
      return [
        {
          text: this.$t("rooms.title"),
          to: { name: "rooms" },
        },
        {
          text: this.$t("rooms.details"),
          disabled: true,
        },
      ];
    },
    ...mapGetters("main", ["findRoomByName"]),
  },

  mounted() {
    this.room = this.findRoomByName(
      this.$route.params.nsp,
      this.$route.params.name
    );
  },
};
</script>
