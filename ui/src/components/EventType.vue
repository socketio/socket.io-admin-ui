<template>
  <v-chip :color="color" variant="tonal" size="small">
    {{ $t(`events.type.${type}`) }}
  </v-chip>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  type: {
    type: String,
    default: "",
  },
});

const color = computed(() => {
  const palette = {
    connection: "success",
    room_joined: "teal",
    room_left: "warning",
    disconnection: "error",
    event_received: "info",
    event_sent: "orange",
  };
  return palette[props.type] || "default";
});
</script>
