import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { instrument } from '../../../dist';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  afterInit() {
    // @ts-ignore
    instrument(this.server, {
      auth: false,
    });
  }
}
