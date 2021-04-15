<template>
  <v-switch
    :input-value="readonly"
    @change="toggleReadonly"
    :label="$t('config.readonly')"
    :disabled="disabled"
    inset
    dense
  />
</template>

<script>
import { mapMutations, mapState } from "vuex";

export default {
  name: "ReadonlyToggle",

  computed: {
    ...mapState({
      readonly: (state) => state.config.readonly,
      disabled: (state) => state.config.supportedFeatures.length === 0,
    }),
  },

  methods: {
    ...mapMutations("config", ["toggleReadonly"]),
  },
};
</script>
