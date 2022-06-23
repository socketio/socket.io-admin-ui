<template>
  <v-card class="fill-height">
    <v-card-title class="text-center">
      {{ $t("namespaces") }}

      <v-spacer />

      <v-btn v-if="developmentMode" :to="{ name: 'sockets' }" small>
        <v-icon>mdi-dots-horizontal</v-icon>
      </v-btn>
    </v-card-title>

    <v-simple-table>
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
    </v-simple-table>
  </v-card>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import { sortBy } from "lodash-es";

export default {
  name: "NamespacesOverview",

  computed: {
    ...mapState({
      plainNamespaces: (state) =>
        sortBy(state.main.namespaces, "name").map(({ name, sockets }) => {
          return {
            name,
            socketsCount: sockets.length,
          };
        }),
    }),
    ...mapGetters("config", ["hasAggregatedValues", "developmentMode"]),
    ...mapGetters("servers", {
      liteNamespaces: "namespaces",
    }),
    namespaces() {
      return this.hasAggregatedValues
        ? this.liteNamespaces
        : this.plainNamespaces;
    },
  },
};
</script>

<style scoped></style>
