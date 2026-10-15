export type AudioMessage = {
  id: string;
  sender: 'Mesero' | 'Cocina';
  audioData: string; // Base64 data URL
  duration?: number;
  timestamp: number;
  createdAt: string;
};

const MAX_MESSAGES = 25;
const messages: AudioMessage[] = [];
type AudioSubscriber = (msg: AudioMessage) => void;
const subscribers = new Set<AudioSubscriber>();

export const subscribeAudioMessages = (cb: AudioSubscriber): (() => void) => {
  subscribers.add(cb);
  return () => {
    subscribers.delete(cb);
  };
};

export const addAudioMessage = (msg: {
  sender: 'Mesero' | 'Cocina';
  audioData: string;
  duration?: number;
}): AudioMessage => {
  const audioMessage: AudioMessage = {
    id: crypto.randomUUID(),
    sender: msg.sender,
    audioData: msg.audioData,
    duration: msg.duration,
    timestamp: Date.now(),
    createdAt: new Date().toISOString(),
  };
  messages.unshift(audioMessage);
  if (messages.length > MAX_MESSAGES) {
    messages.pop();
  }

  // Notificar inmediatamente a todos los clientes conectados (< 50ms)
  for (const cb of subscribers) {
    try {
      cb(audioMessage);
    } catch (_) {}
  }

  return audioMessage;
};

export const getAudioMessagesSince = (sinceTimestamp?: number): AudioMessage[] => {
  if (!sinceTimestamp || Number.isNaN(sinceTimestamp)) {
    // Retornar los más recientes (máximo 3) si no se especifica timestamp
    return messages.slice(0, 3);
  }
  return messages.filter((m) => m.timestamp > sinceTimestamp);
};
