<template>
  <v-simple-table dense>
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
  </v-simple-table>
</template>

<script>
export default {
  name: "KeyValueTable",

  props: {
    object: Object,
  },

  computed: {
    items() {
      const keys = Object.keys(this.object);
      return keys.sort().map((key) => ({
        key,
        value: this.object[key],
      }));
    },
  },
};
</script>

<style scoped>
.key-column {
  width: 30%;
}
</style>
