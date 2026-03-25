<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import SocketHolder from "../../SocketHolder";
import RoomStatus from "./RoomStatus.vue";
import RoomType from "./RoomType.vue";

const props = defineProps({
  room: Object,
  nsp: String,
});

const store = useStore();

const isReadonly = computed(() => store.state.config.readonly);
const isMultiLeaveSupported = computed(() =>
  store.state.config.supportedFeatures.includes("MLEAVE"),
);

const clear = () => {
  SocketHolder.socket.emit("leave", props.nsp, props.room.name);
};
</script>

<template>
  <v-card class="fill-height">
    <v-card-title>{{ $t("details") }}</v-card-title>

    <v-table density="compact">
      <template v-slot:default>
        <tbody>
          <tr>
            <td class="key-column">{{ $t("namespace") }}</td>
            <td>
              <code>{{ nsp }}</code>
            </td>
            <td />
          </tr>

          <tr>
            <td class="key-column">{{ $t("id") }}</td>
            <td>
              {{ room.name }}
            </td>
            <td></td>
          </tr>

          <tr>
            <td class="key-column">{{ $t("status") }}</td>
            <td>
              <RoomStatus :active="room.active" />
            </td>
            <td align="right">
              <v-tooltip
                location="bottom"
                v-if="isMultiLeaveSupported && !room.isPrivate"
              >
                <template v-slot:activator="{ props }">
                  <v-btn
                    v-bind="props"
                    @click="clear()"
                    :disabled="isReadonly"
                    size="small"
                    class="ml-3"
                  >
                    <v-icon>mdi-tag-off-outline</v-icon>
                  </v-btn>
                </template>
                <span>{{ $t("rooms.clear") }}</span>
              </v-tooltip>
            </td>
          </tr>

          <tr>
            <td class="key-column">{{ $t("type") }}</td>
            <td>
              <RoomType :is-private="room.isPrivate" />
            </td>
            <td />
          </tr>
        </tbody>
      </template>
    </v-table>
  </v-card>
</template>

<style scoped></style>
