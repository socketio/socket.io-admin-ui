export enum Feature {
  EMIT = "EMIT",
  JOIN = "JOIN",
  LEAVE = "LEAVE",
  DISCONNECT = "DISCONNECT",
  // the following features are only available starting with Socket.IO v4.0.0
  MJOIN = "MJOIN",
  MLEAVE = "MLEAVE",
  MDISCONNECT = "MDISCONNECT",

  AGGREGATED_EVENTS = "AGGREGATED_EVENTS",
  ALL_EVENTS = "ALL_EVENTS",
}

interface Config {
  supportedFeatures: Feature[];
}

export type NamespaceEvent = {
  timestamp: number;
  type: string;
  subType?: string;
  count: number;
};

export type NamespaceDetails = {
  name: string;
  socketsCount: number;
};

interface ServerStats {
  serverId: string;
  hostname: string;
  pid: number;
  uptime: number;
  clientsCount: number;
  pollingClientsCount: number;
  namespaces: NamespaceDetails[];
}

export interface SerializedSocket {
  id: string;
  clientId: string;
  transport: string;
  nsp: string;
  data: any;
  handshake: any;
  rooms: string[];
}

export interface ServerEvents {
  session: (sessionId: string) => void;
  config: (config: Config) => void;
  server_stats: (stats: ServerStats) => void;
  all_sockets: (sockets: SerializedSocket[]) => void;
  socket_connected: (socket: SerializedSocket, timestamp: Date) => void;
  socket_updated: (socket: Partial<SerializedSocket>) => void;
  socket_disconnected: (
    nsp: string,
    id: string,
    reason: string,
    timestamp: Date
  ) => void;
  room_joined: (nsp: string, room: string, id: string, timestamp: Date) => void;
  room_left: (nsp: string, room: string, id: string, timestamp: Date) => void;
  event_received: (
    nsp: string,
    id: string,
    args: any[],
    timestamp: Date
  ) => void;
  event_sent: (nsp: string, id: string, args: any[], timestamp: Date) => void;
}

export interface ClientEvents {
  emit: (
    nsp: string,
    filter: string | undefined,
    ev: string,
    ...args: any[]
  ) => void;
  join: (nsp: string, room: string, filter?: string) => void;
  leave: (nsp: string, room: string, filter?: string) => void;
  _disconnect: (nsp: string, close: boolean, filter?: string) => void;
}
