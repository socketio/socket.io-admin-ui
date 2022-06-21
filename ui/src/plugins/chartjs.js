import {
  Chart as ChartJS,
  DoughnutController,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  TimeScale,
  LinearScale,
} from "chart.js";

ChartJS.register(
  DoughnutController,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  TimeScale,
  LinearScale
);

import "chartjs-adapter-date-fns";
