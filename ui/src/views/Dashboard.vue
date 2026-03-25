<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import ClientsOverview from "../components/Dashboard/ClientsOverview.vue";
import ServersOverview from "../components/Dashboard/ServersOverview.vue";
import NamespacesOverview from "../components/Dashboard/NamespacesOverview.vue";
import ConnectionsHistogram from "../components/Dashboard/ConnectionsHistogram.vue";
import BytesHistogram from "../components/Dashboard/BytesHistogram.vue";

const store = useStore();
const { t } = useI18n();

const breadcrumbItems = computed(() => [
  {
    title: t("dashboard.title"),
    disabled: true,
  },
]);

const hasAggregatedValues = computed(
  () => store.getters["config/hasAggregatedValues"],
);
</script>

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
