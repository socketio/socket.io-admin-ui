<script setup>
import Status from "../Status.vue";

defineProps({
  isPrivate: Boolean,
});
</script>

<template>
  <Status
    :value="!isPrivate"
    :ok-label="$t('rooms.public')"
    :ko-label="$t('rooms.private')"
  />
</template>
