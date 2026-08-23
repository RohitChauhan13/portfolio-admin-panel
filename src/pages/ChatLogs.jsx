import { useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';
import FormModal from '../components/FormModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import ReactMarkdown from 'react-markdown';
import { Eye, Trash2 } from 'lucide-react';
const ChatLogs = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [limit, setLimit] = useState(10);
  const [isLimitSaving, setIsLimitSaving] = useState(false);
  const [personalData, setPersonalData] = useState(null);

  const fetchLimit = async () => {
    try {
      const res = await axiosClient.get('/personal');
      if (res.data.data) {
        setPersonalData(res.data.data);
        if (res.data.data.chat_message_limit !== undefined) {
          setLimit(res.data.data.chat_message_limit);
        }
      }
    } catch (error) {
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
      toast.success('Chat limit updated successfully');
    } catch (error) {
      toast.error('Failed to update chat limit');
    } finally {
      setIsLimitSaving(false);
    }
  };

  const fetchData = useCallback(async (currentPage = page) => {
    setIsLoading(true);
    try {
      const res = await axiosClient.get(`/chat?page=${currentPage}`);
      setData(res.data.data);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      toast.error('Failed to load chat sessions');
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchData(page);
    fetchLimit();
  }, [page, fetchData]);

  const viewHistory = async (session_id) => {
    setSelectedSession(session_id);
    setIsViewOpen(true);
    setIsHistoryLoading(true);
    try {
      const res = await axiosClient.get(`/chat/${session_id}`);
      setSessionHistory(res.data.data);
    } catch (error) {
      toast.error('Failed to load history');
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const formatIST = (dateString) => {
    const d = new Date(dateString);
    const datePart = d.toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: '2-digit' });
    const timePart = d.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true }).replace(' ', '').toUpperCase();
    return `${datePart}  ${timePart}`;
  };

  const handleDeleteClick = (session_id) => {
    setSessionToDelete(session_id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!sessionToDelete) return;
    setIsDeleting(true);
    try {
      await axiosClient.delete(`/chat/${sessionToDelete}`);
      toast.success('Session deleted successfully');
      setIsDeleteOpen(false);
      fetchData(page);
    } catch (error) {
      toast.error('Failed to delete session');
    } finally {
      setIsDeleting(false);
    }
  };
  const columns = [
    { header: 'Date', accessor: 'created_at', cell: (row) => formatIST(row.created_at) },
    { header: 'Session ID', accessor: 'session_id' },
    { header: 'Actions', accessor: 'id', cell: (row) => (
      <div className="actions-cell" style={{ justifyContent: 'flex-start' }}>
        <button onClick={() => viewHistory(row.session_id)} className="btn-icon" title="View History">
          <Eye size={16} />
        </button>
        <button onClick={() => handleDeleteClick(row.session_id)} className="btn-icon text-danger" title="Delete Session">
          <Trash2 size={16} />
        </button>
      </div>
    )},
  ];

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">RAG Chat</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--card-bg)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
          <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>Daily Msg Limit / IP:</label>
          <input 
            type="number" 
            className="form-input" 
            style={{ width: '80px', padding: '0.25rem 0.5rem', margin: 0, height: '32px' }}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
          />
          <button 
            className="btn btn-primary" 
            onClick={handleSaveLimit}
            disabled={isLimitSaving}
            style={{ padding: '0.25rem 0.75rem', height: '32px', fontSize: '0.875rem' }}
          >
            {isLimitSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <DataTable 
        columns={columns} data={data} total={total} page={page} totalPages={totalPages}
        onPageChange={setPage} isLoading={isLoading}
      />

      <FormModal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title={`Chat History (${selectedSession?.substring(0, 8)}...)`}>
          <div style={{ padding: "1.5rem", flex: 1, overflowY: "auto" }}>
        {isHistoryLoading ? <p>Loading history...</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {sessionHistory.length === 0 ? <p>No messages in this session.</p> : null}
            {sessionHistory.map((msg, idx) => {
              const timeString = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              return (
                <div key={idx} style={{ 
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  backgroundColor: msg.role === 'user' ? 'var(--accent-color)' : 'var(--bg-surface-hover)',
                  color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                  padding: '0.75rem 1rem 0.5rem 1rem',
                  borderRadius: 'var(--radius-lg)',
                  maxWidth: '80%',
                  position: 'relative',
                  minWidth: '120px'
                }}>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '0.25rem' }}>{msg.role === 'user' ? 'User' : 'AI'}</div>
                  <div className={msg.role === 'assistant' ? "markdown-chat" : ""} style={{ whiteSpace: msg.role === 'user' ? 'pre-wrap' : 'normal', fontSize: '0.875rem' }}>
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </div>
                  <div style={{ 
                    fontSize: '0.65rem', 
                    opacity: 0.6, 
                    textAlign: 'right', 
                    marginTop: '0.25rem',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    gap: '4px'
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



