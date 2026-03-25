<script setup>
import { computed } from "vue";
import { Doughnut } from "vue-chartjs";
import { useStore } from "vuex";
import colors from "vuetify/util/colors";
import Transport from "../Transport.vue";
import { percentage } from "../../util";
import { sumBy } from "lodash-es";

const store = useStore();

const transports = ["websocket", "polling"];
const chartOptions = {
  plugins: {
    legend: {
      display: false,
    },
  },
};

const clients = computed(() => store.state.main.clients);
const darkTheme = computed(() => store.state.config.darkTheme);
const servers = computed(() => store.state.servers.servers);

const hasAggregatedValues = computed(
  () => store.getters["config/hasAggregatedValues"],
);
const developmentMode = computed(() => store.getters["config/developmentMode"]);

const clientsCount = computed(() => {
  if (hasAggregatedValues.value) {
    return sumBy(servers.value, "clientsCount");
  } else {
    return clients.value.length;
  }
});

const transportRepartition = computed(() => {
  if (hasAggregatedValues.value) {
    const pollingClientsCount = sumBy(servers.value, "pollingClientsCount");
    return {
      polling: pollingClientsCount,
      websocket: clientsCount.value - pollingClientsCount,
    };
  }
  return clients.value
    .map((client) => {
      return client.sockets[0];
    })
    .filter((socket) => !!socket)
    .reduce(
      (acc, socket) => {
        acc[socket.transport]++;
        return acc;
      },
      { websocket: 0, polling: 0 },
    );
});

const data = computed(() => ({
  labels: ["WebSocket", "HTTP long-polling"],
  datasets: [
    {
      backgroundColor: [colors.green.base, colors.orange.base],
      borderColor: darkTheme.value ? "black" : "white",
      data: [
        transportRepartition.value["websocket"],
        transportRepartition.value["polling"],
      ],
    },
  ],
}));
</script>

<template>
  <v-card>
    <v-card-title class="text-center d-flex align-center">
      {{ $t("clients.title") }}

      <v-spacer />

      <v-btn v-if="developmentMode" :to="{ name: 'clients' }" size="small">
        <v-icon>mdi-dots-horizontal</v-icon>
      </v-btn>
    </v-card-title>

    <v-card-text>
      <v-row>
        <Doughnut :data="data" class="chart" :options="chartOptions" />

        <v-table class="grow align-self-center">
          <template v-slot:default>
            <tbody>
              <tr>
                <th>{{ $t("sockets.transport") }}</th>
                <th>#</th>
              </tr>
              <tr v-for="transport in transports" :key="transport">
                <td><Transport :transport="transport" /></td>
                <td>
                  <div>
                    <h2>{{ transportRepartition[transport] }}</h2>
                  </div>
                  <div>
                    {{
                      percentage(transportRepartition[transport], clientsCount)
                    }}
                    %
                  </div>
                </td>
              </tr>
            </tbody>
          </template>
        </v-table>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.chart {
  max-width: 160px;
  max-height: 160px;
  margin: 20px;
}
</style>
