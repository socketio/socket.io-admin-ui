<template>
  <v-card>
    <v-card-title class="text-center">
      {{ $t("dashboard.bytesHistogram.title") }}
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
  name: "BytesHistogram",

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
            suggestedMax: 1000,
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
    bytesIn() {
      return this.aggregatedEvents
        .filter((event) => event.type === "bytesIn")
        .map(mapAggregatedEvent);
    },
    bytesOut() {
      return this.aggregatedEvents
        .filter((event) => event.type === "bytesOut")
        .map(mapAggregatedEvent);
    },
    chartData() {
      return {
        datasets: [
          {
            label: this.$i18n.t("dashboard.bytesHistogram.bytesIn"),
            backgroundColor: colors.green.base,
            data: this.bytesIn,
          },
          {
            label: this.$i18n.t("dashboard.bytesHistogram.bytesOut"),
            backgroundColor: colors.red.base,
            data: this.bytesOut,
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
