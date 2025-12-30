import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import ProductService from '../app/services/products.service';
import type { Product } from '../app/types/products.types';
import ProductCard from '../components/products/ProductCard';
import ProductDetailModal from '../components/products/ProductDetailModal';
import ProductFormModal from '../components/products/ProductFormModal';
import DeleteProductModal from '../components/products/DeleteProductModal';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await ProductService.getProducts();
        if (mounted) setProducts(resp);
      } catch (err) {
        console.error(err);
        if (mounted) setError('No se pudo cargar los productos');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    setDeleting(true);
    try {
      await ProductService.deleteProduct(productToDelete.id);
      setProducts((s) => s.filter((p) => p.id !== productToDelete.id));
      setDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (err) {
      console.error(err);
      alert('Error al borrar el producto');
    } finally {
      setDeleting(false);
    }
  };

  const handleSaved = (product: Product) => {
    const exists = products.find((p) => p.id === product.id);
    if (exists) {
      setProducts((s) => s.map((p) => (p.id === product.id ? product : p)));
    } else {
      setProducts((s) => [product, ...s]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Productos</h1>
        <button
          data-testid="create-product"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          onClick={() => {
            setEditProduct(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Crear Producto
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-12">Cargando productos...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-12">{error}</div>
      ) : products.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          No hay productos registrados. Crea tu primer producto.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onView={(p) => setViewProduct(p)}
              onEdit={(p) => {
                setEditProduct(p);
                setFormOpen(true);
              }}
              onDelete={(id) => {
                const prod = products.find((p) => p.id === id);
                if (prod) handleDeleteClick(prod);
              }}
            />
          ))}
        </div>
      )}

      <ProductDetailModal
        product={viewProduct}
        open={Boolean(viewProduct)}
        onClose={() => setViewProduct(null)}
      />

      <ProductFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditProduct(null);
        }}
        onSaved={handleSaved}
        initial={editProduct}
      />

      <DeleteProductModal
        open={deleteModalOpen}
        productName={productToDelete?.name ?? ''}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteModalOpen(false);
          setProductToDelete(null);
        }}
        loading={deleting}
      />
    </div>
  );
}
