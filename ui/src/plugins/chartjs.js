import {
  Chart as ChartJS,
  DoughnutController,
  BarController,
  LineController,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  TimeScale,
  LinearScale,
} from "chart.js";

ChartJS.register(
  DoughnutController,
  BarController,
  LineController,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  TimeScale,
  LinearScale,
);

import "chartjs-adapter-date-fns";
