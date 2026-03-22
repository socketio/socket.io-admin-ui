import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import i18n from "./i18n";
import vuetify from "./plugins/vuetify";
import { useConfigStore } from "./stores/config";
import { useConnectionStore } from "./stores/connection";
import { useServersStore } from "./stores/servers";
import "./plugins/chartjs";
import "./styles/tailwind.css"; 

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(i18n);
app.use(vuetify);

const configStore = useConfigStore(pinia);
const connectionStore = useConnectionStore(pinia);
const serversStore = useServersStore(pinia);

configStore.init();
connectionStore.init();
i18n.global.locale.value = configStore.lang;

setInterval(() => {
  serversStore.updateState();
}, 1000);

app.mount("#app");
