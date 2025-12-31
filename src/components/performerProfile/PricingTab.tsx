import React, { useState, useEffect } from 'react';
import ProductService from '../../app/services/products.service';
import type { Product } from '../../app/types/products.types';

interface PricingTabProps {
  performerId: string;
}

export default function PricingTab({ performerId }: PricingTabProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [priceValues, setPriceValues] = useState<Record<number, number>>({});

  // Cargar productos al montar
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const allProducts = await ProductService.getProducts();
        const editable = allProducts.filter((p) => p.editPriceInProfile === true);
        setProducts(editable);

        const initialValues: Record<number, number> = {};
        editable.forEach((p) => {
          initialValues[p.id] = p.defaultPrice;
        });
        setPriceValues(initialValues);
      } catch (err) {
        console.error('Error loading products for pricing tab:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      // TODO: Implementar endpoint de backend cuando esté disponible
      // await PerformerPricingService.updatePricing(performerId, priceValues);
      console.log('Saving pricing values for performer', performerId, priceValues);
      setSaveMessage('Pricing guardado correctamente');
    } catch (err) {
      console.error('Error saving pricing:', err);
      setSaveMessage('Error guardando Pricing');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin h-8 w-8 border-2 border-pink-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm text-gray-600 dark:text-gray-300">Cargando precios...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        <p className="text-sm">No hay productos configurables para editar el precio.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {products.map((p) => (
          <div
            key={p.id}
            className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">{p.name}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {p.minPrice} - {p.maxPrice} tokens
                </p>
              </div>
              <div className="text-right text-sm text-gray-900 dark:text-white font-medium">
                {priceValues[p.id] ?? p.defaultPrice} tokens
              </div>
            </div>

            <input
              aria-label={`price-slider-${p.id}`}
              type="range"
              min={String(p.minPrice)}
              max={String(p.maxPrice)}
              value={String(priceValues[p.id] ?? p.defaultPrice)}
              onChange={(e) =>
                setPriceValues((prev) => ({ ...prev, [p.id]: Number(e.target.value) }))
              }
              className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-3 pt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-pink-600 text-white rounded-md disabled:opacity-50 hover:bg-pink-700 transition-colors"
        >
          {saving ? 'Guardando...' : 'Save pricing'}
        </button>
      </div>
      {saveMessage && (
        <p
          className={`text-sm ${
            saveMessage.includes('Error') ? 'text-red-600' : 'text-green-600'
          }`}
        >
          {saveMessage}
        </p>
      )}
    </div>
  );
}
