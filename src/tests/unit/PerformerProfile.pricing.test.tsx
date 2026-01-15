import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';

vi.mock('../../app/services/products.service', () => ({
  default: {
    getPerformerProductByPerformerId: vi.fn(),
    getProducts: vi.fn(), // keep for other tests
  },
}));

vi.mock('../../app/services/performerProfile.service', () => ({
  default: {
    getPerformerProfile: vi.fn(),
  },
}));

vi.mock('../../app/services/content.service', () => ({
  getContentByPerformerProfileId: vi.fn(),
}));

import ProductService from '../../app/services/products.service';
import PerformerProfile from '../../components/performers/PerformerProfile';
import PerformerProfileService from '../../app/services/performerProfile.service';
import { getContentByPerformerProfileId } from '../../app/services/content.service';
import type { Performer } from '../../app/types/performers.types';
import type { PerformerProfile as PerformerProfileType } from '../../app/types/performers.types';

const sampleProducts = [
  {
    id: 3,
    productName: 'Streaming minute',
    price: 1,
    minPrice: 1,
    maxPrice: 15,
  },
  {
    id: 4,
    productName: 'Video Call',
    price: 10,
    minPrice: 10,
    maxPrice: 150,
  },
  {
    id: 5,
    productName: 'Private message',
    price: 10,
    minPrice: 10,
    maxPrice: 50,
  },
];

describe('PerformerProfile Pricing tab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (ProductService.getPerformerProductByPerformerId as unknown as Mock).mockResolvedValue(
      sampleProducts
    );
    (PerformerProfileService.getPerformerProfile as unknown as Mock).mockResolvedValue({
      nickName: undefined,
    } as PerformerProfileType);
    (getContentByPerformerProfileId as unknown as Mock).mockResolvedValue({ items: [] });
  });

  it('renders all products and shows default values', async () => {
    const performer: Performer = {
      id: '1',
      stage_name: 'Test Performer',
      performerProfile: { id: 10 },
    } as Performer;

    render(<PerformerProfile performer={performer} onClose={() => {}} />);

    // switch to Pricing tab
    const pricingBtn = screen.getByRole('button', { name: /pricing/i });
    fireEvent.click(pricingBtn);

    // wait for products to load
    await waitFor(() => expect(ProductService.getPerformerProductByPerformerId).toHaveBeenCalled());

    // Should render all products
    expect(screen.getByText('Streaming minute')).toBeInTheDocument();
    expect(screen.getByText('Video Call')).toBeInTheDocument();
    expect(screen.getByText('Private message')).toBeInTheDocument();

    // Verify sliders and default values
    const sliderStreaming = screen.getByLabelText('price-slider-3') as HTMLInputElement;
    expect(sliderStreaming).toBeInTheDocument();
    expect(Number(sliderStreaming.value)).toBe(1);

    const sliderVideo = screen.getByLabelText('price-slider-4') as HTMLInputElement;
    expect(Number(sliderVideo.value)).toBe(10);

    const sliderPrivate = screen.getByLabelText('price-slider-5') as HTMLInputElement;
    expect(Number(sliderPrivate.value)).toBe(10);

    // Check displayed token values
    expect(screen.getByText('1 tokens')).toBeInTheDocument();
    const tokenElements = screen.getAllByText('10 tokens');
    expect(tokenElements.length).toBe(2); // Should appear twice (Video Call and Private message)
  });

  it('updates displayed value when slider changes', async () => {
    const performer: Performer = {
      id: '1',
      stage_name: 'Test Performer',
      performerProfile: { id: 10 },
    } as Performer;

    render(<PerformerProfile performer={performer} onClose={() => {}} />);

    const pricingBtn = screen.getByRole('button', { name: /pricing/i });
    fireEvent.click(pricingBtn);

    await waitFor(() => expect(ProductService.getPerformerProductByPerformerId).toHaveBeenCalled());

    const sliderVideo = screen.getByLabelText('price-slider-4') as HTMLInputElement;
    expect(Number(sliderVideo.value)).toBe(10);

    fireEvent.change(sliderVideo, { target: { value: '50' } });

    // The displayed tokens should update
    expect(screen.getByText('50 tokens')).toBeInTheDocument();
  });
});
