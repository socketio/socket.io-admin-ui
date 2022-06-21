import { find, merge } from "lodash-es";
import { remove } from "../../util";

const HEALTHY_THRESHOLD = 10000;

export default {
  namespaced: true,
  state: {
    servers: [],
  },
  getters: {
    namespaces(state) {
      const namespaces = {};
      for (const server of state.servers) {
        if (server.namespaces) {
          for (const { name, socketsCount } of server.namespaces) {
            namespaces[name] = (namespaces[name] || 0) + socketsCount;
          }
        }
      }
      return Object.keys(namespaces).map((name) => {
        return {
          name,
          socketsCount: namespaces[name],
        };
      });
    },
  },
  mutations: {
    onServerStats(state, stats) {
      stats.lastPing = Date.now();
      const server = find(state.servers, { serverId: stats.serverId });
      if (server) {
        merge(server, stats);
      } else {
        stats.healthy = true;
        state.servers.push(stats);
      }
    },
    removeServer(state, serverId) {
      remove(state.servers, { serverId });
    },
    updateState(state) {
      state.servers.forEach((server) => {
        server.healthy = Date.now() - server.lastPing < HEALTHY_THRESHOLD;
      });
    },
  },
};
