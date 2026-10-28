import { useState, useEffect } from 'react';
import { Layers, Sparkles, BookOpen } from 'lucide-react';
import { getSimilarResources } from '../../api/recommendations';
import { RecommendationCard, RecommendationCardSkeleton } from './RecommendationCard';

export function SimilarResources({ bookId, currentCategory = 'Computer Science', limit = 4 }) {
  const [similarBooks, setSimilarBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookId) return;
    setLoading(true);
    getSimilarResources(bookId, limit)
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setSimilarBooks(res.data);
        } else {
          setSimilarBooks([]);
        }
      })
      .catch(() => setSimilarBooks([]))
      .finally(() => setLoading(false));
  }, [bookId, limit]);

  if (!loading && similarBooks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 pt-8 border-t border-slate-200/80">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-enterprise badge-emerald">
              <Sparkles size={11} className="text-emerald-600" />
              Content Similarity Vector
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-[11px] font-mono font-semibold text-slate-500">Cosine Cos(u, v) Metric</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            Similar Academic Resources
          </h3>
          <p className="text-xs text-slate-500">
            Monographs with overlapping thematic indices, related keyword tags, and academic domain affinity.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: limit }).map((_, i) => (
            <RecommendationCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {similarBooks.map((book, i) => (
            <RecommendationCard key={book.bookId} book={book} index={i} compact />
          ))}
        </div>
      )}
    </div>
  );
}
