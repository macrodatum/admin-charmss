import React, { useEffect, useState } from 'react';
import GeodataService, { Country } from '../../app/services/geodata.service';

interface CountrySelectorProps {
  label?: string;
  value?: string | null;
  onChange: (isoCode: string) => void;
  error?: string | null;
  required?: boolean;
  id?: string;
}

const getFlagEmoji = (iso?: string) => {
  if (!iso) return '';
  return iso
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
    .join('');
};

export default function CountrySelector({ label, value, onChange, error, required, id }: CountrySelectorProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const list = await GeodataService.listCountries();
        if (!mounted) return;
        const normalized = (list ?? []).map((c: any) => ({
          isoCode: (c.isoCode || c.code || c.iso || '').toUpperCase(),
          name: c.name || c.country || c.label || '',
          dialCode: c.dialCode || c.dial || c.phoneCode || c.callingCode || null,
        }));
        setCountries(normalized);
      } catch (err) {
        console.error('Failed to load countries', err);
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}{required ? ' *' : ''}
        </label>
      )}
      <select
        id={id}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-gray-900 dark:text-white px-3 md:px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
      >
        {loading && <option value="">Loading...</option>}
        {!loading && countries.length === 0 && <option value="">No countries</option>}
        {!loading && countries.map((c) => (
          <option key={c.isoCode} value={c.isoCode}>
            {getFlagEmoji(c.isoCode)} {c.name}{c.dialCode ? ` ${c.dialCode}` : ''}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
