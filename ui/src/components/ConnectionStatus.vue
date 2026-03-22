<template>
  <Status :value="connected" :ok-label="$t('connected')" :ko-label="$t('disconnected')" />
</template>

<script setup>
import Status from "./Status.vue";

defineProps({
  connected: Boolean,
});
</script>
