import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Edit, Trash, Calendar, DollarSign, Star, Gift } from 'lucide-react';
import type { Package } from '../../app/types/packages.types';
import { PACKAGE_STATUS_LABELS } from '../../app/types/packages.types';

interface Props {
  paquete: Package;
  onView: (paquete: Package) => void;
  onEdit: (paquete: Package) => void;
  onDelete: (id: number) => void;
}

export default function PackageCard({ paquete: pkg, onView, onEdit, onDelete }: Props) {
  const statusColor = pkg.status
    ? 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20'
    : 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.18 }}
      className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-gray-100 dark:border-slate-700 p-4 flex flex-col gap-3"
      data-testid={`package-card-${pkg.id}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {pkg.logoImage && (
            <img
              src={pkg.logoImage}
              alt={pkg.name}
              className="w-10 h-10 rounded-lg object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {pkg.name}
            </h3>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
          {PACKAGE_STATUS_LABELS[pkg.status.toString()]}
        </div>
      </div>

      {/* Price and Duration */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <DollarSign className="h-4 w-4 text-green-500" />
          <span className="text-xl font-bold text-green-600 dark:text-green-400">${pkg.price}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4 text-blue-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">{pkg.lifeTime} días</span>
        </div>
      </div>

      {/* Credits */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1">
          <Gift className="h-4 w-4 text-orange-500" />
          <span className="text-gray-600 dark:text-gray-400">{pkg.totalCredit} créditos</span>
        </div>
        {pkg.bonus > 0 && (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="text-yellow-600 dark:text-yellow-400">+{pkg.bonus} bonus</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        <button
          aria-label="Ver"
          title="Ver"
          onClick={() => onView(pkg)}
          className="flex-1 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1 text-sm"
        >
          <Eye className="h-4 w-4" />
          Ver
        </button>
        <button
          aria-label="Editar"
          title="Editar"
          onClick={() => onEdit(pkg)}
          className="flex-1 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1 text-sm"
        >
          <Edit className="h-4 w-4" />
          Editar
        </button>
        <button
          aria-label="Borrar"
          title="Borrar"
          onClick={() => onDelete(pkg.id)}
          className="flex-1 p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400 flex items-center justify-center gap-1 text-sm"
        >
          <Trash className="h-4 w-4" />
          Borrar
        </button>
      </div>
    </motion.div>
  );
}
