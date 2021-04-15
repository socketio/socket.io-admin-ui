<template>
  <v-card>
    <v-card-title class="text-center">
      {{ $t("clients.title") }}
      <v-spacer />
      <v-btn :to="{ name: 'clients' }" small>
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
                <th>{{ $t("sockets.transport") }}</th>
                <th>#</th>
              </tr>
              <tr v-for="transport in transports" :key="transport">
                <td><Transport :transport="transport" /></td>
                <td>
                  <div>
                    <h2>{{ transportRepartition[transport] || 0 }}</h2>
                  </div>
                  <div>
                    {{
                      percentage(
                        transportRepartition[transport] || 0,
                        clients.length
                      )
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
import Transport from "../Transport";
import { percentage } from "../../util";

export default {
  name: "ClientsOverview",

  components: {
    Transport,
    Doughnut,
  },

  data() {
    return {
      transports: ["websocket", "polling"],
    };
  },

  computed: {
    ...mapState({
      clients: (state) => state.main.clients,
      darkTheme: (state) => state.config.darkTheme,
    }),
    transportRepartition() {
      return this.clients
        .map((client) => {
          return client.sockets[0];
        })
        .filter((socket) => !!socket)
        .reduce((acc, socket) => {
          acc[socket.transport] = acc[socket.transport] || 0;
          acc[socket.transport]++;
          return acc;
        }, {});
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
