import { createRouter, createWebHashHistory } from "vue-router";
import Dashboard from "../views/Dashboard.vue";
import Sockets from "../views/Sockets.vue";
import Socket from "../views/Socket.vue";
import Rooms from "../views/Rooms.vue";
import Clients from "../views/Clients.vue";
import Client from "../views/Client.vue";
import Servers from "../views/Servers.vue";
import Room from "../views/Room.vue";
import Events from "@/views/Events.vue";

const routes = [
  {
    path: "/",
    name: "dashboard",
    component: Dashboard,
    meta: {
      topLevel: true,
      index: 0,
    },
  },
  {
    path: "/sockets/",
    name: "sockets",
    component: Sockets,
    meta: {
      topLevel: true,
      index: 1,
    },
  },
  {
    path: "/n/:nsp/sockets/:id",
    name: "socket",
    component: Socket,
    meta: {
      topLevel: false,
    },
  },
  {
    path: "/rooms/",
    name: "rooms",
    component: Rooms,
    meta: {
      topLevel: true,
      index: 2,
    },
  },
  {
    path: "/n/:nsp/rooms/:name",
    name: "room",
    component: Room,
    meta: {
      topLevel: false,
    },
  },
  {
    path: "/clients/",
    name: "clients",
    component: Clients,
    meta: {
      topLevel: true,
      index: 3,
    },
  },
  {
    path: "/clients/:id",
    name: "client",
    component: Client,
    meta: {
      topLevel: false,
    },
  },
  {
    path: "/events/",
    name: "events",
    component: Events,
    meta: {
      topLevel: true,
      index: 4,
    },
  },
  {
    path: "/servers/",
    name: "servers",
    component: Servers,
    meta: {
      topLevel: true,
      index: 5,
    },
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
