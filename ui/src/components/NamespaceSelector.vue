<template>
  <v-select
    :model-value="mainStore.selectedNamespace"
    :items="namespaces"
    item-title="name"
    return-object
    :label="$t('select-namespace')"
    variant="outlined"
    density="compact"
    hide-details
    class="selector"
    @update:model-value="mainStore.selectNamespace"
  />
</template>

<script setup>
import { computed } from "vue";
import { sortBy } from "lodash-es";
import { useMainStore } from "../stores/main";

const mainStore = useMainStore();
const namespaces = computed(() => sortBy(mainStore.namespaces, "name"));
</script>

<style scoped>
.selector {
  max-width: 240px;
}
</style>
