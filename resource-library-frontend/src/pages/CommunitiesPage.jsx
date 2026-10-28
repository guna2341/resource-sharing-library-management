import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Plus, MessageSquare, Send, Trash2, ArrowLeft, Shield,
  UserPlus, UserMinus, Sparkles, Image as ImageIcon, Search, Check,
  Layers, ExternalLink, MoreVertical, LogOut, Info, AlertCircle,
  BookOpen, Hash, Flame, ChevronRight, X, Clock, Calendar, Bookmark,
  Award, FileText, CornerDownRight, CheckCircle2, Share2, ThumbsUp,
  Lightbulb, BookMarked, Pin, CheckSquare, Square, Copy, Link as LinkIcon
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import {
  getCommunities, getCommunitiesCreatedByUser, getCommunitiesUserIn,
  createCommunity, updateCommunity, deleteCommunity,
  getCommunityMembers, addCommunityMember, deleteCommunityMember,
  getCommunityMessages, sendCommunityMessage, deleteCommunityMessage
} from '../api/communities';
import { getBooks } from '../api/books';
import { AppLayout } from '../components/layout/AppLayout';
import { selectCurrentUser } from '../features/auth/authSlice';
import { cn, getInitials, formatDate, formatRelativeDate, fileTypeColor, fileTypeLabel } from '../lib/utils';

const DEFAULT_SYLLABUS = {
  'Computer Science': [
    { id: 1, week: 'Module 01', title: 'Foundations of Consensus & Impossibility Proofs', readings: 'FLP Impossibility Proof, Network Asynchrony Assumptions', completed: true },
    { id: 2, week: 'Module 02', title: 'Paxos Architecture, Quorum Intersections & State Machine Replication', readings: 'Lamport 1998, Multi-Paxos log replication invariants', completed: true },
    { id: 3, week: 'Module 03', title: 'Raft: Understandable Consensus with Randomized Elections', readings: 'Ongaro & Ousterhout 2014, Log compaction & membership changes', completed: false },
    { id: 4, week: 'Module 04', title: 'Byzantine Fault Tolerance & State Machine Replication', readings: 'PBFT (Castro & Liskov), Tendermint BFT State Machine Replication', completed: false },
    { id: 5, week: 'Module 05', title: 'Vector Clocks, CRDTs & Conflict-Free Cloud Stores', readings: 'Dynamo Paper, Conflict-Free Replicated Data Types (Shapiro et al.)', completed: false },
  ],
  'Artificial Intelligence': [
    { id: 1, week: 'Module 01', title: 'Attention Mechanisms & Transformer Scaling Laws', readings: 'Vaswani et al., Chinchilla Scaling Laws for LLMs', completed: true },
    { id: 2, week: 'Module 02', title: 'FlashAttention & Fast Hardware-Aware Memory Tiling', readings: 'Dao et al. (Stanford), IO-Aware Exact Attention', completed: false },
    { id: 3, week: 'Module 03', title: 'Direct Preference Optimization & Aligning LLMs', readings: 'Rafailov et al., DPO vs PPO Reinforcement Learning', completed: false },
    { id: 4, week: 'Module 04', title: 'Mixture-of-Experts & Sparsity Routing Architectures', readings: 'Switch Transformers & GShard Routing Mechanisms', completed: false },
    { id: 5, week: 'Module 05', title: 'Parameter-Efficient Fine-Tuning (LoRA & QLoRA)', readings: 'Hu et al., Low-Rank Adaptation of Large Language Models', completed: false },
  ],
  'Applied Physics': [
    { id: 1, week: 'Module 01', title: 'Quantum Decoherence & Open Quantum Systems', readings: 'Nielsen & Chuang, Lindblad Master Equation', completed: true },
    { id: 2, week: 'Module 02', title: 'Topological Quantum Error Correcting Codes', readings: 'Kitaev Surface Code, Stabilizer Formalism', completed: false },
    { id: 3, week: 'Module 03', title: 'Condensed Matter Statistical Physics & Ising Models', readings: 'Kadanoff Scaling, Renormalization Group', completed: false },
    { id: 4, week: 'Module 04', title: 'Non-Equilibrium Thermodynamics & Fluctuation Theorems', readings: 'Jarzynski Equality, Crooks Fluctuation Theorem', completed: false },
  ],
  'Mathematics': [
    { id: 1, week: 'Module 01', title: 'Differential Geometry & Smooth Manifolds', readings: 'Spivak Differential Geometry, Stokes Theorem on Manifolds', completed: true },
    { id: 2, week: 'Module 02', title: 'Homological Algebra & Category Theory', readings: 'Mac Lane Categories for Working Mathematician', completed: false },
    { id: 3, week: 'Module 03', title: 'Spectral Graph Theory & Expander Graphs', readings: 'Cheeger Inequality, Graph Laplacian Eigenvalues', completed: false },
    { id: 4, week: 'Module 04', title: 'Algebraic Number Theory & Galois Cohomology', readings: 'Neukirch Algebraic Number Theory, Local Fields', completed: false },
  ],
  'Cloud Engineering': [
    { id: 1, week: 'Module 01', title: 'LSM-Trees vs B-Trees in Modern Storage Engines', readings: 'RocksDB Architecture & O\'Neil LSM-Tree Analysis', completed: true },
    { id: 2, week: 'Module 02', title: 'Distributed Orchestration & Etcd Raft Consistency', readings: 'Kubernetes API Server Informers, Raft Quorum Invariants', completed: false },
    { id: 3, week: 'Module 03', title: 'Zero-Trust Service Meshes & eBPF Kernel Observability', readings: 'Envoy Proxy Architecture, Cilium eBPF Network Datapath', completed: false },
    { id: 4, week: 'Module 04', title: 'Site Reliability Engineering & Error Budget Governance', readings: 'Google SRE Book, Automated Incident Mitigation', completed: false },
  ],
  'General': [
    { id: 1, week: 'Module 01', title: 'Methodology, Literature Review & Research Formulations', readings: 'Peer-reviewed academic research guidelines', completed: true },
    { id: 2, week: 'Module 02', title: 'Empirical Experimentation & Data Validation', readings: 'Reproducibility in scientific computing', completed: false },
    { id: 3, week: 'Module 03', title: 'Preprint Peer Review & Scholarly Defense', readings: 'Conference submission and rebuttals', completed: false },
  ]
};

export default function CommunitiesPage() {
  const user = useSelector(selectCurrentUser);
  const [searchParams, setSearchParams] = useSearchParams();
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
  const [syllabusModules, setSyllabusModules] = useState([]);
  const [pinnedBookIds, setPinnedBookIds] = useState([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const chatContainerRef = useRef(null);

  // Create Community Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCommName, setNewCommName] = useState('');
  const [newCommDesc, setNewCommDesc] = useState('');
  const [newCommCategory, setNewCommCategory] = useState('Computer Science');
  const [newCommProfileUrl, setNewCommProfileUrl] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Add Book to Vault Modal
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [bookVaultSearch, setBookVaultSearch] = useState('');

  // Add Milestone Modal
  const [showAddMilestoneModal, setShowAddMilestoneModal] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneWeek, setNewMilestoneWeek] = useState('');
  const [newMilestoneReadings, setNewMilestoneReadings] = useState('');

  const CATEGORIES = [
    'ALL',
    'Computer Science',
    'Artificial Intelligence',
    'Applied Physics',
    'Mathematics',
    'Cloud Engineering'
  ];

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  }

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
        let commList = [];
        if (allRes.success && Array.isArray(allRes.data)) {
          commList = allRes.data;
          setCommunities(commList);
        }
        if (joinedRes.success && Array.isArray(joinedRes.data)) {
          setJoinedCommunities(joinedRes.data);
        }
        if (createdRes.success && Array.isArray(createdRes.data)) {
          setCreatedCommunities(createdRes.data);
        }
        if (booksRes.success && Array.isArray(booksRes.data)) {
          setCircleBooks(booksRes.data);
        }

        // Check for URL param ?id=... or default to first
        const paramId = searchParams.get('id');
        if (commList.length > 0) {
          if (paramId) {
            const found = commList.find((c) => String(c.communityId) === String(paramId));
            if (found) setSelectedCommunity(found);
            else setSelectedCommunity(commList[0]);
          } else if (!selectedCommunity) {
            setSelectedCommunity(commList[0]);
          }
        }
      })
      .catch((err) => setError(err.response?.data?.message || 'Unable to load study circles.'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadCommunitiesData();
  }, [user?.userId]);

  // Load community-specific state (chat, members, syllabus, pinned books, reactions)
  useEffect(() => {
    if (!selectedCommunity) return;
    const commId = selectedCommunity.communityId;

    // Load Reactions from localStorage
    try {
      const storedReactions = localStorage.getItem(`rs_circle_reactions_${commId}`);
      if (storedReactions) setMessageReactions(JSON.parse(storedReactions));
      else setMessageReactions({});
    } catch {
      setMessageReactions({});
    }

    // Load Pinned Books from localStorage
    try {
      const storedVault = localStorage.getItem(`rs_circle_vault_${commId}`);
      if (storedVault) setPinnedBookIds(JSON.parse(storedVault));
      else setPinnedBookIds([]);
    } catch {
      setPinnedBookIds([]);
    }

    // Load Syllabus from localStorage or fallback
    try {
      const storedSyllabus = localStorage.getItem(`rs_circle_syllabus_${commId}`);
      if (storedSyllabus) {
        setSyllabusModules(JSON.parse(storedSyllabus));
      } else {
        const cat = selectedCommunity.category || 'General';
        const fallback = DEFAULT_SYLLABUS[cat] || DEFAULT_SYLLABUS['General'];
        setSyllabusModules(fallback);
      }
    } catch {
      setSyllabusModules(DEFAULT_SYLLABUS['General']);
    }

    setChatLoading(true);
    Promise.all([
      getCommunityMessages(commId).catch(() => ({ success: false, data: [] })),
      getCommunityMembers(commId).catch(() => ({ success: false, data: [] })),
    ])
      .then(([msgRes, memRes]) => {
        if (msgRes.success && Array.isArray(msgRes.data)) {
          setMessages(msgRes.data);
        }
        if (memRes.success && Array.isArray(memRes.data)) {
          setMembers(memRes.data);
        }
      })
      .finally(() => {
        setChatLoading(false);
        setTimeout(() => {
          if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
          }
        }, 100);
      });
  }, [selectedCommunity?.communityId]);

  // Live polling for discourse stream without overwriting newly sent messages
  useEffect(() => {
    if (!selectedCommunity) return;
    const interval = setInterval(async () => {
      try {
        const msgRes = await getCommunityMessages(selectedCommunity.communityId);
        if (msgRes.success && Array.isArray(msgRes.data)) {
          setMessages((prev) => {
            const serverIds = new Set(msgRes.data.map((m) => String(m.id || m.messageId)));
            // Keep any locally created message that isn't yet in server list
            const pending = prev.filter((p) => {
              const pId = String(p.id || p.messageId);
              const pText = (p.content || p.message || '').trim();
              return !serverIds.has(pId) && !msgRes.data.some((m) => (m.content || m.message || '').trim() === pText);
            });
            const merged = [...msgRes.data, ...pending];
            merged.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
            return merged;
          });
        }
      } catch {}
    }, 4500);
    return () => clearInterval(interval);
  }, [selectedCommunity?.communityId]);

  const isJoined = (commId) => {
    if (!commId) return false;
    const inJoined = joinedCommunities.some((c) => (c.communityId || c.communities?.communityId) === commId);
    const inCreated = createdCommunities.some((c) => c.communityId === commId);
    const inMembers = members.some((m) => (m.user?.userId || m.communities?.user?.userId || m.userId) === user?.userId);
    return inJoined || inCreated || inMembers;
  };

  async function handleJoin(comm) {
    if (!user?.userId) {
      showToast('Please sign in to join study circles.');
      return;
    }
    try {
      const res = await addCommunityMember(comm.communityId, user.userId);
      setJoinedCommunities((prev) => [...prev, comm]);
      setCommunities((prev) =>
        prev.map((c) => (c.communityId === comm.communityId ? { ...c, memberCount: (c.memberCount || 0) + 1, isJoined: true } : c))
      );
      if (selectedCommunity?.communityId === comm.communityId) {
        setSelectedCommunity((prev) => ({ ...prev, memberCount: (prev.memberCount || 0) + 1, isJoined: true }));
        const memRes = await getCommunityMembers(comm.communityId);
        if (memRes.success && Array.isArray(memRes.data)) setMembers(memRes.data);
        else {
          setMembers((prev) => [
            ...prev,
            {
              communityMemberId: Date.now(),
              role: 'SCHOLAR',
              user: { userId: user.userId, username: user.username || 'You', profileUrl: user.profileUrl }
            }
          ]);
        }
      }
      showToast(`Enrolled in "${comm.name}"! Welcome to the circle.`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to join community');
    }
  }

  async function handleLeave(commId) {
    if (!commId) return;
    if (!confirm('Leave this academic study circle?')) return;
    try {
      const memObj = members.find((m) => (m.user?.userId || m.communities?.user?.userId || m.userId) === user?.userId);
      const memberRecordId = memObj?.communityMemberId;

      await deleteCommunityMember(memberRecordId, commId);

      setJoinedCommunities((prev) => prev.filter((c) => (c.communityId || c.communities?.communityId) !== commId));
      setCommunities((prev) =>
        prev.map((c) => (c.communityId === commId ? { ...c, memberCount: Math.max(0, (c.memberCount || 1) - 1), isJoined: false } : c))
      );
      if (selectedCommunity?.communityId === commId) {
        setSelectedCommunity((prev) => ({ ...prev, memberCount: Math.max(0, (prev.memberCount || 1) - 1), isJoined: false }));
        setMembers((prev) => prev.filter((m) => (m.user?.userId || m.communities?.user?.userId || m.userId) !== user?.userId));
      }
      showToast('You have departed the study circle.');
    } catch {
      showToast('Left study circle.');
    }
  }

  async function handleSendMessage(e) {
    if (e) e.preventDefault();
    if (!messageText.trim() || !selectedCommunity?.communityId) return;
    const content = messageText.trim();
    setMessageText('');
    setSendingMessage(true);

    const currentUserId = user?.userId || 1;
    const currentUsername = user?.username || 'You';
    const currentProfileUrl = user?.profileUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80';
    const localMsgId = Date.now();

    const optimisticMsg = {
      messageId: localMsgId,
      id: localMsgId,
      content: content,
      message: content,
      createdAt: new Date().toISOString(),
      user: {
        userId: currentUserId,
        username: currentUsername,
        profileUrl: currentProfileUrl,
      },
      sender: {
        userId: currentUserId,
        username: currentUsername,
        profileUrl: currentProfileUrl,
      },
      senderId: {
        userId: currentUserId,
        username: currentUsername,
        profileUrl: currentProfileUrl,
      }
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await sendCommunityMessage(selectedCommunity.communityId, currentUserId, {
        content,
        username: currentUsername,
        profileUrl: currentProfileUrl,
      });

      if (res.success && res.data) {
        const confirmedId = res.data.id || res.data.messageId || localMsgId;
        setMessages((prev) =>
          prev.map((m) =>
            m.messageId === localMsgId || m.id === localMsgId
              ? { ...optimisticMsg, ...res.data, id: confirmedId, messageId: confirmedId }
              : m
          )
        );
      }
    } catch {
      // Optimistic message remains in state
    } finally {
      setSendingMessage(false);
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTo({
            top: chatContainerRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 60);
    }
  }

  async function handleDeleteMessage(msgId) {
    if (!msgId) return;
    try {
      await deleteCommunityMessage(msgId);
      setMessages((prev) => prev.filter((m) => String(m.id || m.messageId) !== String(msgId)));
      showToast('Discourse note removed.');
    } catch {
      setMessages((prev) => prev.filter((m) => String(m.id || m.messageId) !== String(msgId)));
    }
  }

  function handleToggleReaction(messageId, type) {
    setMessageReactions((prev) => {
      const current = prev[messageId] || {};
      const nextVal = (current[type] || 0) + 1;
      const updated = { ...prev, [messageId]: { ...current, [type]: nextVal } };
      if (selectedCommunity?.communityId) {
        try {
          localStorage.setItem(`rs_circle_reactions_${selectedCommunity.communityId}`, JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });
  }

  // Toggle Syllabus Milestone Completion
  function handleToggleMilestone(modId) {
    setSyllabusModules((prev) => {
      const updated = prev.map((m) => (m.id === modId ? { ...m, completed: !m.completed } : m));
      if (selectedCommunity?.communityId) {
        try {
          localStorage.setItem(`rs_circle_syllabus_${selectedCommunity.communityId}`, JSON.stringify(updated));
        } catch {}
      }
      const target = updated.find((m) => m.id === modId);
      showToast(target?.completed ? 'Milestone marked as complete! 🎉' : 'Milestone marked as pending.');
      return updated;
    });
  }

  // Add Custom Milestone
  function handleAddMilestone(e) {
    e.preventDefault();
    if (!newMilestoneTitle.trim() || !selectedCommunity?.communityId) return;
    const newMod = {
      id: Date.now(),
      week: newMilestoneWeek.trim() || `Module 0${syllabusModules.length + 1}`,
      title: newMilestoneTitle.trim(),
      readings: newMilestoneReadings.trim() || 'Required academic chapter reading',
      completed: false
    };
    const updated = [...syllabusModules, newMod];
    setSyllabusModules(updated);
    try {
      localStorage.setItem(`rs_circle_syllabus_${selectedCommunity.communityId}`, JSON.stringify(updated));
    } catch {}
    setNewMilestoneTitle('');
    setNewMilestoneWeek('');
    setNewMilestoneReadings('');
    setShowAddMilestoneModal(false);
    showToast('Seminar milestone added to curriculum!');
  }

  // Pin Book to Vault
  function handlePinBookToVault(bookId) {
    if (!selectedCommunity?.communityId) return;
    const updated = Array.from(new Set([...pinnedBookIds, bookId]));
    setPinnedBookIds(updated);
    try {
      localStorage.setItem(`rs_circle_vault_${selectedCommunity.communityId}`, JSON.stringify(updated));
    } catch {}
    setShowAddBookModal(false);
    showToast('Manuscript linked to Circle Vault!');
  }

  // Unpin Book from Vault
  function handleUnpinBookFromVault(bookId) {
    if (!selectedCommunity?.communityId) return;
    const updated = pinnedBookIds.filter((id) => id !== bookId);
    setPinnedBookIds(updated);
    try {
      localStorage.setItem(`rs_circle_vault_${selectedCommunity.communityId}`, JSON.stringify(updated));
    } catch {}
    showToast('Manuscript removed from vault.');
  }

  // Copy Circle Invite Link
  function handleCopyInvite() {
    if (!selectedCommunity) return;
    const inviteUrl = `${window.location.origin}/communities?id=${selectedCommunity.communityId}`;
    navigator.clipboard.writeText(inviteUrl);
    showToast('Invite link copied to clipboard! 📋');
  }

  // Cite Book into Discourse
  function handleCiteBook(book) {
    setCircleWorkspaceTab('discourse');
    const citation = `[Citation: "${book.title}" by ${typeof book.author === 'object' ? book.author?.name : book.author || 'Author'}] `;
    setMessageText((prev) => prev ? `${prev} ${citation}` : citation);
    showToast(`Cited "${book.title}" in discourse composer.`);
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
        profileUrl: newCommProfileUrl.trim() || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80',
        createdBy: user?.userId || 1,
      });
      if (res.success) {
        setShowCreateModal(false);
        setNewCommName('');
        setNewCommDesc('');
        setNewCommProfileUrl('');
        loadCommunitiesData();
        if (res.data) setSelectedCommunity(res.data);
        showToast('Academic study circle established! 🎉');
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

  // Combine Category-matched books + pinned books for the vault
  const categoryMatchedBooks = circleBooks.filter((b) => {
    if (!b) return false;
    if (!selectedCommunity) return true;
    const cat = (selectedCommunity.category || '').toLowerCase();
    const bCat = (b.category || '').toLowerCase();
    return bCat.includes(cat) || cat.includes(bCat) || b.fileType === 'PDF';
  });

  const pinnedBooksList = circleBooks.filter((b) => pinnedBookIds.includes(b.bookId));
  
  // Merge unique books: pinned books first, then category matched
  const vaultBooks = [
    ...pinnedBooksList,
    ...categoryMatchedBooks.filter((cb) => !pinnedBookIds.includes(cb.bookId))
  ].slice(0, 12);

  // Filter scholars in roster drawer
  const rosterQuery = (memberSearchQuery || '').toLowerCase().trim();
  const displayedMembers = (members.length > 0 ? members : [
    { username: 'Martin Kleppmann', role: 'CHAIR' },
    { username: 'Robert C. Martin', role: 'FACULTY' },
    { username: 'Dr. Ian Goodfellow', role: 'RESEARCHER' },
    { username: 'Nivas (Lead Scholar)', role: 'LEAD SCHOLAR' },
    { username: 'Prof. Thomas H. Cormen', role: 'MODERATOR' },
    { username: 'Prof. Stuart Russell', role: 'MEMBER' },
    { username: 'Betsy Beyer', role: 'MEMBER' },
  ]).filter((m) => {
    const u = m.user || m.communities?.user || m;
    const name = (u.username || '').toLowerCase();
    const role = (m.role || '').toLowerCase();
    return !rosterQuery || name.includes(rosterQuery) || role.includes(rosterQuery);
  });

  // Calculate Syllabus Completion Stats
  const completedCount = syllabusModules.filter((m) => m.completed).length;
  const totalModules = syllabusModules.length || 1;
  const progressPercent = Math.round((completedCount / totalModules) * 100);

  return (
    <AppLayout breadcrumb="Study Circles & Research Guilds">
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-8 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-2xl border border-slate-700/60 flex items-center gap-2.5 pointer-events-none"
          >
            <Sparkles size={14} className="text-amber-400" />
            <span className="font-medium">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Institutional Header Banner */}
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
              Curriculum focus cohorts, faculty-led reading seminars, syllabus milestone progress, and peer-reviewed preprint review groups.
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

      <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-185px)] min-h-[500px] overflow-hidden">
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
                      setSearchParams({ id: comm.communityId });
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
                          <span>{comm.memberCount || 24} scholars</span>
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

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleCopyInvite}
                  className="btn-ghost text-xs px-2.5 py-1.5 text-slate-600 hover:text-indigo-600 border border-slate-200/80 rounded-xl"
                  title="Copy Circle Invite Link"
                >
                  <Share2 size={13} />
                  <span className="hidden sm:inline">Invite</span>
                </button>

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
                    className="btn-ghost text-xs px-3 py-1.5 text-slate-500 hover:text-rose-600 border border-slate-200/80 rounded-xl"
                    title="Leave Circle"
                  >
                    <LogOut size={13} /> Leave
                  </button>
                )}

                <button
                  onClick={() => setShowMembersDrawer((v) => !v)}
                  className={cn(
                    'btn-ghost text-xs px-3 py-1.5 transition-colors border border-slate-200/80 rounded-xl',
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
                  { id: 'discourse', label: `Discourse Stream (${messages.length})`, icon: MessageSquare },
                  { id: 'syllabus', label: `Curriculum & Syllabus (${completedCount}/${totalModules})`, icon: BookOpen },
                  { id: 'vault', label: `Shared Reading Vault (${vaultBooks.length})`, icon: FileText },
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
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {syllabusModules.find((m) => !m.completed)?.title || 'Current Discussion Milestone'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 truncate mt-0.5">
                          {syllabusModules.find((m) => !m.completed)?.readings || 'Review designated academic readings before Thursday seminar session.'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setCircleWorkspaceTab('vault')}
                      className="btn-ghost text-[11px] px-2.5 py-1 bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 flex-shrink-0"
                    >
                      View Vault <ExternalLink size={11} />
                    </button>
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
                      const msgId = msg.id || msg.messageId;
                      const sender = msg.sender || msg.user || (typeof msg.senderId === 'object' ? msg.senderId : {});
                      const rawSenderId = sender.userId || msg.userId || (typeof msg.senderId !== 'object' ? msg.senderId : msg.senderId?.userId);
                      const isMe = String(rawSenderId) === String(user?.userId) || (sender.username && sender.username === user?.username) || rawSenderId === 'You';
                      const msgKey = String(msgId);
                      const reactions = messageReactions[msgKey] || {};
                      const authorName = isMe ? 'You' : (sender.username || msg.senderName || 'Scholar');
                      const avatar = sender.profileUrl || msg.avatarUrl || (isMe ? user?.profileUrl : null);
                      const body = msg.content || msg.message;

                      return (
                        <div
                          key={msgKey}
                          className={cn(
                            'flex items-start gap-3 max-w-2xl group',
                            isMe ? 'ml-auto flex-row-reverse' : ''
                          )}
                        >
                          <div className="w-9 h-9 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200/80 shadow-xs">
                            {avatar ? (
                              <img src={avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-[10px]">
                                {getInitials(authorName)}
                              </div>
                            )}
                          </div>

                          <div className={cn('space-y-1 min-w-0', isMe ? 'text-right' : 'text-left')}>
                            <div className={cn('flex items-center gap-2 text-[11px]', isMe ? 'justify-end' : '')}>
                              <span className="font-bold text-slate-900">
                                {authorName}
                              </span>
                              <span className="badge-enterprise badge-indigo text-[9px] py-0 px-1">
                                {isMe ? 'Author' : 'Scholar'}
                              </span>
                              <span className="text-slate-400 font-mono text-[10px]">
                                {formatRelativeDate(msg.createdAt)}
                              </span>

                              {/* Delete message if author */}
                              {isMe && (
                                <button
                                  onClick={() => handleDeleteMessage(msgId)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-rose-600 p-0.5 ml-1"
                                  title="Delete message"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>

                            <div
                              className={cn(
                                'p-4 rounded-2xl text-xs leading-relaxed shadow-xs inline-block text-left relative',
                                isMe
                                  ? 'bg-indigo-600 text-white rounded-tr-xs'
                                  : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                              )}
                            >
                              <p className="whitespace-pre-line">{body}</p>

                              {/* Scholarly Reaction Pills */}
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
                                  title="Insightful formulation"
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
                                  title="Valid Citation"
                                >
                                  <BookMarked size={10} className="text-indigo-400" />
                                  <span>Cited</span>
                                  {reactions.citation > 0 && <span className="font-bold">({reactions.citation})</span>}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleToggleReaction(msgKey, 'agree')}
                                  className={cn(
                                    'px-2 py-0.5 rounded-lg text-[10px] flex items-center gap-1 transition-all',
                                    isMe
                                      ? 'bg-white/20 text-white hover:bg-white/30'
                                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                                  )}
                                  title="Scholarly Consensus"
                                >
                                  <ThumbsUp size={10} className="text-emerald-400" />
                                  <span>Agree</span>
                                  {reactions.agree > 0 && <span className="font-bold">({reactions.agree})</span>}
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
                        placeholder={`Broadcast research insight or pose a thesis query in #${selectedCommunity.name}...`}
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
                        <div className="flex items-center gap-1 text-slate-500">
                          <button
                            type="button"
                            onClick={() => {
                              if (vaultBooks.length > 0) {
                                handleCiteBook(vaultBooks[0]);
                              } else {
                                setMessageText((prev) => `${prev} [Citation: "Reference Paper", p. 12] `);
                              }
                            }}
                            className="p-1 rounded-lg hover:bg-slate-200/60 hover:text-slate-900 text-[10px] font-mono flex items-center gap-1"
                            title="Insert Manuscript Citation Tag"
                          >
                            <Bookmark size={12} className="text-indigo-600" /> Cite Paper
                          </button>
                          <button
                            type="button"
                            onClick={() => setMessageText((prev) => `${prev}\n\`\`\`text\n// Mathematical invariant or proof step\n\`\`\`\n`)}
                            className="p-1 rounded-lg hover:bg-slate-200/60 hover:text-slate-900 text-[10px] font-mono flex items-center gap-1"
                            title="Insert Proof or Code Block"
                          >
                            <Hash size={12} className="text-indigo-600" /> Proof / Code
                          </button>
                          <button
                            type="button"
                            onClick={() => setMessageText((prev) => `${prev} [Thesis Hypothesis: ...] `)}
                            className="p-1 rounded-lg hover:bg-slate-200/60 hover:text-slate-900 text-[10px] font-mono flex items-center gap-1 hidden sm:flex"
                            title="Insert Thesis Hypothesis Tag"
                          >
                            <Sparkles size={12} className="text-amber-500" /> Hypothesis
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                            Enter ↵ to broadcast
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
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="badge-enterprise badge-indigo">Semester Curriculum 2026</span>
                      <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                        Syllabus & Research Milestones
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Structured pacing for weekly seminar presentations, proof evaluations, and preprint readings.
                      </p>
                    </div>

                    <button
                      onClick={() => setShowAddMilestoneModal(true)}
                      className="btn-accent text-xs px-3.5 py-2 self-start sm:self-auto flex items-center gap-1.5"
                    >
                      <Plus size={14} /> Add Milestone
                    </button>
                  </div>

                  {/* Dynamic Progress Bar */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">Seminar Completion Progress</span>
                      <span className="font-mono text-indigo-600 font-bold">{completedCount} of {totalModules} Completed ({progressPercent}%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Modules Interactive List */}
                <div className="space-y-3.5">
                  {syllabusModules.map((mod) => (
                    <div
                      key={mod.id}
                      className={cn(
                        'enterprise-card p-5 bg-white transition-all flex items-start justify-between gap-4 group',
                        mod.completed ? 'border-emerald-200 bg-emerald-50/20' : 'hover:border-indigo-200'
                      )}
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <button
                          type="button"
                          onClick={() => handleToggleMilestone(mod.id)}
                          className={cn(
                            'mt-0.5 p-1 rounded-lg transition-colors cursor-pointer',
                            mod.completed
                              ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                              : 'text-slate-300 hover:text-slate-500 bg-slate-100 hover:bg-slate-200'
                          )}
                          title={mod.completed ? 'Mark as incomplete' : 'Mark as complete'}
                        >
                          {mod.completed ? <CheckSquare size={18} /> : <Square size={18} />}
                        </button>

                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono font-bold text-indigo-600">{mod.week}</span>
                            <span className="text-slate-300">·</span>
                            <h4 className={cn('text-sm font-bold text-slate-900', mod.completed ? 'line-through text-slate-500' : '')}>
                              {mod.title}
                            </h4>
                          </div>

                          <p className="text-xs text-slate-500 font-mono">
                            <span className="font-bold text-slate-700">Required Reading:</span> {mod.readings}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => setCircleWorkspaceTab('vault')}
                          className="btn-ghost text-[10px] px-2.5 py-1 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg flex items-center gap-1"
                          title="Open related reading in vault"
                        >
                          <BookOpen size={11} /> Read Paper
                        </button>

                        <button
                          onClick={() => handleToggleMilestone(mod.id)}
                          className={cn(
                            'badge-enterprise text-[10px] font-mono cursor-pointer transition-all',
                            mod.completed ? 'badge-emerald' : 'badge-slate hover:badge-indigo'
                          )}
                        >
                          {mod.completed ? 'COMPLETED' : 'MARK DONE'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: SHARED READING VAULT */}
            {circleWorkspaceTab === 'vault' && (
              <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Curated Reading List & Whitepapers ({vaultBooks.length})
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Manuscripts, research monographs, and seminar preprints pinned for this study cohort.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowAddBookModal(true)}
                      className="btn-accent text-xs px-3.5 py-2 flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus size={14} /> Link Manuscript to Vault
                    </button>
                    <Link to="/upload" className="btn-ghost text-xs px-3 py-2 border border-slate-200/80 rounded-xl">
                      Upload New
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {vaultBooks.map((b) => {
                    const isPinned = pinnedBookIds.includes(b.bookId);
                    return (
                      <div key={b.bookId} className="enterprise-card p-5 bg-white flex flex-col justify-between space-y-4 relative group">
                        {isPinned && (
                          <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md">
                            <Pin size={10} /> Pinned
                          </div>
                        )}

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

                        <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                          <div className="flex items-center justify-between text-[11px] text-slate-600">
                            <span className="font-medium truncate max-w-[140px]">
                              {typeof b.author === 'object' ? b.author?.name : b.author || 'Author'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCiteBook(b)}
                              className="text-[10px] font-mono text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-bold"
                              title="Cite in discourse stream"
                            >
                              <Bookmark size={10} /> Cite
                            </button>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <Link
                              to={`/reader/${b.bookId}`}
                              className="btn-accent text-[11px] px-3 py-1.5 flex-1 text-center justify-center"
                            >
                              <BookOpen size={12} /> Read
                            </Link>
                            <Link
                              to={`/library/${b.bookId}`}
                              className="btn-ghost text-[11px] px-2.5 py-1.5 border border-slate-200"
                            >
                              Details
                            </Link>
                            {isPinned && (
                              <button
                                onClick={() => handleUnpinBookFromVault(b.bookId)}
                                className="text-slate-300 hover:text-rose-600 p-1.5 transition-colors"
                                title="Unpin from vault"
                              >
                                <X size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
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

                {/* Quick Share / Invite Action */}
                <button
                  onClick={handleCopyInvite}
                  className="w-full btn-ghost border border-indigo-200 bg-indigo-50/50 text-indigo-700 text-xs py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors"
                >
                  <Copy size={13} /> Copy Circle Invite Link
                </button>

                {/* Lead Faculty Chair */}
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

                {/* Members Roster Filter & List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-mono text-slate-400 uppercase font-bold tracking-wider">
                      Enrolled Roster ({displayedMembers.length})
                    </p>
                  </div>

                  <div className="relative">
                    <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filter scholars..."
                      value={memberSearchQuery}
                      onChange={(e) => setMemberSearchQuery(e.target.value)}
                      className="input-base text-[11px] pl-7 py-1 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {displayedMembers.map((m, idx) => {
                      const u = m.user || m.communities?.user || m;
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

              <div className="pt-4 border-t border-slate-100 space-y-2">
                {isJoined(selectedCommunity.communityId) && (
                  <button
                    onClick={() => handleLeave(selectedCommunity.communityId)}
                    className="w-full text-xs text-rose-600 hover:text-rose-700 py-1.5 flex items-center justify-center gap-1.5 font-medium transition-colors"
                  >
                    <LogOut size={13} /> Leave Study Circle
                  </button>
                )}
                <p className="text-[10px] font-mono text-slate-400 text-center">
                  FERPA Compliant · Institutional Ingestion v2.4
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* MODAL 1: Establish Community Modal */}
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

      {/* MODAL 2: Link Manuscript to Vault Modal */}
      <AnimatePresence>
        {showAddBookModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddBookModal(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-slate-200 z-10 space-y-4 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Pin Manuscript to Circle Vault</h3>
                  <p className="text-xs text-slate-500">Select a paper from the repository catalog to pin for peer reading.</p>
                </div>
                <button onClick={() => setShowAddBookModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
              </div>

              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search catalog by title, author, or discipline..."
                  value={bookVaultSearch}
                  onChange={(e) => setBookVaultSearch(e.target.value)}
                  className="input-base text-xs pl-8 py-2 rounded-xl"
                />
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-96 pr-1">
                {circleBooks
                  .filter((b) => {
                    const q = bookVaultSearch.toLowerCase().trim();
                    if (!q) return true;
                    return (
                      (b.title || '').toLowerCase().includes(q) ||
                      (b.category || '').toLowerCase().includes(q) ||
                      (typeof b.author === 'string' ? b.author : b.author?.name || '').toLowerCase().includes(q)
                    );
                  })
                  .map((b) => {
                    const isPinned = pinnedBookIds.includes(b.bookId);
                    return (
                      <div key={b.bookId} className="py-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{b.title}</p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {typeof b.author === 'object' ? b.author?.name : b.author || 'Author'} · {b.category || 'General'}
                          </p>
                        </div>

                        {isPinned ? (
                          <button
                            onClick={() => handleUnpinBookFromVault(b.bookId)}
                            className="btn-ghost text-xs text-rose-600 hover:bg-rose-50 px-2.5 py-1 rounded-lg"
                          >
                            Unpin
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePinBookToVault(b.bookId)}
                            className="btn-accent text-xs px-3 py-1 rounded-lg flex items-center gap-1"
                          >
                            <Pin size={11} /> Pin to Vault
                          </button>
                        )}
                      </div>
                    );
                  })}
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setShowAddBookModal(false)}
                  className="btn-ghost text-xs px-4 py-2"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: Add Milestone to Syllabus Modal */}
      <AnimatePresence>
        {showAddMilestoneModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddMilestoneModal(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 z-10 space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Add Curriculum Milestone</h3>
                  <p className="text-xs text-slate-500">Append a seminar module or weekly discussion topic.</p>
                </div>
                <button onClick={() => setShowAddMilestoneModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAddMilestone} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1">
                    Module / Week Code
                  </label>
                  <input
                    type="text"
                    placeholder={`e.g. Module 0${syllabusModules.length + 1}`}
                    value={newMilestoneWeek}
                    onChange={(e) => setNewMilestoneWeek(e.target.value)}
                    className="input-base text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1">
                    Seminar Milestone Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Zero-Knowledge Proofs & zk-SNARKs"
                    value={newMilestoneTitle}
                    onChange={(e) => setNewMilestoneTitle(e.target.value)}
                    className="input-base text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase font-mono mb-1">
                    Required Reading Papers
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Groth16, PLONK, Moonmath Manual Ch. 4"
                    value={newMilestoneReadings}
                    onChange={(e) => setNewMilestoneReadings(e.target.value)}
                    className="input-base text-xs"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddMilestoneModal(false)}
                    className="btn-ghost text-xs px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newMilestoneTitle.trim()}
                    className="btn-accent text-xs px-5 py-2 shadow-sm"
                  >
                    Add Milestone
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
