<template>
  <v-card>
    <v-card-title class="text-center">
      {{ $t("dashboard.connectionsHistogram.title") }}
    </v-card-title>

    <v-card-text>
      <v-row>
        <Bar
          :chart-data="chartData"
          :chart-options="chartOptions"
          style="width: 100%"
          :height="chartHeight"
        />
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import colors from "vuetify/lib/util/colors";
import { mapState } from "vuex";
import { Bar } from "vue-chartjs/legacy";
import { subMinutes } from "date-fns";

function mapAggregatedEvent(event) {
  return {
    x: event.timestamp,
    y: event.count,
  };
}

export default {
  name: "ConnectionsHistogram",

  components: {
    Bar,
  },

  data() {
    return {
      chartHeight: 120,
      chartOptions: {
        parsing: false,
        scales: {
          x: {
            type: "time",
            time: {
              stepSize: 1,
              unit: "minute",
            },
          },
          y: {
            type: "linear",
            beginAtZero: true,
            suggestedMax: 10,
            ticks: {
              precision: 0,
            },
          },
        },
      },
    };
  },

  computed: {
    ...mapState("main", ["aggregatedEvents"]),
    connectionEvents() {
      return this.aggregatedEvents
        .filter((event) => event.type === "rawConnection")
        .map(mapAggregatedEvent);
    },
    disconnectionEvents() {
      return this.aggregatedEvents
        .filter((event) => event.type === "rawDisconnection")
        .map(mapAggregatedEvent);
    },
    chartData() {
      return {
        datasets: [
          {
            label: this.$i18n.t("events.type.connection"),
            backgroundColor: colors.green.base,
            data: this.connectionEvents,
          },
          {
            label: this.$i18n.t("events.type.disconnection"),
            backgroundColor: colors.red.base,
            data: this.disconnectionEvents,
          },
        ],
      };
    },
  },

  created() {
    this.updateChartBounds();
    this.interval = setInterval(this.updateChartBounds, 10000);
  },

  beforeDestroy() {
    clearInterval(this.interval);
  },

  methods: {
    updateChartBounds() {
      const now = new Date();
      this.chartOptions.scales.x.min = subMinutes(now, 10);
      this.chartOptions.scales.x.max = now;
    },
  },
};
</script>
