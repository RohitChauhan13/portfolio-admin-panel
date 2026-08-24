import { useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';
import FormModal from '../components/FormModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { ModalLoader } from '../components/Loader';
import ReactMarkdown from 'react-markdown';
import { Eye, Trash2, CalendarDays, X } from 'lucide-react';

// ─── Date Range Filter ────────────────────────────────────────
// Inline date-range bar: "From [date] → To [date]" with clear
const DateRangeFilter = ({ fromDate, toDate, onChange }) => {
  const hasFilter = fromDate || toDate;

  const handleClear = () => onChange({ from_date: '', to_date: '' });

  return (
    <div className="chat-date-range">
      <span className="chat-date-range__icon">
        <CalendarDays size={15} />
      </span>

      <div className="chat-date-range__field">
        <label className="chat-date-range__label">From</label>
        <input
          type="date"
          className="chat-date-range__input"
          value={fromDate}
          max={toDate || undefined}
          onChange={e => onChange({ from_date: e.target.value, to_date: toDate })}
        />
      </div>

      <span className="chat-date-range__sep">→</span>

      <div className="chat-date-range__field">
        <label className="chat-date-range__label">To</label>
        <input
          type="date"
          className="chat-date-range__input"
          value={toDate}
          min={fromDate || undefined}
          onChange={e => onChange({ from_date: fromDate, to_date: e.target.value })}
        />
      </div>

      {hasFilter && (
        <button
          type="button"
          className="chat-date-range__clear"
          onClick={handleClear}
          title="Clear date filter"
        >
          <X size={13} strokeWidth={2.5} />
          Clear
        </button>
      )}
    </div>
  );
};

// ─── ChatLogs Page ─────────────────────────────────────────────
const ChatLogs = () => {
  const [data, setData]             = useState([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading]   = useState(true);

  // Date range filter
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate]     = useState('');

  // Chat history modal
  const [isViewOpen, setIsViewOpen]           = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionHistory, setSessionHistory]   = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  // Delete modal
  const [isDeleteOpen, setIsDeleteOpen]       = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [isDeleting, setIsDeleting]           = useState(false);

  // Daily limit control
  const [limit, setLimit]           = useState(10);
  const [isLimitSaving, setIsLimitSaving] = useState(false);
  const [personalData, setPersonalData]   = useState(null);

  // ── Fetch personal data (for chat limit) ──────────────────
  const fetchLimit = async () => {
    try {
      const res = await axiosClient.get('/personal');
      if (res.data.data) {
        setPersonalData(res.data.data);
        if (res.data.data.chat_message_limit !== undefined) {
          setLimit(res.data.data.chat_message_limit);
        }
      }
    } catch {
      console.error('Failed to load chat limit');
    }
  };

  const handleSaveLimit = async () => {
    if (!personalData) return;
    setIsLimitSaving(true);
    try {
      const payload = { ...personalData, chat_message_limit: limit };
      await axiosClient.put('/personal', payload);
      setPersonalData(payload);
      toast.success('Chat limit updated');
    } catch {
      toast.error('Failed to update chat limit');
    } finally {
      setIsLimitSaving(false);
    }
  };

  // ── Fetch sessions ─────────────────────────────────────────
  const fetchData = useCallback(
    async (currentPage = page, from = fromDate, to = toDate) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({ page: currentPage });
        if (from) params.set('from_date', from);
        if (to)   params.set('to_date', to);

        const res = await axiosClient.get(`/chat?${params.toString()}`);
        setData(res.data.data);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      } catch {
        toast.error('Failed to load chat sessions');
      } finally {
        setIsLoading(false);
      }
    },
    [page, fromDate, toDate]
  );

  useEffect(() => {
    fetchData(page, fromDate, toDate);
    fetchLimit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, fromDate, toDate]);

  const handleDateChange = ({ from_date, to_date }) => {
    setFromDate(from_date);
    setToDate(to_date);
    setPage(1);
  };

  // ── Chat history modal ─────────────────────────────────────
  const viewHistory = async (session_id) => {
    setSelectedSession(session_id);
    setIsViewOpen(true);
    setIsHistoryLoading(true);
    try {
      const res = await axiosClient.get(`/chat/${session_id}`);
      setSessionHistory(res.data.data);
    } catch {
      toast.error('Failed to load history');
    } finally {
      setIsHistoryLoading(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────
  const handleDeleteClick = (session_id) => {
    setSessionToDelete(session_id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!sessionToDelete) return;
    setIsDeleting(true);
    try {
      await axiosClient.delete(`/chat/${sessionToDelete}`);
      toast.success('Session deleted');
      setIsDeleteOpen(false);
      fetchData(page, fromDate, toDate);
    } catch {
      toast.error('Failed to delete session');
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Helpers ────────────────────────────────────────────────
  const formatIST = (dateString) => {
    const d = new Date(dateString);
    const datePart = d.toLocaleDateString('en-GB', {
      timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: '2-digit',
    });
    const timePart = d.toLocaleTimeString('en-US', {
      timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true,
    }).replace(' ', '').toUpperCase();
    return `${datePart}  ${timePart}`;
  };

  // ── Table columns ──────────────────────────────────────────
  const columns = [
    { header: 'Date', accessor: 'created_at', cell: (row) => formatIST(row.created_at) },
    { header: 'Session ID', accessor: 'session_id' },
    { header: 'IP Address', accessor: 'ip_address' },
    {
      header: 'Actions',
      accessor: 'id',
      cell: (row) => (
        <div className="actions-cell" style={{ justifyContent: 'flex-start' }}>
          <button onClick={() => viewHistory(row.session_id)} className="btn-icon" title="View History">
            <Eye size={16} />
          </button>
          <button onClick={() => handleDeleteClick(row.session_id)} className="btn-icon text-danger" title="Delete Session">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">RAG Chat Logs</h1>

        {/* Daily limit control */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: 'var(--bg-surface)', padding: '0.5rem 1rem',
          borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <label style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0, whiteSpace: 'nowrap' }}>
            Daily Limit / IP
          </label>
          <input
            type="number"
            className="form-input"
            style={{ width: '72px', padding: '0.25rem 0.5rem', margin: 0, height: '32px', fontSize: '0.875rem' }}
            value={limit}
            min={1}
            onChange={(e) => setLimit(Number(e.target.value))}
          />
          <button
            className="btn btn-primary"
            onClick={handleSaveLimit}
            disabled={isLimitSaving}
            style={{ padding: '0.25rem 0.875rem', height: '32px', fontSize: '0.8125rem' }}
          >
            {isLimitSaving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={data}
        total={total}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        isLoading={isLoading}
        customFilterComponent={
          <div className="chat-filter-bar" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <DateRangeFilter
              fromDate={fromDate}
              toDate={toDate}
              onChange={handleDateChange}
            />
            {(fromDate || toDate) && (
              <span className="chat-filter-bar__count">
                Filtered results
              </span>
            )}
          </div>
        }
      />

      {/* Chat History Modal */}
      <FormModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title={`Chat History · ${selectedSession?.substring(0, 8)}…`}
      >
        <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
          {isHistoryLoading ? (
            <ModalLoader text="Loading chat history..." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {sessionHistory.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
                  No messages in this session.
                </p>
              ) : null}
              {sessionHistory.map((msg, idx) => {
                const timeString = new Date(msg.created_at).toLocaleTimeString([], {
                  hour: '2-digit', minute: '2-digit',
                });
                return (
                  <div
                    key={idx}
                    style={{
                      alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      backgroundColor: msg.role === 'user' ? 'var(--accent-color)' : 'var(--bg-surface-hover)',
                      color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                      padding: '0.75rem 1rem 0.5rem 1rem',
                      borderRadius: 'var(--radius-lg)',
                      maxWidth: '80%',
                      minWidth: '120px',
                    }}
                  >
                    <div style={{ fontSize: '0.7rem', opacity: 0.7, marginBottom: '0.25rem', fontWeight: 600 }}>
                      {msg.role === 'user' ? 'User' : 'AI'}
                    </div>
                    <div
                      className={msg.role === 'assistant' ? 'markdown-chat' : ''}
                      style={{ whiteSpace: msg.role === 'user' ? 'pre-wrap' : 'normal', fontSize: '0.875rem' }}
                    >
                      {msg.role === 'assistant' ? (
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      ) : msg.content}
                    </div>
                    <div style={{
                      fontSize: '0.65rem', opacity: 0.55, textAlign: 'right',
                      marginTop: '0.375rem',
                    }}>
                      {timeString}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </FormModal>

      {/* Delete Confirmation */}
      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        itemName="chat session"
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default ChatLogs;
