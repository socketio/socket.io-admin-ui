<template>
  <div>
    <v-breadcrumbs :items="breadcrumbs" />
    <v-row v-if="room">
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>{{ $t("rooms.details") }}</v-card-title>
          <v-table>
            <tbody>
              <tr><td>ID</td><td>{{ room.name }}</td></tr>
              <tr><td>{{ $t("status") }}</td><td><RoomStatus :active="room.active" /></td></tr>
              <tr><td>Namespace</td><td>{{ route.params.nsp }}</td></tr>
              <tr><td>{{ $t("rooms.sockets-count") }}</td><td>{{ room.sockets.length }}</td></tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>{{ $t("sockets.title") }}</v-card-title>
          <v-list>
            <v-list-item
              v-for="socket in room.sockets"
              :key="socket.id"
              :to="{ name: 'socket', params: { nsp: route.params.nsp, id: socket.id } }"
            >
              <v-list-item-title>{{ socket.id }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import RoomStatus from "../components/Room/RoomStatus.vue";
import { useMainStore } from "../stores/main";

const route = useRoute();
const mainStore = useMainStore();

const room = computed(() => mainStore.findRoomByName(route.params.nsp, route.params.name));
const breadcrumbs = computed(() => [
  { title: "Rooms", to: { name: "rooms" } },
  { title: "Details" },
]);
</script>
