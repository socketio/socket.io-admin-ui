import { createStore } from "vuex";
import config from "./modules/config";
import connection from "./modules/connection";
import main from "./modules/main";
import servers from "./modules/servers";

export default createStore({
  modules: {
    config,
    connection,
    main,
    servers,
  },
});
