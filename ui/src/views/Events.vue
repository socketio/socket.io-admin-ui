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
        single-expand
        show-expand
      >
        <template #item.type="{ value }">
          <EventType :type="value" />
        </template>

        <template #item.id="{ value }">
          <router-link class="link" :to="socketDetailsRoute(value)">{{
            value
          }}</router-link>
        </template>

        <template #item.args="{ item, value }">
          <span v-if="isExpandable(item)">
            {{ $t("events.eventName") }}{{ $t("separator")
            }}<code>{{ item.eventName }}</code>
          </span>
          <span v-else-if="item.type === 'disconnection'">
            {{ $t("events.reason") }}{{ $t("separator")
            }}<code>{{ value }}</code>
          </span>
          <span
            v-else-if="item.type === 'room_joined' || item.type === 'room_left'"
          >
            {{ $t("events.room") }}{{ $t("separator") }}<code>{{ value }}</code>
          </span>
          <span v-else>
            {{ value }}
          </span>
        </template>

        <template #item.data-table-expand="{ item, isExpanded, expand }">
          <v-btn
            @click="expand(true)"
            v-if="isExpandable(item) && !isExpanded"
            icon
          >
            <v-icon>mdi-chevron-down</v-icon>
          </v-btn>
          <v-btn
            @click="expand(false)"
            v-if="isExpandable(item) && isExpanded"
            icon
          >
            <v-icon>mdi-chevron-up</v-icon>
          </v-btn>
        </template>

        <template #expanded-item="{ headers, item }">
          <td :colspan="headers.length">
            <div class="ma-3">
              {{ $t("events.eventArgs") }}{{ $t("separator") }}
              <pre><code>{{ item.args }}</code></pre>
            </div>
          </td>
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
        "items-per-page-options": [-1],
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
          value: "args",
          sortable: false,
        },
        { text: "", value: "data-table-expand" },
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
    isExpandable(item) {
      return ["event_received", "event_sent"].includes(item.type);
    },
  },
};
</script>
<style scoped>
.link {
  color: inherit;
}
</style>
