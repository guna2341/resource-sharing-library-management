import { useState, useEffect } from 'react';
import { Flame, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getTrendingRecommendations } from '../../api/recommendations';
import { RecommendationCard, RecommendationCardSkeleton } from './RecommendationCard';

export function TrendingResources({ limit = 4 }) {
  const [trendingBooks, setTrendingBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTrendingRecommendations(limit)
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setTrendingBooks(res.data);
        } else {
          setTrendingBooks([]);
        }
      })
      .catch(() => setTrendingBooks([]))
      .finally(() => setLoading(false));
  }, [limit]);

  if (!loading && trendingBooks.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-enterprise badge-amber">
              <Flame size={12} className="text-amber-600" />
              Velocity & Citations
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-[11px] font-mono font-semibold text-slate-500">Repository Highlights</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Trending Across the Catalog
          </h2>
          <p className="text-xs text-slate-500">
            High-engagement peer publications with highest active reading velocity this semester.
          </p>
        </div>

        <Link to="/library" className="btn-ghost text-xs px-3 py-1.5 self-start sm:self-auto flex items-center gap-1.5">
          Full Catalog <ArrowRight size={13} />
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
          {trendingBooks.slice(0, limit).map((book, i) => (
            <RecommendationCard key={book.bookId} book={book} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
