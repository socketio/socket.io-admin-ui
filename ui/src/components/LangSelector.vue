<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";

const store = useStore();
const i18n = useI18n();

const languages = [
  {
    title: "বাংলা",
    value: "bn",
  },
  {
    title: "English",
    value: "en",
  },
  {
    title: "Français",
    value: "fr",
  },
  {
    title: "한국어",
    value: "ko",
  },
  {
    title: "Português (Brazil)",
    value: "pt-BR",
  },
  {
    title: "Türkçe",
    value: "tr",
  },
  {
    title: "简体中文",
    value: "zh-CN",
  },
];

const lang = computed(() => store.state.config.lang);

const onSelectLang = (newLang) => {
  i18n.locale.value = newLang;
  store.commit("config/selectLang", newLang);
};
</script>

<template>
  <v-select
    density="compact"
    :model-value="lang"
    :items="languages"
    @update:model-value="onSelectLang"
    :label="$t('config.language')"
  />
</template>
