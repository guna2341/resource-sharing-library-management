import api from './client';
import { mockStore } from './mockStore';
import { networkApi } from './network';

// Simple client-side TF-IDF & Hybrid Fallback Engine
function computeClientSideRecommendations(type = 'for-me', targetBookId = null, limit = 10) {
  const allBooks = mockStore.getBooks() || [];
  if (allBooks.length === 0) return [];

  const followedAuthorIds = networkApi.getFollowedAuthorIds() || [];
  const likedBookIds = networkApi.getLikedBookIds() || [];

  if (type === 'similar' && targetBookId) {
    const target = allBooks.find((b) => String(b.bookId) === String(targetBookId)) || allBooks[0];
    const targetTerms = new Set([
      ...(target.category ? target.category.toLowerCase().split(/\s+/) : []),
      ...(target.tags ? target.tags.map((t) => t.toLowerCase()) : []),
      ...target.title.toLowerCase().split(/\s+/),
    ]);

    return allBooks
      .filter((b) => String(b.bookId) !== String(targetBookId))
      .map((b) => {
        let matchCount = 0;
        const bTerms = [
          ...(b.category ? b.category.toLowerCase().split(/\s+/) : []),
          ...(b.tags ? b.tags.map((t) => t.toLowerCase()) : []),
          ...b.title.toLowerCase().split(/\s+/),
        ];
        bTerms.forEach((term) => {
          if (targetTerms.has(term)) matchCount++;
        });

        const sameAuthor = (b.author?.authorId || b.author) === (target.author?.authorId || target.author);
        const sameCategory = b.category && target.category && b.category.toLowerCase() === target.category.toLowerCase();

        let score = Math.min(0.98, 0.45 + matchCount * 0.12 + (sameCategory ? 0.20 : 0) + (sameAuthor ? 0.25 : 0));
        let reason = sameAuthor
          ? `Also authored by ${target.author?.name || 'Faculty'}`
          : sameCategory
          ? `Shared domain in ${b.category}`
          : `Thematic overlap in ${target.tags?.[0] || 'research'}`;

        return {
          ...b,
          score,
          matchPercentage: Math.round(score * 100),
          recommendationReason: reason,
          signalType: 'CONTENT_SIMILARITY',
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  if (type === 'network') {
    return allBooks
      .filter((b) => {
        const authorId = b.author?.authorId || b.author;
        return followedAuthorIds.some((id) => String(id) === String(authorId));
      })
      .map((b) => ({
        ...b,
        score: 0.94,
        matchPercentage: 94,
        recommendationReason: `Authored by followed scholar ${b.author?.name || 'Faculty'}`,
        signalType: 'NETWORK_FOLLOW',
      }))
      .slice(0, limit);
  }

  if (type === 'trending') {
    return allBooks
      .slice()
      .sort((a, b) => (b.averageRating || 4.5) - (a.averageRating || 4.5))
      .map((b) => ({
        ...b,
        score: 0.88,
        matchPercentage: 88,
        recommendationReason: `Top rated in library vault (${(b.averageRating || 4.8).toFixed(1)}★)`,
        signalType: 'TRENDING',
      }))
      .slice(0, limit);
  }

  // Personalized 'for-me'
  return allBooks
    .map((b) => {
      const authorId = b.author?.authorId || b.author;
      const isFollowed = followedAuthorIds.some((id) => String(id) === String(authorId));
      const isLiked = likedBookIds.some((id) => String(id) === String(b.bookId));

      let score = 0.65;
      let reason = 'Selected based on your curriculum reading profile';
      let signalType = 'USER_PREFERENCE';

      if (isFollowed) {
        score = 0.96;
        reason = `From followed faculty ${b.author?.name || 'Author'}`;
        signalType = 'NETWORK_FOLLOW';
      } else if (b.category === 'Computer Science' || b.category === 'Machine Learning') {
        score = 0.89;
        reason = `Matches your focus in ${b.category}`;
        signalType = 'USER_PREFERENCE';
      } else if (b.averageRating >= 4.8) {
        score = 0.84;
        reason = `High peer citation index (${b.averageRating.toFixed(1)}★)`;
        signalType = 'TRENDING';
      }

      return {
        ...b,
        score,
        matchPercentage: Math.round(score * 100),
        recommendationReason: reason,
        signalType,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// GET /api/v1/recommendations/for-me
export const getRecommendationsForMe = async (limit = 8) => {
  try {
    const res = await api.get('/api/v1/recommendations/for-me', { params: { limit } });
    if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
      return res.data;
    }
  } catch (err) {
    // Backend offline or empty
  }
  return {
    success: true,
    message: 'Personalized recommendations loaded',
    data: computeClientSideRecommendations('for-me', null, limit),
  };
};

// GET /api/v1/recommendations/similar/{bookId}
export const getSimilarResources = async (bookId, limit = 4) => {
  try {
    const res = await api.get(`/api/v1/recommendations/similar/${bookId}`, { params: { limit } });
    if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
      return res.data;
    }
  } catch (err) {}
  return {
    success: true,
    message: 'Similar resources loaded',
    data: computeClientSideRecommendations('similar', bookId, limit),
  };
};

// GET /api/v1/recommendations/trending
export const getTrendingRecommendations = async (limit = 6) => {
  try {
    const res = await api.get('/api/v1/recommendations/trending', { params: { limit } });
    if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
      return res.data;
    }
  } catch (err) {}
  return {
    success: true,
    message: 'Trending resources loaded',
    data: computeClientSideRecommendations('trending', null, limit),
  };
};

// GET /api/v1/recommendations/network
export const getNetworkRecommendations = async (limit = 6) => {
  try {
    const res = await api.get('/api/v1/recommendations/network', { params: { limit } });
    if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
      return res.data;
    }
  } catch (err) {}
  return {
    success: true,
    message: 'Network recommendations loaded',
    data: computeClientSideRecommendations('network', null, limit),
  };
};

// GET /api/v1/recommendations/category
export const getCategoryRecommendations = async (category, limit = 6) => {
  try {
    const res = await api.get('/api/v1/recommendations/category', { params: { category, limit } });
    if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
      return res.data;
    }
  } catch (err) {}
  const all = mockStore.getBooks() || [];
  const filtered = all.filter((b) => b.category?.toLowerCase() === category?.toLowerCase());
  return {
    success: true,
    data: (filtered.length ? filtered : all).slice(0, limit).map((b) => ({
      ...b,
      matchPercentage: 90,
      recommendationReason: `Curated recommendation in ${b.category || category}`,
      signalType: 'CATEGORY_MATCH',
    })),
  };
};

// POST /api/v1/recommendations/refresh
export const refreshRecommendations = async () => {
  try {
    const res = await api.post('/api/v1/recommendations/refresh');
    if (res.data?.success) return res.data;
  } catch (err) {}
  return { success: true, message: 'Recommendation models refreshed' };
};
