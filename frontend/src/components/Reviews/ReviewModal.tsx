'use client';

import React, { useState } from 'react';
import { X, Star, MessageSquare, ThumbsUp, CheckCircle2, User, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Review {
  id: string;
  author_name: string;
  rating: number;
  comment: string;
  tags?: string[];
  created_at: string;
}

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType?: 'DRIVER' | 'COMPANY' | 'CONDUCTOR' | 'EMPRESA';
  targetId?: string;
  targetName?: string;
  targetSubtext?: string;
  existingRating?: number;
  existingReviews?: Review[];
  onReviewSubmitted?: (review: Review) => void;
}

const REVIEW_TAGS = [
  'Manejo Prudente',
  'Vehículo Limpio',
  'Puntualidad Exacta',
  'Tarifa Justa Pactada',
  'Trato Amable',
  'Música Agradable',
  'Conducción Segura'
];

export default function ReviewModal({
  isOpen,
  onClose,
  targetType = 'DRIVER',
  targetId = 'driver-1',
  targetName = 'Conductor de Barranca',
  targetSubtext,
  existingRating = 4.8,
  existingReviews = [
    {
      id: 'r1',
      author_name: 'Lucía Fernández (Estudiante UNAB)',
      rating: 5,
      comment: 'Excelente servicio hacia el campus universitario. Manejo prudente y respetuoso.',
      tags: ['Manejo Prudente', 'Puntualidad Exacta'],
      created_at: 'Ayer'
    },
    {
      id: 'r2',
      author_name: 'Marcos Rivas (Docente)',
      rating: 4.8,
      comment: 'Muy buen trato. Auto limpio y tarifa pactada al inicio sin sorpresas.',
      tags: ['Vehículo Limpio', 'Tarifa Justa Pactada'],
      created_at: 'Hace 3 días'
    }
  ],
  onReviewSubmitted
}: ReviewModalProps) {
  const { user } = useAuth();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Manejo Prudente', 'Tarifa Justa Pactada']);
  const [reviewsList, setReviewsList] = useState<Review[]>(existingReviews);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);

    const newRev: Review = {
      id: `rev_${Date.now()}`,
      author_name: user?.email?.split('@')[0] || 'Pasajero de Barranca',
      rating,
      comment: comment.trim(),
      tags: selectedTags,
      created_at: new Date().toISOString()
    };

    setTimeout(() => {
      setReviewsList(prev => [newRev, ...prev]);
      setIsSubmitting(false);
      setSuccessMsg(true);
      setComment('');
      if (onReviewSubmitted) onReviewSubmitted(newRev);
      setTimeout(() => setSuccessMsg(false), 3000);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#14161a] w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Cabecera */}
        <div className="px-5 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold">
              <Star className="w-5 h-5 fill-white text-white" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-100 block">
                {targetType === 'DRIVER' || targetType === 'CONDUCTOR' ? 'Calificar Conductor' : 'Calificar Comité de Transporte'}
              </span>
              <h2 className="text-sm font-bold truncate max-w-[220px]">{targetName}</h2>
              {targetSubtext && <p className="text-[11px] text-amber-100 truncate">{targetSubtext}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          {/* Formulario de Calificación */}
          <form onSubmit={handleSubmitReview} className="p-4 bg-slate-50 dark:bg-[#191d24] rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-3">
            <div className="text-center">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1.5">
                ¿Cómo calificarías tu experiencia de viaje?
              </span>
              {/* Estrellas Interactivas */}
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-2xl transition hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                          : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 block mt-1">
                {rating === 5 && '¡Excelente servicio!'}
                {rating === 4 && 'Muy buen viaje'}
                {rating === 3 && 'Servicio regular'}
                {rating === 2 && 'Por mejorar'}
                {rating === 1 && 'Mala experiencia'}
              </span>
            </div>

            {/* Etiquetas de Aspectos Positivos */}
            <div>
              <label className="text-[10.5px] font-bold text-slate-600 dark:text-slate-400 block mb-1.5">
                Destaca lo mejor del viaje:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {REVIEW_TAGS.map(tag => {
                  const active = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-2.5 py-1 rounded-xl text-[10.5px] font-semibold transition border ${
                        active
                          ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                          : 'bg-white dark:bg-[#1d222b] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {active && '✓ '}
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comentario escrito */}
            <div>
              <textarea
                rows={2}
                required
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Escribe tu opinión sobre el chofer, puntualidad o vehículo..."
                className="w-full p-3 text-xs rounded-xl bg-white dark:bg-[#121418] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {successMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>¡Gracias! Tu reseña ha sido publicada y ayuda a la comunidad de Barranca.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !comment.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition disabled:opacity-50"
            >
              {isSubmitting ? 'Publicando...' : 'Publicar Calificación'}
            </button>
          </form>

          {/* Historial de Reseñas de Otros Pasajeros */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 px-1">
              <span>Opiniones de la Comunidad ({reviewsList.length})</span>
              <span className="flex items-center gap-1 text-amber-500">
                <Star className="w-3.5 h-3.5 fill-current" />
                {existingRating.toFixed(1)} / 5.0
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {reviewsList.map(r => (
                <div
                  key={r.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-[#181b22] border border-slate-200/80 dark:border-slate-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {r.author_name}
                    </span>
                    <div className="flex items-center text-amber-400">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    "{r.comment}"
                  </p>
                  {r.tags && r.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {r.tags.map(t => (
                        <span key={t} className="text-[9px] font-semibold px-1.5 py-0.2 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
