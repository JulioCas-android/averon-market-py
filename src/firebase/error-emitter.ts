import { EventEmitter } from 'events';
// Central event emitter for handling specific app-wide events, like permission errors.
export const errorEmitter = new EventEmitter();
