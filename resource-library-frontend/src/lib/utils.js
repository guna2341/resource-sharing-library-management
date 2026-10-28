import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import defaultBookCover from '../assets/images/default-book-cover.jpg';
import defaultAuthorAvatar from '../assets/images/default-author-avatar.jpg';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatRelativeDate(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(dateStr);
}

export function fileTypeLabel(type) {
  const labels = {
    PDF: 'PDF',
    DOC: 'Word',
    DOCX: 'Word',
    PPT: 'PowerPoint',
    PPTX: 'PowerPoint',
    XLS: 'Excel',
    XLSX: 'Excel',
    TXT: 'Text',
    OTHER: 'Document',
  };
  return labels[type] || type;
}

export function fileTypeColor(type) {
  const colors = {
    PDF: 'text-red-600 bg-red-50',
    DOC: 'text-blue-600 bg-blue-50',
    DOCX: 'text-blue-600 bg-blue-50',
    PPT: 'text-orange-600 bg-orange-50',
    PPTX: 'text-orange-600 bg-orange-50',
    XLS: 'text-green-600 bg-green-50',
    XLSX: 'text-green-600 bg-green-50',
    TXT: 'text-gray-600 bg-gray-50',
    OTHER: 'text-gray-600 bg-gray-50',
  };
  return colors[type] || 'text-gray-600 bg-gray-50';
}

export function coverGradient(id) {
  const gradients = [
    'cover-gradient-1',
    'cover-gradient-2',
    'cover-gradient-3',
    'cover-gradient-4',
    'cover-gradient-5',
    'cover-gradient-6',
  ];
  return gradients[(id || 0) % gradients.length];
}

export const DEFAULT_BOOK_COVER = defaultBookCover;
export const DEFAULT_AUTHOR_AVATAR = defaultAuthorAvatar;

export function getBookCover(url) {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return DEFAULT_BOOK_COVER;
  }
  return url;
}

export function getAuthorAvatar(url) {
  if (!url || typeof url !== 'string' || url.trim() === '' || url.includes('/api/v1/author') || url.includes('localhost:8080')) {
    return DEFAULT_AUTHOR_AVATAR;
  }
  return url;
}

export function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function getAuthorName(author) {
  if (!author) return 'Anonymous';
  if (typeof author === 'string') return author;
  if (typeof author === 'object') return author.name || 'Anonymous';
  return 'Anonymous';
}

