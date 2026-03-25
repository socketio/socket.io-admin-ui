<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import { sortBy } from "lodash-es";

const store = useStore();

const hasAggregatedValues = computed(
  () => store.getters["config/hasAggregatedValues"],
);
const developmentMode = computed(() => store.getters["config/developmentMode"]);
const liteNamespaces = computed(() => store.getters["servers/namespaces"]);

const plainNamespaces = computed(() =>
  sortBy(store.state.main.namespaces, "name").map(({ name, sockets }) => {
    return {
      name,
      socketsCount: sockets.length,
    };
  }),
);

const namespaces = computed(() =>
  hasAggregatedValues.value ? liteNamespaces.value : plainNamespaces.value,
);
</script>

<template>
  <v-card class="fill-height">
    <v-card-title class="text-center d-flex align-center">
      {{ $t("namespaces") }}

      <v-spacer />

      <v-btn v-if="developmentMode" :to="{ name: 'sockets' }" size="small">
        <v-icon>mdi-dots-horizontal</v-icon>
      </v-btn>
    </v-card-title>

    <v-table>
      <template v-slot:default>
        <thead>
          <tr>
            <th>{{ $t("name") }}</th>
            <th>{{ $t("rooms.sockets-count") }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="namespace of namespaces" :key="namespace.name">
            <td class="key-column">
              <code>{{ namespace.name }}</code>
            </td>
            <td>{{ namespace.socketsCount }}</td>
          </tr>
        </tbody>
      </template>
    </v-table>
  </v-card>
</template>

<style scoped></style>
