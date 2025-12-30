import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProductCard from './ProductCard';
import { ProductType } from '../../app/types/products.types';
import type { Product } from '../../app/types/products.types';

const mockProduct: Product = {
  id: 1,
  name: 'Private Show',
  productType: ProductType.PRIVATE_SHOW,
  durationDays: 30,
  minPrice: 100,
  maxPrice: 500,
  defaultPrice: 150,
  editPriceInProfile: true,
};

describe('ProductCard', () => {
  const mockOnView = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render product information correctly', () => {
    render(
      <ProductCard
        product={mockProduct}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Private Show')).toBeInTheDocument();
    expect(screen.getByText('Show Privado')).toBeInTheDocument();
    expect(screen.getByText('30 días')).toBeInTheDocument();
    expect(screen.getByText('$150')).toBeInTheDocument();
    expect(screen.getByText('$100 - $500')).toBeInTheDocument();
    expect(screen.getByText('Sí')).toBeInTheDocument();
  });

  it('should call onView when view button is clicked', async () => {
    render(
      <ProductCard
        product={mockProduct}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const viewButton = screen.getByLabelText('Ver');
    fireEvent.click(viewButton);

    await waitFor(() => {
      expect(mockOnView).toHaveBeenCalledWith(mockProduct);
    });
  });

  it('should call onEdit when edit button is clicked', async () => {
    render(
      <ProductCard
        product={mockProduct}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const editButton = screen.getByLabelText('Editar');
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(mockOnEdit).toHaveBeenCalledWith(mockProduct);
    });
  });

  it('should call onDelete when delete button is clicked', async () => {
    render(
      <ProductCard
        product={mockProduct}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByLabelText('Borrar');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledWith(mockProduct.id);
    });
  });

  it('should display "No" when editPriceInProfile is false', () => {
    const product = { ...mockProduct, editPriceInProfile: false };
    render(
      <ProductCard
        product={product}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('No')).toBeInTheDocument();
  });
});
