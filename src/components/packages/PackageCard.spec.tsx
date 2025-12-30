import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PackageCard from './PackageCard';
import type { Package } from '../../app/types/packages.types';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  },
}));

describe('PackageCard', () => {
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
    paquete: mockPackage,
    onView: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render package information correctly', () => {
    render(<PackageCard {...mockProps} />);

    expect(screen.getByText('Premium Package')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByText('30 días')).toBeInTheDocument();
    expect(screen.getByText('1000 créditos')).toBeInTheDocument();
    expect(screen.getByText('+100 bonus')).toBeInTheDocument();
    expect(screen.getByText('Activo')).toBeInTheDocument();
  });

  it('should display logo image when provided', () => {
    render(<PackageCard {...mockProps} />);

    const logoImage = screen.getByAltText('Premium Package');
    expect(logoImage).toBeInTheDocument();
    expect(logoImage).toHaveAttribute('src', 'https://example.com/logo.png');
  });

  it('should handle missing logo image gracefully', () => {
    const packageWithoutLogo = { ...mockPackage, logoImage: '' };
    render(<PackageCard {...mockProps} paquete={packageWithoutLogo} />);

    expect(screen.queryByAltText('Premium Package')).not.toBeInTheDocument();
  });

  it('should show inactive status for inactive packages', () => {
    const inactivePackage = { ...mockPackage, status: false };
    render(<PackageCard {...mockProps} paquete={inactivePackage} />);

    expect(screen.getByText('Inactivo')).toBeInTheDocument();
  });

  it('should not show bonus when bonus is 0', () => {
    const packageWithoutBonus = { ...mockPackage, bonus: 0 };
    render(<PackageCard {...mockProps} paquete={packageWithoutBonus} />);

    expect(screen.queryByText('+0 bonus')).not.toBeInTheDocument();
  });

  it('should call onView when view button is clicked', () => {
    render(<PackageCard {...mockProps} />);

    const viewButton = screen.getByRole('button', { name: /ver/i });
    fireEvent.click(viewButton);

    expect(mockProps.onView).toHaveBeenCalledWith(mockPackage);
  });

  it('should call onEdit when edit button is clicked', () => {
    render(<PackageCard {...mockProps} />);

    const editButton = screen.getByRole('button', { name: /editar/i });
    fireEvent.click(editButton);

    expect(mockProps.onEdit).toHaveBeenCalledWith(mockPackage);
  });

  it('should call onDelete when delete button is clicked', () => {
    render(<PackageCard {...mockProps} />);

    const deleteButton = screen.getByRole('button', { name: /borrar/i });
    fireEvent.click(deleteButton);

    expect(mockProps.onDelete).toHaveBeenCalledWith(1);
  });

  it('should have proper test id', () => {
    render(<PackageCard {...mockProps} />);

    expect(screen.getByTestId('package-card-1')).toBeInTheDocument();
  });

  it('should handle image load error', () => {
    render(<PackageCard {...mockProps} />);

    const logoImage = screen.getByAltText('Premium Package');
    fireEvent.error(logoImage);

    expect(logoImage.style.display).toBe('none');
  });
});
