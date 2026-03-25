<script setup>
import { computed } from "vue";
import colors from "vuetify/util/colors";

const props = defineProps({
  value: Boolean,
  koLabel: String,
  okLabel: String,
});

const label = computed(() => (props.value ? props.okLabel : props.koLabel));
const color = computed(() =>
  props.value ? colors.green.base : colors.red.base,
);
</script>

<template>
  <v-chip
    size="small"
    :color="color"
    variant="outlined"
    class="text-uppercase"
    >{{ label }}</v-chip
  >
</template>
