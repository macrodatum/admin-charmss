import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import PackageService from '../app/services/packages.service';
import type { Package } from '../app/types/packages.types';
import PackageCard from '../components/packages/PackageCard';
import PackageDetailModal from '../components/packages/PackageDetailModal';
import PackageFormModal from '../components/packages/PackageFormModal';
import DeletePackageModal from '../components/packages/DeletePackageModal';

export default function Packages() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewPaquete, setViewPaquete] = useState<Package | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editPaquete, setEditPaquete] = useState<Package | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [paqueteToDelete, setPaqueteToDelete] = useState<Package | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await PackageService.getPackages();
        if (mounted) setPackages(resp);
      } catch (err) {
        console.error(err);
        if (mounted) setError('No se pudo cargar los paquetes');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleDeleteClick = (packageObj: Package) => {
    setPaqueteToDelete(packageObj);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!paqueteToDelete) return;
    setDeleting(true);
    try {
      await PackageService.deletePackage(paqueteToDelete.id);
      setPackages((s) => s.filter((p) => p.id !== paqueteToDelete.id));
      setDeleteModalOpen(false);
      setPaqueteToDelete(null);
    } catch (err) {
      console.error(err);
      alert('Error al borrar el paquete');
    } finally {
      setDeleting(false);
    }
  };

  const handleSaved = (paquete: Package) => {
    const exists = packages.find((p) => p.id === paquete.id);
    if (exists) {
      setPackages((s) => s.map((p) => (p.id === paquete.id ? paquete : p)));
    } else {
      setPackages((s) => [paquete, ...s]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Paquetes</h1>
        <button
          data-testid="create-package"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          onClick={() => {
            setEditPaquete(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Crear Paquete
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-12">Cargando paquetes...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-12">{error}</div>
      ) : packages.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          No hay paquetes registrados. Crea tu primer paquete.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map((paquete) => (
            <PackageCard
              key={paquete.id}
              paquete={paquete}
              onView={(p) => setViewPaquete(p)}
              onEdit={(p) => {
                setEditPaquete(p);
                setFormOpen(true);
              }}
              onDelete={(id) => {
                const pkg = packages.find((p) => p.id === id);
                if (pkg) handleDeleteClick(pkg);
              }}
            />
          ))}
        </div>
      )}

      <PackageDetailModal
        paquete={viewPaquete}
        open={Boolean(viewPaquete)}
        onClose={() => setViewPaquete(null)}
      />

      <PackageFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditPaquete(null);
        }}
        onSaved={handleSaved}
        initial={editPaquete}
      />

      <DeletePackageModal
        open={deleteModalOpen}
        nombrePaquete={paqueteToDelete?.name ?? ''}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteModalOpen(false);
          setPaqueteToDelete(null);
        }}
        loading={deleting}
      />
    </div>
  );
}
