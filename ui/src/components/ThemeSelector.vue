<template>
  <v-switch
    :input-value="darkTheme"
    @change="onSelectTheme"
    :label="$t('config.dark-theme')"
    inset
    dense
  />
</template>

<script>
import { mapMutations, mapState } from "vuex";

export default {
  name: "ThemeSelector",

  computed: {
    ...mapState({
      darkTheme: (state) => state.config.darkTheme,
    }),
  },

  methods: {
    ...mapMutations("config", ["selectTheme"]),
    onSelectTheme(darkTheme) {
      this.$vuetify.theme.dark = darkTheme;
      this.selectTheme(darkTheme);
    },
  },
};
</script>
