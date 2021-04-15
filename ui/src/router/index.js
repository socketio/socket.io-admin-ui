import Vue from "vue";
import VueRouter from "vue-router";
import Dashboard from "../views/Dashboard";
import Sockets from "../views/Sockets";
import Socket from "../views/Socket";
import Rooms from "../views/Rooms";
import Clients from "../views/Clients";
import Client from "../views/Client";
import Servers from "../views/Servers";
import Room from "../views/Room";

Vue.use(VueRouter);

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
    path: "/servers/",
    name: "servers",
    component: Servers,
    meta: {
      topLevel: true,
      index: 4,
    },
  },
];

const router = new VueRouter({
  mode: "hash",
  base: process.env.BASE_URL,
  routes,
});

export default router;
