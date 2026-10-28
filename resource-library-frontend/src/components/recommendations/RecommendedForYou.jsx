import { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Compass, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getRecommendationsForMe, refreshRecommendations } from '../../api/recommendations';
import { RecommendationCard, RecommendationCardSkeleton } from './RecommendationCard';

export function RecommendedForYou({ limit = 4, showHeader = true }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecommendations = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      if (isRefresh) {
        await refreshRecommendations();
      }
      const res = await getRecommendationsForMe(limit);
      if (res.success && Array.isArray(res.data)) {
        setRecommendations(res.data);
      } else {
        setRecommendations([]);
      }
    } catch (err) {
      setError('Unable to load personalized recommendations.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRecommendations(false);
  }, [limit]);

  return (
    <section className="space-y-4">
      {showHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge-enterprise badge-indigo">
                <Sparkles size={12} className="text-indigo-600" />
                Adaptive ML Engine
              </span>
              <span className="text-slate-300">/</span>
              <span className="text-[11px] font-mono font-semibold text-slate-500">TF-IDF & Network Filtering</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Recommended for You
            </h2>
            <p className="text-xs text-slate-500">
              Personalized based on your academic interests, saved items, and verified research connections.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => fetchRecommendations(true)}
              disabled={loading || refreshing}
              className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 transition-colors"
              title="Recompute recommendation models"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin text-indigo-600' : ''} />
              <span>{refreshing ? 'Refreshing...' : 'Rediscover'}</span>
            </button>
            <Link to="/library" className="btn-accent text-xs px-3.5 py-1.5 shadow-sm">
              Explore All <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      )}

      {/* Grid or Skeletons */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: limit }).map((_, i) => (
            <RecommendationCardSkeleton key={i} />
          ))}
        </div>
      ) : recommendations.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white border border-dashed border-slate-300 text-center max-w-md mx-auto">
          <Compass size={28} className="text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-800">No recommendations yet</p>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Bookmark monographs or follow faculty scholars to train your personalized recommendation profile.
          </p>
          <Link to="/library" className="btn-accent text-xs px-4 py-2">
            Browse Vault Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {recommendations.slice(0, limit).map((book, i) => (
            <RecommendationCard key={book.bookId} book={book} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
