<template>
  <v-chip small :color="color" outlined>{{ label }}</v-chip>
</template>

<script>
import colors from "vuetify/lib/util/colors";

export default {
  name: "Transport",

  props: {
    transport: String,
  },

  computed: {
    label() {
      switch (this.transport) {
        case "polling":
          return "HTTP long-polling";
        case "websocket":
          return "WebSocket";
        default:
          return this.transport;
      }
    },
    color() {
      switch (this.transport) {
        case "polling":
          return colors.orange.base;
        case "websocket":
          return colors.green.base;
        default:
          return colors.grey.base;
      }
    },
  },
};
</script>
