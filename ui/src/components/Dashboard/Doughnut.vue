<script>
import { Doughnut, mixins } from "vue-chartjs";
const { reactiveProp } = mixins;

export default {
  extends: Doughnut,
  mixins: [reactiveProp],
  props: ["options"],
  mounted() {
    this.renderChart(this.chartData, {
      legend: false,
    });
  },
};
</script>
