<script setup>
import { computed } from "vue";
import colors from "vuetify/util/colors";

const props = defineProps({
  type: String,
});

const color = computed(() => {
  switch (props.type) {
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
});
</script>

<template>
  <v-chip :color="color" variant="outlined">
    {{ $t("events.type." + type) }}
  </v-chip>
</template>
