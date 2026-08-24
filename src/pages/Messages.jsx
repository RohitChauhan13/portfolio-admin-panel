import { useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { Trash2 } from 'lucide-react';
import DateRangeFilter from '../components/DateRangeFilter';

const Messages = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Date range filter
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async (currentPage = page, from = fromDate, to = toDate) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: currentPage });
      if (from) params.set('from_date', from);
      if (to)   params.set('to_date', to);

      const res = await axiosClient.get(`/contact?${params.toString()}`);
      setData(res.data.data);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, [page, fromDate, toDate]);

  useEffect(() => {
    fetchData(page, fromDate, toDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, fromDate, toDate]);

  const handleDateChange = ({ from_date, to_date }) => {
    setFromDate(from_date);
    setToDate(to_date);
    setPage(1);
  };

  const handleMarkAsRead = async (id) => {
    try {
      await axiosClient.patch(`/contact/${id}/read`);
      toast.success('Marked as read');
      fetchData(page, fromDate, toDate);
    } catch (error) {
      toast.error('Failed to mark read');
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await axiosClient.delete(`/contact/${itemToDelete}`);
      toast.success('Message deleted successfully');
      setIsDeleteOpen(false);
      fetchData(page, fromDate, toDate);
    } catch (error) {
      toast.error('Failed to delete message');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    { header: 'Date', accessor: 'created_at', cell: (row) => new Date(row.created_at).toLocaleString() },
    { header: 'Sender', accessor: 'name', cell: (row) => `${row.name} (${row.email})` },
    { header: 'Subject', accessor: 'subject' },
    { header: 'Status', accessor: 'is_read', cell: (row) => row.is_read ? <span style={{color:'var(--success-color)'}}>Read</span> : <span style={{color:'var(--danger-color)', fontWeight: 'bold'}}>Unread</span> },
    { header: 'Actions', accessor: 'id', cell: (row) => (
      <div className="actions-cell" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
        {!row.is_read && (
          <button onClick={() => handleMarkAsRead(row.id)} className="btn btn-outline" style={{padding: '4px 8px'}}>Mark Read</button>
        )}
        <button onClick={() => { setItemToDelete(row.id); setIsDeleteOpen(true); }} className="btn-icon text-danger" title="Delete Message">
          <Trash2 size={16} />
        </button>
      </div>
    )},
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Contact Messages</h1>
      </div>

      <DataTable 
        columns={columns} data={data} total={total} page={page} totalPages={totalPages}
        onPageChange={setPage} isLoading={isLoading}
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

      <ConfirmDeleteModal 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        onConfirm={confirmDelete} 
        itemName="contact message" 
        isDeleting={isDeleting} 
      />
    </div>
  );
};

export default Messages;

