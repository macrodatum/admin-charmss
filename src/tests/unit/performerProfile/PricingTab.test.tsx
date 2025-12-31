import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import PricingTab from '../../../components/performerProfile/PricingTab';
import ProductService from '../../../app/services/products.service';

vi.mock('../../../app/services/products.service');

describe('PricingTab', () => {
  const mockProps = {
    performerId: '1',
  };

  const mockProducts = [
    {
      id: 1,
      name: 'Private Show',
      editPriceInProfile: true,
      minPrice: 10,
      maxPrice: 100,
      defaultPrice: 50,
    },
    {
      id: 2,
      name: 'Video Call',
      editPriceInProfile: true,
      minPrice: 5,
      maxPrice: 50,
      defaultPrice: 25,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads and displays editable products', async () => {
    vi.mocked(ProductService.getProducts).mockResolvedValue(mockProducts as any);

    render(<PricingTab {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Private Show')).toBeInTheDocument();
      expect(screen.getByText('Video Call')).toBeInTheDocument();
    });
  });

  it('filters only editable products', async () => {
    const allProducts = [
      ...mockProducts,
      {
        id: 3,
        name: 'Non-editable Product',
        editPriceInProfile: false,
        minPrice: 10,
        maxPrice: 100,
        defaultPrice: 50,
      },
    ];

    vi.mocked(ProductService.getProducts).mockResolvedValue(allProducts as any);

    render(<PricingTab {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Private Show')).toBeInTheDocument();
      expect(screen.queryByText('Non-editable Product')).not.toBeInTheDocument();
    });
  });

  it('updates price slider value', async () => {
    vi.mocked(ProductService.getProducts).mockResolvedValue(mockProducts as any);

    render(<PricingTab {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Private Show')).toBeInTheDocument();
    });

    const slider = screen.getByLabelText('price-slider-1') as HTMLInputElement;
    fireEvent.change(slider, { target: { value: '75' } });

    expect(slider.value).toBe('75');
  });

  it('displays message when save button is clicked', async () => {
    vi.mocked(ProductService.getProducts).mockResolvedValue(mockProducts as any);

    render(<PricingTab {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('Private Show')).toBeInTheDocument();
    });

    const saveButton = screen.getByText('Save pricing');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Pricing guardado correctamente')).toBeInTheDocument();
    });
  });

  it('shows message when no editable products exist', async () => {
    vi.mocked(ProductService.getProducts).mockResolvedValue([]);

    render(<PricingTab {...mockProps} />);

    await waitFor(() => {
      expect(screen.getByText('No hay productos configurables para editar el precio.')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    vi.mocked(ProductService.getProducts).mockImplementation(() => new Promise(() => {}));

    render(<PricingTab {...mockProps} />);

    expect(screen.getByText('Cargando precios...')).toBeInTheDocument();
  });
});
