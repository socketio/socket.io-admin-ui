<template>
  <div>
    <v-breadcrumbs :items="breadcrumbItems" />

    <v-card>
      <v-card-text>
        <NamespaceSelector />
      </v-card-text>

      <v-data-table
        :headers="headers"
        :items="events"
        :footer-props="footerProps"
        item-key="eventId"
        :sort-by="['timestamp', 'eventId']"
        :sort-desc="[true, true]"
      >
        <template #item.type="{ value }">
          <EventType :type="value" />
        </template>

        <template #item.id="{ value }">
          <router-link class="link" :to="socketDetailsRoute(value)">{{
            value
          }}</router-link>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
import { mapGetters, mapState } from "vuex";
import NamespaceSelector from "../components/NamespaceSelector";
import EventType from "@/components/EventType";

export default {
  name: "Events",

  components: { EventType, NamespaceSelector },

  data() {
    return {
      footerProps: {
        "items-per-page-options": [20, 100, -1],
      },
    };
  },

  computed: {
    breadcrumbItems() {
      return [
        {
          text: this.$t("events.title"),
          disabled: true,
        },
      ];
    },
    headers() {
      return [
        {
          text: this.$t("timestamp"),
          value: "timestamp",
        },
        {
          text: this.$t("sockets.socket"),
          value: "id",
          sortable: false,
        },
        {
          text: this.$t("type"),
          value: "type",
          sortable: false,
        },
        {
          text: this.$t("args"),
          value: "args",
          sortable: false,
        },
      ];
    },
    ...mapGetters("main", ["events"]),
    ...mapState({
      selectedNamespace: (state) => state.main.selectedNamespace,
    }),
  },

  methods: {
    socketDetailsRoute(sid) {
      return {
        name: "socket",
        params: { nsp: this.selectedNamespace.name, id: sid },
      };
    },
  },
};
</script>
<style scoped>
.link {
  color: inherit;
}
</style>
