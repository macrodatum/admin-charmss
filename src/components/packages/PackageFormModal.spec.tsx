import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import PackageFormModal from './PackageFormModal';
import PackageService from '../../app/services/packages.service';
import type { Package } from '../../app/types/packages.types';

// Mock the service
vi.mock('../../app/services/packages.service');

describe('PackageFormModal', () => {
  const mockPackage: Package = {
    id: 1,
    name: 'Premium Package',
    lifeTime: 30,
    price: 99.99,
    status: true,
    bonus: 100,
    totalCredit: 1000,
    logoImage: 'https://example.com/logo.png',
  };

  const mockProps = {
    open: true,
    onClose: vi.fn(),
    onSaved: vi.fn(),
    initial: null as Package | null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render create modal when no initial package', () => {
    render(<PackageFormModal {...mockProps} />);

    expect(screen.getByText('Crear Nuevo Paquete')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ej: Premium Package')).toBeInTheDocument();
  });

  it('should render edit modal when initial package provided', () => {
    render(<PackageFormModal {...mockProps} initial={mockPackage} />);

    expect(screen.getByText('Editar Paquete')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Premium Package')).toBeInTheDocument();
    expect(screen.getByDisplayValue('99.99')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<PackageFormModal {...mockProps} open={false} />);

    expect(screen.queryByText('Crear Nuevo Paquete')).not.toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    render(<PackageFormModal {...mockProps} />);

    const submitButton = screen.getByRole('button', { name: /guardar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('El nombre es requerido')).toBeInTheDocument();
    });
  });

  it('should validate price is greater than 0', async () => {
    render(<PackageFormModal {...mockProps} />);

    const nameInput = screen.getByPlaceholderText('Ej: Premium Package');
    const priceInput = screen.getByPlaceholderText('99.99');

    fireEvent.change(nameInput, { target: { value: 'Test Package' } });
    fireEvent.change(priceInput, { target: { value: '0' } });

    const submitButton = screen.getByRole('button', { name: /guardar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('El precio debe ser mayor a 0')).toBeInTheDocument();
    });
  });

  it('should validate lifeTime is greater than 0', async () => {
    const mockCreatePackage = vi.fn().mockRejectedValue(new Error('Validation error'));
    (PackageService.createPackage as unknown as Mock).mockImplementation(mockCreatePackage);

    render(<PackageFormModal {...mockProps} />);

    // Fill all required fields with invalid lifeTime
    const nameInput = screen.getByPlaceholderText('Ej: Premium Package');
    const priceInput = screen.getByPlaceholderText('99.99');
    const lifeTimeInput = screen.getByPlaceholderText('30');

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'Test Package' } });
      fireEvent.change(priceInput, { target: { value: '99.99' } });
      fireEvent.change(lifeTimeInput, { target: { value: '0' } });
    });

    await act(async () => {
      const submitButton = screen.getByRole('button', { name: /guardar/i });
      fireEvent.click(submitButton);
    });

    // The form should prevent submission due to validation
    expect(mockCreatePackage).not.toHaveBeenCalled();
  });

  it('should validate totalCredit is greater than 0', async () => {
    const mockCreatePackage = vi.fn().mockRejectedValue(new Error('Validation error'));
    (PackageService.createPackage as unknown as Mock).mockImplementation(mockCreatePackage);

    render(<PackageFormModal {...mockProps} />);

    // Fill all required fields with invalid totalCredit
    const nameInput = screen.getByPlaceholderText('Ej: Premium Package');
    const priceInput = screen.getByPlaceholderText('99.99');
    const totalCreditInput = screen.getByPlaceholderText('100');

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'Test Package' } });
      fireEvent.change(priceInput, { target: { value: '99.99' } });
      fireEvent.change(totalCreditInput, { target: { value: '0' } });
    });

    await act(async () => {
      const submitButton = screen.getByRole('button', { name: /guardar/i });
      fireEvent.click(submitButton);
    });

    // The form should prevent submission due to validation
    expect(mockCreatePackage).not.toHaveBeenCalled();
  });

  it('should validate logoImage URL format', async () => {
    const mockCreatePackage = vi.fn().mockRejectedValue(new Error('Validation error'));
    (PackageService.createPackage as unknown as Mock).mockImplementation(mockCreatePackage);

    render(<PackageFormModal {...mockProps} />);

    // Fill all required fields with invalid URL
    const nameInput = screen.getByPlaceholderText('Ej: Premium Package');
    const priceInput = screen.getByPlaceholderText('99.99');
    const logoImageInput = screen.getByPlaceholderText('https://example.com/logo.png');

    fireEvent.change(nameInput, { target: { value: 'Test Package' } });
    fireEvent.change(priceInput, { target: { value: '99.99' } });
    fireEvent.change(logoImageInput, { target: { value: 'invalid-url' } });

    const submitButton = screen.getByRole('button', { name: /guardar/i });
    fireEvent.click(submitButton);

    // The form should prevent submission due to validation
    expect(mockCreatePackage).not.toHaveBeenCalled();
  });

  it('should create package successfully', async () => {
    const createdPackage = { ...mockPackage };
    vi.mocked(PackageService.createPackage).mockResolvedValue(createdPackage);

    render(<PackageFormModal {...mockProps} />);

    const nameInput = screen.getByPlaceholderText('Ej: Premium Package');
    const priceInput = screen.getByPlaceholderText('99.99');

    fireEvent.change(nameInput, { target: { value: 'Test Package' } });
    fireEvent.change(priceInput, { target: { value: '99.99' } });

    const submitButton = screen.getByRole('button', { name: /guardar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(PackageService.createPackage).toHaveBeenCalledWith({
        name: 'Test Package',
        lifeTime: 30,
        price: 99.99,
        status: true,
        bonus: 0,
        totalCredit: 100,
        logoImage: '',
      });
      expect(mockProps.onSaved).toHaveBeenCalledWith(createdPackage);
      expect(mockProps.onClose).toHaveBeenCalled();
    });
  });

  it('should update package successfully', async () => {
    const updatedPackage = { ...mockPackage, name: 'Updated Package' };
    vi.mocked(PackageService.updatePackage).mockResolvedValue(updatedPackage);

    render(<PackageFormModal {...mockProps} initial={mockPackage} />);

    const nameInput = screen.getByDisplayValue('Premium Package');
    fireEvent.change(nameInput, { target: { value: 'Updated Package' } });

    const submitButton = screen.getByRole('button', { name: /guardar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(PackageService.updatePackage).toHaveBeenCalledWith(1, {
        name: 'Updated Package',
        lifeTime: 30,
        price: 99.99,
        status: true,
        bonus: 100,
        totalCredit: 1000,
        logoImage: 'https://example.com/logo.png',
      });
      expect(mockProps.onSaved).toHaveBeenCalledWith(updatedPackage);
    });
  });

  it('should handle service errors', async () => {
    vi.mocked(PackageService.createPackage).mockRejectedValue(new Error('Service error'));

    render(<PackageFormModal {...mockProps} />);

    const nameInput = screen.getByPlaceholderText('Ej: Premium Package');
    const priceInput = screen.getByPlaceholderText('99.99');

    fireEvent.change(nameInput, { target: { value: 'Test Package' } });
    fireEvent.change(priceInput, { target: { value: '99.99' } });

    const submitButton = screen.getByRole('button', { name: /guardar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Error al guardar el paquete')).toBeInTheDocument();
    });
  });

  it('should call onClose when cancel button clicked', () => {
    render(<PackageFormModal {...mockProps} />);

    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    fireEvent.click(cancelButton);

    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('should call onClose when X button clicked', () => {
    render(<PackageFormModal {...mockProps} />);

    const closeButtons = screen.getAllByRole('button');
    const closeButton = closeButtons.find(
      (button) => button.querySelector('svg') && button.getAttribute('aria-label') === null
    );

    if (closeButton) {
      fireEvent.click(closeButton);
      expect(mockProps.onClose).toHaveBeenCalled();
    }
  });

  it('should show preview image when valid URL provided', async () => {
    render(<PackageFormModal {...mockProps} />);

    const logoImageInput = screen.getByPlaceholderText('https://example.com/logo.png');
    fireEvent.change(logoImageInput, { target: { value: 'https://example.com/test.png' } });

    await waitFor(() => {
      const previewImage = screen.getByAltText('Preview');
      expect(previewImage).toBeInTheDocument();
      expect(previewImage).toHaveAttribute('src', 'https://example.com/test.png');
    });
  });
});
