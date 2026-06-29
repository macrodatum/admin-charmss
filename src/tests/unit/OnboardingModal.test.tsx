import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import type { Mock } from 'vitest';
import OnboardingModal from '../../components/performers/OnboardingModal';
import * as onboardingService from '../../app/services/onBoarding.service';
import type { OnboardingData } from '../../types/onboarding';

vi.mock('../../app/services/onBoarding.service');

const sample = {
  id: 2,
  firstName: 'Ana',
  middleName: 'María López',
  lastName: 'Ramírez',
  emailAddress: 'ana.ramirez@example.com',
  nickName: 'anaR',
  birthDate: '1995-03-22T00:00:00.000Z',
  countryCode: 'MX',
  gender: 2,
  requestDate: '2025-12-17T23:29:59.200Z',
  performerId: 2,
  studioId: 2,
  identificationNumber: '12345678',
  identificationType: 'CC',
  statusCardFrontFile: 2,
  statusCardBackFile: 2,
  statusCardFrontFaceFile: 2,
  statusCardBackFaceFile: 2,
  statusProfileImageFile: 2,
  sign: 'https://example.com/sign.png',
  requestDocuments: [
    {
      id: 7,
      requestPerformerId: 2,
      fileName: 'https://example.com/doc1.png',
      documentType: 1,
      documentName: 'Front',
      loadDate: new Date().toISOString(),
    },
    {
      id: 8,
      requestPerformerId: 2,
      fileName: 'https://example.com/doc2.png',
      documentType: 2,
      documentName: 'Back',
      loadDate: new Date().toISOString(),
    },
    {
      id: 9,
      requestPerformerId: 2,
      fileName: 'https://example.com/doc3.png',
      documentType: 3,
      documentName: 'FrontFace',
      loadDate: new Date().toISOString(),
    },
    {
      id: 10,
      requestPerformerId: 2,
      fileName: 'https://example.com/doc4.png',
      documentType: 4,
      documentName: 'BackFace',
      loadDate: new Date().toISOString(),
    },
    {
      id: 11,
      requestPerformerId: 2,
      fileName: 'https://example.com/doc5.png',
      documentType: 5,
      documentName: 'ProfileImage',
      loadDate: new Date().toISOString(),
    },
    {
      id: 12,
      requestPerformerId: 2,
      fileName: 'https://example.com/contract.png',
      documentType: 6,
      documentName: 'Contract',
      loadDate: new Date().toISOString(),
    },
  ],
  contractAcceptedByPerformer: true,
} as unknown as OnboardingData;

describe('OnboardingModal', () => {
  afterEach(() => vi.resetAllMocks());

  it('renders loading and then displays documents, signature and details', async () => {
    (onboardingService.getOnboardingData as unknown as Mock).mockResolvedValueOnce(sample);
    (onboardingService.decideOnboarding as unknown as Mock).mockResolvedValueOnce({
      ...sample,
      status: 2,
    } as unknown as OnboardingData);

    render(<OnboardingModal performerId={2} onClose={vi.fn()} />);

    expect(screen.getByText(/Loading documents/i)).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText(/Documents/i)).toBeInTheDocument());

    // Check documents are rendered (should show 5 images of types 1..5)
    expect(screen.getByText('Front')).toBeInTheDocument();
    expect(screen.getByText('Back')).toBeInTheDocument();
    expect(screen.getByText('FrontFace')).toBeInTheDocument();
    expect(screen.getByText('BackFace')).toBeInTheDocument();
    expect(screen.getByText('ProfileImage')).toBeInTheDocument();

    // Signature should be visible
    expect(screen.getByAltText('Signature')).toBeInTheDocument();

    // Details should be visible
    expect(screen.getAllByText('Ana María López Ramírez').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/ana.ramirez@example.com/)).toBeInTheDocument();
  });

  it('opens preview modal when clicking a document', async () => {
    (onboardingService.getOnboardingData as unknown as Mock).mockResolvedValueOnce(sample);

    render(<OnboardingModal performerId={2} onClose={vi.fn()} />);

    await waitFor(() => expect(screen.getByText('Front')).toBeInTheDocument());

    const img = screen.getByAltText('Front');
    expect(img).toBeInTheDocument();

    fireEvent.click(img);

    // AssetPreviewModal should open and display close button with aria-label
    await waitFor(() => expect(screen.getByLabelText('Close preview')).toBeInTheDocument());
  });

  it('stages an individual document approval locally', async () => {
    (onboardingService.getOnboardingData as unknown as Mock).mockResolvedValueOnce(sample);

    // ensure updateDocumentStatus is NOT called when staging locally
    (onboardingService.updateDocumentStatus as unknown as Mock).mockReset();

    render(<OnboardingModal performerId={2} onClose={vi.fn()} />);

    await waitFor(() => expect(screen.getByText('Front')).toBeInTheDocument());

    // find the card for 'Front' and click its approve button
    const frontLabel = screen.getByText('Front');
    // climb up until we find the container that holds the action buttons
    let cardNode: Element | null = frontLabel;
    while (
      cardNode &&
      cardNode.querySelectorAll &&
      cardNode.querySelectorAll('button').length === 0
    ) {
      cardNode = cardNode.parentElement;
    }
    if (!cardNode) throw new Error('Front card not found');

    const approveBtn = Array.from(cardNode.querySelectorAll('button')).find((b) =>
      /Accept/i.test(b.textContent || '')
    ) as HTMLButtonElement;
    expect(approveBtn).toBeDefined();
    fireEvent.click(approveBtn);

    // updateDocumentStatus should NOT have been called
    expect(onboardingService.updateDocumentStatus as unknown as Mock).not.toHaveBeenCalled();

    // after staging, status badge should show 'Approved'
    await waitFor(() => expect(screen.getAllByText('Approved').length).toBeGreaterThanOrEqual(1));
  });

  it('stages an individual document rejection locally', async () => {
    (onboardingService.getOnboardingData as unknown as Mock).mockResolvedValueOnce(sample);

    (onboardingService.updateDocumentStatus as unknown as Mock).mockReset();

    render(<OnboardingModal performerId={2} onClose={vi.fn()} />);

    await waitFor(() => expect(screen.getByText('Front')).toBeInTheDocument());

    const rejectBtns = screen.getAllByRole('button', { name: /Reject/i });
    // click the first reject for the 'Front' document
    fireEvent.click(rejectBtns[0]);

    // updateDocumentStatus should NOT have been called
    expect(onboardingService.updateDocumentStatus as unknown as Mock).not.toHaveBeenCalled();

    await waitFor(() => expect(screen.getAllByText('Rejected').length).toBeGreaterThanOrEqual(1));
  });

  it('sends document statuses when approving the onboarding', async () => {
    (onboardingService.getOnboardingData as unknown as Mock).mockResolvedValueOnce(sample);
    (onboardingService.decideOnboarding as unknown as Mock).mockResolvedValueOnce({
      ...sample,
      status: 2,
    } as unknown as OnboardingData);

    render(<OnboardingModal performerId={2} onClose={vi.fn()} />);

    await waitFor(() => expect(screen.getByText(/Approve Registration/i)).toBeInTheDocument());

    // stage first doc as approved
    const frontLabel = screen.getByText('Front');
    let cardNode: Element | null = frontLabel;
    while (
      cardNode &&
      cardNode.querySelectorAll &&
      cardNode.querySelectorAll('button').length === 0
    ) {
      cardNode = cardNode.parentElement;
    }
    const approveBtn = Array.from(cardNode!.querySelectorAll('button')).find((b) =>
      /Accept/i.test(b.textContent || '')
    ) as HTMLButtonElement;
    fireEvent.click(approveBtn);

    // click global approve and confirm
    const approveGlobal = screen.getByRole('button', { name: /Approve Registration/i });
    fireEvent.click(approveGlobal);

    await waitFor(() => expect(screen.getByText(/Confirm Approval/i)).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /^Approve$/ }));

    await waitFor(() => expect(screen.getByText(/Registration approved/i)).toBeInTheDocument());
    // also show status badge (use getAllByText because "Approved" appears on multiple approved docs)
    expect(screen.getAllByText('Approved').length).toBeGreaterThanOrEqual(1);

    // decideOnboarding should be called with the staged document statuses as explicit fields
    expect(onboardingService.decideOnboarding as unknown as Mock).toHaveBeenCalled();
    const args = (onboardingService.decideOnboarding as unknown as Mock).mock.calls[0];
    expect(args[0]).toBe(2); // performer id
    expect(args[1]).toBe(2); // statusOnboarding
    // explicit fields are passed as the last argument
    expect(args[5]).toBeDefined();
    // staged front should be approved
    expect(args[5].statusCardFrontFile).toBe(2);
  });

  it('rejects an individual document locally', async () => {
    (onboardingService.getOnboardingData as unknown as Mock).mockResolvedValueOnce(sample);

    (onboardingService.updateDocumentStatus as unknown as Mock).mockReset();

    render(<OnboardingModal performerId={2} onClose={vi.fn()} />);

    await waitFor(() => expect(screen.getByText('Front')).toBeInTheDocument());

    const rejectBtns = screen.getAllByRole('button', { name: /Reject/i });
    // click the first reject for the 'Front' document
    fireEvent.click(rejectBtns[0]);

    // updateDocumentStatus should NOT have been called
    expect(onboardingService.updateDocumentStatus as unknown as Mock).not.toHaveBeenCalled();

    await waitFor(() => expect(screen.getAllByText('Rejected').length).toBeGreaterThanOrEqual(1));
  });

  it('approve flow shows confirm and sets approval state', async () => {
    (onboardingService.getOnboardingData as unknown as Mock).mockResolvedValueOnce(sample);
    (onboardingService.decideOnboarding as unknown as Mock).mockResolvedValueOnce({
      ...sample,
      status: 2,
    } as unknown as OnboardingData);

    render(<OnboardingModal performerId={2} onClose={vi.fn()} />);

    await waitFor(() => expect(screen.getByText(/Approve Registration/i)).toBeInTheDocument());

    const approveBtn = screen.getByRole('button', { name: /Approve Registration/i });
    fireEvent.click(approveBtn);

    // Confirm modal should appear
    await waitFor(() => expect(screen.getByText(/Confirm Approval/i)).toBeInTheDocument());

    // Click approve in confirm (exact button)
    fireEvent.click(screen.getByRole('button', { name: /^Approve$/ }));

    // After action, header should show approval message
    await waitFor(() => expect(screen.getByText(/Registration approved/i)).toBeInTheDocument());
  });

  it('reject flow opens textarea and sets rejected state', async () => {
    (onboardingService.getOnboardingData as unknown as Mock).mockResolvedValueOnce(sample);
    (onboardingService.decideOnboarding as unknown as Mock).mockResolvedValueOnce({
      ...sample,
      status: 3,
    } as unknown as OnboardingData);

    render(<OnboardingModal performerId={2} onClose={vi.fn()} />);

    await waitFor(() => expect(screen.getByText(/Reject Registration/i)).toBeInTheDocument());

    const rejectBtn = screen.getByRole('button', { name: /Reject Registration/i });
    fireEvent.click(rejectBtn);

    await waitFor(() =>
      expect(screen.getByText(/Indicate the reason for rejection/i)).toBeInTheDocument()
    );

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'Illegible document' } });

    fireEvent.click(screen.getByText(/Confirm Rejection/i));

    await waitFor(() => expect(screen.getByText(/Registration rejected/i)).toBeInTheDocument());
    // also show status badge
    expect(screen.getByText('Rejected')).toBeInTheDocument();
  });

  it('returns null when no performerId passed', () => {
    const { container } = render(<OnboardingModal performerId={null} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('shows initial request status when present', async () => {
    (onboardingService.getOnboardingData as unknown as Mock).mockResolvedValueOnce({
      ...sample,
      status: 1,
      processMessage: 'Awaiting review',
    } as unknown as OnboardingData);

    render(<OnboardingModal performerId={2} onClose={vi.fn()} />);

    await waitFor(() => expect(screen.getByText(/Documents/i)).toBeInTheDocument());

    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Awaiting review')).toBeInTheDocument();
  });
});

describe('OnboardingModal - KYC SecurityRequest semaphore', () => {
  afterEach(() => vi.resetAllMocks());

  const baseSample = {
    ...sample,
    status: 0,
  };

  it('renders KYC green bubble when securityRequest is "Approved"', async () => {
    (onboardingService.getOnboardingData as unknown as Mock).mockResolvedValueOnce({
      ...baseSample,
      securityRequest: 'Approved',
    } as unknown as OnboardingData);

    render(<OnboardingModal performerId={2} onClose={vi.fn()} />);

    // only the colored bubble is rendered (no duplicate text label)
    const bubble = await waitFor(() => {
      const el = document.querySelector('[aria-label="KYC Approved"]');
      if (!el) throw new Error('KYC bubble not found');
      return el;
    });
    expect(bubble.className).toContain('bg-green-500');
  });

  it('renders KYC yellow bubble when securityRequest is "InReview"', async () => {
    (onboardingService.getOnboardingData as unknown as Mock).mockResolvedValueOnce({
      ...baseSample,
      securityRequest: 'InReview',
    } as unknown as OnboardingData);

    render(<OnboardingModal performerId={2} onClose={vi.fn()} />);

    const bubble = await waitFor(() => {
      const el = document.querySelector('[aria-label="KYC InReview"]');
      if (!el) throw new Error('KYC bubble not found');
      return el;
    });
    expect(bubble.className).toContain('bg-yellow-500');
  });

  it('renders KYC red bubble when securityRequest is "Declined"', async () => {
    (onboardingService.getOnboardingData as unknown as Mock).mockResolvedValueOnce({
      ...baseSample,
      securityRequest: 'Declined',
    } as unknown as OnboardingData);

    render(<OnboardingModal performerId={2} onClose={vi.fn()} />);

    const bubble = await waitFor(() => {
      const el = document.querySelector('[aria-label="KYC Declined"]');
      if (!el) throw new Error('KYC bubble not found');
      return el;
    });
    expect(bubble.className).toContain('bg-red-500');
  });

  it('renders KYC gray bubble when securityRequest is null', async () => {
    (onboardingService.getOnboardingData as unknown as Mock).mockResolvedValueOnce({
      ...baseSample,
      securityRequest: null,
    } as unknown as OnboardingData);

    render(<OnboardingModal performerId={2} onClose={vi.fn()} />);

    const bubble = await waitFor(() => {
      const el = document.querySelector('[aria-label="KYC Unknown"]');
      if (!el) throw new Error('KYC bubble not found');
      return el;
    });
    expect(bubble.className).toContain('bg-gray-300');
  });

  it('normalizes variants of approved (e.g. "approved", "kyc_approved", "verified")', async () => {
    (onboardingService.getOnboardingData as unknown as Mock).mockResolvedValueOnce({
      ...baseSample,
      securityRequest: 'kyc_approved',
    } as unknown as OnboardingData);

    render(<OnboardingModal performerId={2} onClose={vi.fn()} />);

    const bubble = await waitFor(() => {
      const el = document.querySelector('[aria-label="KYC Approved"]');
      if (!el) throw new Error('KYC bubble not found');
      return el;
    });
    expect(bubble).not.toBeNull();
  });

  it('normalizes variants of in review (e.g. "In_Progress")', async () => {
    (onboardingService.getOnboardingData as unknown as Mock).mockResolvedValueOnce({
      ...baseSample,
      securityRequest: 'In_Progress',
    } as unknown as OnboardingData);

    render(<OnboardingModal performerId={2} onClose={vi.fn()} />);

    const bubble = await waitFor(() => {
      const el = document.querySelector('[aria-label="KYC InReview"]');
      if (!el) throw new Error('KYC bubble not found');
      return el;
    });
    expect(bubble.className).toContain('bg-yellow-500');
  });

  it('normalizes variants of declined (e.g. "rejected", "failed")', async () => {
    (onboardingService.getOnboardingData as unknown as Mock).mockResolvedValueOnce({
      ...baseSample,
      securityRequest: 'failed',
    } as unknown as OnboardingData);

    render(<OnboardingModal performerId={2} onClose={vi.fn()} />);

    const bubble = await waitFor(() => {
      const el = document.querySelector('[aria-label="KYC Declined"]');
      if (!el) throw new Error('KYC bubble not found');
      return el;
    });
    expect(bubble.className).toContain('bg-red-500');
  });

  it('does NOT render the duplicated KYC text label', async () => {
    (onboardingService.getOnboardingData as unknown as Mock).mockResolvedValueOnce({
      ...baseSample,
      securityRequest: 'Approved',
    } as unknown as OnboardingData);

    render(<OnboardingModal performerId={2} onClose={vi.fn()} />);

    // wait for modal data to load by checking the bubble exists
    await waitFor(() =>
      expect(document.querySelector('[aria-label="KYC Approved"]')).not.toBeNull()
    );

    // neither the "KYC:" prefix nor the textual state should be rendered
    expect(screen.queryByText('KYC:')).toBeNull();
    expect(screen.queryByText('approved')).toBeNull();
    expect(screen.queryByText('in review')).toBeNull();
    expect(screen.queryByText('declined')).toBeNull();
    expect(screen.queryByText('unavailable')).toBeNull();
  });

  it('exposes KYC state via aria-label and title for accessibility', async () => {
    (onboardingService.getOnboardingData as unknown as Mock).mockResolvedValueOnce({
      ...baseSample,
      securityRequest: 'InReview',
    } as unknown as OnboardingData);

    render(<OnboardingModal performerId={2} onClose={vi.fn()} />);

    await waitFor(() =>
      expect(document.querySelector('[aria-label="KYC InReview"]')).not.toBeNull()
    );

    const bubble = document.querySelector('[aria-label="KYC InReview"]') as HTMLElement;
    expect(bubble.getAttribute('aria-label')).toBe('KYC InReview');
    expect(bubble.getAttribute('title')).toBe('KYC in review');
  });
});
