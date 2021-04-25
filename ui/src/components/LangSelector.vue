<template>
  <v-select
    dense
    :value="lang"
    :items="languages"
    @change="onSelectLang"
    :label="$t('config.language')"
  />
</template>

<script>
import { mapMutations, mapState } from "vuex";

export default {
  name: "LangSelector",

  data() {
    return {
      languages: [
        {
          text: "English",
          value: "en",
        },
        {
          text: "Français",
          value: "fr",
        },
        {
          text: "简体中文",
          value: "zh-CN",
        },
      ],
    };
  },

  computed: {
    ...mapState({
      lang: (state) => state.config.lang,
    }),
  },

  methods: {
    ...mapMutations("config", ["selectLang"]),
    onSelectLang(lang) {
      this.$i18n.locale = lang;
      this.selectLang(lang);
    },
  },
};
</script>
