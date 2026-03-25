<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import { sortBy } from "lodash-es";

const store = useStore();

const selectedNamespace = computed(() => store.state.main.selectedNamespace);
const namespaces = computed(() => sortBy(store.state.main.namespaces, "name"));

const selectNamespace = (namespace) => {
  store.commit("main/selectNamespace", namespace);
};
</script>

<template>
  <v-select
    :model-value="selectedNamespace"
    :items="namespaces"
    @update:model-value="selectNamespace"
    item-title="name"
    item-value="name"
    :label="$t('select-namespace')"
    persistent-hint
    return-object
    class="selector"
  />
</template>

<style scoped>
.selector {
  max-width: 200px;
}
</style>
