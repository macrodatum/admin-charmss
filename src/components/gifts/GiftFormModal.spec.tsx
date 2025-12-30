import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GiftFormModal from './GiftFormModal';
import GiftService from '../../app/services/gift.service';
import type { Gift } from '../../app/types/gifts.types';
import type { Mock } from 'vitest';

vi.mock('../../app/services/gift.service');

const mockService = GiftService as unknown as {
  createGift: Mock;
  updateGift: Mock;
};

describe('GiftFormModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates gift', async () => {
    const onSaved = vi.fn();
    const onClose = vi.fn();
    mockService.createGift = vi.fn().mockResolvedValue({ id: 1, name: 'A', price: 10 } as Gift);

    render(<GiftFormModal open={true} onClose={onClose} onSaved={onSaved} initial={null} />);

    fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { value: 'A' } });
    fireEvent.change(screen.getByLabelText(/Precio/i), { target: { value: '10' } });

    fireEvent.click(screen.getByText('Guardar'));

    await waitFor(() => expect(mockService.createGift).toHaveBeenCalled());
    expect(onSaved).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('edits gift', async () => {
    const onSaved = vi.fn();
    const onClose = vi.fn();
    mockService.updateGift = vi.fn().mockResolvedValue({ id: 2, name: 'B', price: 20 } as Gift);

    render(
      <GiftFormModal
        open={true}
        onClose={onClose}
        onSaved={onSaved}
        initial={{ id: 2, name: 'B', price: 20 }}
      />
    );

    fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { value: 'B' } });
    fireEvent.click(screen.getByText('Guardar'));

    await waitFor(() => expect(mockService.updateGift).toHaveBeenCalled());
    expect(onSaved).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});
