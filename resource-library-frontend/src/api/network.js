import { INITIAL_AUTHORS, INITIAL_BOOKS } from './mockData';

const K_FOLLOWED_AUTHORS = 'rl_followed_authors';
const K_NETWORK_POSTS = 'rl_network_posts';
const K_NOTIFICATIONS = 'rl_notifications';
const K_LIKED_BOOKS = 'rl_liked_books';
const K_BOOK_COMMENTS = 'rl_book_comments';

const NETWORK_VERSION_KEY = 'rl_network_version';
const CURRENT_NET_VERSION = 'v2_real_internet_network';

function checkAndMigrateNet() {
  try {
    const v = localStorage.getItem(NETWORK_VERSION_KEY);
    const posts = load(K_NETWORK_POSTS, null);
    const hasOldDemo = posts && posts.some((p) => p.content && (p.content.includes('Evelyn Vasquez') || p.content.includes('Resilient Distributed Systems')));
    if (v !== CURRENT_NET_VERSION || hasOldDemo) {
      localStorage.removeItem(K_NETWORK_POSTS);
      localStorage.removeItem(K_NOTIFICATIONS);
      localStorage.removeItem(K_BOOK_COMMENTS);
      localStorage.removeItem(K_FOLLOWED_AUTHORS);
      localStorage.setItem(NETWORK_VERSION_KEY, CURRENT_NET_VERSION);
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

checkAndMigrateNet();

const INITIAL_BOOK_COMMENTS = {
  101: [
    {
      commentId: 1,
      user: { userId: 2, username: 'Robert C. Martin', profileUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
      content: 'Essential text for anyone designing scalable distributed architectures. The Multi-Paxos and consensus failure proofs are top tier.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    }
  ],
  102: [
    {
      commentId: 2,
      user: { userId: 1, username: 'Martin Kleppmann', profileUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
      content: 'Clear and disciplined approach to code craftsmanship. Highly recommended for every software engineer.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    }
  ]
};

const INITIAL_POSTS = [
  {
    postId: 1001,
    author: INITIAL_AUTHORS[0], // Martin Kleppmann
    content: "Excited to share that our comprehensive textbook 'Designing Data-Intensive Applications: The Big Ideas Behind Reliable, Scalable, and Maintainable Systems' is available in the library!\n\nThis release covers in-depth treatments of storage engines (LSM-Trees vs B-Trees), multi-datacenter replication, distributed transactions, consensus protocols, and event streaming architectures with Kafka.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    attachedBook: INITIAL_BOOKS[0],
    tags: ['DistributedSystems', 'Databases', 'Replication', 'Kafka', 'Consensus'],
    likes: 128,
    likedByMe: true,
    comments: [
      {
        commentId: 1,
        user: { userId: 2, username: 'Robert C. Martin', profileUrl: INITIAL_AUTHORS[1].profileUrl },
        content: 'Remarkable work on the replication and transaction isolation levels, Martin! We recommend Chapter 7 to all engineers.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      },
      {
        commentId: 2,
        user: { userId: 201, username: 'Nivas (Lead Scholar)', profileUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80' },
        content: 'The architectural diagrams on log replication quorum intersections are crystal clear. Thank you for making this accessible!',
        createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      }
    ]
  },
  {
    postId: 1002,
    author: INITIAL_AUTHORS[3], // Dr. Ian Goodfellow
    content: "Foundational Monograph Announcement: The complete edition of 'Deep Learning' (MIT Press) with Yoshua Bengio and Aaron Courville is accessible for research members.\n\nWe provide extensive mathematical derivations of convolutional networks, attention mechanisms, backpropagation manifolds, and deep generative models. Download directly below!",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(),
    attachedBook: INITIAL_BOOKS[3],
    tags: ['MachineLearning', 'DeepLearning', 'NeuralNetworks', 'AIResearch'],
    likes: 195,
    likedByMe: false,
    comments: [
      {
        commentId: 3,
        user: { userId: 5, username: 'Prof. Stuart Russell', profileUrl: INITIAL_AUTHORS[4].profileUrl },
        content: 'The section on optimization landscapes and regularizers during stochastic gradient descent is one of the clearest explanations available.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      }
    ]
  },
  {
    postId: 1003,
    author: INITIAL_AUTHORS[1], // Robert C. Martin
    content: "Software craftsmanship note: 'Clean Code: A Handbook of Agile Software Craftsmanship' is available in the library.\n\nCovers meaningful naming, single-responsibility functions, clean error handling, TDD unit testing discipline, and refactoring code smells into clean SOLID architectures.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    attachedBook: INITIAL_BOOKS[1],
    tags: ['SoftwareCraftsmanship', 'CleanCode', 'Refactoring', 'Agile', 'SOLID'],
    likes: 142,
    likedByMe: true,
    comments: [
      {
        commentId: 4,
        user: { userId: 1, username: 'Martin Kleppmann', profileUrl: INITIAL_AUTHORS[0].profileUrl },
        content: 'The chapter on concurrency and decoupling is essential for junior and senior engineers alike.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      }
    ]
  },
  {
    postId: 1004,
    author: INITIAL_AUTHORS[2], // Prof. Thomas H. Cormen
    content: "The fourth edition of 'Introduction to Algorithms' (CLRS) has been indexed.\n\nFeaturing comprehensive treatments of dynamic programming, B-Trees, graph algorithms, maximum flow networks, and NP-completeness proofs.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    attachedBook: INITIAL_BOOKS[2],
    tags: ['Algorithms', 'DataStructures', 'GraphTheory', 'Mathematics', 'Complexity'],
    likes: 210,
    likedByMe: false,
    comments: []
  }
];

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    title: 'Martin Kleppmann Published a New Resource',
    message: 'New resource "Designing Data-Intensive Applications" was added to the library catalog.',
    time: '3h ago',
    type: 'book_release',
    read: false,
    authorId: 1,
    bookId: 101,
  },
  {
    id: 2,
    title: 'Dr. Ian Goodfellow Shared a Research Update',
    message: 'Published deep learning lecture notes on neural network optimization.',
    time: '9h ago',
    type: 'post',
    read: false,
    authorId: 4,
    bookId: 104,
  },
  {
    id: 3,
    title: 'Reading Streak Milestone',
    message: 'Congratulations! You reached an 18-day uninterrupted reading streak.',
    time: '1d ago',
    type: 'streak',
    read: true,
  },
  {
    id: 4,
    title: 'New Discussion in Study Forum',
    message: 'Robert C. Martin replied to your architecture thread in Distributed Systems.',
    time: '1d ago',
    type: 'community',
    read: true,
  }
];

export const networkApi = {
  // Following Authors
  getFollowedAuthorIds() {
    return load(K_FOLLOWED_AUTHORS, [1, 2]); // Martin Kleppmann and Robert C. Martin followed by default
  },

  isFollowing(authorId) {
    const list = this.getFollowedAuthorIds();
    return list.some((id) => String(id) === String(authorId));
  },

  followAuthor(authorId, authorName = 'Faculty Author') {
    const list = this.getFollowedAuthorIds();
    const idNum = Number(authorId);
    if (!list.some((id) => String(id) === String(authorId))) {
      list.push(idNum);
      save(K_FOLLOWED_AUTHORS, list);

      // Add instant notification
      this.addNotification({
        title: `Now Following ${authorName}`,
        message: `You will now receive automatic notifications whenever ${authorName} publishes a new book or research update.`,
        type: 'follow',
        authorId: idNum,
      });
    }
    return list;
  },

  unfollowAuthor(authorId) {
    let list = this.getFollowedAuthorIds();
    list = list.filter((id) => String(id) !== String(authorId));
    save(K_FOLLOWED_AUTHORS, list);
    return list;
  },

  toggleFollow(authorId, authorName = 'Faculty Author') {
    if (this.isFollowing(authorId)) {
      this.unfollowAuthor(authorId);
      return false;
    } else {
      this.followAuthor(authorId, authorName);
      return true;
    }
  },

  // Posts
  getPosts() {
    return load(K_NETWORK_POSTS, INITIAL_POSTS);
  },

  createPost({ author, content, attachedBook, tags = [] }) {
    const posts = this.getPosts();
    const newPost = {
      postId: Date.now(),
      author: author || INITIAL_AUTHORS[0],
      content,
      createdAt: new Date().toISOString(),
      attachedBook: attachedBook || null,
      tags: tags.map((t) => t.replace(/^#/, '')),
      likes: 1,
      likedByMe: true,
      comments: [],
    };
    posts.unshift(newPost);
    save(K_NETWORK_POSTS, posts);

    // If author is followed, trigger notification
    if (this.isFollowing(newPost.author?.authorId)) {
      this.addNotification({
        title: `${newPost.author.name} Posted a New Research Update`,
        message: newPost.content.slice(0, 100) + '...',
        type: attachedBook ? 'book_release' : 'post',
        authorId: newPost.author.authorId,
        bookId: attachedBook?.bookId || null,
      });
    }

    return newPost;
  },

  toggleLikePost(postId) {
    const posts = this.getPosts();
    const post = posts.find((p) => String(p.postId) === String(postId));
    if (post) {
      if (post.likedByMe) {
        post.likedByMe = false;
        post.likes = Math.max(0, (post.likes || 1) - 1);
      } else {
        post.likedByMe = true;
        post.likes = (post.likes || 0) + 1;
      }
      save(K_NETWORK_POSTS, posts);
      return post;
    }
    return null;
  },

  addComment(postId, content, user) {
    const posts = this.getPosts();
    const post = posts.find((p) => String(p.postId) === String(postId));
    if (post) {
      if (!Array.isArray(post.comments)) post.comments = [];
      const newComment = {
        commentId: Date.now(),
        user: {
          userId: user?.userId || 201,
          username: user?.username || 'You (Lead Scholar)',
          profileUrl: user?.profileUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
        },
        content,
        createdAt: new Date().toISOString(),
      };
      post.comments.push(newComment);
      save(K_NETWORK_POSTS, posts);
      return newComment;
    }
    return null;
  },

  deleteComment(postId, commentId) {
    const posts = this.getPosts();
    const post = posts.find((p) => String(p.postId) === String(postId));
    if (post && Array.isArray(post.comments)) {
      post.comments = post.comments.filter((c) => String(c.commentId) !== String(commentId));
      save(K_NETWORK_POSTS, posts);
      return true;
    }
    return false;
  },

  // Notifications
  getNotifications() {
    return load(K_NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  },

  addNotification(notif) {
    const notifs = this.getNotifications();
    const newNotif = {
      id: Date.now(),
      title: notif.title,
      message: notif.message,
      time: 'Just now',
      type: notif.type || 'network',
      read: false,
      authorId: notif.authorId || null,
      bookId: notif.bookId || null,
    };
    notifs.unshift(newNotif);
    save(K_NOTIFICATIONS, notifs);
    return newNotif;
  },

  markAllNotificationsRead() {
    const notifs = this.getNotifications().map((n) => ({ ...n, read: true }));
    save(K_NOTIFICATIONS, notifs);
    return notifs;
  },

  clearNotifications() {
    save(K_NOTIFICATIONS, []);
    return [];
  },

  // Broadcast when a new book is published to catalog
  onNewBookPublished(book) {
    if (!book) return;
    const authorObj = typeof book.author === 'object' && book.author ? book.author : { authorId: 1, name: String(book.author || 'Faculty Author') };
    const authorId = authorObj?.authorId || 1;
    const authorName = authorObj?.name || 'Faculty Author';

    // If author is followed, trigger notification
    if (this.isFollowing(authorId)) {
      this.addNotification({
        title: `New Book by ${authorName}: "${book.title}"`,
        message: `${authorName} published a new monograph: "${book.title}". Available in catalog now!`,
        type: 'book_release',
        authorId: authorId,
        bookId: book.bookId,
      });
    }

    // Automatically create a post in the feed announcing the new book release!
    const newPost = this.createPost({
      author: authorObj,
      content: `🎉 New Manuscript Release: I have published "${book.title}" to the digital library catalog. Open to peer comments, feedback, and academic citations!`,
      attachedBook: book,
      tags: [book.category || 'Research', book.fileType || 'Document'],
    });

    return newPost;
  },

  // Book Likes
  getLikedBookIds() {
    return load(K_LIKED_BOOKS, [101]); // 101 liked by default
  },

  isBookLiked(bookId) {
    const list = this.getLikedBookIds();
    return list.some((id) => String(id) === String(bookId));
  },

  toggleLikeBook(bookId) {
    let list = this.getLikedBookIds();
    const idNum = Number(bookId) || bookId;
    let isLiked = false;
    if (this.isBookLiked(bookId)) {
      list = list.filter((id) => String(id) !== String(bookId));
      isLiked = false;
    } else {
      list.push(idNum);
      isLiked = true;
    }
    save(K_LIKED_BOOKS, list);
    return isLiked;
  },

  // Book Comments
  getAllBookComments() {
    return load(K_BOOK_COMMENTS, INITIAL_BOOK_COMMENTS);
  },

  getBookComments(bookId) {
    const map = this.getAllBookComments();
    return map[String(bookId)] || [];
  },

  addBookComment(bookId, content, user) {
    const map = this.getAllBookComments();
    const key = String(bookId);
    if (!map[key]) map[key] = [];
    const newComment = {
      commentId: Date.now(),
      user: {
        userId: user?.userId || 201,
        username: user?.username || 'You (Lead Scholar)',
        profileUrl: user?.profileUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
      },
      content,
      createdAt: new Date().toISOString(),
    };
    map[key].push(newComment);
    save(K_BOOK_COMMENTS, map);
    return newComment;
  },

  deleteBookComment(bookId, commentId) {
    const map = this.getAllBookComments();
    const key = String(bookId);
    if (map[key]) {
      map[key] = map[key].filter((c) => String(c.commentId) !== String(commentId));
      save(K_BOOK_COMMENTS, map);
      return true;
    }
    return false;
  }
};
