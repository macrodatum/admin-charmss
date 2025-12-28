import React, { useEffect, useState } from 'react';
import GiftService from '../app/services/gift.service';
import type { Gift } from '../app/types/gifts.types';
import GiftCard from '../components/gifts/GiftCard';
import GiftModal from '../components/gifts/GiftModal';
import GiftFormModal from '../components/gifts/GiftFormModal';

export default function Gifts() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewGift, setViewGift] = useState<Gift | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editGift, setEditGift] = useState<Gift | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await GiftService.getGifts();
        if (mounted) setGifts(resp);
      } catch (err) {
        console.error(err);
        if (mounted) setError('No se pudo cargar los gifts');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleDelete = async (id: number) => {
    const ok = window.confirm('¿Borrar gift?');
    if (!ok) return;
    try {
      await GiftService.deleteGift(id);
      setGifts((s) => s.filter((g) => g.id !== id));
    } catch (err) {
      console.error(err);
      alert('Error al borrar');
    }
  };

  const handleSaved = (gift: Gift) => {
    const exists = gifts.find((d) => d.id === gift.id);
    if (exists) {
      setGifts((s) => s.map((d) => (d.id === gift.id ? gift : d)));
    } else {
      setGifts((s) => [gift, ...s]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Gifts</h1>
        <div>
          <button
            data-testid="create-gift"
            className="px-4 py-2 rounded bg-blue-600 text-white text-sm"
            onClick={() => {
              setEditGift(null);
              setFormOpen(true);
            }}
          >
            Crear gift
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">Cargando...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gifts.map((g) => (
            <GiftCard
              key={g.id}
              gift={g}
              onView={(gift) => setViewGift(gift)}
              onEdit={(gift) => {
                setEditGift(gift);
                setFormOpen(true);
              }}
              onDelete={(id) => handleDelete(id)}
            />
          ))}
        </div>
      )}

      <GiftModal
        gift={viewGift ?? null}
        open={Boolean(viewGift)}
        onClose={() => setViewGift(null)}
      />

      <GiftFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditGift(null);
        }}
        onSaved={handleSaved}
        initial={editGift}
      />
    </div>
  );
}
