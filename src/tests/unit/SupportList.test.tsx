import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SupportList from '../../components/support/SupportList';
import { SupportStatusEnum, RequirementTypeEnum, SupportRequest } from '../../app/types/support.types';

const mockSupportRequests: SupportRequest[] = [
  {
    id: 1,
    fullName: 'John Doe',
    email: 'john@example.com',
    requestDate: '2026-02-28T00:00:00.000Z',
    requirementType: RequirementTypeEnum.COPYRIGHT,
    notes: 'El contenido infringe mis derechos.',
    documentUrl: 'https://example.com/document.pdf',
    documentKey: 'support/document.pdf',
    status: SupportStatusEnum.PENDING,
    createdAt: '2026-02-28T12:00:00.000Z',
    updatedAt: '2026-02-28T12:00:00.000Z',
  },
  {
    id: 2,
    fullName: 'Jane Smith',
    email: 'jane@example.com',
    requestDate: '2026-03-01T00:00:00.000Z',
    requirementType: RequirementTypeEnum.TECHNICAL_ISSUE,
    notes: 'Problema técnico en la plataforma.',
    status: SupportStatusEnum.IN_PROGRESS,
    createdAt: '2026-03-01T12:00:00.000Z',
    updatedAt: '2026-03-01T12:00:00.000Z',
  },
];

describe('SupportList', () => {
  const mockProps = {
    supportRequests: mockSupportRequests,
    onViewDetail: vi.fn(),
    onDownloadDocument: vi.fn(),
    totalCount: 2,
    currentSkip: 0,
    itemsToTake: 20,
    onChangeSkip: vi.fn(),
    onChangeItemsToTake: vi.fn(),
    onSearch: vi.fn(),
    onFilterStatus: vi.fn(),
    onSort: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render support requests correctly', () => {
    render(<SupportList {...mockProps} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('should display requirement type labels correctly', () => {
    render(<SupportList {...mockProps} />);

    expect(screen.getByText('Derechos de Autor')).toBeInTheDocument();
    expect(screen.getByText('Problema Técnico')).toBeInTheDocument();
  });

  it('should display status labels correctly', () => {
    render(<SupportList {...mockProps} />);

    expect(screen.getByText('Pendiente')).toBeInTheDocument();
    expect(screen.getByText('En Progreso')).toBeInTheDocument();
  });

  it('should show document download button when document exists', () => {
    render(<SupportList {...mockProps} />);

    const documentButtons = screen.getAllByText('Documento');
    expect(documentButtons).toHaveLength(1); // Only first request has document
    
    const noDocumentText = screen.getByText('Sin documento');
    expect(noDocumentText).toBeInTheDocument();
  });

  it('should call onViewDetail when view button is clicked', () => {
    render(<SupportList {...mockProps} />);

    const viewButtons = screen.getAllByTitle('Ver detalle');
    fireEvent.click(viewButtons[0]);

    expect(mockProps.onViewDetail).toHaveBeenCalledWith(mockSupportRequests[0]);
  });

  it('should call onDownloadDocument when download button is clicked', () => {
    render(<SupportList {...mockProps} />);

    const downloadButton = screen.getByText('Documento');
    fireEvent.click(downloadButton);

    expect(mockProps.onDownloadDocument).toHaveBeenCalledWith(mockSupportRequests[0]);
  });

  it('should handle search input correctly', async () => {
    render(<SupportList {...mockProps} />);

    const searchInput = screen.getByPlaceholderText('Buscar por nombre, email o notas...');
    fireEvent.change(searchInput, { target: { value: 'John' } });

    await waitFor(() => {
      expect(mockProps.onSearch).toHaveBeenCalledWith('John');
    });
  });

  it('should handle status filter correctly', () => {
    render(<SupportList {...mockProps} />);

    const statusSelect = screen.getByDisplayValue('Todos los Estados');
    fireEvent.change(statusSelect, { target: { value: 'PENDING' } });

    expect(mockProps.onFilterStatus).toHaveBeenCalledWith('PENDING');
  });

  it('should handle sorting correctly', () => {
    render(<SupportList {...mockProps} />);

    const nameHeader = screen.getByText('Solicitante');
    fireEvent.click(nameHeader);

    expect(mockProps.onSort).toHaveBeenCalledWith('fullName', 'asc');
  });

  it('should display empty state when no requests', () => {
    const emptyProps = { ...mockProps, supportRequests: [] };
    render(<SupportList {...emptyProps} />);

    expect(screen.getByText('No hay reportes de soporte')).toBeInTheDocument();
    expect(screen.getByText('No se encontraron reportes de soporte con los criterios actuales.')).toBeInTheDocument();
  });

  it('should handle pagination correctly', () => {
    render(<SupportList {...mockProps} />);

    const itemsSelect = screen.getByDisplayValue('20');
    fireEvent.change(itemsSelect, { target: { value: '50' } });

    expect(mockProps.onChangeItemsToTake).toHaveBeenCalledWith(50);
  });

  it('should display pagination information correctly', () => {
    render(<SupportList {...mockProps} />);

    expect(screen.getByText(/de 2 resultados \(página 1 de 1\)/)).toBeInTheDocument();
  });

  it('should format dates correctly', () => {
    render(<SupportList {...mockProps} />);

    // The dates should be formatted in Spanish locale
    expect(screen.getByText(/28 feb 2026/)).toBeInTheDocument();
    expect(screen.getByText(/1 mar 2026/)).toBeInTheDocument();
  });

  it('should show correct pagination buttons state', () => {
    render(<SupportList {...mockProps} />);

    const firstPageButton = screen.getByRole('button', { name: '' }).closest('button');
    const prevButton = screen.getAllByRole('button')[screen.getAllByRole('button').length - 4];
    
    // First and previous buttons should be disabled on page 1
    expect(firstPageButton).toBeDisabled();
    expect(prevButton).toBeDisabled();
  });
});