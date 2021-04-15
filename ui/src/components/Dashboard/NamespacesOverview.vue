<template>
  <v-card class="fill-height">
    <v-card-title class="text-center">
      {{ $t("namespaces") }}
      <v-spacer />
      <v-btn :to="{ name: 'sockets' }" small>
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
            <td>{{ namespace.sockets.length }}</td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
  </v-card>
</template>

<script>
import { mapState } from "vuex";
import { sortBy } from "lodash-es";

export default {
  name: "NamespacesOverview",

  computed: {
    ...mapState({
      namespaces: (state) => sortBy(state.main.namespaces, "name"),
    }),
  },
};
</script>

<style scoped></style>
