import React, { useState, useEffect } from 'react';
import ProductService from '../../app/services/products.service';
import type { PerformerProduct } from '../../app/types/products.types';

interface PricingTabProps {
  performerId: string;
  performerProfileId: number;
}

export default function PricingTab({ performerId, performerProfileId }: PricingTabProps) {
  const [loading, setLoading] = useState(false);

  // Use performer products directly (contains price/min/max/productName)
  const [products, setProducts] = useState<PerformerProduct[]>([]);

  // Mantener la lógica de actualización dentro del componente para facilitar el acceso a setProducts
  const updateProductPrice = (productId: number, price: number) => {
    setProducts((prev) => prev.map((item) => (String(item.id) === String(productId) ? { ...item, price } : item)));
  };

  // Cargar productos al montar o cuando cambie el performerId
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        // Obtener productos específicos del performer (todos los datos vienen de aquí)
        const performerProductsRaw = await ProductService.getPerformerProductByPerformerId(performerId);

        // El servicio debería devolver un array, pero protegernos contra formas inesperadas
        let performerProducts: PerformerProduct[] = [];
        if (Array.isArray(performerProductsRaw)) {
          performerProducts = performerProductsRaw;
        } else if (performerProductsRaw && typeof performerProductsRaw === 'object') {
          // Soporte para estructuras como { data: [] } o { items: [] }
          const asRecord = performerProductsRaw as { data?: PerformerProduct[]; items?: PerformerProduct[] };
          if (Array.isArray(asRecord.data)) {
            performerProducts = asRecord.data;
          } else if (Array.isArray(asRecord.items)) {
            performerProducts = asRecord.items;
          } else {
            console.warn('Unexpected performerProducts shape:', performerProductsRaw);
            performerProducts = [];
          }
        }

        // Asegurarse de que cada producto tenga min/max/default; si faltan, añadir valores por defecto razonables
        const normalized = performerProducts.map((pp) => ({
          ...pp,
          price: typeof pp.price === 'number' ? pp.price : Number(pp.price) || 0,
          minPrice: pp.minPrice ?? Math.max(1, Math.floor((pp.price as number) * 0.5)),
          maxPrice: pp.maxPrice ?? Math.max((pp.price as number), Math.ceil((pp.price as number) * 1.5)),
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
  }, [performerId, performerProfileId]);



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
              onChange={(e) => updateProductPrice(performerProfileId, Number(e.target.value))}
              className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        ))}
      </div>



    </div>
  );
}
