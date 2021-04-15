import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import i18n from "./i18n";
import store from "./store";
import vuetify from "./plugins/vuetify";

Vue.config.productionTip = false;

store.commit("config/init");
store.commit("connection/init");

i18n.locale = store.state.config.lang;

setInterval(() => {
  store.commit("servers/updateState");
}, 1000);

new Vue({
  router,
  i18n,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");
