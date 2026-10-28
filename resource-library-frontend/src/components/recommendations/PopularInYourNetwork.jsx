import { useState, useEffect } from 'react';
import { Users, UserCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getNetworkRecommendations } from '../../api/recommendations';
import { RecommendationCard, RecommendationCardSkeleton } from './RecommendationCard';

export function PopularInYourNetwork({ limit = 4 }) {
  const [networkBooks, setNetworkBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNetworkRecommendations(limit)
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setNetworkBooks(res.data);
        } else {
          setNetworkBooks([]);
        }
      })
      .catch(() => setNetworkBooks([]))
      .finally(() => setLoading(false));
  }, [limit]);

  if (!loading && networkBooks.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-enterprise badge-purple">
              <Users size={12} className="text-purple-600" />
              Network Graph
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-[11px] font-mono font-semibold text-slate-500">Peer Circles & Faculty</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Popular in Your Network
          </h2>
          <p className="text-xs text-slate-500">
            Works published by scholars you follow and monographs trending across your study groups.
          </p>
        </div>

        <Link to="/network" className="btn-ghost text-xs px-3 py-1.5 self-start sm:self-auto flex items-center gap-1.5">
          View Scholar Feed <ArrowRight size={13} />
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
          {networkBooks.slice(0, limit).map((book, i) => (
            <RecommendationCard key={book.bookId} book={book} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
