import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StreamingChat from '../../components/performers/StreamingChat';

// Mock del SocketProvider
const mockJoinRoom = vi.fn();
const mockLeaveRoom = vi.fn();
const mockSendRoomTextMessage = vi.fn();
const mockOnRoomMessage = vi.fn();

vi.mock('../../app/providers/SocketProvider', () => ({
  useSocketStore: () => ({
    connected: true,
    joinRoom: mockJoinRoom,
    leaveRoom: mockLeaveRoom,
    sendRoomTextMessage: mockSendRoomTextMessage,
    onRoomMessage: mockOnRoomMessage,
  }),
}));

describe('StreamingChat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the chat component', () => {
    render(
      <StreamingChat
        room="performer_123"
        performerName="Test Performer"
      />
    );

    expect(screen.getByText('Chat en Vivo')).toBeInTheDocument();
  });

  it('should join room on mount', () => {
    render(
      <StreamingChat
        room="performer_123"
        performerName="Test Performer"
      />
    );

    expect(mockJoinRoom).toHaveBeenCalledWith('performer_123');
  });

  it('should leave room on unmount', () => {
    const { unmount } = render(
      <StreamingChat
        room="performer_123"
        performerName="Test Performer"
      />
    );

    unmount();
    expect(mockLeaveRoom).toHaveBeenCalledWith('performer_123');
  });

  it('should send message when form is submitted', async () => {
    render(
      <StreamingChat
        room="performer_123"
        performerName="Test Performer"
      />
    );

    const input = screen.getByPlaceholderText('Mensaje a Test Performer...');
    const form = input.closest('form');

    fireEvent.change(input, { target: { value: 'Hello world' } });
    
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(mockSendRoomTextMessage).toHaveBeenCalledWith(
        'performer_123',
        'Hello world',
        expect.any(Function)
      );
    });
  });

  it('should not send empty messages', () => {
    render(
      <StreamingChat
        room="performer_123"
        performerName="Test Performer"
      />
    );

    const input = screen.getByPlaceholderText('Mensaje a Test Performer...');
    const form = input.closest('form');
    
    if (form) {
      fireEvent.submit(form);
    }

    expect(mockSendRoomTextMessage).not.toHaveBeenCalled();
  });

  it('should clear input after sending message', async () => {
    render(
      <StreamingChat
        room="performer_123"
        performerName="Test Performer"
      />
    );

    const input = screen.getByPlaceholderText('Mensaje a Test Performer...') as HTMLInputElement;
    const form = input.closest('form');
    
    fireEvent.change(input, { target: { value: 'Test message' } });
    expect(input.value).toBe('Test message');

    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  it('should register message listener on mount', () => {
    render(
      <StreamingChat
        room="performer_123"
        performerName="Test Performer"
      />
    );

    expect(mockOnRoomMessage).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should display no messages initially', () => {
    render(
      <StreamingChat
        room="performer_123"
        performerName="Test Performer"
      />
    );

    expect(screen.getByText('No hay mensajes aún. ¡Sé el primero en escribir!')).toBeInTheDocument();
  });

  it('should show gift button when onGiftClick is provided', () => {
    const onGiftClick = vi.fn();
    render(
      <StreamingChat
        room="performer_123"
        performerName="Test Performer"
        onGiftClick={onGiftClick}
      />
    );

    const giftButton = screen.getByTitle('Enviar regalo');
    expect(giftButton).toBeInTheDocument();
    
    fireEvent.click(giftButton);
    expect(onGiftClick).toHaveBeenCalled();
  });

  it('should not show gift button when onGiftClick is not provided', () => {
    render(
      <StreamingChat
        room="performer_123"
        performerName="Test Performer"
      />
    );

    const giftButton = screen.queryByTitle('Enviar regalo');
    expect(giftButton).not.toBeInTheDocument();
  });

  it('should display room name in info section', () => {
    render(
      <StreamingChat
        room="performer_123"
        performerName="Test Performer"
      />
    );

    expect(screen.getByText('Sala: performer_123')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <StreamingChat
        room="performer_123"
        performerName="Test Performer"
        className="custom-class"
      />
    );

    const chatContainer = container.firstChild;
    expect(chatContainer).toHaveClass('custom-class');
  });
});
