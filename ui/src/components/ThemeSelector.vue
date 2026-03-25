<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import { useTheme } from "vuetify";

const store = useStore();
const theme = useTheme();

const darkTheme = computed(() => store.state.config.darkTheme);

const onSelectTheme = (darkThemeValue) => {
  theme.global.name.value = darkThemeValue ? "dark" : "light";
  store.commit("config/selectTheme", darkThemeValue);
};
</script>

<template>
  <v-switch
    :model-value="darkTheme"
    @update:model-value="onSelectTheme"
    :label="$t('config.dark-theme')"
    inset
    density="compact"
  />
</template>
