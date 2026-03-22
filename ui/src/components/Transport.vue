<template>
  <v-chip :color="color" variant="tonal" size="small">{{ label }}</v-chip>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  transport: {
    type: String,
    default: "",
  },
});

const label = computed(() => {
  if (props.transport === "polling") {
    return "HTTP long-polling";
  }
  if (props.transport === "websocket") {
    return "WebSocket";
  }
  return props.transport;
});

const color = computed(() => {
  if (props.transport === "polling") {
    return "warning";
  }
  if (props.transport === "websocket") {
    return "success";
  }
  return "default";
});
</script>
