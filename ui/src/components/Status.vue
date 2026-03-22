<template>
  <v-chip :color="value ? 'success' : 'error'" size="small" variant="tonal" class="text-uppercase">
    {{ value ? okLabel : koLabel }}
  </v-chip>
</template>

<script setup>
defineProps({
  value: Boolean,
  koLabel: {
    type: String,
    default: "",
  },
  okLabel: {
    type: String,
    default: "",
  },
});
</script>
