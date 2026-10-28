import { useState, useEffect } from 'react';
import { Bookmark, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCategoryRecommendations } from '../../api/recommendations';
import { RecommendationCard, RecommendationCardSkeleton } from './RecommendationCard';

export function BecauseYouLikeSection({ category = 'Computer Science', limit = 4 }) {
  const [categoryBooks, setCategoryBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getCategoryRecommendations(category, limit)
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setCategoryBooks(res.data);
        } else {
          setCategoryBooks([]);
        }
      })
      .catch(() => setCategoryBooks([]))
      .finally(() => setLoading(false));
  }, [category, limit]);

  if (!loading && categoryBooks.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-enterprise badge-emerald">
              <Bookmark size={11} className="text-emerald-600" />
              Category Affinity
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-[11px] font-mono font-semibold text-slate-500">Domain Focus</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Because You Follow {category}
          </h2>
          <p className="text-xs text-slate-500">
            Selected from the digital repository based on your interaction with {category} manuscripts.
          </p>
        </div>

        <Link to={`/library?category=${encodeURIComponent(category)}`} className="btn-ghost text-xs px-3 py-1.5 self-start sm:self-auto flex items-center gap-1.5">
          View All in {category} <ArrowRight size={13} />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: limit }).map((_, i) => (
            <RecommendationCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categoryBooks.slice(0, limit).map((book, i) => (
            <RecommendationCard key={book.bookId} book={book} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
