import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProductFormModal from './ProductFormModal';
import ProductService from '../../app/services/products.service';
import { ProductType } from '../../app/types/products.types';
import type { Product } from '../../app/types/products.types';

vi.mock('../../app/services/products.service');

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

describe('ProductFormModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSaved = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when open is false', () => {
    render(
      <ProductFormModal open={false} onClose={mockOnClose} onSaved={mockOnSaved} initial={null} />
    );

    expect(screen.queryByText('Crear Producto')).not.toBeInTheDocument();
  });

  it('should render create form when open is true and initial is null', () => {
    render(
      <ProductFormModal open={true} onClose={mockOnClose} onSaved={mockOnSaved} initial={null} />
    );

    expect(screen.getByText('Crear Producto')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ej: Private Show')).toBeInTheDocument();
  });

  it('should render edit form when initial product is provided', () => {
    render(
      <ProductFormModal
        open={true}
        onClose={mockOnClose}
        onSaved={mockOnSaved}
        initial={mockProduct}
      />
    );

    expect(screen.getByText('Editar Producto')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Private Show')).toBeInTheDocument();
    expect(screen.getByDisplayValue('30')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(
      <ProductFormModal open={true} onClose={mockOnClose} onSaved={mockOnSaved} initial={null} />
    );

    const closeButton = screen.getByLabelText('Cerrar');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should show error when minPrice is greater than maxPrice', async () => {
    render(
      <ProductFormModal open={true} onClose={mockOnClose} onSaved={mockOnSaved} initial={null} />
    );

    fireEvent.change(screen.getByPlaceholderText('Ej: Private Show'), {
      target: { value: 'Test Product' },
    });
    fireEvent.change(screen.getByPlaceholderText('150'), { target: { value: '200' } });
    fireEvent.change(screen.getByPlaceholderText('100'), { target: { value: '600' } });
    fireEvent.change(screen.getByPlaceholderText('500'), { target: { value: '400' } });

    const submitButton = screen.getByText('Guardar');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('El precio mínimo no puede ser mayor al precio máximo')
      ).toBeInTheDocument();
    });
  });

  it('should show error when defaultPrice is outside price range', async () => {
    render(
      <ProductFormModal open={true} onClose={mockOnClose} onSaved={mockOnSaved} initial={null} />
    );

    fireEvent.change(screen.getByPlaceholderText('Ej: Private Show'), {
      target: { value: 'Test Product' },
    });
    fireEvent.change(screen.getByPlaceholderText('150'), { target: { value: '50' } });
    fireEvent.change(screen.getByPlaceholderText('100'), { target: { value: '100' } });
    fireEvent.change(screen.getByPlaceholderText('500'), { target: { value: '400' } });

    const submitButton = screen.getByText('Guardar');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('El precio por defecto debe estar dentro del rango de precios')
      ).toBeInTheDocument();
    });
  });

  it('should create product successfully', async () => {
    const newProduct = { ...mockProduct, id: 2 };
    vi.mocked(ProductService.createProduct).mockResolvedValue(newProduct);

    render(
      <ProductFormModal open={true} onClose={mockOnClose} onSaved={mockOnSaved} initial={null} />
    );

    fireEvent.change(screen.getByPlaceholderText('Ej: Private Show'), {
      target: { value: 'New Product' },
    });
    fireEvent.change(screen.getByPlaceholderText('30'), { target: { value: '45' } });
    fireEvent.change(screen.getByPlaceholderText('150'), { target: { value: '200' } });
    fireEvent.change(screen.getByPlaceholderText('100'), { target: { value: '150' } });
    fireEvent.change(screen.getByPlaceholderText('500'), { target: { value: '600' } });

    const submitButton = screen.getByText('Guardar');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(ProductService.createProduct).toHaveBeenCalled();
      expect(mockOnSaved).toHaveBeenCalledWith(newProduct);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should update product successfully', async () => {
    const updatedProduct = { ...mockProduct, name: 'Updated Product' };
    vi.mocked(ProductService.updateProduct).mockResolvedValue(updatedProduct);

    render(
      <ProductFormModal
        open={true}
        onClose={mockOnClose}
        onSaved={mockOnSaved}
        initial={mockProduct}
      />
    );

    fireEvent.change(screen.getByDisplayValue('Private Show'), {
      target: { value: 'Updated Product' },
    });

    const submitButton = screen.getByText('Guardar');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(ProductService.updateProduct).toHaveBeenCalledWith(mockProduct.id, expect.any(Object));
      expect(mockOnSaved).toHaveBeenCalledWith(updatedProduct);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
