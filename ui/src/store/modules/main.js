import { find, merge } from "lodash-es";
import { pushUniq, remove } from "../../util";

const getOrCreateNamespace = (namespaces, name) => {
  let namespace = find(namespaces, { name });
  if (namespace) {
    return namespace;
  }
  namespace = {
    name,
    sockets: [],
    rooms: [],
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

export default {
  namespaced: true,
  state: {
    namespaces: [],
    clients: [],
    selectedNamespace: null,
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
    onSocketConnected(state, socket) {
      addSocket(state, socket);
    },
    onSocketUpdated(state, socket) {
      const namespace = getOrCreateNamespace(state.namespaces, socket.nsp);
      const existingSocket = find(namespace.sockets, { id: socket.id });
      if (existingSocket) {
        merge(existingSocket, socket);
      }
    },
    onSocketDisconnected(state, { nsp, id }) {
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
    },
    onRoomJoined(state, { nsp, room, id }) {
      const namespace = getOrCreateNamespace(state.namespaces, nsp);
      const socket = find(namespace.sockets, { id });
      if (socket) {
        pushUniq(socket.rooms, room);
        const _room = getOrCreateRoom(namespace, room);
        _room.sockets.push(socket);
      }
    },
    onRoomLeft(state, { nsp, room, id }) {
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
    },
  },
};
