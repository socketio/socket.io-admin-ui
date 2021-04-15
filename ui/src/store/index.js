import Vue from "vue";
import Vuex from "vuex";
import config from "./modules/config";
import connection from "./modules/connection";
import main from "./modules/main";
import servers from "./modules/servers";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    config,
    connection,
    main,
    servers,
  },
});
