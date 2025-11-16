import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import type { LocationResponse } from '../types/location';

const WS_URL = 'http://localhost:8080/ws';

/**
 * WebSocket Service for Real-time Drone Location Updates
 * Uses SockJS + STOMP protocol
 */
class WebSocketService {
  private client: Client | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 3000;

  /**
   * Connect to WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnected) {
        console.log('✅ WebSocket already connected');
        resolve();
        return;
      }

      console.log('🔌 Connecting to WebSocket:', WS_URL);

      // Create STOMP client with SockJS
      this.client = new Client({
        webSocketFactory: () => new SockJS(WS_URL) as any,
        
        onConnect: () => {
          console.log('✅ WebSocket connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve();
        },

        onStompError: (frame: any) => {
          console.error('❌ STOMP error:', frame);
          reject(new Error('STOMP connection error'));
        },

        onWebSocketError: (event: any) => {
          console.error('❌ WebSocket error:', event);
          reject(new Error('WebSocket connection error'));
        },

        onDisconnect: () => {
          console.log('🔌 WebSocket disconnected');
          this.isConnected = false;
          this.attemptReconnect();
        },

        // Heartbeat configuration
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,

        // Debug mode (set to false in production)
        debug: () => {
          // console.log('[STOMP Debug]:', str);
        },
      });

      // Activate the client
      this.client.activate();
    });
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`🔄 Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect().catch((error) => {
        console.error('❌ Reconnection failed:', error);
      });
    }, this.reconnectDelay);
  }

  /**
   * Subscribe to drone location updates
   * @param droneId - The drone ID to track
   * @param callback - Function to handle location updates
   * @returns Unsubscribe function
   */
  subscribeToDroneLocation(
    droneId: string,
    callback: (location: LocationResponse) => void
  ): () => void {
    if (!this.client || !this.isConnected) {
      console.warn('⚠️ WebSocket not connected. Cannot subscribe.');
      // Auto-connect and retry
      this.connect()
        .then(() => {
          console.log('✅ Connected, retrying subscription...');
          this.subscribeToDroneLocation(droneId, callback);
        })
        .catch((error) => {
          console.error('❌ Failed to connect:', error);
        });
      return () => {}; // Return empty unsubscribe function
    }

    const topic = `/topic/drone/${droneId}`;
    console.log('📡 Subscribing to:', topic);

    const subscription = this.client.subscribe(topic, (message) => {
      try {
        const location: LocationResponse = JSON.parse(message.body);
        console.log('📍 Received location update:', location);
        callback(location);
      } catch (error) {
        console.error('❌ Failed to parse location message:', error);
      }
    });

    // Return unsubscribe function
    return () => {
      console.log('📡 Unsubscribing from:', topic);
      subscription.unsubscribe();
    };
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    if (this.client && this.isConnected) {
      console.log('🔌 Disconnecting WebSocket...');
      this.client.deactivate();
      this.isConnected = false;
    }
  }

  /**
   * Check if connected
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
export default websocketService;
