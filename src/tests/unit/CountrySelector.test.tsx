import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import CountrySelector from '../../components/ui/CountrySelector';
import GeodataService from '../../app/services/geodata.service';

vi.mock('../../app/services/geodata.service');

describe('CountrySelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads countries and calls onChange with iso code', async () => {
    vi.mocked(GeodataService.listCountries).mockResolvedValue([
      { isoCode: 'CO', name: 'Colombia', dialCode: '+57' },
      { isoCode: 'US', name: 'United States', dialCode: '+1' },
    ] as any);

    const onChange = vi.fn();

    render(<CountrySelector id="country" label="Country" value={"CO"} onChange={onChange} error={null} required />);

    const select = screen.getByRole('combobox', { name: /Country/ }) as HTMLSelectElement;

    await waitFor(() => {
      expect(Array.from(select.options).some((o) => o.value === 'CO')).toBeTruthy();
      expect(Array.from(select.options).some((o) => o.value === 'US')).toBeTruthy();
    });

    fireEvent.change(select, { target: { value: 'US' } });

    expect(onChange).toHaveBeenCalledWith('US');
  });
});
