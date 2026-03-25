<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import RoomSockets from "../components/Room/RoomSockets.vue";
import RoomDetails from "../components/Room/RoomDetails.vue";

const store = useStore();
const route = useRoute();
const { t } = useI18n();

const room = ref(null);

const breadcrumbItems = computed(() => [
  {
    title: t("rooms.title"),
    to: { name: "rooms" },
  },
  {
    title: t("rooms.details"),
    disabled: true,
  },
]);

onMounted(() => {
  room.value = store.getters["main/findRoomByName"](
    route.params.nsp,
    route.params.name,
  );
});
</script>

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
