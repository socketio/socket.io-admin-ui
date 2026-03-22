<template>
  <div class="max-w-[1360px] mx-auto px-6 pt-7 pb-12 max-md:px-4 max-md:pt-5 max-md:pb-8">
    <!-- Header -->
    <header class="flex items-start justify-between max-md:flex-col max-md:gap-2">
      <div>
        <h1 class="text-headline-small font-bold">Dashboard</h1>
      </div>
      <v-chip variant="tonal" color="primary" size="small" prepend-icon="mdi-clock-outline">
        {{ formattedNow }}
      </v-chip>
    </header>

    <!-- KPI Strip -->
    <section class="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5 mb-7 max-md:grid-cols-1">
      <!-- Connected Clients -->
      <div
        class="flex items-start gap-3.5 p-5 bg-[rgb(var(--v-theme-surface))] border border-[rgba(var(--v-border-color),var(--v-border-opacity))] rounded-2xl transition-[box-shadow,border-color] duration-200 ease-in-out hover:border-[rgba(var(--v-theme-primary),0.25)] hover:shadow-[0_4px_24px_rgba(var(--v-theme-primary),0.06)] max-md:flex-wrap">
        <div class="shrink-0 grid place-items-center w-[42px] h-[42px] rounded-xl bg-blue-500/10 text-blue-500">
          <v-icon icon="mdi-account-multiple-outline" size="20" />
        </div>
        <div class="flex flex-col gap-0.5 min-w-0">
          <span class="text-[1.75rem] font-bold leading-[1.15] tracking-tight">{{ clientCount }}</span>
          <span class="text-[0.8rem] text-[rgba(var(--v-theme-on-surface),0.55)] font-medium">Connected Clients</span>
        </div>
        <div class="flex flex-wrap gap-1.5 ml-auto self-center max-md:ml-0">
          <span
            class="inline-flex items-center gap-1 px-2 py-[3px] rounded-lg text-[0.7rem] font-semibold whitespace-nowrap bg-green-500/10 text-green-600">
            <v-icon icon="mdi-lightning-bolt" size="11" /> WS {{ transportBreakdown.websocket }}
          </span>
          <span
            class="inline-flex items-center gap-1 px-2 py-[3px] rounded-lg text-[0.7rem] font-semibold whitespace-nowrap bg-yellow-400/12 text-yellow-700">
            <v-icon icon="mdi-swap-vertical" size="11" /> Poll {{ transportBreakdown.polling }}
          </span>
        </div>
      </div>

      <!-- Servers -->
      <div
        class="flex items-start gap-3.5 p-5 bg-[rgb(var(--v-theme-surface))] border border-[rgba(var(--v-border-color),var(--v-border-opacity))] rounded-2xl transition-[box-shadow,border-color] duration-200 ease-in-out hover:border-[rgba(var(--v-theme-primary),0.25)] hover:shadow-[0_4px_24px_rgba(var(--v-theme-primary),0.06)] max-md:flex-wrap">
        <div class="shrink-0 grid place-items-center w-[42px] h-[42px] rounded-xl bg-green-500/10 text-green-500">
          <v-icon icon="mdi-server-outline" size="20" />
        </div>
        <div class="flex flex-col gap-0.5 min-w-0">
          <span class="text-[1.75rem] font-bold leading-[1.15] tracking-tight">{{ serversTotal }}</span>
          <span class="text-[0.8rem] text-[rgba(var(--v-theme-on-surface),0.55)] font-medium">Servers</span>
        </div>
        <div class="flex flex-wrap gap-1.5 ml-auto self-center max-md:ml-0">
          <span
            class="inline-flex items-center gap-1 px-2 py-[3px] rounded-lg text-[0.7rem] font-semibold whitespace-nowrap bg-green-500/10 text-green-600">
            <v-icon icon="mdi-check-circle" size="11" /> {{ healthyCount }}
          </span>
          <span
            class="inline-flex items-center gap-1 px-2 py-[3px] rounded-lg text-[0.7rem] font-semibold whitespace-nowrap bg-red-500/10 text-red-600">
            <v-icon icon="mdi-alert-circle" size="11" /> {{ unhealthyCount }}
          </span>
        </div>
      </div>

      <!-- Namespaces -->
      <div
        class="flex items-start gap-3.5 p-5 bg-[rgb(var(--v-theme-surface))] border border-[rgba(var(--v-border-color),var(--v-border-opacity))] rounded-2xl transition-[box-shadow,border-color] duration-200 ease-in-out hover:border-[rgba(var(--v-theme-primary),0.25)] hover:shadow-[0_4px_24px_rgba(var(--v-theme-primary),0.06)] max-md:flex-wrap">
        <div class="shrink-0 grid place-items-center w-[42px] h-[42px] rounded-xl bg-purple-500/10 text-purple-500">
          <v-icon icon="mdi-tag-multiple-outline" size="20" />
        </div>
        <div class="flex flex-col gap-0.5 min-w-0">
          <span class="text-[1.75rem] font-bold leading-[1.15] tracking-tight">{{ namespaceRows.length }}</span>
          <span class="text-[0.8rem] text-[rgba(var(--v-theme-on-surface),0.55)] font-medium">Namespaces</span>
        </div>
      </div>
    </section>

    <!-- Main Grid -->
    <v-row gap="24">
      <!-- Server Health Donut -->
      <v-col cols="12" md="4">
        <div
          class="bg-[rgb(var(--v-theme-surface))] border border-[rgba(var(--v-border-color),var(--v-border-opacity))] rounded-2xl flex flex-col h-full overflow-hidden">
          <div class="flex items-baseline gap-2.5 px-[22px] pt-[18px]">
            <h2 class="text-[0.9rem] font-semibold tracking-[0.01em]">Server Health</h2>
          </div>
          <div class="flex-1 px-[22px] pt-[18px] pb-[22px] grid place-items-center">
            <div class="relative w-[180px] h-[180px]">
              <Doughnut :data="serversDonutData" :options="donutOptions" />
              <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span class="text-2xl font-bold leading-none tracking-tight">{{ healthyPct }}%</span>
                <span
                  class="text-[0.7rem] text-[rgba(var(--v-theme-on-surface),0.45)] font-medium mt-0.5">healthy</span>
              </div>
            </div>
          </div>
          <div class="px-[22px] pb-[18px] flex flex-col gap-2">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full shrink-0 bg-green-500" />
              <span class="text-body-small">Healthy</span>
              <span class="text-body-small font-medium ml-auto">{{ healthyCount }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full shrink-0 bg-red-500" />
              <span class="text-body-small">Unhealthy</span>
              <span class="text-body-small font-medium ml-auto">{{ unhealthyCount }}</span>
            </div>
          </div>
        </div>
      </v-col>

      <!-- Namespaces Table -->
      <v-col cols="12" md="8">
        <div
          class="bg-[rgb(var(--v-theme-surface))] border border-[rgba(var(--v-border-color),var(--v-border-opacity))] rounded-2xl flex flex-col h-full overflow-hidden">
          <div class="flex items-baseline gap-2.5 px-[22px] pt-[18px]">
            <h2 class="text-[0.9rem] font-semibold tracking-[0.01em]">Namespaces</h2>
          </div>
          <div class="flex-1">
            <table class="w-full border-collapse">
              <thead>
                <tr>
                  <th
                    class="px-[22px] py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-[rgba(var(--v-theme-on-surface),0.45)] border-b border-[rgba(var(--v-border-color),var(--v-border-opacity))] text-left">
                    Name</th>
                  <th
                    class="px-[22px] py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-[rgba(var(--v-theme-on-surface),0.45)] border-b border-[rgba(var(--v-border-color),var(--v-border-opacity))] text-right">
                    Sockets</th>
                  <th
                    class="px-[22px] py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.06em] text-[rgba(var(--v-theme-on-surface),0.45)] border-b border-[rgba(var(--v-border-color),var(--v-border-opacity))] text-right">
                    Share</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="ns in namespaceRows" :key="ns.name"
                  class="transition-colors duration-150 ease-in-out hover:bg-[rgba(var(--v-theme-primary),0.03)]">
                  <td
                    class="px-[22px] py-[11px] text-[0.82rem] border-b border-[rgba(var(--v-border-color),calc(var(--v-border-opacity)*0.5))]">
                    <code
                      class="font-mono text-[0.78rem] px-2 py-0.5 rounded-md bg-[rgba(var(--v-theme-primary),0.06)] text-[rgb(var(--v-theme-primary))]">{{ ns.name }}</code>
                  </td>
                  <td
                    class="px-[22px] py-[11px] text-[0.82rem] border-b border-[rgba(var(--v-border-color),calc(var(--v-border-opacity)*0.5))] text-right font-medium">
                    {{ ns.socketsCount }}
                  </td>
                  <td
                    class="px-[22px] py-[11px] text-[0.82rem] border-b border-[rgba(var(--v-border-color),calc(var(--v-border-opacity)*0.5))] text-right">
                    <div class="flex items-center gap-2 justify-end">
                      <div
                        class="h-1.5 min-w-1 max-w-20 rounded-sm bg-[rgba(var(--v-theme-primary),0.35)] transition-[width] duration-300 ease-in-out"
                        :style="{ width: nsSharePct(ns.socketsCount) + '%' }" />
                      <span class="text-body-small text-medium-emphasis">
                        {{ nsSharePct(ns.socketsCount) }}%
                      </span>
                    </div>
                  </td>
                </tr>
                <tr v-if="!namespaceRows.length">
                  <td colspan="3" class="text-center text-[rgba(var(--v-theme-on-surface),0.35)] px-[22px] py-8">
                    No active namespaces
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </v-col>

      <!-- Connection Events Chart -->
      <v-col v-if="configStore.hasAggregatedValues" cols="12" md="6">
        <div
          class="bg-[rgb(var(--v-theme-surface))] border border-[rgba(var(--v-border-color),var(--v-border-opacity))] rounded-2xl flex flex-col h-full overflow-hidden">
          <div class="flex items-baseline gap-2.5 px-[22px] pt-[18px]">
            <h2 class="text-[0.9rem] font-semibold tracking-[0.01em]">Connections</h2>
            <span class="text-[0.75rem] text-[rgba(var(--v-theme-on-surface),0.45)] font-medium">Last 10 minutes</span>
          </div>
          <div class="flex-1 px-[22px] pt-[18px] pb-[22px]">
            <div class="relative h-[260px] max-md:h-[220px]">
              <Bar :data="connectionsChartData" :options="barChartOptions" />
            </div>
          </div>
        </div>
      </v-col>

      <!-- Bytes / Packets Chart -->
      <v-col v-if="configStore.hasAggregatedValues" cols="12" md="6">
        <div
          class="bg-[rgb(var(--v-theme-surface))] border border-[rgba(var(--v-border-color),var(--v-border-opacity))] rounded-2xl flex flex-col h-full overflow-hidden">
          <div class="flex items-baseline gap-2.5 px-[22px] pt-[18px]">
            <h2 class="text-[0.9rem] font-semibold tracking-[0.01em]">{{ bytesChartTitle }}</h2>
            <span class="text-[0.75rem] text-[rgba(var(--v-theme-on-surface),0.45)] font-medium">Last 10 minutes</span>
          </div>
          <div class="flex-1 px-[22px] pt-[18px] pb-[22px]">
            <div class="relative h-[260px] max-md:h-[220px]">
              <Bar :data="bytesChartData" :options="barChartOptions" />
            </div>
          </div>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, shallowRef } from "vue";
import { Bar, Doughnut } from "vue-chartjs";
import { subMinutes, format } from "date-fns";
import { useConfigStore } from "../stores/config";
import { useMainStore } from "../stores/main";
import { useServersStore } from "../stores/servers";

// ── Stores ───────────────────────────────────────────────────────────
const configStore = useConfigStore();
const mainStore = useMainStore();
const serversStore = useServersStore();

// ── Clock ────────────────────────────────────────────────────────────
const TICK_MS = 5_000;
const now = shallowRef(new Date());
let tickId;

onMounted(() => {
  now.value = new Date();
  tickId = setInterval(() => {
    now.value = new Date();
  }, TICK_MS);
});
onUnmounted(() => clearInterval(tickId));

const formattedNow = computed(() => format(now.value, "HH:mm:ss"));

// ── Clients ──────────────────────────────────────────────────────────
const clientCount = computed(() => mainStore.clients.length);

const transportBreakdown = computed(() => {
  let websocket = 0;
  let polling = 0;
  for (const c of mainStore.clients) {
    const t = c.sockets[0]?.transport;
    if (t === "websocket") websocket++;
    else if (t === "polling") polling++;
  }
  return { websocket, polling };
});

// ── Servers ──────────────────────────────────────────────────────────
const healthyCount = computed(
  () => serversStore.servers.filter((s) => s.healthy).length,
);
const unhealthyCount = computed(
  () => serversStore.servers.filter((s) => !s.healthy).length,
);
const serversTotal = computed(() => healthyCount.value + unhealthyCount.value);

const pct = (n, total) => (total ? ((n / total) * 100).toFixed(1) : "0.0");
const healthyPct = computed(() => pct(healthyCount.value, serversTotal.value));

// Donut
const serversDonutData = computed(() => ({
  labels: ["Healthy", "Unhealthy"],
  datasets: [
    {
      data: [healthyCount.value, unhealthyCount.value],
      backgroundColor: [
        "rgba(34,197,94,0.85)",
        "rgba(239,68,68,0.85)",
      ],
      hoverBackgroundColor: [
        "rgba(34,197,94,1)",
        "rgba(239,68,68,1)",
      ],
      borderWidth: 0,
      cutout: "74%",
      borderRadius: 6,
    },
  ],
}));

const donutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "rgba(15,23,42,0.92)",
      padding: 10,
      cornerRadius: 8,
      titleFont: { weight: "600" },
    },
  },
};

// ── Namespaces ───────────────────────────────────────────────────────
const namespaceRows = computed(() => {
  const rows = serversStore.namespaces.length
    ? serversStore.namespaces
    : mainStore.namespaces.map((ns) => ({
      name: ns.name,
      socketsCount: ns.sockets.length,
    }));
  return [...rows].sort((a, b) => a.name.localeCompare(b.name));
});

const totalSockets = computed(() =>
  namespaceRows.value.reduce((sum, ns) => sum + ns.socketsCount, 0),
);

const nsSharePct = (count) => {
  const t = totalSockets.value;
  return t ? ((count / t) * 100).toFixed(1) : "0.0";
};

// ── Aggregated Events ────────────────────────────────────────────────
const aggregated = computed(() => mainStore.aggregatedEvents || []);

function sumByTimestamp(predicate) {
  const map = new Map();
  for (const ev of aggregated.value) {
    if (!predicate(ev)) continue;
    map.set(ev.timestamp, (map.get(ev.timestamp) ?? 0) + ev.count);
  }
  return map;
}

function buildAligned(mapA, mapB) {
  const keys = new Set([...mapA.keys(), ...mapB.keys()]);
  const sorted = Array.from(keys).sort((a, b) => a - b);
  return {
    labels: sorted,
    a: sorted.map((t) => mapA.get(t) ?? 0),
    b: sorted.map((t) => mapB.get(t) ?? 0),
  };
}

// -- Connection / Disconnection
const isConn = (t) =>
  t === "rawConnection" || t === "connections" || t === "connection";
const isDisc = (t) =>
  t === "rawDisconnection" || t === "disconnections" || t === "disconnection";

const connectionsChartData = computed(() => {
  const connMap = sumByTimestamp((ev) => isConn(ev.type));
  const discMap = sumByTimestamp((ev) => isDisc(ev.type));
  const { labels, a, b } = buildAligned(connMap, discMap);

  return {
    labels,
    datasets: [
      {
        label: "Connected",
        data: a,
        backgroundColor: "rgba(34,197,94,0.65)",
        hoverBackgroundColor: "rgba(34,197,94,0.9)",
        borderColor: "rgba(34,197,94,1)",
        borderWidth: 1,
        borderRadius: 3,
        categoryPercentage: 1,
        barPercentage: 0.9,
        maxBarThickness: 16,
      },
      {
        label: "Disconnected",
        data: b,
        backgroundColor: "rgba(239,68,68,0.65)",
        hoverBackgroundColor: "rgba(239,68,68,0.9)",
        borderColor: "rgba(239,68,68,1)",
        borderWidth: 1,
        borderRadius: 3,
        categoryPercentage: 1,
        barPercentage: 0.9,
        maxBarThickness: 16,
      },
    ],
  };
});

// -- Bytes / Packets
const isBytesIn = (ev) => {
  if (ev.type === "bytesIn") return true;
  if (ev.type === "bytes" || ev.type === "packets")
    return ev.subType === "received" || ev.subType === "in";
  return false;
};
const isBytesOut = (ev) => {
  if (ev.type === "bytesOut") return true;
  if (ev.type === "bytes" || ev.type === "packets")
    return ev.subType === "sent" || ev.subType === "out";
  return false;
};

const hasNativeBytes = computed(() =>
  aggregated.value.some((ev) => ev.type === "bytesIn" || ev.type === "bytesOut"),
);
const bytesChartTitle = computed(() =>
  hasNativeBytes.value ? "Bytes In / Out" : "Packets In / Out",
);

const bytesChartData = computed(() => {
  const inMap = sumByTimestamp(isBytesIn);
  const outMap = sumByTimestamp(isBytesOut);
  const { labels, a, b } = buildAligned(inMap, outMap);
  const noun = hasNativeBytes.value ? "Bytes" : "Packets";
  return {
    labels,
    datasets: [
      {
        label: `${noun} in`,
        data: a,
        backgroundColor: "rgba(59,130,246,0.65)",
        hoverBackgroundColor: "rgba(59,130,246,0.9)",
        borderColor: "rgba(59,130,246,1)",
        borderWidth: 1,
        borderRadius: 3,
        categoryPercentage: 1,
        barPercentage: 1,
        maxBarThickness: 28,
      },
      {
        label: `${noun} out`,
        data: b,
        backgroundColor: "rgba(168,85,247,0.65)",
        hoverBackgroundColor: "rgba(168,85,247,0.9)",
        borderColor: "rgba(168,85,247,1)",
        borderWidth: 1,
        borderRadius: 3,
        categoryPercentage: 1,
        barPercentage: 1,
        maxBarThickness: 28,
      },
    ],
  };
});

// ── Shared chart options ─────────────────────────────────────────────
const barChartOptions = computed(() => {
  const end = now.value;
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    interaction: { intersect: false, mode: "index" },
    plugins: {
      legend: {
        position: "top",
        align: "end",
        labels: {
          usePointStyle: true,
          pointStyle: "rectRounded",
          boxWidth: 8,
          boxHeight: 8,
          padding: 16,
          font: { size: 11, weight: "500" },
        },
      },
      tooltip: {
        backgroundColor: "rgba(15,23,42,0.92)",
        padding: 10,
        cornerRadius: 8,
        titleFont: { weight: "600" },
        bodyFont: { size: 12 },
      },
    },
    scales: {
      x: {
        type: "time",
        offset: true,
        grouped: true,
        min: subMinutes(end, 10).getTime(),
        max: end.getTime(),
        time: {
          unit: "minute",
          stepSize: 1,
          tooltipFormat: "HH:mm:ss",
          round: "second",
        },
        border: { display: false },
        grid: { display: false },
        ticks: {
          maxRotation: 0,
          font: { size: 10 },
          color: "rgba(100,116,139,0.7)",
          source: "auto",
        },
      },
      y: {
        beginAtZero: true,
        border: { display: false },
        grid: {
          color: "rgba(148,163,184,0.1)",
          drawTicks: false,
        },
        ticks: {
          precision: 0,
          padding: 8,
          font: { size: 10 },
          color: "rgba(100,116,139,0.7)",
        },
      },
    },
  };
});

</script>