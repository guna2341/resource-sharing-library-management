import {
  INITIAL_AUTHORS,
  INITIAL_BOOKS,
  INITIAL_COMMUNITIES,
  INITIAL_MESSAGES,
  INITIAL_LEADERBOARD,
  INITIAL_BADGES,
  INITIAL_RATINGS,
  INITIAL_COMMENTS,
  INITIAL_ADMIN_USERS,
} from './mockData';

// Storage keys
const K_BOOKS = 'rl_mock_books';
const K_AUTHORS = 'rl_mock_authors';
const K_COMMUNITIES = 'rl_mock_communities';
const K_MESSAGES = 'rl_mock_messages';
const K_LEADERBOARD = 'rl_mock_leaderboard';
const K_BADGES = 'rl_mock_badges';
const K_RATINGS = 'rl_mock_ratings';
const K_COMMENTS = 'rl_mock_comments';
const K_USERS = 'rl_mock_users';
const K_WISHLIST = 'rl_mock_wishlist';
const K_BOOKMARKS = 'rl_mock_bookmarks';

const STORAGE_VERSION_KEY = 'rl_catalog_version';
const CURRENT_VERSION = 'v2_real_internet_data';

function checkAndMigrate() {
  try {
    const v = localStorage.getItem(STORAGE_VERSION_KEY);
    const books = load(K_BOOKS, null);
    const hasOldDemo = books && books.some((b) => b.title && (b.title.includes('Resilient Distributed Systems') || b.title === 'Book 1'));
    if (v !== CURRENT_VERSION || hasOldDemo) {
      localStorage.removeItem(K_BOOKS);
      localStorage.removeItem(K_AUTHORS);
      localStorage.removeItem(K_COMMUNITIES);
      localStorage.removeItem(K_MESSAGES);
      localStorage.removeItem(K_LEADERBOARD);
      localStorage.removeItem(K_BADGES);
      localStorage.removeItem(K_RATINGS);
      localStorage.removeItem(K_COMMENTS);
      localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION);
    }
  } catch {}
}

function load(key, defaultVal) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function save(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

checkAndMigrate();

export const mockStore = {
  // Books
  getBooks() {
    return load(K_BOOKS, INITIAL_BOOKS);
  },
  getBookById(id) {
    const books = this.getBooks();
    return books.find((b) => String(b.bookId) === String(id)) || books[0];
  },
  createBook(data) {
    const books = this.getBooks();
    const authors = this.getAuthors();
    const authorObj = authors.find((a) => String(a.authorId) === String(data.author)) || {
      authorId: 99,
      name: typeof data.author === 'string' ? data.author : 'Academic Author',
      profileUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    };

    const newBook = {
      bookId: Date.now(),
      rootId: Date.now(),
      versionNumber: 1,
      isActive: true,
      title: data.title,
      description: data.description || 'Uploaded academic document resource.',
      pages: Number(data.pages) || 10,
      fileType: data.fileType || 'PDF',
      fileUrl: data.fileUrl || '',
      coverUrl: data.coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
      author: authorObj,
      uploadedBy: data.uploadedBy || 201,
      uploaderName: 'Current User',
      category: data.category || 'General',
      level: data.level || 'Academic',
      downloadCount: 0,
      averageRating: 5.0,
      ratingCount: 1,
      createdAt: new Date().toISOString(),
      tags: data.tags || ['Research', 'Study Guide'],
    };

    books.unshift(newBook);
    save(K_BOOKS, books);
    return newBook;
  },
  updateBook(id, data) {
    const books = this.getBooks();
    const idx = books.findIndex((b) => String(b.bookId) === String(id));
    if (idx !== -1) {
      books[idx] = { ...books[idx], ...data };
      save(K_BOOKS, books);
      return books[idx];
    }
    return null;
  },
  deleteBook(id) {
    let books = this.getBooks();
    books = books.filter((b) => String(b.bookId) !== String(id));
    save(K_BOOKS, books);
    return true;
  },
  getBookVersions(rootId) {
    const books = this.getBooks();
    const versions = books.filter((b) => String(b.rootId) === String(rootId) || String(b.bookId) === String(rootId));
    if (versions.length === 0) {
      const single = this.getBookById(rootId);
      return single ? [single] : [];
    }
    return versions;
  },
  createBookVersion(bookId, data) {
    const existing = this.getBookById(bookId);
    const newVersion = {
      ...existing,
      bookId: Date.now(),
      rootId: existing.rootId || existing.bookId,
      versionNumber: (existing.versionNumber || 1) + 1,
      title: data.title || existing.title,
      description: data.description || existing.description,
      pages: Number(data.pages) || existing.pages,
      fileType: data.fileType || existing.fileType,
      fileUrl: data.fileUrl || existing.fileUrl,
      coverUrl: data.coverUrl || existing.coverUrl,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    const books = this.getBooks();
    books.unshift(newVersion);
    save(K_BOOKS, books);
    return newVersion;
  },
  activateBookVersion(versionBookId) {
    const books = this.getBooks();
    const target = books.find((b) => String(b.bookId) === String(versionBookId));
    if (target) {
      const rootId = target.rootId || target.bookId;
      books.forEach((b) => {
        if (b.rootId === rootId) {
          b.isActive = b.bookId === target.bookId;
        }
      });
      save(K_BOOKS, books);
    }
    return target;
  },

  // Authors
  getAuthors() {
    return load(K_AUTHORS, INITIAL_AUTHORS);
  },
  getAuthorById(id) {
    const authors = this.getAuthors();
    return authors.find((a) => String(a.authorId) === String(id)) || authors[0];
  },
  createAuthor(data) {
    const authors = this.getAuthors();
    const newAuthor = {
      authorId: Date.now(),
      name: data.name,
      bio: data.bio || 'Academic scholar & peer contributor.',
      profileUrl: data.profileUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      department: data.department || 'Academic Department',
      publicationsCount: 1,
    };
    authors.push(newAuthor);
    save(K_AUTHORS, authors);
    return newAuthor;
  },
  updateAuthor(id, data) {
    const authors = this.getAuthors();
    const idx = authors.findIndex((a) => String(a.authorId) === String(id));
    if (idx !== -1) {
      authors[idx] = { ...authors[idx], ...data };
      save(K_AUTHORS, authors);
      return authors[idx];
    }
    return null;
  },
  deleteAuthor(id) {
    let authors = this.getAuthors();
    authors = authors.filter((a) => String(a.authorId) !== String(id));
    save(K_AUTHORS, authors);
    return true;
  },

  // Communities
  getCommunities() {
    return load(K_COMMUNITIES, INITIAL_COMMUNITIES);
  },
  createCommunity(data) {
    const communities = this.getCommunities();
    const newComm = {
      communityId: Date.now(),
      name: data.name,
      description: data.description,
      profileUrl: data.profileUrl || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80',
      category: data.category || 'General Study Circle',
      memberCount: 1,
      createdBy: data.createdBy || 201,
      creatorName: 'You',
      isJoined: true,
      createdAt: new Date().toISOString(),
    };
    communities.push(newComm);
    save(K_COMMUNITIES, communities);
    return newComm;
  },
  updateCommunity(id, data) {
    const communities = this.getCommunities();
    const idx = communities.findIndex((c) => String(c.communityId) === String(id));
    if (idx !== -1) {
      communities[idx] = { ...communities[idx], ...data };
      save(K_COMMUNITIES, communities);
      return communities[idx];
    }
    return null;
  },
  deleteCommunity(id) {
    let communities = this.getCommunities();
    communities = communities.filter((c) => String(c.communityId) !== String(id));
    save(K_COMMUNITIES, communities);
    return true;
  },
  joinCommunity(id) {
    const communities = this.getCommunities();
    const comm = communities.find((c) => String(c.communityId) === String(id));
    if (comm) {
      comm.isJoined = true;
      comm.memberCount = (comm.memberCount || 0) + 1;
      save(K_COMMUNITIES, communities);
    }
    return comm;
  },
  leaveCommunity(id) {
    const communities = this.getCommunities();
    const comm = communities.find((c) => String(c.communityId) === String(id));
    if (comm) {
      comm.isJoined = false;
      comm.memberCount = Math.max(0, (comm.memberCount || 1) - 1);
      save(K_COMMUNITIES, communities);
    }
    return comm;
  },

  // Messages
  getMessages(communityId) {
    const all = load(K_MESSAGES, INITIAL_MESSAGES);
    return all[communityId] || [];
  },
  sendMessage(communityId, senderId, text, senderName = 'Nivas (Lead Scholar)', avatarUrl = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80') {
    const all = load(K_MESSAGES, INITIAL_MESSAGES);
    if (!all[communityId]) all[communityId] = [];
    const newMsg = {
      messageId: Date.now(),
      senderId,
      senderName,
      senderRole: 'Scholar',
      avatarUrl,
      content: text,
      createdAt: new Date().toISOString(),
    };
    all[communityId].push(newMsg);
    save(K_MESSAGES, all);
    return newMsg;
  },
  deleteMessage(msgId) {
    const all = load(K_MESSAGES, INITIAL_MESSAGES);
    Object.keys(all).forEach((k) => {
      all[k] = all[k].filter((m) => String(m.messageId) !== String(msgId));
    });
    save(K_MESSAGES, all);
    return true;
  },

  // Ratings
  getRatings(bookId) {
    const all = load(K_RATINGS, INITIAL_RATINGS);
    return all[bookId] || [];
  },
  postRating(bookId, userId, { rating, review }) {
    const all = load(K_RATINGS, INITIAL_RATINGS);
    if (!all[bookId]) all[bookId] = [];
    const existingIdx = all[bookId].findIndex((r) => String(r.userId) === String(userId));
    const newRating = {
      ratingId: Date.now(),
      userId,
      username: 'Nivas (You)',
      rating: Number(rating),
      review: review || 'Comprehensive and well-structured resource.',
      createdAt: new Date().toISOString(),
    };
    if (existingIdx !== -1) {
      all[bookId][existingIdx] = newRating;
    } else {
      all[bookId].unshift(newRating);
    }
    save(K_RATINGS, all);
    return newRating;
  },

  // Comments
  getComments(bookId) {
    const all = load(K_COMMENTS, INITIAL_COMMENTS);
    return all[bookId] || [];
  },
  postComment(bookId, commentText, user) {
    const all = load(K_COMMENTS, INITIAL_COMMENTS);
    if (!all[bookId]) all[bookId] = [];
    const newComment = {
      commentId: Date.now(),
      userId: user?.userId || 201,
      username: user?.username || 'Nivas (Lead Scholar)',
      avatarUrl: user?.profileUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
      comment: commentText,
      createdAt: new Date().toISOString(),
    };
    all[bookId].push(newComment);
    save(K_COMMENTS, all);
    return newComment;
  },
  deleteComment(commentId) {
    const all = load(K_COMMENTS, INITIAL_COMMENTS);
    Object.keys(all).forEach((k) => {
      all[k] = all[k].filter((c) => String(c.commentId) !== String(commentId));
    });
    save(K_COMMENTS, all);
    return true;
  },

  // Wishlist
  getWishlist(userId) {
    const list = load(K_WISHLIST, [
      { wishlistId: 1, userId, book: INITIAL_BOOKS[0] },
      { wishlistId: 2, userId, book: INITIAL_BOOKS[2] },
    ]);
    return list;
  },
  addToWishlist(userId, bookId) {
    const list = this.getWishlist(userId);
    const book = this.getBookById(bookId);
    if (!list.some((item) => String(item.book?.bookId) === String(bookId))) {
      list.push({ wishlistId: Date.now(), userId, book });
      save(K_WISHLIST, list);
    }
    return list;
  },
  removeFromWishlist(wishlistId) {
    let list = load(K_WISHLIST, []);
    list = list.filter((item) => String(item.wishlistId) !== String(wishlistId));
    save(K_WISHLIST, list);
    return true;
  },

  // Bookmarks
  getBookmarks(userId, bookId) {
    const all = load(K_BOOKMARKS, [
      { bookMarkId: 1, userId, bookId: 101, page: 42, note: 'Consensus proofs' },
      { bookMarkId: 2, userId, bookId: 101, page: 118, note: 'Raft election' },
      { bookMarkId: 3, userId, bookId: 103, page: 75, note: 'RoPE equations' },
    ]);
    return all.filter((bm) => String(bm.bookId) === String(bookId));
  },
  addBookmark(userId, bookId, page) {
    const all = load(K_BOOKMARKS, []);
    const newBm = {
      bookMarkId: Date.now(),
      userId,
      bookId,
      page: Number(page) || 1,
      createdAt: new Date().toISOString(),
    };
    all.push(newBm);
    save(K_BOOKMARKS, all);
    return newBm;
  },
  removeBookmark(bmId) {
    let all = load(K_BOOKMARKS, []);
    all = all.filter((b) => String(b.bookMarkId) !== String(bmId) && String(b.bookmarkId) !== String(bmId));
    save(K_BOOKMARKS, all);
    return true;
  },

  // Badges & Leaderboard
  getBadges() {
    return load(K_BADGES, INITIAL_BADGES);
  },
  createBadge(data) {
    const badges = this.getBadges();
    const newBadge = {
      badgeId: Date.now(),
      badgeName: data.badgeName,
      description: data.description,
      iconUrl: data.iconUrl || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=200&q=80',
      points: Number(data.points) || 100,
      requirementType: data.requirementType || 'BOOK_UPLOAD',
      requirementValue: Number(data.requirementValue) || 1,
      isActive: true,
    };
    badges.push(newBadge);
    save(K_BADGES, badges);
    return newBadge;
  },
  updateBadge(id, data) {
    const badges = this.getBadges();
    const idx = badges.findIndex((b) => String(b.badgeId) === String(id));
    if (idx !== -1) {
      badges[idx] = { ...badges[idx], ...data };
      save(K_BADGES, badges);
      return badges[idx];
    }
    return null;
  },
  deleteBadge(id) {
    let badges = this.getBadges();
    badges = badges.filter((b) => String(b.badgeId) !== String(id));
    save(K_BADGES, badges);
    return true;
  },
  getLeaderboard() {
    return load(K_LEADERBOARD, INITIAL_LEADERBOARD);
  },

  // Admin users
  getAdminUsers() {
    return load(K_USERS, INITIAL_ADMIN_USERS);
  },
  addAdminUser(data) {
    const users = this.getAdminUsers();
    const newUser = {
      userId: Date.now(),
      username: data.username,
      email: data.email,
      role: data.role || 'MEMBER',
      profileUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      totalBooksUploaded: 0,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    save(K_USERS, users);
    return newUser;
  },
  deleteAdminUser(id) {
    let users = this.getAdminUsers();
    users = users.filter((u) => String(u.userId) !== String(id));
    save(K_USERS, users);
    return true;
  },
};
