<template>
  <div>
    <v-breadcrumbs :items="breadcrumbItems" />

    <v-container fluid>
      <v-row>
        <v-col cols="12" md="6" lg="4">
          <ClientsOverview />
        </v-col>

        <v-col cols="12" md="6" lg="4">
          <ServersOverview />
        </v-col>

        <v-col cols="12" md="6" lg="4">
          <NamespacesOverview />
        </v-col>

        <v-col v-if="hasAggregatedValues" cols="12" md="6">
          <ConnectionsHistogram />
        </v-col>

        <v-col v-if="hasAggregatedValues" cols="12" md="6">
          <BytesHistogram />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import ClientsOverview from "../components/Dashboard/ClientsOverview";
import ServersOverview from "../components/Dashboard/ServersOverview";
import NamespacesOverview from "../components/Dashboard/NamespacesOverview";
import ConnectionsHistogram from "../components/Dashboard/ConnectionsHistogram";
import BytesHistogram from "../components/Dashboard/BytesHistogram";
import { mapGetters } from "vuex";

export default {
  name: "Dashboard",

  components: {
    NamespacesOverview,
    ServersOverview,
    ClientsOverview,
    ConnectionsHistogram,
    BytesHistogram,
  },

  computed: {
    breadcrumbItems() {
      return [
        {
          text: this.$t("dashboard.title"),
          disabled: true,
        },
      ];
    },
    ...mapGetters("config", ["hasAggregatedValues"]),
  },
};
</script>
