import { createSlice } from '@reduxjs/toolkit';
import { getUserIdFromToken, getEmailFromToken, isTokenExpired } from '../../utils/jwtUtils';

const token = localStorage.getItem('rl_token');
const storedUser = localStorage.getItem('rl_user');

function buildInitialState() {
  if (token && !isTokenExpired(token)) {
    const userId = getUserIdFromToken(token);
    const email = getEmailFromToken(token);
    const user = storedUser ? JSON.parse(storedUser) : { userId, email };
    return { token, user, isAuthenticated: true };
  }
  return { token: null, user: null, isAuthenticated: false };
}

const authSlice = createSlice({
  name: 'auth',
  initialState: buildInitialState(),
  reducers: {
    setCredentials(state, action) {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;
      state.isAuthenticated = true;
      localStorage.setItem('rl_token', token);
      localStorage.setItem('rl_user', JSON.stringify(user));
    },
    updateUser(state, action) {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('rl_user', JSON.stringify(state.user));
    },
    logout(state) {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('rl_token');
      localStorage.removeItem('rl_user');
    },
  },
});

export const { setCredentials, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectIsAuthenticated = (s) => s.auth.isAuthenticated;
export const selectCurrentUser = (s) => s.auth.user;
export const selectToken = (s) => s.auth.token;
