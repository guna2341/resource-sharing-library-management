import { jwtDecode } from 'jwt-decode';

export function decodeToken(token) {
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
}

export function isTokenExpired(token) {
  const decoded = decodeToken(token);
  if (!decoded) return true;
  return decoded.exp * 1000 < Date.now();
}

export function getUserIdFromToken(token) {
  const decoded = decodeToken(token);
  return decoded?.userId || null;
}

export function getEmailFromToken(token) {
  const decoded = decodeToken(token);
  return decoded?.sub || null;
}

export function getRoleFromToken(token) {
  const decoded = decodeToken(token);
  return decoded?.role || null;
}
