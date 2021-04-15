<template>
  <v-card class="fill-height">
    <v-card-title>{{ $t("details") }}</v-card-title>

    <v-simple-table dense>
      <template>
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
              <v-tooltip bottom v-if="isMultiLeaveSupported && !room.isPrivate">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    v-bind="attrs"
                    v-on="on"
                    @click="clear()"
                    :disabled="isReadonly"
                    small
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
    </v-simple-table>
  </v-card>
</template>

<script>
import { mapState } from "vuex";
import SocketHolder from "../../SocketHolder";
import RoomStatus from "./RoomStatus";
import RoomType from "./RoomType";

export default {
  name: "RoomDetails",
  components: { RoomType, RoomStatus },
  props: {
    room: Object,
    nsp: String,
  },

  computed: {
    ...mapState({
      isReadonly: (state) => state.config.readonly,
      isMultiLeaveSupported: (state) =>
        state.config.supportedFeatures.includes("MLEAVE"),
    }),
  },

  methods: {
    clear() {
      SocketHolder.socket.emit("leave", this.nsp, this.room.name);
    },
  },
};
</script>

<style scoped></style>
