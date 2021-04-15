<template>
  <v-select
    :value="selectedNamespace"
    :items="namespaces"
    @change="selectNamespace"
    item-text="name"
    item-value="name"
    :label="$t('select-namespace')"
    persistent-hint
    return-object
    class="selector"
  />
</template>

<script>
import { mapMutations, mapState } from "vuex";
import { sortBy } from "lodash-es";

export default {
  name: "NamespaceSelector",
  computed: {
    ...mapState({
      selectedNamespace: (state) => state.main.selectedNamespace,
      namespaces: (state) => sortBy(state.main.namespaces, "name"),
    }),
  },
  methods: {
    ...mapMutations("main", ["selectNamespace"]),
  },
};
</script>

<style scoped>
.selector {
  max-width: 200px;
}
</style>
