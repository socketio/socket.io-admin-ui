<template>
  <div>
    <v-breadcrumbs :items="breadcrumbItems" />

    <v-container fluid>
      <v-row>
        <v-col sm="12" md="6" lg="4">
          <ClientsOverview />
        </v-col>

        <v-col sm="12" md="6" lg="4">
          <ServersOverview />
        </v-col>

        <v-col sm="12" md="6" lg="4">
          <NamespacesOverview />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import ClientsOverview from "../components/Dashboard/ClientsOverview";
import ServersOverview from "../components/Dashboard/ServersOverview";
import NamespacesOverview from "../components/Dashboard/NamespacesOverview";

export default {
  name: "Dashboard",

  components: { NamespacesOverview, ServersOverview, ClientsOverview },

  computed: {
    breadcrumbItems() {
      return [
        {
          text: this.$t("dashboard.title"),
          disabled: true,
        },
      ];
    },
  },
};
</script>
