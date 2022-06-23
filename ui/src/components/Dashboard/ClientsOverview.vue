<template>
  <v-card>
    <v-card-title class="text-center">
      {{ $t("clients.title") }}

      <v-spacer />

      <v-btn v-if="developmentMode" :to="{ name: 'clients' }" small>
        <v-icon>mdi-dots-horizontal</v-icon>
      </v-btn>
    </v-card-title>

    <v-card-text>
      <v-row>
        <Doughnut
          :chart-data="data"
          class="chart"
          :chart-options="chartOptions"
        />

        <v-simple-table class="grow align-self-center">
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
        </v-simple-table>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import { Doughnut } from "vue-chartjs/legacy";
import { mapState, mapGetters } from "vuex";
import colors from "vuetify/lib/util/colors";
import Transport from "../Transport";
import { percentage } from "../../util";
import { sumBy } from "lodash-es";

export default {
  name: "ClientsOverview",

  components: {
    Transport,
    Doughnut,
  },

  data() {
    return {
      transports: ["websocket", "polling"],
      chartOptions: {
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    };
  },

  computed: {
    ...mapState({
      clients: (state) => state.main.clients,
      darkTheme: (state) => state.config.darkTheme,
      servers: (state) => state.servers.servers,
    }),
    ...mapGetters("config", ["hasAggregatedValues", "developmentMode"]),

    clientsCount() {
      if (this.hasAggregatedValues) {
        return sumBy(this.servers, "clientsCount");
      } else {
        return this.clients.length;
      }
    },

    transportRepartition() {
      if (this.hasAggregatedValues) {
        const pollingClientsCount = sumBy(this.servers, "pollingClientsCount");
        return {
          polling: pollingClientsCount,
          websocket: this.clientsCount - pollingClientsCount,
        };
      }
      return this.clients
        .map((client) => {
          return client.sockets[0];
        })
        .filter((socket) => !!socket)
        .reduce(
          (acc, socket) => {
            acc[socket.transport]++;
            return acc;
          },
          { websocket: 0, polling: 0 }
        );
    },
    data() {
      return {
        labels: ["WebSocket", "HTTP long-polling"],
        datasets: [
          {
            backgroundColor: [colors.green.base, colors.orange.base],
            borderColor: this.darkTheme ? "black" : "white",
            data: [
              this.transportRepartition["websocket"],
              this.transportRepartition["polling"],
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
