import React, { useState, useEffect } from 'react';
import ProductService from '../../app/services/products.service';
import type { PerformerProduct } from '../../app/types/products.types';

interface PricingTabProps {
  performerId: string;
}

export default function PricingTab({ performerId }: PricingTabProps) {
  const [loading, setLoading] = useState(false);

  // Use performer products directly (contains price/min/max/productName)
  const [products, setProducts] = useState<PerformerProduct[]>([]);


  // Cargar productos al montar o cuando cambie el performerId
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        // Obtener productos específicos del performer (todos los datos vienen de aquí)
        const performerProducts = await ProductService.getPerformerProductByPerformerId(performerId);

        // Asegurarse de que cada producto tenga min/max/default; si faltan, añadir valores por defecto razonables
        const normalized = performerProducts.map((pp) => ({
          ...pp,
          minPrice: pp.minPrice ?? Math.max(1, Math.floor(pp.price * 0.5)),
          maxPrice: pp.maxPrice ?? Math.max(pp.price, Math.ceil(pp.price * 1.5)),
          defaultPrice: pp.price,
        }));

        setProducts(normalized);
      } catch (err) {
        console.error('Error loading products for pricing tab:', err);
        setProducts([]);

      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [performerId]);



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
                <h4 className="font-medium text-gray-900 dark:text-white">{p.productName}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {p.minPrice} - {p.maxPrice} tokens
                </p>
              </div>
              <div className="text-right text-sm text-gray-900 dark:text-white font-medium">
                {p.price} tokens
              </div>
            </div>

            <input
              aria-label={`price-slider-${p.id}`}
              type="range"
              min={String(p.minPrice)}
              max={String(p.maxPrice)}
              value={String(p.price)}
              onChange={(e) =>
                setProducts((prev) =>
                  prev.map((item) => (item.id === p.id ? { ...item, price: Number(e.target.value) } : item))
                )
              }
              className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        ))}
      </div>



    </div>
  );
}
