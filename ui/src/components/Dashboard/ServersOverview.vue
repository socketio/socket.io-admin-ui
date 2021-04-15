<template>
  <v-card>
    <v-card-title class="text-center">
      {{ $t("servers.title") }}
      <v-spacer />
      <v-btn :to="{ name: 'servers' }" small>
        <v-icon>mdi-dots-horizontal</v-icon>
      </v-btn>
    </v-card-title>

    <v-card-text>
      <v-row>
        <Doughnut :chart-data="data" class="chart" />

        <v-simple-table class="grow align-self-center">
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
        </v-simple-table>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import Doughnut from "./Doughnut";
import { mapState } from "vuex";
import colors from "vuetify/lib/util/colors";
import { percentage } from "../../util";
import ServerStatus from "../ServerStatus";

export default {
  name: "ServersOverview",

  components: {
    ServerStatus,
    Doughnut,
  },

  computed: {
    ...mapState({
      healthyServers: (state) =>
        state.servers.servers.filter((server) => server.healthy).length,
      totalServers: (state) => state.servers.servers.length,
      darkTheme: (state) => state.config.darkTheme,
    }),
    data() {
      return {
        labels: [this.$t("servers.healthy"), this.$t("servers.unhealthy")],
        datasets: [
          {
            backgroundColor: [colors.green.base, colors.red.base],
            borderColor: this.darkTheme ? "black" : "white",
            data: [
              this.healthyServers,
              this.totalServers - this.healthyServers,
            ],
          },
        ],
      };
    },
  },

  methods: {
    percentage,
  },
};
</script>

<style scoped>
.chart {
  max-width: 160px;
  margin: 20px;
}
</style>
