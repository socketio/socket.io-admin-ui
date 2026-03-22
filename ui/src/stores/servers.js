import { defineStore } from "pinia";
import { find, merge } from "lodash-es";
import { remove } from "../util";

const HEALTHY_THRESHOLD = 10000;

export const useServersStore = defineStore("servers", {
  state: () => ({
    servers: [],
  }),
  getters: {
    namespaces(state) {
      const namespaces = {};
      for (const server of state.servers) {
        if (!server.namespaces) {
          continue;
        }
        for (const { name, socketsCount } of server.namespaces) {
          namespaces[name] = (namespaces[name] || 0) + socketsCount;
        }
      }
      return Object.keys(namespaces).map((name) => ({
        name,
        socketsCount: namespaces[name],
      }));
    },
  },
  actions: {
    onServerStats(stats) {
      const payload = {
        ...stats,
        lastPing: Date.now(),
      };
      const server = find(this.servers, { serverId: payload.serverId });
      if (server) {
        merge(server, payload);
      } else {
        payload.healthy = true;
        this.servers.push(payload);
      }
    },
    removeServer(serverId) {
      remove(this.servers, { serverId });
    },
    updateState() {
      this.servers.forEach((server) => {
        server.healthy = Date.now() - server.lastPing < HEALTHY_THRESHOLD;
      });
    },
  },
});
