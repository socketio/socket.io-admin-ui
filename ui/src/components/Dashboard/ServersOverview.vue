<script setup>
import { computed } from "vue";
import { Doughnut } from "vue-chartjs";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import colors from "vuetify/util/colors";
import { percentage } from "../../util";
import ServerStatus from "../ServerStatus.vue";

const store = useStore();
const { t } = useI18n();

const chartOptions = {
  plugins: {
    legend: {
      display: false,
    },
  },
};

const healthyServers = computed(
  () => store.state.servers.servers.filter((server) => server.healthy).length,
);
const totalServers = computed(() => store.state.servers.servers.length);
const darkTheme = computed(() => store.state.config.darkTheme);

const data = computed(() => ({
  labels: [t("servers.healthy"), t("servers.unhealthy")],
  datasets: [
    {
      backgroundColor: [colors.green.base, colors.red.base],
      borderColor: darkTheme.value ? "black" : "white",
      data: [healthyServers.value, totalServers.value - healthyServers.value],
    },
  ],
}));
</script>

<template>
  <v-card>
    <v-card-title class="text-center d-flex align-center">
      {{ $t("servers.title") }}
      <v-spacer />
      <v-btn :to="{ name: 'servers' }" size="small">
        <v-icon>mdi-dots-horizontal</v-icon>
      </v-btn>
    </v-card-title>

    <v-card-text>
      <v-row>
        <Doughnut :data="data" :options="chartOptions" class="chart" />

        <v-table class="grow align-self-center">
          <template v-slot:default>
            <tbody>
              <tr>
                <th>{{ $t("status") }}</th>
                <th>#</th>
              </tr>
              <tr>
                <td><ServerStatus healthy /></td>
                <td>
                  <div>
                    <h2>{{ healthyServers }}</h2>
                  </div>
                  <div>{{ percentage(healthyServers, totalServers) }} %</div>
                </td>
              </tr>
              <tr>
                <td><ServerStatus /></td>
                <td>
                  <div>
                    <h2>{{ totalServers - healthyServers }}</h2>
                  </div>
                  <div>
                    {{
                      percentage(totalServers - healthyServers, totalServers)
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
