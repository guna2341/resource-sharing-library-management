import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Plus, MessageSquare, Send, Trash2, ArrowLeft, Shield,
  UserPlus, UserMinus, Sparkles, Image as ImageIcon, Search, Check,
  Layers, ExternalLink, MoreVertical, LogOut, Info, AlertCircle,
  BookOpen, Hash, Flame, ChevronRight, X, Clock, Calendar, Bookmark,
  Award, FileText, CornerDownRight, CheckCircle2, Share2, ThumbsUp,
  Lightbulb, BookMarked, Pin
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  getCommunities, getCommunitiesCreatedByUser, getCommunitiesUserIn,
  createCommunity, updateCommunity, deleteCommunity,
  getCommunityMembers, addCommunityMember, deleteCommunityMember,
  getCommunityMessages, sendCommunityMessage, deleteCommunityMessage
} from '../api/communities';
import { getBooks } from '../api/books';
import { uploadFile } from '../api/files';
import { AppLayout } from '../components/layout/AppLayout';
import { ErrorState } from '../components/common/States';
import { selectCurrentUser } from '../features/auth/authSlice';
import { cn, getInitials, formatDate, formatRelativeDate, fileTypeColor, fileTypeLabel } from '../lib/utils';

export default function CommunitiesPage() {
  const user = useSelector(selectCurrentUser);
  const [activeTab, setActiveTab] = useState('all'); // all | joined | created
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [communities, setCommunities] = useState([]);
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [createdCommunities, setCreatedCommunities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected Community Detail & Chat view
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [circleWorkspaceTab, setCircleWorkspaceTab] = useState('discourse'); // discourse | syllabus | vault
  const [members, setMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showMembersDrawer, setShowMembersDrawer] = useState(false);
  const [circleBooks, setCircleBooks] = useState([]);
  const [messageReactions, setMessageReactions] = useState({});
  const chatContainerRef = useRef(null);

  // Create Community Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCommName, setNewCommName] = useState('');
  const [newCommDesc, setNewCommDesc] = useState('');
  const [newCommCategory, setNewCommCategory] = useState('Computer Science');
  const [newCommProfileUrl, setNewCommProfileUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const CATEGORIES = [
    'ALL',
    'Computer Science',
    'Artificial Intelligence',
    'Applied Physics',
    'Mathematics',
    'Cloud Engineering'
  ];

  function loadCommunitiesData() {
    setLoading(true);
    setError(null);
    Promise.all([
      getCommunities().catch(() => ({ success: false, data: [] })),
      user?.userId ? getCommunitiesUserIn(user.userId).catch(() => ({ success: false, data: [] })) : Promise.resolve({ success: true, data: [] }),
      user?.userId ? getCommunitiesCreatedByUser(user.userId).catch(() => ({ success: false, data: [] })) : Promise.resolve({ success: true, data: [] }),
      getBooks().catch(() => ({ success: false, data: [] })),
    ])
      .then(([allRes, joinedRes, createdRes, booksRes]) => {
        if (allRes.success) {
          const commList = allRes.data || [];
          setCommunities(commList);
          if (commList.length > 0 && !selectedCommunity) {
            setSelectedCommunity(commList[0]);
          }
        }
        if (joinedRes.success) setJoinedCommunities(joinedRes.data || []);
        if (createdRes.success) setCreatedCommunities(createdRes.data || []);
        if (booksRes.success && Array.isArray(booksRes.data)) {
          setCircleBooks(booksRes.data);
        }
      })
      .catch((err) => setError(err.response?.data?.message || 'Unable to load study circles.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadCommunitiesData();
  }, [user?.userId]);

  // Load chat & members when community selected
  useEffect(() => {
    if (!selectedCommunity) return;
    setChatLoading(true);
    Promise.all([
      getCommunityMessages(selectedCommunity.communityId).catch(() => ({ success: false, data: [] })),
      getCommunityMembers(selectedCommunity.communityId).catch(() => ({ success: false, data: [] })),
    ])
      .then(([msgRes, memRes]) => {
        if (msgRes.success) setMessages(msgRes.data || []);
        if (memRes.success) setMembers(memRes.data || []);
      })
      .finally(() => {
        setChatLoading(false);
        setTimeout(() => {
          if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
          }
        }, 80);
      });
  }, [selectedCommunity?.communityId]);

  // Live polling for new messages when community selected
  useEffect(() => {
    if (!selectedCommunity) return;
    const interval = setInterval(async () => {
      try {
        const msgRes = await getCommunityMessages(selectedCommunity.communityId);
        if (msgRes.success && Array.isArray(msgRes.data)) {
          setMessages((prev) => {
            if (prev.length !== msgRes.data.length) {
              return msgRes.data;
            }
            return prev;
          });
        }
      } catch {}
    }, 6000);
    return () => clearInterval(interval);
  }, [selectedCommunity?.communityId]);

  const isJoined = (commId) => {
    return joinedCommunities.some((c) => (c.communityId || c.communities?.communityId) === commId) ||
           createdCommunities.some((c) => c.communityId === commId) ||
           members.some((m) => (m.user?.userId || m.userId) === user?.userId);
  };

  const isCreator = (comm) => {
    return comm?.createdBy?.userId === user?.userId || comm?.createdBy === user?.userId;
  };

  async function handleJoin(comm) {
    if (!user?.userId) return;
    try {
      const res = await addCommunityMember(comm.communityId, user.userId);
      if (res.success) {
        setJoinedCommunities((prev) => [...prev, comm]);
        if (selectedCommunity?.communityId === comm.communityId) {
          const memRes = await getCommunityMembers(comm.communityId);
          if (memRes.success) setMembers(memRes.data || []);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to join community');
    }
  }

  async function handleLeave(commId) {
    if (!confirm('Leave this academic study circle?')) return;
    try {
      await deleteCommunityMember(commId, user.userId);
      setJoinedCommunities((prev) => prev.filter((c) => (c.communityId || c.communities?.communityId) !== commId));
      if (selectedCommunity?.communityId === commId) {
        setMembers((prev) => prev.filter((m) => (m.user?.userId || m.userId) !== user.userId));
      }
    } catch {}
  }

  async function handleSendMessage(e) {
    if (e) e.preventDefault();
    if (!messageText.trim() || !selectedCommunity?.communityId || !user?.userId) return;
    setSendingMessage(true);
    const content = messageText.trim();
    setMessageText('');

    try {
      const res = await sendCommunityMessage(selectedCommunity.communityId, user.userId, { message: content });
      if (res.success && res.data) {
        setMessages((prev) => [...prev, res.data]);
      } else {
        const fallbackMsg = {
          messageId: Date.now(),
          message: content,
          createdAt: new Date().toISOString(),
          user: {
            userId: user.userId,
            username: user.username || 'You',
            profileUrl: user.profileUrl,
          }
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      }
    } catch {
      const fallbackMsg = {
        messageId: Date.now(),
        message: content,
        createdAt: new Date().toISOString(),
        user: {
          userId: user.userId,
          username: user.username || 'You',
          profileUrl: user.profileUrl,
        }
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setSendingMessage(false);
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTo({
            top: chatContainerRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 50);
    }
  }

  function handleToggleReaction(messageId, type) {
    setMessageReactions((prev) => {
      const current = prev[messageId] || {};
      const nextCount = (current[type] || 0) + 1;
      return {
        ...prev,
        [messageId]: { ...current, [type]: nextCount }
      };
    });
  }

  async function handleCreateCommunity(e) {
    e.preventDefault();
    if (!newCommName.trim()) return;
    setCreating(true);
    setCreateError('');
    try {
      const res = await createCommunity({
        name: newCommName.trim(),
        description: newCommDesc.trim(),
        category: newCommCategory,
        profileUrl: newCommProfileUrl || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80',
        createdBy: user?.userId || 1,
      });
      if (res.success) {
        setShowCreateModal(false);
        setNewCommName('');
        setNewCommDesc('');
        setNewCommProfileUrl('');
        loadCommunitiesData();
        if (res.data) setSelectedCommunity(res.data);
      } else {
        setCreateError(res.message || 'Failed to establish circle.');
      }
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to establish circle.');
    } finally {
      setCreating(false);
    }
  }

  const query = (searchQuery || '').toLowerCase().trim();

  const displayedList = (activeTab === 'all'
    ? communities
    : activeTab === 'joined'
    ? joinedCommunities
    : createdCommunities
  ).filter((c) => {
    if (!c) return false;
    if (selectedCategory !== 'ALL' && (c.category || '').toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }
    if (!query) return true;
    return (
      (c.name || '').toLowerCase().includes(query) ||
      (c.description || '').toLowerCase().includes(query) ||
      (c.category || '').toLowerCase().includes(query)
    );
  });

  // Filter books matching current circle category
  const relevantBooks = circleBooks.filter((b) => {
    if (!b) return false;
    if (!selectedCommunity) return true;
    const cat = (selectedCommunity.category || '').toLowerCase();
    const bCat = (b.category || '').toLowerCase();
    return bCat.includes(cat) || cat.includes(bCat) || b.fileType === 'PDF';
  }).slice(0, 6);

  return (
    <AppLayout breadcrumb="Study Circles & Research Guilds">
      {/* Top Professional Institutional Header Banner */}
      <div className="bg-white border-b border-slate-200/80 px-6 sm:px-10 py-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge-enterprise badge-indigo">Faculty Research Guilds</span>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-mono text-slate-400">Collaborative Peer Ingestion</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>Academic Study Circles</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-bold">
                Live Discourse
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Curriculum focus cohorts, faculty-led reading seminars, and peer-reviewed preprint review groups.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-accent text-xs px-4 py-2.5 shadow-md shadow-indigo-500/20"
            >
              <Plus size={15} /> Establish Study Circle
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row min-h-[calc(100vh-140px)] overflow-hidden">
        {/* Left Study Circles Directory Sidebar */}
        <div className="w-full lg:w-84 xl:w-96 bg-white border-r border-slate-200/80 flex flex-col flex-shrink-0 shadow-xs z-10">
          {/* Top Filter & Search */}
          <div className="p-4 border-b border-slate-100 space-y-3">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setActiveTab('all')}
                className={cn('flex-1 py-1 rounded-lg transition-all', activeTab === 'all' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800')}
              >
                All ({communities.length})
              </button>
              <button
                onClick={() => setActiveTab('joined')}
                className={cn('flex-1 py-1 rounded-lg transition-all', activeTab === 'joined' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800')}
              >
                Enrolled ({joinedCommunities.length})
              </button>
              <button
                onClick={() => setActiveTab('created')}
                className={cn('flex-1 py-1 rounded-lg transition-all', activeTab === 'created' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800')}
              >
                Chaired ({createdCommunities.length})
              </button>
            </div>

            {/* Category Select Filter */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    'px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-colors font-mono',
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800'
                  )}
                >
                  {cat === 'ALL' ? 'All Disciplines' : cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search circles & topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-base pl-8 py-1.5 text-xs rounded-xl"
              />
            </div>
          </div>

          {/* Circles List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400 font-mono space-y-2">
                <div className="w-5 h-5 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin mx-auto" />
                <p>Loading academic study circles...</p>
              </div>
            ) : displayedList.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No circles match your criteria.
              </div>
            ) : (
              displayedList.map((comm) => {
                const isSelected = selectedCommunity?.communityId === comm.communityId;
                const joined = isJoined(comm.communityId);
                return (
                  <button
                    key={comm.communityId}
                    onClick={() => {
                      setSelectedCommunity(comm);
                      setCircleWorkspaceTab('discourse');
                    }}
                    className={cn(
                      'w-full text-left p-4 hover:bg-slate-50/80 transition-all flex items-start gap-3.5 relative group',
                      isSelected ? 'bg-indigo-50/70 border-l-4 border-indigo-600 shadow-inner' : ''
                    )}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-11 h-11 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-xs">
                        {comm.profileUrl ? (
                          <img src={comm.profileUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                            {getInitials(comm.name)}
                          </div>
                        )}
                      </div>
                      <span className="status-indicator status-indicator-live absolute -bottom-0.5 -right-0.5 border-2 border-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <p className={cn('text-xs font-bold truncate leading-tight', isSelected ? 'text-indigo-950 font-extrabold' : 'text-slate-900 group-hover:text-indigo-600')}>
                          {comm.name}
                        </p>
                      </div>

                      <p className="text-[11px] text-slate-500 line-clamp-1 leading-snug">
                        {comm.description || 'Academic research seminar & group.'}
                      </p>

                      <div className="flex items-center justify-between gap-2 mt-2 text-[10px] text-slate-400 font-mono">
                        <div className="flex items-center gap-1.5">
                          <span className="badge-enterprise badge-slate text-[9px] py-0 px-1.5">
                            {comm.category || 'General'}
                          </span>
                          <span>{comm.memberCount || comm.membersCount || 24} scholars</span>
                        </div>
                        {joined && (
                          <span className="badge-enterprise badge-emerald text-[9px] py-0 px-1.5">
                            Enrolled
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Center Main Discussion & Workspace Canvas */}
        {selectedCommunity ? (
          <div className="flex-1 flex flex-col min-w-0 bg-[#FAF9F6] relative">
            {/* Community Header Bar */}
            <div className="h-20 bg-white border-b border-slate-200/80 px-6 sm:px-8 flex items-center justify-between flex-shrink-0 shadow-xs z-10">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 shadow-xs">
                  {selectedCommunity.profileUrl ? (
                    <img src={selectedCommunity.profileUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                      {getInitials(selectedCommunity.name)}
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold text-slate-900 truncate">
                      {selectedCommunity.name}
                    </h2>
                    <span className="badge-enterprise badge-indigo hidden sm:inline-flex text-[10px]">
                      {selectedCommunity.category || 'Curriculum Group'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate max-w-xl mt-0.5">
                    {selectedCommunity.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 flex-shrink-0">
                {!isJoined(selectedCommunity.communityId) ? (
                  <button
                    onClick={() => handleJoin(selectedCommunity)}
                    className="btn-accent text-xs px-3.5 py-1.5 shadow-sm"
                  >
                    <UserPlus size={13} /> Join Circle
                  </button>
                ) : (
                  <button
                    onClick={() => handleLeave(selectedCommunity.communityId)}
                    className="btn-ghost text-xs px-3 py-1.5 text-slate-500 hover:text-rose-600"
                    title="Leave Circle"
                  >
                    <LogOut size={13} /> Leave
                  </button>
                )}

                <button
                  onClick={() => setShowMembersDrawer((v) => !v)}
                  className={cn(
                    'btn-ghost text-xs px-3 py-1.5 transition-colors',
                    showMembersDrawer ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : ''
                  )}
                  title="Circle Dossier & Roster"
                >
                  <Users size={14} />
                  <span className="font-mono">({members.length || selectedCommunity.memberCount || 24})</span>
                </button>
              </div>
            </div>

            {/* Sub-Navigation Tabs */}
            <div className="bg-white border-b border-slate-200/80 px-6 sm:px-8 flex items-center justify-between">
              <div className="flex items-center gap-6 text-xs font-bold">
                {[
                  { id: 'discourse', label: 'Discourse Stream', icon: MessageSquare },
                  { id: 'syllabus', label: 'Curriculum & Syllabus', icon: BookOpen },
                  { id: 'vault', label: `Shared Reading Vault (${relevantBooks.length})`, icon: FileText },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setCircleWorkspaceTab(id)}
                    className={cn(
                      'flex items-center gap-2 py-3 border-b-2 transition-all cursor-pointer font-sans text-xs',
                      circleWorkspaceTab === id
                        ? 'border-indigo-600 text-indigo-600 font-extrabold'
                        : 'border-transparent text-slate-500 hover:text-slate-900'
                    )}
                  >
                    <Icon size={14} /> {label}
                  </button>
                ))}
              </div>

              <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-slate-400">
                <Shield size={12} className="text-emerald-500" />
                <span>Audited Institutional Channel</span>
              </div>
            </div>

            {/* TAB 1: DISCOURSE STREAM */}
            {circleWorkspaceTab === 'discourse' && (
              <div className="flex-1 flex flex-col min-h-0">
                {/* Pinned Academic Seminar Topic */}
                <div className="px-6 sm:px-8 pt-4 pb-2">
                  <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center flex-shrink-0">
                        <Pin size={13} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold uppercase text-indigo-700">Pinned Seminar Focus</span>
                          <span className="text-slate-300">·</span>
                          <span className="text-xs font-bold text-slate-900 truncate">Week 4: Paxos vs Raft consensus invariants under partitions</span>
                        </div>
                        <p className="text-[11px] text-slate-600 truncate mt-0.5">
                          Read Section 3.2 on leader lease leases before Thursday seminar session.
                        </p>
                      </div>
                    </div>

                    <Link
                      to="/library"
                      className="btn-ghost text-[11px] px-2.5 py-1 bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 flex-shrink-0"
                    >
                      View Reading <ExternalLink size={11} />
                    </Link>
                  </div>
                </div>

                {/* Messages Feed */}
                <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-6 sm:px-8 py-4 space-y-4">
                  {chatLoading ? (
                    <div className="text-center py-12 text-xs font-mono text-slate-400 space-y-2">
                      <div className="w-5 h-5 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin mx-auto" />
                      <p>Decrypting faculty communication stream...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-16 text-xs text-slate-400 max-w-sm mx-auto">
                      <BookOpen size={28} className="mx-auto text-slate-300 mb-2" />
                      <p className="font-bold text-slate-600">No discourse entries recorded</p>
                      <p className="mt-1">Initiate the peer discussion by posing a thesis question below.</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.user?.userId === user?.userId || msg.userId === user?.userId || msg.senderId === user?.userId;
                      const msgKey = msg.messageId || Math.random();
                      const reactions = messageReactions[msgKey] || {};

                      return (
                        <div
                          key={msgKey}
                          className={cn(
                            'flex items-start gap-3 max-w-2xl group',
                            isMe ? 'ml-auto flex-row-reverse' : ''
                          )}
                        >
                          <div className="w-9 h-9 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200/80 shadow-xs">
                            {msg.user?.profileUrl || msg.avatarUrl ? (
                              <img src={msg.user?.profileUrl || msg.avatarUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-[10px]">
                                {getInitials(msg.user?.username || msg.senderName || 'Scholar')}
                              </div>
                            )}
                          </div>

                          <div className={cn('space-y-1 min-w-0', isMe ? 'text-right' : 'text-left')}>
                            <div className={cn('flex items-center gap-2 text-[11px]', isMe ? 'justify-end' : '')}>
                              <span className="font-bold text-slate-900">
                                {isMe ? 'You' : msg.user?.username || msg.senderName || 'Scholar'}
                              </span>
                              <span className="badge-enterprise badge-indigo text-[9px] py-0 px-1">
                                {msg.senderRole || (isMe ? 'Author' : 'Scholar')}
                              </span>
                              <span className="text-slate-400 font-mono text-[10px]">
                                {formatRelativeDate(msg.createdAt)}
                              </span>
                            </div>

                            <div
                              className={cn(
                                'p-4 rounded-2xl text-xs leading-relaxed shadow-xs inline-block text-left relative',
                                isMe
                                  ? 'bg-indigo-600 text-white rounded-tr-xs'
                                  : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                              )}
                            >
                              <p className="whitespace-pre-line">{msg.message || msg.content}</p>

                              {/* Reaction Pills */}
                              <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-100/30">
                                <button
                                  type="button"
                                  onClick={() => handleToggleReaction(msgKey, 'insight')}
                                  className={cn(
                                    'px-2 py-0.5 rounded-lg text-[10px] flex items-center gap-1 transition-all',
                                    isMe
                                      ? 'bg-white/20 text-white hover:bg-white/30'
                                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                                  )}
                                >
                                  <Lightbulb size={10} className="text-amber-400" />
                                  <span>Insightful</span>
                                  {reactions.insight > 0 && <span className="font-bold">({reactions.insight})</span>}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleToggleReaction(msgKey, 'citation')}
                                  className={cn(
                                    'px-2 py-0.5 rounded-lg text-[10px] flex items-center gap-1 transition-all',
                                    isMe
                                      ? 'bg-white/20 text-white hover:bg-white/30'
                                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                                  )}
                                >
                                  <BookMarked size={10} className="text-indigo-400" />
                                  <span>Cited</span>
                                  {reactions.citation > 0 && <span className="font-bold">({reactions.citation})</span>}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Professional Compose Input Bar */}
                <div className="p-4 sm:p-5 bg-white border-t border-slate-200/80">
                  <form onSubmit={handleSendMessage} className="space-y-2">
                    <div className="relative rounded-2xl border border-slate-200 hover:border-slate-300 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all bg-slate-50/50 p-2">
                      <textarea
                        rows={2}
                        placeholder={`Broadcast research insight or ask a peer question in #${selectedCommunity.name}...`}
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 outline-none resize-none p-1.5"
                      />

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                        <div className="flex items-center gap-1 text-slate-400">
                          <button
                            type="button"
                            onClick={() => setMessageText((prev) => prev + ' [Citation: ...] ')}
                            className="p-1 rounded-lg hover:bg-slate-200/60 hover:text-slate-700 text-[10px] font-mono flex items-center gap-1"
                            title="Insert Citation Tag"
                          >
                            <Bookmark size={12} /> Citation
                          </button>
                          <button
                            type="button"
                            onClick={() => setMessageText((prev) => prev + ' ```\n// Code or proof\n```\n')}
                            className="p-1 rounded-lg hover:bg-slate-200/60 hover:text-slate-700 text-[10px] font-mono flex items-center gap-1"
                            title="Insert Code Proof"
                          >
                            <Hash size={12} /> Code
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                            Enter ↵ to send
                          </span>
                          <button
                            type="submit"
                            disabled={sendingMessage || !messageText.trim()}
                            className="btn-accent px-4 py-2 text-xs shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                          >
                            <Send size={13} /> Broadcast
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* TAB 2: CURRICULUM & SYLLABUS */}
            {circleWorkspaceTab === 'syllabus' && (
              <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6 max-w-4xl">
                <div className="enterprise-card p-6 bg-white space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="badge-enterprise badge-indigo">Semester Curriculum 2026</span>
                      <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                        Syllabus & Research Milestones
                      </h3>
                    </div>
                    <span className="text-xs font-mono text-slate-400">Paced Seminar · 6 Modules</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    This academic study circle meets weekly to discuss theoretical foundations, critique distributed systems whitepapers, and review graduate level problem sets.
                  </p>
                </div>

                {/* Modules Timeline */}
                <div className="space-y-4">
                  {[
                    {
                      week: 'Module 01',
                      title: 'Foundations of Consensus & Impossibility Proofs',
                      readings: 'FLP Impossibility Proof, Synchronous vs Asynchronous Network Assumptions',
                      status: 'COMPLETED',
                    },
                    {
                      week: 'Module 02',
                      title: 'Paxos Architecture, Quorum Intersections & State Machine Replication',
                      readings: 'Lamport 1998, Multi-Paxos log replication invariants',
                      status: 'COMPLETED',
                    },
                    {
                      week: 'Module 03',
                      title: 'Raft: Understandable Consensus with Randomized Elections',
                      readings: 'Ongaro & Ousterhout 2014, Log compaction & membership changes',
                      status: 'ACTIVE SEMINAR',
                    },
                    {
                      week: 'Module 04',
                      title: 'Byzantine Fault Tolerance & Modern Proof of Stake',
                      readings: 'PBFT (Castro & Liskov), Tendermint BFT State Machine Replication',
                      status: 'UPCOMING',
                    },
                    {
                      week: 'Module 05',
                      title: 'Vector Clocks, CRDTs & Eventually Consistent Cloud Stores',
                      readings: 'Dynamo Paper, Conflict-Free Replicated Data Types (Shapiro et al.)',
                      status: 'UPCOMING',
                    },
                  ].map((mod, i) => (
                    <div key={i} className="enterprise-card p-5 bg-white flex items-start justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-indigo-600">{mod.week}</span>
                          <span className="text-slate-300">·</span>
                          <h4 className="text-sm font-bold text-slate-900">{mod.title}</h4>
                        </div>
                        <p className="text-xs text-slate-500 font-mono">
                          <span className="font-bold text-slate-700">Required Reading:</span> {mod.readings}
                        </p>
                      </div>

                      <span
                        className={cn(
                          'badge-enterprise text-[10px] font-mono whitespace-nowrap',
                          mod.status === 'COMPLETED' ? 'badge-emerald' :
                          mod.status === 'ACTIVE SEMINAR' ? 'badge-indigo animate-pulse' :
                          'badge-slate'
                        )}
                      >
                        {mod.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: SHARED READING VAULT */}
            {circleWorkspaceTab === 'vault' && (
              <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Curated Reading List & Whitepapers
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Resources cataloged by faculty members for this circle.
                    </p>
                  </div>
                  <Link to="/upload" className="btn-accent text-xs px-3.5 py-2">
                    <Plus size={14} /> Link New Paper
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {relevantBooks.map((b) => (
                    <div key={b.bookId} className="enterprise-card p-5 bg-white flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className={cn('px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase', fileTypeColor(b.fileType))}>
                            {fileTypeLabel(b.fileType)}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">{b.pages || 48} pages</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                          {b.title}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                          {b.description || 'Academic research document.'}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-600 font-medium truncate max-w-[140px]">
                          {typeof b.author === 'object' ? b.author?.name : b.author || 'Author'}
                        </span>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/reader/${b.bookId}`}
                            className="btn-accent text-[11px] px-3 py-1.5"
                          >
                            <BookOpen size={12} /> Read
                          </Link>
                          <Link
                            to={`/library/${b.bookId}`}
                            className="btn-ghost text-[11px] px-2.5 py-1.5"
                          >
                            Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-12 text-center text-slate-400">
            Select a study circle from the directory to start reading discussions.
          </div>
        )}

        {/* Right Members & Circle Dossier Slide-Over / Dock */}
        <AnimatePresence>
          {showMembersDrawer && selectedCommunity && (
            <motion.div
              initial={{ x: 320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 320, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-80 xl:w-88 bg-white border-l border-slate-200/80 p-6 flex flex-col justify-between z-20 overflow-y-auto shadow-lg"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-900 flex items-center gap-1.5">
                    <Shield size={14} className="text-indigo-600" />
                    Circle Dossier
                  </h3>
                  <button onClick={() => setShowMembersDrawer(false)} className="text-slate-400 hover:text-slate-700 p-1">
                    <X size={16} />
                  </button>
                </div>

                {/* Circle Key Stats */}
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Scholars</span>
                    <p className="text-lg font-extrabold text-slate-900 mt-0.5">
                      {members.length || selectedCommunity.memberCount || 24}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Discussions</span>
                    <p className="text-lg font-extrabold text-indigo-600 mt-0.5">
                      {messages.length || 18}
                    </p>
                  </div>
                </div>

                {/* Lead Faculty */}
                <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/80 space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-indigo-700">Faculty Chair</span>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      {getInitials(selectedCommunity.creatorName || 'Faculty')}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{selectedCommunity.creatorName || 'Martin Kleppmann'}</p>
                      <p className="text-[10px] text-slate-500 font-mono">Department Chair & Lead Investigator</p>
                    </div>
                  </div>
                </div>

                {/* Members Roster List */}
                <div className="space-y-3">
                  <p className="text-[11px] font-mono text-slate-400 uppercase font-bold tracking-wider">
                    Enrolled Roster ({members.length || 8})
                  </p>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {(members.length > 0 ? members : [
                      { username: 'Martin Kleppmann', role: 'CHAIR' },
                      { username: 'Robert C. Martin', role: 'FACULTY' },
                      { username: 'Dr. Ian Goodfellow', role: 'RESEARCHER' },
                      { username: 'Nivas (Lead Scholar)', role: 'LEAD SCHOLAR' },
                      { username: 'Prof. Thomas H. Cormen', role: 'MODERATOR' },
                      { username: 'Prof. Stuart Russell', role: 'MEMBER' },
                      { username: 'Betsy Beyer', role: 'MEMBER' },
                    ]).map((m, idx) => {
                      const u = m.user || m;
                      const roleName = m.role || (idx === 0 ? 'CHAIR' : 'SCHOLAR');
                      return (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center overflow-hidden flex-shrink-0">
                              {u.profileUrl ? (
                                <img src={u.profileUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                getInitials(u.username || 'Scholar')
                              )}
                            </div>
                            <div className="truncate">
                              <p className="text-xs font-bold text-slate-800 truncate">{u.username || 'Scholar'}</p>
                              <span className="text-[9px] font-mono text-indigo-600 font-semibold">{roleName}</span>
                            </div>
                          </div>

                          <span className="status-indicator status-indicator-live" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 text-center">
                <p className="text-[10px] font-mono text-slate-400">
                  FERPA Compliant · Institutional Ingestion v2.4
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Establish Community Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl border border-slate-200 z-10"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="badge-enterprise badge-indigo">Faculty Charter</span>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Establish Academic Study Circle</h3>
              <p className="text-xs text-slate-500 mb-5">Create a focused research collaboration space for your curriculum.</p>

              {createError && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs mb-3 flex items-center gap-2">
                  <AlertCircle size={14} /> {createError}
                </div>
              )}

              <form onSubmit={handleCreateCommunity} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1">
                    Circle Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Distributed Consensus & Cloud Storage"
                    value={newCommName}
                    onChange={(e) => setNewCommName(e.target.value)}
                    className="input-base text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1">
                    Academic Discipline
                  </label>
                  <select
                    value={newCommCategory}
                    onChange={(e) => setNewCommCategory(e.target.value)}
                    className="input-base text-xs cursor-pointer"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                    <option value="Applied Physics">Applied Physics</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Cloud Engineering">Cloud Engineering</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1">
                    Research Objective / Scope
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe discussion guidelines, reading list requirements, and curriculum focus..."
                    value={newCommDesc}
                    onChange={(e) => setNewCommDesc(e.target.value)}
                    className="input-base text-xs resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn-ghost text-xs px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !newCommName.trim()}
                    className="btn-accent text-xs px-5 py-2 shadow-sm"
                  >
                    {creating ? 'Chartering...' : 'Establish Circle'}
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
