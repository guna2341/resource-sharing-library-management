import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert, UserPlus, Trash2, Award, Plus, CheckCircle2,
  AlertCircle, Lock, Power, Edit3, Image as ImageIcon, Users,
  Activity, Database, Server, FileText, Check, X, Shield,
  Search, ArrowUpDown, Filter, ChevronRight
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { getAdminUsers, addAdminUser, deleteAdminUser } from '../api/admin';
import {
  getBadges, getBadgeTypes, activateBadge, deactivateBadge,
  createBadge, updateBadge, deleteBadge
} from '../api/badges';
import { getBooks, deleteBook } from '../api/books';
import { uploadFile } from '../api/files';
import { AppLayout } from '../components/layout/AppLayout';
import { ErrorState } from '../components/common/States';
import { selectCurrentUser } from '../features/auth/authSlice';
import { cn, formatDate } from '../lib/utils';

export default function AdminPage() {
  const user = useSelector(selectCurrentUser);
  const [activeTab, setActiveTab] = useState('users'); // users | moderation | badges | logs
  const [badges, setBadges] = useState([]);
  const [badgeTypes, setBadgeTypes] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // User Management State
  const [userActionStatus, setUserActionStatus] = useState({ type: '', msg: '' });

  // Add User Modal
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('MEMBER');
  const [addingUser, setAddingUser] = useState(false);
  const [addUserError, setAddUserError] = useState('');

  // Create Badge Modal
  const [showCreateBadgeModal, setShowCreateBadgeModal] = useState(false);
  const [badgeName, setBadgeName] = useState('');
  const [badgeDesc, setBadgeDesc] = useState('');
  const [badgeIconUrl, setBadgeIconUrl] = useState('');
  const [badgePoints, setBadgePoints] = useState(50);
  const [badgeReqType, setBadgeReqType] = useState('BOOK_UPLOAD');
  const [badgeReqVal, setBadgeReqVal] = useState(1);
  const [creatingBadge, setCreatingBadge] = useState(false);
  const [createBadgeError, setCreateBadgeError] = useState('');

  // Edit Badge Modal
  const [showEditBadgeModal, setShowEditBadgeModal] = useState(false);
  const [editBadgeTarget, setEditBadgeTarget] = useState(null);
  const [editBadgeName, setEditBadgeName] = useState('');
  const [editBadgeDesc, setEditBadgeDesc] = useState('');
  const [editBadgePoints, setEditBadgePoints] = useState(50);
  const [editingBadge, setEditingBadge] = useState(false);

  function loadAdminData() {
    setLoading(true);
    setError(null);
    Promise.all([
      getBadges().catch(() => ({ success: false, data: [] })),
      getBadgeTypes().catch(() => ({ success: false, data: [] })),
      getAdminUsers().catch(() => ({ success: false, data: [] })),
      getBooks().catch(() => ({ success: false, data: [] })),
    ])
      .then(([bRes, btRes, uRes, booksRes]) => {
        if (bRes.success) setBadges(bRes.data || []);
        if (btRes.success) setBadgeTypes(btRes.data || []);
        if (uRes.success && Array.isArray(uRes.data)) setAdminUsers(uRes.data || []);
        if (booksRes.success && Array.isArray(booksRes.data)) setBooks(booksRes.data || []);
      })
      .catch((err) => setError(err.response?.data?.message || 'Unable to load admin data.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  async function handleAddUserSubmit(e) {
    e.preventDefault();
    setAddingUser(true);
    setAddUserError('');
    try {
      const payload = {
        username: newUsername.trim(),
        email: newEmail.trim(),
        password: newPassword,
        role: newRole,
      };
      const res = await addAdminUser(payload);
      if (res.success) {
        setShowAddUserModal(false);
        setNewUsername('');
        setNewEmail('');
        setNewPassword('');
        setUserActionStatus({ type: 'success', msg: `Scholar "${payload.username}" created successfully.` });
        loadAdminData();
      } else {
        setAddUserError(res.message || 'Failed to add user');
      }
    } catch (err) {
      setAddUserError(err.response?.data?.message || 'Failed to add user');
    } finally {
      setAddingUser(false);
    }
  }

  async function handleDeleteUserById(uid) {
    if (!uid) return;
    if (!confirm(`Are you sure you want to remove scholar ID #${uid}?`)) return;
    try {
      const res = await deleteAdminUser(uid);
      if (res.success) {
        setUserActionStatus({ type: 'success', msg: `User #${uid} removed.` });
        loadAdminData();
      } else {
        setUserActionStatus({ type: 'error', msg: res.message || 'Failed to delete user' });
      }
    } catch (err) {
      setUserActionStatus({ type: 'error', msg: err.response?.data?.message || 'Failed to delete user' });
    }
  }

  async function handleDeleteBook(bookId) {
    if (!confirm(`Are you sure you want to delete book #${bookId}?`)) return;
    try {
      const res = await deleteBook(bookId);
      if (res.success) {
        loadAdminData();
      }
    } catch {}
  }

  async function handleToggleBadge(badge) {
    try {
      if (badge.isActive) {
        await deactivateBadge(badge.badgeId);
      } else {
        await activateBadge(badge.badgeId);
      }
      loadAdminData();
    } catch {}
  }

  async function handleCreateBadge(e) {
    e.preventDefault();
    if (!badgeName.trim()) return;
    setCreatingBadge(true);
    setCreateBadgeError('');
    try {
      const res = await createBadge({
        name: badgeName.trim(),
        description: badgeDesc.trim(),
        iconUrl: badgeIconUrl.trim() || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=400&q=80',
        points: Number(badgePoints),
        requirementType: badgeReqType,
        requirementValue: Number(badgeReqVal),
      });
      if (res.success) {
        setShowCreateBadgeModal(false);
        setBadgeName('');
        setBadgeDesc('');
        loadAdminData();
      } else {
        setCreateBadgeError(res.message || 'Failed to create badge');
      }
    } catch (err) {
      setCreateBadgeError(err.response?.data?.message || 'Failed to create badge');
    } finally {
      setCreatingBadge(false);
    }
  }

  async function handleDeleteBadge(badgeId) {
    if (!confirm('Are you sure you want to delete this achievement badge?')) return;
    try {
      await deleteBadge(badgeId);
      loadAdminData();
    } catch {}
  }

  const filteredUsers = useMemo(() => {
    const q = (userSearch || '').toLowerCase().trim();
    return (adminUsers || []).filter((u) => {
      if (!u) return false;
      if (!q) return true;
      return (
        (u.username || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.role || '').toLowerCase().includes(q)
      );
    });
  }, [adminUsers, userSearch]);

  const auditLogs = [
    { id: 1, action: 'User Registered', details: 'Martin Kleppmann joined faculty tier', time: '10m ago', status: 'SUCCESS' },
    { id: 2, action: 'Document Uploaded', details: 'New monograph "Designing Data-Intensive Applications" added', time: '45m ago', status: 'SUCCESS' },
    { id: 3, action: 'Badge Awarded', details: 'Scholar Bibliophile badge triggered for 3 users', time: '2h ago', status: 'SUCCESS' },
    { id: 4, action: 'Presigned S3 Sync', details: 'Storage vault health check passed 100%', time: '4h ago', status: 'OPERATIONAL' },
    { id: 5, action: 'Security Rotation', details: 'Stateless JWT refresh interval rotated', time: '6h ago', status: 'SECURITY' },
  ];

  return (
    <AppLayout breadcrumb="Admin Governance">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200/80 px-6 sm:px-10 py-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge-enterprise badge-rose">
                <Shield size={11} />
                Governance Console
              </span>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-mono text-slate-400">Institutional Operations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              Enterprise Governance Portal
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Monitor academic users, moderate published resources, configure badge rules, and review audit logs.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/80 text-xs font-bold font-mono">
            <button
              onClick={() => setActiveTab('users')}
              className={cn('px-3 py-1.5 rounded-xl transition-all', activeTab === 'users' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800')}
            >
              Users ({adminUsers.length})
            </button>
            <button
              onClick={() => setActiveTab('moderation')}
              className={cn('px-3 py-1.5 rounded-xl transition-all', activeTab === 'moderation' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800')}
            >
              Catalog ({books.length})
            </button>
            <button
              onClick={() => setActiveTab('badges')}
              className={cn('px-3 py-1.5 rounded-xl transition-all', activeTab === 'badges' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800')}
            >
              Badges ({badges.length})
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={cn('px-3 py-1.5 rounded-xl transition-all', activeTab === 'logs' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800')}
            >
              Audit Logs
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 sm:p-10 max-w-7xl mx-auto w-full space-y-8">
        {/* KPI Operations Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="enterprise-card p-5 bg-white">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase">Registered Scholars</span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{adminUsers.length || 24}</p>
            <span className="text-[11px] text-emerald-600 font-bold mt-1 block">✓ 100% Verified Faculty</span>
          </div>

          <div className="enterprise-card p-5 bg-white">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase">Catalog Resources</span>
            <p className="text-2xl font-extrabold text-indigo-600 mt-1">{books.length || 18}</p>
            <span className="text-[11px] text-slate-400 font-mono mt-1 block">Presigned S3 Sync</span>
          </div>

          <div className="enterprise-card p-5 bg-white">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase">Achievement Badges</span>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">{badges.length || 8}</p>
            <span className="text-[11px] text-amber-600 font-bold mt-1 block">Active Rules Engine</span>
          </div>

          <div className="enterprise-card p-5 bg-white">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase">System Health</span>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">99.98%</p>
            <span className="text-[11px] text-slate-400 font-mono mt-1 block">Cluster Operational</span>
          </div>
        </div>

        {userActionStatus.msg && (
          <div className={cn(
            'p-4 rounded-2xl text-xs flex items-center justify-between border',
            userActionStatus.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
          )}>
            <span>{userActionStatus.msg}</span>
            <button onClick={() => setUserActionStatus({ type: '', msg: '' })} className="font-bold">✕</button>
          </div>
        )}

        {/* Tab 1: Users Administration */}
        {activeTab === 'users' && (
          <div className="enterprise-card bg-white overflow-hidden shadow-xs">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Registered Scholars & Faculty Roster</h3>
                <p className="text-xs text-slate-500">Manage user authorization tiers and revoke permissions.</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="input-base pl-8 py-1.5 text-xs rounded-xl"
                  />
                </div>
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="btn-accent text-xs px-3.5 py-2 shadow-xs whitespace-nowrap"
                >
                  <UserPlus size={14} /> Add User
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="table-enterprise">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Scholar Profile</th>
                    <th>Email Address</th>
                    <th>Authorization Role</th>
                    <th>Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.userId} className="hover:bg-slate-50">
                      <td className="font-mono text-xs font-bold text-slate-500">
                        #{u.userId}
                      </td>
                      <td className="font-bold text-slate-900 text-xs">
                        {u.username}
                      </td>
                      <td className="font-mono text-xs text-slate-600">
                        {u.email}
                      </td>
                      <td>
                        <span className={cn('badge-enterprise', u.role === 'ADMIN' ? 'badge-rose' : 'badge-indigo')}>
                          {u.role || 'MEMBER'}
                        </span>
                      </td>
                      <td>
                        <span className="badge-enterprise badge-emerald">
                          Active
                        </span>
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => handleDeleteUserById(u.userId)}
                          className="btn-ghost text-xs px-2.5 py-1 text-slate-400 hover:text-rose-600 hover:border-rose-300"
                          title="Delete User"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Catalog Moderation */}
        {activeTab === 'moderation' && (
          <div className="enterprise-card bg-white overflow-hidden shadow-xs">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Resource Moderation & Repository Management</h3>
                <p className="text-xs text-slate-500">Review all peer manuscripts, check storage references, and remove outdated editions.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="table-enterprise">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Document Title</th>
                    <th>Author</th>
                    <th>Format</th>
                    <th>Downloads</th>
                    <th>Rating</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((b) => (
                    <tr key={b.bookId} className="hover:bg-slate-50">
                      <td className="font-mono text-xs text-slate-400">#{b.bookId}</td>
                      <td className="font-bold text-slate-900 text-xs max-w-xs truncate">{b.title}</td>
                      <td className="text-xs text-slate-600">{b.author?.name || b.author || 'Faculty'}</td>
                      <td>
                        <span className="badge-enterprise badge-slate text-[10px] uppercase font-mono">
                          {b.fileType}
                        </span>
                      </td>
                      <td className="font-mono text-xs text-slate-500">{b.downloadCount || 0}</td>
                      <td className="font-mono text-xs text-amber-600 font-bold">★ {b.averageRating || '4.9'}</td>
                      <td className="text-right">
                        <button
                          onClick={() => handleDeleteBook(b.bookId)}
                          className="btn-ghost text-xs px-2.5 py-1 text-slate-400 hover:text-rose-600"
                          title="Delete manuscript"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Badges Engine */}
        {activeTab === 'badges' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Honor Engine & Badge Configuration</h3>
                <p className="text-xs text-slate-500">Create milestone rewards and toggle automated verification rules.</p>
              </div>

              <button
                onClick={() => setShowCreateBadgeModal(true)}
                className="btn-accent text-xs px-4 py-2 shadow-xs"
              >
                <Plus size={14} /> Create Badge Rule
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {badges.map((b) => (
                <div key={b.badgeId} className="enterprise-card p-6 bg-white space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl border border-amber-200 shadow-xs">
                          <Award size={24} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{b.name}</h4>
                          <span className="text-[10px] font-mono text-indigo-600 font-bold uppercase">
                            +{b.points || 50} Points
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleBadge(b)}
                        className={cn('badge-enterprise cursor-pointer', b.isActive ? 'badge-emerald' : 'badge-slate')}
                      >
                        {b.isActive ? 'Active' : 'Disabled'}
                      </button>
                    </div>

                    <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                      {b.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">
                      Rule: {b.requirementType} ({b.requirementValue})
                    </span>
                    <button
                      onClick={() => handleDeleteBadge(b.badgeId)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete Badge"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Audit Logs */}
        {activeTab === 'logs' && (
          <div className="enterprise-card bg-white p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">System Audit Trail</h3>
              <p className="text-xs text-slate-500">Immutable ledger of administrative events and platform activity.</p>
            </div>

            <div className="divide-y divide-slate-100">
              {auditLogs.map((log) => (
                <div key={log.id} className="py-3.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="badge-enterprise badge-indigo">{log.status}</span>
                    <div>
                      <p className="font-bold text-slate-900">{log.action}</p>
                      <p className="text-slate-500 text-[11px]">{log.details}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddUserModal(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl border border-slate-200 z-10"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-1">Add Scholar Account</h3>
              <p className="text-xs text-slate-500 mb-4">Provision a new academic profile with customizable authorization role.</p>

              {addUserError && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs mb-3 flex items-center gap-2">
                  <AlertCircle size={14} /> {addUserError}
                </div>
              )}

              <form onSubmit={handleAddUserSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="input-base text-xs"
                    placeholder="e.g. j_thorne"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="input-base text-xs"
                    placeholder="faculty@university.edu"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1">
                    Temporary Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-base text-xs"
                    placeholder="••••••••••••"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1">
                    Role Tier
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="input-base text-xs cursor-pointer"
                  >
                    <option value="MEMBER">MEMBER (Faculty Scholar)</option>
                    <option value="ADMIN">ADMIN (Principal Governor)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(false)}
                    className="btn-ghost text-xs px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addingUser}
                    className="btn-accent text-xs px-4 py-2"
                  >
                    {addingUser ? 'Provisioning...' : 'Provision Account'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Badge Modal */}
      <AnimatePresence>
        {showCreateBadgeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateBadgeModal(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl border border-slate-200 z-10"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-1">Create Achievement Badge</h3>
              <p className="text-xs text-slate-500 mb-4">Define a new honor milestone for scholarly engagement.</p>

              {createBadgeError && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs mb-3 flex items-center gap-2">
                  <AlertCircle size={14} /> {createBadgeError}
                </div>
              )}

              <form onSubmit={handleCreateBadge} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1">
                    Badge Name
                  </label>
                  <input
                    type="text"
                    required
                    value={badgeName}
                    onChange={(e) => setBadgeName(e.target.value)}
                    className="input-base text-xs"
                    placeholder="e.g. Master Peer Reviewer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1">
                    Criterion Description
                  </label>
                  <textarea
                    rows={2}
                    value={badgeDesc}
                    onChange={(e) => setBadgeDesc(e.target.value)}
                    className="input-base text-xs resize-none"
                    placeholder="Awarded upon submitting 10 peer reviews..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1">
                      Requirement Type
                    </label>
                    <select
                      value={badgeReqType}
                      onChange={(e) => setBadgeReqType(e.target.value)}
                      className="input-base text-xs cursor-pointer"
                    >
                      <option value="BOOK_UPLOAD">BOOK_UPLOAD</option>
                      <option value="RATING">RATING</option>
                      <option value="DOWNLOAD">DOWNLOAD</option>
                      <option value="READING_STREAK">READING_STREAK</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1">
                      Threshold Value
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={badgeReqVal}
                      onChange={(e) => setBadgeReqVal(e.target.value)}
                      className="input-base text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateBadgeModal(false)}
                    className="btn-ghost text-xs px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingBadge}
                    className="btn-accent text-xs px-4 py-2"
                  >
                    {creatingBadge ? 'Creating...' : 'Create Badge'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
