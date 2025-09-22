// // // import { io, Socket } from 'socket.io-client';

// // // class SocketManager {
// // //   private socket: Socket | null = null;
// // //   private listeners: Map<string, ((...args: any[]) => void)[]> = new Map();

// // //   connect() {
// // //     if (this.socket?.connected) return this.socket;

// // //     // Use the WebContainer API URL for socket connection
// // //     this.socket = io('http://localhost:5000', {
// // //       transports: ['websocket', 'polling'],
// // //       forceNew: true,
// // //       reconnection: true,
// // //       timeout: 20000,
// // //     });

// // //     this.socket.on('connect', () => {
// // //       console.log('Connected to Flask backend');
// // //     });

// // //     this.socket.on('disconnect', () => {
// // //       console.log('Disconnected from Flask backend');
// // //     });

// // //     this.socket.on('connect_error', (error) => {
// // //       console.error('Socket connection error:', error);
// // //     });

// // //     // Re-register all listeners
// // //     this.listeners.forEach((callbacks, event) => {
// // //       callbacks.forEach(callback => {
// // //         this.socket?.on(event, callback);
// // //       });
// // //     });

// // //     return this.socket;
// // //   }

// // //   disconnect() {
// // //     if (this.socket) {
// // //       this.socket.disconnect();
// // //       this.socket = null;
// // //     }
// // //   }

// // //   on(event: string, callback: (...args: any[]) => void) {
// // //     if (!this.listeners.has(event)) {
// // //       this.listeners.set(event, []);
// // //     }
// // //     this.listeners.get(event)?.push(callback);

// // //     if (this.socket) {
// // //       this.socket.on(event, callback);
// // //     }
// // //   }

// // //   emit(event: string, data?: any) {
// // //     if (this.socket?.connected) {
// // //       this.socket.emit(event, data);
// // //     }
// // //   }

// // //   off(event: string, callback: (...args: any[]) => void) {
// // //     const callbacks = this.listeners.get(event);
// // //     if (callbacks) {
// // //       const index = callbacks.indexOf(callback);
// // //       if (index > -1) {
// // //         callbacks.splice(index, 1);
// // //       }
// // //     }

// // //     if (this.socket) {
// // //       this.socket.off(event, callback);
// // //     }
// // //   }
// // // }

// // // export const socketManager = new SocketManager();

// // import { io, Socket } from 'socket.io-client';

// // class SocketManager {
// //   private socket: Socket | null = null;
// //   private listeners: Map<string, ((...args: any[]) => void)[]> = new Map();

// //   connect() {
// //     if (this.socket?.connected) return this.socket;

// //     // Use the WebContainer API URL for socket connection
// //     this.socket = io('http://localhost:5000', {
// //       transports: ['websocket', 'polling'],
// //       forceNew: true,
// //       reconnection: true,
// //       timeout: 20000,
// //     });

// //     this.socket.on('connect', () => {
// //       console.log('Connected to Flask backend');
// //     });

// //     this.socket.on('disconnect', () => {
// //       console.log('Disconnected from Flask backend');
// //     });

// //     this.socket.on('connect_error', (error: any) => {
// //       console.error('Socket connection error:', error);
// //     });

// //     // Re-register all listeners
// //     this.listeners.forEach((callbacks, event) => {
// //       callbacks.forEach((callback) => {
// //         this.socket?.on(event, callback);
// //       });
// //     });

// //     return this.socket;
// //   }

// //   disconnect() {
// //     if (this.socket) {
// //       this.socket.disconnect();
// //       this.socket = null;
// //     }
// //   }

// //   on(event: string, callback: (...args: any[]) => void) {
// //     if (!this.listeners.has(event)) {
// //       this.listeners.set(event, []);
// //     }
// //     this.listeners.get(event)?.push(callback);

// //     if (this.socket) {
// //       this.socket.on(event, callback);
// //     }
// //   }

// //   emit(event: string, data?: any) {
// //     if (this.socket?.connected) {
// //       this.socket.emit(event, data);
// //     }
// //   }

// //   off(event: string, callback: (...args: any[]) => void) {
// //     const callbacks = this.listeners.get(event);
// //     if (callbacks) {
// //       const index = callbacks.indexOf(callback);
// //       if (index > -1) {
// //         callbacks.splice(index, 1);
// //       }
// //     }

// //     if (this.socket) {
// //       this.socket.off(event, callback);
// //     }
// //   }
// // }

// // export const socketManager = new SocketManager();

// // import { io, Socket } from 'socket.io-client';

// // class SocketManager {
// //   private socket: Socket | null = null;
// //   private listeners: Map<string, ((...args: any[]) => void)[]> = new Map();

// //   connect() {
// //     if (this.socket?.connected) return this.socket;

// //     // Use the WebContainer API URL for socket connection
// //     this.socket = io('http://localhost:5000', {
// //       transports: ['websocket', 'polling'],
// //       forceNew: true,
// //       reconnection: true,
// //       timeout: 20000,
// //     });

// //     this.socket.on('connect', () => {
// //       console.log('Connected to Flask backend');
// //     });

// //     this.socket.on('disconnect', () => {
// //       console.log('Disconnected from Flask backend');
// //     });

// //     this.socket.on('connect_error', (error) => {
// //       console.error('Socket connection error:', error);
// //     });

// //     // Re-register all listeners
// //     this.listeners.forEach((callbacks, event) => {
// //       callbacks.forEach(callback => {
// //         this.socket?.on(event, callback);
// //       });
// //     });

// //     return this.socket;
// //   }

// //   disconnect() {
// //     if (this.socket) {
// //       this.socket.disconnect();
// //       this.socket = null;
// //     }
// //   }

// //   on(event: string, callback: (...args: any[]) => void) {
// //     if (!this.listeners.has(event)) {
// //       this.listeners.set(event, []);
// //     }
// //     this.listeners.get(event)?.push(callback);

// //     if (this.socket) {
// //       this.socket.on(event, callback);
// //     }
// //   }

// //   emit(event: string, data?: any) {
// //     if (this.socket?.connected) {
// //       this.socket.emit(event, data);
// //     }
// //   }

// //   off(event: string, callback: (...args: any[]) => void) {
// //     const callbacks = this.listeners.get(event);
// //     if (callbacks) {
// //       const index = callbacks.indexOf(callback);
// //       if (index > -1) {
// //         callbacks.splice(index, 1);
// //       }
// //     }

// //     if (this.socket) {
// //       this.socket.off(event, callback);
// //     }
// //   }
// // }

// // export const socketManager = new SocketManager();

// import { io, Socket } from 'socket.io-client';

// class SocketManager {
//   private socket: Socket | null = null;
//   private listeners: Map<string, ((...args: any[]) => void)[]> = new Map();

//   connect() {
//     if (this.socket?.connected) return this.socket;

//     // Use the WebContainer API URL for socket connection
//     this.socket = io('http://localhost:5000', {
//       transports: ['websocket', 'polling'],
//       forceNew: true,
//       reconnection: true,
//       timeout: 20000,
//     });

//     this.socket.on('connect', () => {
//       console.log('Connected to Flask backend');
//     });

//     this.socket.on('disconnect', () => {
//       console.log('Disconnected from Flask backend');
//     });

//     this.socket.on('connect_error', (error) => {
//       console.error('Socket connection error:', error);
//     });

//     // Re-register all listeners
//     this.listeners.forEach((callbacks, event) => {
//       callbacks.forEach((callback) => {
//         this.socket?.on(event, callback);
//       });
//     });

//     return this.socket;
//   }

//   disconnect() {
//     if (this.socket) {
//       this.socket.disconnect();
//       this.socket = null;
//     }
//   }

//   on(event: string, callback: (...args: any[]) => void) {
//     if (!this.listeners.has(event)) {
//       this.listeners.set(event, []);
//     }
//     this.listeners.get(event)?.push(callback);

//     if (this.socket) {
//       this.socket.on(event, callback);
//     }
//   }

//   emit(event: string, data?: any) {
//     if (this.socket?.connected) {
//       this.socket.emit(event, data);
//     }
//   }

//   off(event: string, callback: (...args: any[]) => void) {
//     const callbacks = this.listeners.get(event);
//     if (callbacks) {
//       const index = callbacks.indexOf(callback);
//       if (index > -1) {
//         callbacks.splice(index, 1);
//       }
//     }

//     if (this.socket) {
//       this.socket.off(event, callback);
//     }
//   }
// }

// export const socketManager = new SocketManager();
