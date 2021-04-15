<template>
  <v-chip small :color="color" outlined class="text-uppercase">{{
    label
  }}</v-chip>
</template>

<script>
import colors from "vuetify/lib/util/colors";

export default {
  name: "Status",

  props: {
    value: Boolean,
    koLabel: String,
    okLabel: String,
  },

  computed: {
    label() {
      return this.value ? this.okLabel : this.koLabel;
    },
    color() {
      return this.value ? colors.green.base : colors.red.base;
    },
  },
};
</script>
