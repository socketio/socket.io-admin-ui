<script setup>
import Status from "./Status.vue";

defineProps({
  healthy: Boolean,
});
</script>

<template>
  <Status
    :value="healthy"
    :ok-label="$t('servers.healthy')"
    :ko-label="$t('servers.unhealthy')"
  />
</template>
