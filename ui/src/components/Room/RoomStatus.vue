<script setup>
import Status from "../Status.vue";

defineProps({
  active: Boolean,
});
</script>

<template>
  <Status
    :value="active"
    :ok-label="$t('rooms.active')"
    :ko-label="$t('rooms.deleted')"
  />
</template>
