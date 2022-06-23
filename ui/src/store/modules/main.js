import { find, merge, remove as silentlyRemove } from "lodash-es";
import { pushUniq, remove } from "@/util";

const TEN_MINUTES = 10 * 60 * 1000;

const getOrCreateNamespace = (namespaces, name) => {
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
};

const getOrCreateRoom = (namespace, name) => {
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
};

const getOrCreateClient = (clients, id) => {
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
};

const addSocket = (state, socket) => {
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
};

const MAX_ARRAY_LENGTH = 1000;
let EVENT_COUNTER = 0;

const pushEvents = (array, event) => {
  event.eventId = ++EVENT_COUNTER; // unique id
  array.push(event);
  if (array.length > MAX_ARRAY_LENGTH) {
    array.shift();
  }
};

// group events by each 10 seconds
// see: https://www.chartjs.org/docs/latest/general/performance.html#decimation
function roundedTimestamp(timestamp) {
  return timestamp - (timestamp % 10_000);
}

export default {
  namespaced: true,
  state: {
    namespaces: [],
    clients: [],
    selectedNamespace: null,
    aggregatedEvents: [],
  },
  getters: {
    findSocketById: (state) => (nsp, id) => {
      const namespace = find(state.namespaces, { name: nsp });
      if (namespace) {
        return find(namespace.sockets, { id });
      }
    },
    findClientById: (state) => (id) => {
      return find(state.clients, { id });
    },
    findRoomByName: (state) => (nsp, name) => {
      const namespace = find(state.namespaces, { name: nsp });
      if (namespace) {
        return find(namespace.rooms, { name });
      }
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
  mutations: {
    selectNamespace(state, namespace) {
      state.selectedNamespace = namespace;
    },
    onAllSockets(state, sockets) {
      state.namespaces.forEach((namespace) => {
        namespace.sockets.splice(0);
        namespace.rooms.splice(0);
      });
      state.clients.splice(0);
      sockets.forEach((socket) => addSocket(state, socket));
      if (!state.selectedNamespace) {
        state.selectedNamespace =
          find(state.namespaces, { name: "/" }) || state.namespaces[0];
      }
    },
    onSocketConnected(state, { timestamp, socket }) {
      addSocket(state, socket);
      const namespace = getOrCreateNamespace(state.namespaces, socket.nsp);
      pushEvents(namespace.events, {
        type: "connection",
        timestamp,
        id: socket.id,
      });
    },
    onSocketUpdated(state, socket) {
      const namespace = getOrCreateNamespace(state.namespaces, socket.nsp);
      const existingSocket = find(namespace.sockets, { id: socket.id });
      if (existingSocket) {
        merge(existingSocket, socket);
      }
    },
    onSocketDisconnected(state, { timestamp, nsp, id, reason }) {
      const namespace = getOrCreateNamespace(state.namespaces, nsp);
      const [socket] = remove(namespace.sockets, { id });
      if (socket) {
        socket.connected = false;

        const client = getOrCreateClient(state.clients, socket.clientId);
        remove(client.sockets, { id });
        if (client.sockets.length === 0) {
          client.connected = false;
          remove(state.clients, { id: socket.clientId });
        }
      }
      pushEvents(namespace.events, {
        type: "disconnection",
        timestamp,
        id,
        args: reason,
      });
    },
    onRoomJoined(state, { nsp, room, id, timestamp }) {
      const namespace = getOrCreateNamespace(state.namespaces, nsp);
      const socket = find(namespace.sockets, { id });
      if (socket) {
        pushUniq(socket.rooms, room);
        const _room = getOrCreateRoom(namespace, room);
        _room.sockets.push(socket);
      }
      pushEvents(namespace.events, {
        type: "room_joined",
        timestamp,
        id,
        args: room,
      });
    },
    onRoomLeft(state, { timestamp, nsp, room, id }) {
      const namespace = getOrCreateNamespace(state.namespaces, nsp);
      const socket = find(namespace.sockets, { id });
      if (socket) {
        remove(socket.rooms, room);
      }
      const _room = getOrCreateRoom(namespace, room);
      remove(_room.sockets, { id });
      if (_room.sockets.length === 0) {
        _room.active = false;
        remove(namespace.rooms, { name: room });
      }
      pushEvents(namespace.events, {
        type: "room_left",
        timestamp,
        id,
        args: room,
      });
    },
    onServerStats(state, serverStats) {
      if (!serverStats.aggregatedEvents) {
        return;
      }
      for (const aggregatedEvent of serverStats.aggregatedEvents) {
        const timestamp = roundedTimestamp(aggregatedEvent.timestamp);
        const elem = find(state.aggregatedEvents, {
          timestamp,
          type: aggregatedEvent.type,
          subType: aggregatedEvent.subType,
        });
        if (elem) {
          elem.count += aggregatedEvent.count;
        } else {
          state.aggregatedEvents.push({
            timestamp,
            type: aggregatedEvent.type,
            subType: aggregatedEvent.subType,
            count: aggregatedEvent.count,
          });
        }
      }
      silentlyRemove(state.aggregatedEvents, (elem) => {
        return elem.timestamp < Date.now() - TEN_MINUTES;
      });
    },
    onEventReceived(state, { timestamp, nsp, id, args }) {
      const namespace = getOrCreateNamespace(state.namespaces, nsp);
      const eventName = args.shift();
      pushEvents(namespace.events, {
        type: "event_received",
        timestamp,
        id,
        eventName,
        args,
      });
    },
    onEventSent(state, { timestamp, nsp, id, args }) {
      const namespace = getOrCreateNamespace(state.namespaces, nsp);
      const eventName = args.shift();
      pushEvents(namespace.events, {
        type: "event_sent",
        timestamp,
        id,
        eventName,
        args,
      });
    },
  },
};
