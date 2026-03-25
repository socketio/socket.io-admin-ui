<script setup>
import { computed } from "vue";
import { useStore } from "vuex";

const store = useStore();

const readonly = computed(() => store.state.config.readonly);
const disabled = computed(
  () => store.state.config.supportedFeatures.length === 0,
);

const toggleReadonly = (val) => {
  store.commit("config/toggleReadonly", val);
};
</script>

<template>
  <v-switch
    :model-value="readonly"
    @update:model-value="toggleReadonly"
    :label="$t('config.readonly')"
    :disabled="disabled"
    inset
    density="compact"
  />
</template>
