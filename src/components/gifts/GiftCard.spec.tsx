import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GiftCard from './GiftCard';
import type { Gift } from '../../app/types/gifts.types';

const gift: Gift = { id: 1, name: 'Rose', description: 'Red', price: 100, url: '', urlSound: '' };

describe('GiftCard', () => {
  it('renders gift info and buttons', () => {
    const onView = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(<GiftCard gift={gift} onView={onView} onEdit={onEdit} onDelete={onDelete} />);

    expect(screen.getByText('Rose')).toBeInTheDocument();
    expect(screen.getByText('100 tokens')).toBeInTheDocument();

    fireEvent.click(screen.getByTitle('Ver'));
    expect(onView).toHaveBeenCalledWith(gift);

    fireEvent.click(screen.getByTitle('Editar'));
    expect(onEdit).toHaveBeenCalledWith(gift);

    fireEvent.click(screen.getByTitle('Borrar'));
    expect(onDelete).toHaveBeenCalledWith(gift.id);
  });
});
