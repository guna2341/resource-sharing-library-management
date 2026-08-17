import { createSlice } from '@reduxjs/toolkit';

const booksSlice = createSlice({
  name: 'books',
  initialState: {
    items: [],
    loading: false,
    error: null,
    searchQuery: '',
  },
  reducers: {
    setBooks(state, action) {
      state.items = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    setSearchQuery(state, action) {
      state.searchQuery = action.payload;
    },
    addBook(state, action) {
      state.items.unshift(action.payload);
    },
    removeBook(state, action) {
      state.items = state.items.filter(b => b.bookId !== action.payload);
    },
    updateBook(state, action) {
      const idx = state.items.findIndex(b => b.bookId === action.payload.bookId);
      if (idx !== -1) state.items[idx] = { ...state.items[idx], ...action.payload };
    },
  },
});

export const {
  setBooks,
  setLoading,
  setError,
  setSearchQuery,
  addBook,
  removeBook,
  updateBook,
} = booksSlice.actions;
export default booksSlice.reducer;

// Selectors
export const selectBooks = (s) => s.books.items;
export const selectBooksLoading = (s) => s.books.loading;
export const selectBooksError = (s) => s.books.error;
export const selectSearchQuery = (s) => s.books.searchQuery;
export const selectFilteredBooks = (s) => {
  const q = s.books.searchQuery.toLowerCase().trim();
  if (!q) return s.books.items;
  return s.books.items.filter(
    (b) =>
      b.title?.toLowerCase().includes(q) ||
      b.author?.toLowerCase().includes(q) ||
      b.description?.toLowerCase().includes(q)
  );
};
