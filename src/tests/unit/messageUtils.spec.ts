import { describe, it, expect } from 'vitest';
import {
  createTextMessage,
  createMediaMessage,
  createSystemMessage,
  createTokensMessage,
  createGoalMessage,
  createSocketMessage,
  parseSystemContent,
  parseTokensContent,
  parseGoalContent,
  validateMessageContent,
  convertLegacyMessage,
  getDisplayText,
  isSystemMessage,
  isHighlightMessage,
  formatMessageTime,
} from '../../shared/utils/messageUtils';
import type { MessageSender } from '../../shared/types/SocketMessage';

describe('messageUtils', () => {
  describe('Message Creation', () => {
    it('should create a text message', () => {
      const msg = createTextMessage('Hello world');
      expect(msg.type).toBe('text');
      expect(msg.content).toBe('Hello world');
      expect(msg.timestamp).toBeGreaterThan(0);
    });

    it('should create a media message', () => {
      const msg = createMediaMessage('https://example.com/image.jpg', 'image', 'photo.jpg');
      expect(msg.type).toBe('media');
      expect(msg.content).toBe('https://example.com/image.jpg');
      expect(msg.mediaType).toBe('image');
      expect(msg.fileName).toBe('photo.jpg');
      expect(msg.timestamp).toBeGreaterThan(0);
    });

    it('should create a system message', () => {
      const msg = createSystemMessage('connected', 'client123');
      expect(msg.type).toBe('system');
      expect(msg.content).toBe('client123_connected');
      expect(msg.timestamp).toBeGreaterThan(0);
    });

    it('should create a tokens message', () => {
      const msg = createTokensMessage('client123', 50);
      expect(msg.type).toBe('tokens');
      expect(msg.content).toBe('client123_50');
      expect(msg.timestamp).toBeGreaterThan(0);
    });

    it('should create a goal message', () => {
      const msg = createGoalMessage('TipGoal', 'performer456', 100);
      expect(msg.type).toBe('goal');
      expect(msg.content).toBe('TipGoal_performer456_100');
      expect(msg.timestamp).toBeGreaterThan(0);
    });

    it('should create a complete socket message', () => {
      const messageContent = createTextMessage('Test');
      const sender: MessageSender = { id: 'user1', name: 'Test User' };
      const msg = createSocketMessage('room1', messageContent, sender);

      expect(msg.id).toBeDefined();
      expect(msg.room).toBe('room1');
      expect(msg.messageContent).toEqual(messageContent);
      expect(msg.sender).toEqual(sender);
      expect(msg.timestamp).toBeGreaterThan(0);
    });
  });

  describe('Content Parsing', () => {
    it('should parse system content correctly', () => {
      const parsed = parseSystemContent('client123_connected');
      expect(parsed).toEqual({ clientId: 'client123', event: 'connected' });
    });

    it('should parse system content with underscore in event', () => {
      const parsed = parseSystemContent('client123_user_joined');
      expect(parsed).toEqual({ clientId: 'client123', event: 'user_joined' });
    });

    it('should return null for invalid system content', () => {
      const parsed = parseSystemContent('invalid');
      expect(parsed).toBeNull();
    });

    it('should parse tokens content correctly', () => {
      const parsed = parseTokensContent('client123_50');
      expect(parsed).toEqual({ clientId: 'client123', amount: 50 });
    });

    it('should return null for invalid tokens content', () => {
      const parsed = parseTokensContent('client123_invalid');
      expect(parsed).toBeNull();
    });

    it('should parse goal content correctly', () => {
      const parsed = parseGoalContent('TipGoal_performer456_100');
      expect(parsed).toEqual({
        goalName: 'TipGoal',
        performerId: 'performer456',
        tokens: 100,
      });
    });

    it('should return null for invalid goal content', () => {
      const parsed = parseGoalContent('TipGoal_performer456');
      expect(parsed).toBeNull();
    });
  });

  describe('Message Validation', () => {
    it('should validate text messages', () => {
      const msg = createTextMessage('Hello');
      expect(validateMessageContent(msg)).toBe(true);
    });

    it('should validate media messages with valid URL', () => {
      const msg = createMediaMessage('https://example.com/image.jpg');
      expect(validateMessageContent(msg)).toBe(true);
    });

    it('should reject media messages with invalid URL', () => {
      const msg = {
        type: 'media' as const,
        content: 'not-a-url',
        timestamp: Date.now(),
      };
      expect(validateMessageContent(msg)).toBe(false);
    });

    it('should validate system messages', () => {
      const msg = createSystemMessage('connected', 'client123');
      expect(validateMessageContent(msg)).toBe(true);
    });

    it('should validate tokens messages', () => {
      const msg = createTokensMessage('client123', 50);
      expect(validateMessageContent(msg)).toBe(true);
    });

    it('should validate goal messages', () => {
      const msg = createGoalMessage('TipGoal', 'performer456', 100);
      expect(validateMessageContent(msg)).toBe(true);
    });

    it('should reject messages without type', () => {
      const msg = {
        content: 'Test',
        timestamp: Date.now(),
      } as any;
      expect(validateMessageContent(msg)).toBe(false);
    });

    it('should reject messages without content', () => {
      const msg = {
        type: 'text',
        timestamp: Date.now(),
      } as any;
      expect(validateMessageContent(msg)).toBe(false);
    });

    it('should reject messages with invalid timestamp', () => {
      const msg = {
        type: 'text',
        content: 'Test',
        timestamp: 0,
      } as any;
      expect(validateMessageContent(msg)).toBe(false);
    });
  });

  describe('Legacy Message Conversion', () => {
    it('should convert legacy string message to structured message', () => {
      const legacyMsg = 'Hello world';
      const converted = convertLegacyMessage(legacyMsg, 'room1');

      expect(converted.id).toBeDefined();
      expect(converted.room).toBe('room1');
      expect(converted.messageContent.type).toBe('text');
      expect(converted.messageContent.content).toBe('Hello world');
      expect(converted.timestamp).toBeGreaterThan(0);
    });
  });

  describe('Display Text Generation', () => {
    it('should return content for text messages', () => {
      const msg = createTextMessage('Hello world');
      expect(getDisplayText(msg)).toBe('Hello world');
    });

    it('should return filename for media messages with filename', () => {
      const msg = createMediaMessage('https://example.com/image.jpg', 'image', 'photo.jpg');
      expect(getDisplayText(msg)).toBe('📎 photo.jpg');
    });

    it('should return emoji for media messages without filename', () => {
      const msg = createMediaMessage('https://example.com/image.jpg', 'image');
      expect(getDisplayText(msg)).toBe('🖼️ Imagen');
    });

    it('should format system messages', () => {
      const msg = createSystemMessage('connected', 'client123');
      expect(getDisplayText(msg)).toBe('client123 se conectó');
    });

    it('should format tokens messages', () => {
      const msg = createTokensMessage('client123', 50);
      expect(getDisplayText(msg)).toBe('💰 client123 envió 50 tokens');
    });

    it('should format goal messages', () => {
      const msg = createGoalMessage('TipGoal', 'performer456', 100);
      expect(getDisplayText(msg)).toBe('🎯 TipGoal: 100 tokens para performer456');
    });
  });

  describe('Message Classification', () => {
    it('should identify system messages', () => {
      const msg = createSystemMessage('connected', 'client123');
      expect(isSystemMessage(msg)).toBe(true);

      const textMsg = createTextMessage('Hello');
      expect(isSystemMessage(textMsg)).toBe(false);
    });

    it('should identify highlight messages (tokens)', () => {
      const msg = createTokensMessage('client123', 50);
      expect(isHighlightMessage(msg)).toBe(true);
    });

    it('should identify highlight messages (goals)', () => {
      const msg = createGoalMessage('TipGoal', 'performer456', 100);
      expect(isHighlightMessage(msg)).toBe(true);
    });

    it('should not highlight regular messages', () => {
      const msg = createTextMessage('Hello');
      expect(isHighlightMessage(msg)).toBe(false);
    });
  });

  describe('Time Formatting', () => {
    it('should format timestamp to HH:MM', () => {
      const timestamp = new Date('2026-01-09T14:30:00').getTime();
      const formatted = formatMessageTime(timestamp);
      expect(formatted).toMatch(/^\d{2}:\d{2}$/);
    });

    it('should pad single digit hours and minutes', () => {
      const timestamp = new Date('2026-01-09T09:05:00').getTime();
      const formatted = formatMessageTime(timestamp);
      expect(formatted).toMatch(/^\d{2}:\d{2}$/);
      expect(formatted.length).toBe(5); // HH:MM = 5 characters
    });
  });
});
