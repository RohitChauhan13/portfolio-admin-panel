import { useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { Star, Trash2 } from 'lucide-react';

const Feedback = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async (currentPage = page) => {
    setIsLoading(true);
    try {
      const res = await axiosClient.get(`/feedback?page=${currentPage}`);
      setData(res.data.data);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      toast.error('Failed to load feedback');
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchData(page);
  }, [page, fetchData]);

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await axiosClient.delete(`/feedback/${itemToDelete}`);
      toast.success('Feedback deleted successfully');
      setIsDeleteOpen(false);
      fetchData(page);
    } catch (error) {
      toast.error('Failed to delete feedback');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    { 
      header: 'Rating', 
      accessor: 'rating', 
      width: '120px',
      cell: (row) => (
        <div style={{ display: 'flex', gap: '2px', color: '#f59e0b' }}>
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={14} fill={i < row.rating ? 'currentColor' : 'none'} />
          ))}
        </div>
      )
    },
    { header: 'Comment', accessor: 'comment', cell: (row) => row.comment || <span style={{ color: 'var(--text-muted)' }}>No comment provided</span> },
    { header: 'IP Address', accessor: 'ip_address', width: '150px' },
    { 
      header: 'Date', 
      accessor: 'created_at', 
      width: '150px',
      cell: (row) => new Date(row.created_at).toLocaleDateString()
    },
    { 
      header: 'Actions', 
      accessor: 'id', 
      width: '100px',
      cell: (row) => (
        <div className="actions-cell" style={{ justifyContent: 'flex-start' }}>
          <button onClick={() => { setItemToDelete(row.id); setIsDeleteOpen(true); }} className="btn-icon text-danger" title="Delete Feedback">
            <Trash2 size={16} />
          </button>
        </div>
      )
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Portfolio Feedback</h1>
      </div>

      <DataTable 
        columns={columns} 
        data={data} 
        total={total} 
        page={page} 
        totalPages={totalPages}
        onPageChange={setPage} 
        isLoading={isLoading}
      />

      <ConfirmDeleteModal 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        onConfirm={confirmDelete} 
        itemName="feedback" 
        isDeleting={isDeleting} 
      />
    </div>
  );
};

export default Feedback;


