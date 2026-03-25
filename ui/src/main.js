import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import i18n from "./i18n";
import store from "./store";
import vuetify from "./plugins/vuetify";
import "./plugins/chartjs";

const app = createApp(App);

store.commit("config/init");
store.commit("connection/init");

if (i18n.mode === "legacy") {
  i18n.global.locale = store.state.config.lang;
} else {
  i18n.global.locale.value = store.state.config.lang;
}

setInterval(() => {
  store.commit("servers/updateState");
}, 1000);

app.use(router);
app.use(i18n);
app.use(store);
app.use(vuetify);

app.mount("#app");
