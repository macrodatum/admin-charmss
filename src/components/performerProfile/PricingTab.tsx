import React, { useState, useEffect, useRef } from 'react';
import ProductService from '../../app/services/products.service';
import type { PerformerProduct } from '../../app/types/products.types';
import { Check } from 'lucide-react';

interface PricingTabProps {
  performerId: string;
  performerProfileId: number;
}

export default function PricingTab({ performerId, performerProfileId }: PricingTabProps) {
  const [loading, setLoading] = useState(false);

  // Use performer products directly (contains price/min/max/productName)
  const [products, setProducts] = useState<PerformerProduct[]>([]);

  // Estado para mostrar confirmaciones breves por producto
  const [confirmations, setConfirmations] = useState<Record<string, boolean>>({});
  const timersRef = useRef<Record<string, number>>({});

  // Limpiar timers pendientes al desmontar
  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach((t) => clearTimeout(t));
      timersRef.current = {};
    };
  }, []);

  // Mantener la lógica de actualización dentro del componente para facilitar el acceso a setProducts
  const updateProductPrice = async (productId: number, price: number) => {
    const idStr = String(productId);
    // Actualizar UI inmediatamente
    setProducts((prev) => prev.map((item) => (String(item.productId) === idStr ? { ...item, price } : item)));

    // Enviar al backend
    const result = await ProductService.setPerformerProduct(performerProfileId, productId, price).catch((err) => {
      console.error('Error updating product price:', err);
      return undefined;
    });

    // Si hay resultado, mostrar confirmación temporal
    if (result) {
      setConfirmations((prev) => ({ ...prev, [idStr]: true }));

      // Limpiar timer previo si existe
      if (timersRef.current[idStr]) {
        clearTimeout(timersRef.current[idStr]);
      }

      timersRef.current[idStr] = window.setTimeout(() => {
        setConfirmations((prev) => {
          const copy = { ...prev };
          delete copy[idStr];
          return copy;
        });
        delete timersRef.current[idStr];
      }, 3000);
    }
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
                <div className="flex items-center justify-end space-x-2">
                  <span>{p.price} tokens</span>
                  {confirmations[String(p.productId)] && (
                    <span className="text-green-500 text-xs flex items-center space-x-1">
                      <Check className="w-4 h-4" />
                      <span>Guardado</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <input
              aria-label={`price-slider-${p.productId}`}
              type="range"
              min={String(p.minPrice)}
              max={String(p.maxPrice)}
              value={String(p.price)}
              onChange={(e) => updateProductPrice(p.productId, Number(e.target.value))}
              className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        ))}
      </div>



    </div>
  );
}
