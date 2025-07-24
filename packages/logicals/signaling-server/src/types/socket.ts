import { WebSocket } from 'ws';
import { ID } from '.';

export type Socket = WebSocket & {
  id: ID;
  is_alive: boolean;
  strike: number;
  lastmessage?: number;
}

export type NetworkInfo = Record<string, any> & {
  id: ID;
  host: ID;
}