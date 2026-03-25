<script setup>
import { ref, computed } from "vue";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import NamespaceSelector from "../components/NamespaceSelector.vue";
import EventType from "@/components/EventType.vue";

const store = useStore();
const { t } = useI18n();

const sortBy = ref([
  { key: "timestamp", order: "desc" },
  { key: "eventId", order: "desc" },
]);

const breadcrumbItems = computed(() => [
  {
    title: t("events.title"),
    disabled: true,
  },
]);

const headers = computed(() => [
  {
    title: t("timestamp"),
    key: "timestamp",
  },
  {
    title: t("sockets.socket"),
    key: "id",
    sortable: false,
  },
  {
    title: t("type"),
    key: "type",
    sortable: false,
  },
  {
    key: "args",
    sortable: false,
  },
  { title: "", key: "data-table-expand" },
]);

const events = computed(() => store.getters["main/events"]);
const selectedNamespace = computed(() => store.state.main.selectedNamespace);

const socketDetailsRoute = (sid) => ({
  name: "socket",
  params: { nsp: selectedNamespace.value.name, id: sid },
});

const isExpandable = (item) =>
  ["event_received", "event_sent"].includes(item.type);
</script>

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
        :items-per-page-options="[-1]"
        item-value="eventId"
        v-model:sort-by="sortBy"
        show-expand
      >
        <template #item.type="{ item }">
          <EventType :type="item.type" />
        </template>

        <template #item.id="{ item }">
          <router-link class="link" :to="socketDetailsRoute(item.id)">{{
            item.id
          }}</router-link>
        </template>

        <template #item.args="{ item }">
          <span v-if="isExpandable(item)">
            {{ $t("events.eventName") }}{{ $t("separator")
            }}<code>{{ item.eventName }}</code>
          </span>
          <span v-else-if="item.type === 'disconnection'">
            {{ $t("events.reason") }}{{ $t("separator")
            }}<code>{{ item.args }}</code>
          </span>
          <span
            v-else-if="item.type === 'room_joined' || item.type === 'room_left'"
          >
            {{ $t("events.room") }}{{ $t("separator")
            }}<code>{{ item.args }}</code>
          </span>
          <span v-else>
            {{ item.args }}
          </span>
        </template>

        <template #expanded-row="{ columns, item }">
          <tr>
            <td :colspan="columns.length">
              <div class="ma-3">
                {{ $t("events.eventArgs") }}{{ $t("separator") }}
                <pre><code>{{ item.args }}</code></pre>
              </div>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<style scoped>
.link {
  color: inherit;
}
</style>
