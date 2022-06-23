<template>
  <v-chip :color="color" outlined>
    {{ $t("events.type." + type) }}
  </v-chip>
</template>

<script>
import colors from "vuetify/lib/util/colors";

export default {
  name: "EventType",

  props: {
    type: String,
  },

  computed: {
    color() {
      switch (this.type) {
        case "connection":
          return colors.green.base;
        case "room_joined":
          return colors.teal.base;
        case "room_left":
          return colors.amber.base;
        case "disconnection":
          return colors.red.base;
        case "event_received":
          return colors.blue.base;
        case "event_sent":
          return colors.orange.base;
      }
      return colors.gray.base;
    },
  },
};
</script>
