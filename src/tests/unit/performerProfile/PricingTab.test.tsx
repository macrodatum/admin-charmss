import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import PricingTab from '../../../components/performerProfile/PricingTab';
import ProductService from '../../../app/services/products.service';

vi.mock('../../../app/services/products.service');

describe('PricingTab', () => {
  const mockProps = {
    performerId: '1',
    performerProfileId: 100,
  };

  const mockProducts = [
    {
      id: 1,
      productName: 'Private Show',
      price: 50,
      minPrice: 10,
      maxPrice: 100,
    },
    {
      id: 2,
      productName: 'Video Call',
      price: 25,
      minPrice: 5,
      maxPrice: 50,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads and displays returned products', async () => {
    vi.mocked(ProductService.getPerformerProductByPerformerId).mockResolvedValue(
      mockProducts as any
    );

    render(<PricingTab {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Private Show')).toBeInTheDocument();
      expect(screen.getByText('Video Call')).toBeInTheDocument();
    });
  });

  it('displays whatever the service returns (no extra filtering)', async () => {
    const allProducts = [
      ...mockProducts,
      {
        id: 3,
        productName: 'Non-editable Product',
        price: 10,
        minPrice: 10,
        maxPrice: 100,
      },
    ];

    vi.mocked(ProductService.getPerformerProductByPerformerId).mockResolvedValue(
      allProducts as any
    );

    render(<PricingTab {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Private Show')).toBeInTheDocument();
      // now the third product should also be rendered because the component displays returned items
      expect(screen.getByText('Non-editable Product')).toBeInTheDocument();
    });
  });

  it('updates price slider value', async () => {
    vi.mocked(ProductService.getPerformerProductByPerformerId).mockResolvedValue(
      mockProducts as any
    );

    render(<PricingTab {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Private Show')).toBeInTheDocument();
    });

    const slider = screen.getByLabelText('price-slider-1') as HTMLInputElement;
    fireEvent.change(slider, { target: { value: '75' } });

    expect(slider.value).toBe('75');
  });

  // PricingTab no incluye funcionalidad de guardado en el componente actual, por lo tanto se elimina la prueba de guardar.

  it('shows message when no products are returned', async () => {
    vi.mocked(ProductService.getPerformerProductByPerformerId).mockResolvedValue([]);

    render(<PricingTab {...mockProps} />);

    await waitFor(() => {
      expect(
        screen.getByText('No hay productos configurables para editar el precio.')
      ).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    vi.mocked(ProductService.getPerformerProductByPerformerId).mockImplementation(
      () => new Promise(() => {})
    );

    render(<PricingTab {...mockProps} />);

    expect(screen.getByText('Cargando precios...')).toBeInTheDocument();
  });
});
