<script setup>
import { computed } from "vue";

const props = defineProps({
  object: Object,
});

const items = computed(() => {
  const keys = Object.keys(props.object);
  return keys.sort().map((key) => ({
    key,
    value: props.object[key],
  }));
});
</script>

<template>
  <v-table density="compact">
    <template v-slot:default>
      <thead>
        <tr>
          <th>{{ $t("name") }}</th>
          <th>{{ $t("value") }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="{ key, value } of items" :key="key">
          <td class="key-column">{{ key }}</td>
          <td>{{ value }}</td>
        </tr>
      </tbody>
    </template>
  </v-table>
</template>

<style scoped>
.key-column {
  width: 30%;
}
</style>
