<script setup>
import { reactive, computed, onUnmounted, onBeforeMount } from "vue";
import colors from "vuetify/util/colors";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import { Bar } from "vue-chartjs";
import { subMinutes } from "date-fns";

function mapAggregatedEvent(event) {
  return {
    x: event.timestamp,
    y: event.count,
  };
}

const store = useStore();
const { t } = useI18n();

const chartHeight = 120;
const chartOptions = reactive({
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
});

const aggregatedEvents = computed(() => store.state.main.aggregatedEvents);

const bytesIn = computed(() =>
  aggregatedEvents.value
    .filter((event) => event.type === "bytesIn")
    .map(mapAggregatedEvent),
);
const bytesOut = computed(() =>
  aggregatedEvents.value
    .filter((event) => event.type === "bytesOut")
    .map(mapAggregatedEvent),
);

const chartData = computed(() => ({
  datasets: [
    {
      label: t("dashboard.bytesHistogram.bytesIn"),
      backgroundColor: colors.green.base,
      data: bytesIn.value,
    },
    {
      label: t("dashboard.bytesHistogram.bytesOut"),
      backgroundColor: colors.red.base,
      data: bytesOut.value,
    },
  ],
}));

const updateChartBounds = () => {
  const now = new Date();
  chartOptions.scales.x.min = subMinutes(now, 10);
  chartOptions.scales.x.max = now;
};

let interval;
onBeforeMount(() => {
  updateChartBounds();
  interval = setInterval(updateChartBounds, 10000);
});

onUnmounted(() => {
  clearInterval(interval);
});
</script>

<template>
  <v-card>
    <v-card-title class="text-center">
      {{ $t("dashboard.bytesHistogram.title") }}
    </v-card-title>

    <v-card-text>
      <v-row>
        <Bar :data="chartData" :options="chartOptions" :height="chartHeight" />
      </v-row>
    </v-card-text>
  </v-card>
</template>
