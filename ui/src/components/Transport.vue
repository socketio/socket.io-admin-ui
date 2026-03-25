<script setup>
import { computed } from "vue";
import colors from "vuetify/util/colors";

const props = defineProps({
  transport: String,
});

const label = computed(() => {
  switch (props.transport) {
    case "polling":
      return "HTTP long-polling";
    case "websocket":
      return "WebSocket";
    default:
      return props.transport;
  }
});

const color = computed(() => {
  switch (props.transport) {
    case "polling":
      return colors.orange.base;
    case "websocket":
      return colors.green.base;
    default:
      return colors.grey.base;
  }
});
</script>

<template>
  <v-chip size="small" :color="color" variant="outlined">{{ label }}</v-chip>
</template>
