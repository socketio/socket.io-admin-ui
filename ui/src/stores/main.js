import { defineStore } from "pinia";
import { find, merge, remove as silentlyRemove } from "lodash-es";
import { pushUniq, remove } from "../util";

const TEN_MINUTES = 10 * 60 * 1000;
const MAX_ARRAY_LENGTH = 1000;
let EVENT_COUNTER = 0;

function getOrCreateNamespace(namespaces, name) {
  let namespace = find(namespaces, { name });
  if (namespace) {
    return namespace;
  }
  namespace = {
    name,
    sockets: [],
    rooms: [],
    events: [],
  };
  namespaces.push(namespace);
  return namespace;
}

function getOrCreateRoom(namespace, name) {
  let room = find(namespace.rooms, { name });
  if (room) {
    return room;
  }
  room = {
    name,
    active: true,
    sockets: [],
  };
  namespace.rooms.push(room);
  return room;
}

function getOrCreateClient(clients, id) {
  let client = find(clients, { id });
  if (client) {
    return client;
  }
  client = {
    id,
    connected: true,
    sockets: [],
  };
  clients.push(client);
  return client;
}

function addSocket(state, socket) {
  const namespace = getOrCreateNamespace(state.namespaces, socket.nsp);
  socket.connected = true;
  if (!find(namespace.sockets, { id: socket.id })) {
    namespace.sockets.push(socket);
  }

  socket.rooms.forEach((name) => {
    const room = getOrCreateRoom(namespace, name);
    room.isPrivate = name === socket.id;
    if (!find(room.sockets, { id: socket.id })) {
      room.sockets.push(socket);
    }
  });

  const client = getOrCreateClient(state.clients, socket.clientId);
  if (!find(client.sockets, { id: socket.id })) {
    client.sockets.push(socket);
  }
}

function pushEvents(array, event) {
  event.eventId = ++EVENT_COUNTER;
  array.push(event);
  if (array.length > MAX_ARRAY_LENGTH) {
    array.shift();
  }
}

function roundedTimestamp(timestamp) {
  return timestamp - (timestamp % 10000);
}

export const useMainStore = defineStore("main", {
  state: () => ({
    namespaces: [],
    clients: [],
    selectedNamespace: null,
    aggregatedEvents: [],
  }),
  getters: {
    findSocketById: (state) => (nsp, id) => {
      const namespace = find(state.namespaces, { name: nsp });
      if (namespace) {
        return find(namespace.sockets, { id });
      }
      return null;
    },
    findClientById: (state) => (id) => {
      return find(state.clients, { id });
    },
    findRoomByName: (state) => (nsp, name) => {
      const namespace = find(state.namespaces, { name: nsp });
      if (namespace) {
        return find(namespace.rooms, { name });
      }
      return null;
    },
    findRoomsByNamespace: (state) => (nsp) => {
      const namespace = find(state.namespaces, { name: nsp });
      return namespace ? namespace.rooms : [];
    },
    sockets: (state) => {
      return state.selectedNamespace ? state.selectedNamespace.sockets : [];
    },
    rooms: (state) => {
      return state.selectedNamespace ? state.selectedNamespace.rooms : [];
    },
    events: (state) => {
      return state.selectedNamespace ? state.selectedNamespace.events : [];
    },
  },
  actions: {
    selectNamespace(namespace) {
      this.selectedNamespace = namespace;
    },
    onAllSockets(sockets) {
      this.namespaces.forEach((namespace) => {
        namespace.sockets.splice(0);
        namespace.rooms.splice(0);
      });
      this.clients.splice(0);
      sockets.forEach((socket) => addSocket(this, socket));
      if (!this.selectedNamespace) {
        this.selectedNamespace =
          find(this.namespaces, { name: "/" }) || this.namespaces[0] || null;
      }
    },
    onSocketConnected({ timestamp, socket }) {
      addSocket(this, socket);
      const namespace = getOrCreateNamespace(this.namespaces, socket.nsp);
      pushEvents(namespace.events, {
        type: "connection",
        timestamp,
        id: socket.id,
      });
    },
    onSocketUpdated(socket) {
      const namespace = getOrCreateNamespace(this.namespaces, socket.nsp);
      const existingSocket = find(namespace.sockets, { id: socket.id });
      if (existingSocket) {
        merge(existingSocket, socket);
      }
    },
    onSocketDisconnected({ timestamp, nsp, id, reason }) {
      const namespace = getOrCreateNamespace(this.namespaces, nsp);
      const [socket] = remove(namespace.sockets, { id });
      if (socket) {
        socket.connected = false;
        const client = getOrCreateClient(this.clients, socket.clientId);
        remove(client.sockets, { id });
        if (client.sockets.length === 0) {
          client.connected = false;
          remove(this.clients, { id: socket.clientId });
        }
      }
      pushEvents(namespace.events, {
        type: "disconnection",
        timestamp,
        id,
        args: reason,
      });
    },
    onRoomJoined({ nsp, room, id, timestamp }) {
      const namespace = getOrCreateNamespace(this.namespaces, nsp);
      const socket = find(namespace.sockets, { id });
      if (socket) {
        pushUniq(socket.rooms, room);
        const currentRoom = getOrCreateRoom(namespace, room);
        currentRoom.sockets.push(socket);
      }
      pushEvents(namespace.events, {
        type: "room_joined",
        timestamp,
        id,
        args: room,
      });
    },
    onRoomLeft({ timestamp, nsp, room, id }) {
      const namespace = getOrCreateNamespace(this.namespaces, nsp);
      const socket = find(namespace.sockets, { id });
      if (socket) {
        remove(socket.rooms, room);
      }
      const currentRoom = getOrCreateRoom(namespace, room);
      remove(currentRoom.sockets, { id });
      if (currentRoom.sockets.length === 0) {
        currentRoom.active = false;
        remove(namespace.rooms, { name: room });
      }
      pushEvents(namespace.events, {
        type: "room_left",
        timestamp,
        id,
        args: room,
      });
    },
    onServerStats(serverStats) {
      if (!serverStats.aggregatedEvents) {
        return;
      }
      for (const aggregatedEvent of serverStats.aggregatedEvents) {
        const timestamp = roundedTimestamp(aggregatedEvent.timestamp);
        const entry = find(this.aggregatedEvents, {
          timestamp,
          type: aggregatedEvent.type,
          subType: aggregatedEvent.subType,
        });
        if (entry) {
          entry.count += aggregatedEvent.count;
        } else {
          this.aggregatedEvents.push({
            timestamp,
            type: aggregatedEvent.type,
            subType: aggregatedEvent.subType,
            count: aggregatedEvent.count,
          });
        }
      }
      silentlyRemove(this.aggregatedEvents, (entry) => {
        return entry.timestamp < Date.now() - TEN_MINUTES;
      });
    },
    onEventReceived({ timestamp, nsp, id, args }) {
      const namespace = getOrCreateNamespace(this.namespaces, nsp);
      const eventArgs = [...args];
      const eventName = eventArgs.shift();
      pushEvents(namespace.events, {
        type: "event_received",
        timestamp,
        id,
        eventName,
        args: eventArgs,
      });
    },
    onEventSent({ timestamp, nsp, id, args }) {
      const namespace = getOrCreateNamespace(this.namespaces, nsp);
      const eventArgs = [...args];
      const eventName = eventArgs.shift();
      pushEvents(namespace.events, {
        type: "event_sent",
        timestamp,
        id,
        eventName,
        args: eventArgs,
      });
    },
  },
});
