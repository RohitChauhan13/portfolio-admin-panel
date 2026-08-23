import { useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';
import FormModal from '../components/FormModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { Plus } from 'lucide-react';

const emptyForm = { degree: '', institution: '', start_year: '', end_year: '', grade: '', description: '', sort_order: 0 };

const Education = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = useCallback(async (currentPage = page, search = searchTerm) => {
    setIsLoading(true);
    try {
      const res = await axiosClient.get(`/education?page=${currentPage}&search=${search}`);
      setData(res.data.data);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      toast.error('Failed to load education');
    } finally {
      setIsLoading(false);
    }
  }, [page, searchTerm]);

  useEffect(() => {
    fetchData(page, searchTerm);
  }, [page, searchTerm, fetchData]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    setPage(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Strict Frontend Validations
    if (formData.start_year && formData.end_year) {
      if (Number(formData.end_year) < Number(formData.start_year)) {
        toast.error("End Year cannot be before Start Year.");
        return;
      }
    }

    setIsSaving(true);
    try {
      const basePayload = { ...formData, sort_order: Number(formData.sort_order) };
      
      // Sanitize payload: convert empty strings to null for Zod
      const payload = { ...basePayload };
      Object.keys(payload).forEach(key => {
        if (payload[key] === '') {
          payload[key] = null;
        }
      });

      if (editingId) {
        await axiosClient.put(`/education/${editingId}`, payload);
        toast.success('Updated');
      } else {
        await axiosClient.post('/education', payload);
        toast.success('Added');
      }
      setIsFormOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsSaving(true);
    try {
      await axiosClient.delete(`/education/${itemToDelete.id}`);
      toast.success('Deleted');
      setIsDeleteOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Delete failed');
    } finally {
      setIsSaving(false);
    }
  };

  const columns = [
    { header: 'Degree', accessor: 'degree' },
    { header: 'Institution', accessor: 'institution' },
    { header: 'Duration', accessor: 'start_year', cell: (row) => `${row.start_year || ''} - ${row.end_year || 'Present'}` },
    { header: 'Order', accessor: 'sort_order', width: '80px' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Education</h1>
        <button className="btn btn-primary" onClick={() => { setFormData(emptyForm); setEditingId(null); setIsFormOpen(true); }}>
          <Plus size={18} /> Add Education
        </button>
      </div>

      <DataTable 
        columns={columns} data={data} total={total} page={page} totalPages={totalPages}
        onPageChange={setPage} onSearch={handleSearch}
        onEdit={(item) => { setFormData(item); setEditingId(item.id); setIsFormOpen(true); }}
        onDelete={(item) => { setItemToDelete(item); setIsDeleteOpen(true); }}
        isLoading={isLoading}
      />

      <FormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingId ? 'Edit' : 'Add'}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
          <div style={{ padding: "1.5rem", flex: 1, overflowY: "auto" }}>
          <div className="form-group"><label className="form-label">Degree *</label><input type="text" className="form-input" required value={formData.degree || ''} onChange={e => setFormData({...formData, degree: e.target.value})} /></div>
          <div className="form-group"><label className="form-label">Institution *</label><input type="text" className="form-input" required value={formData.institution || ''} onChange={e => setFormData({...formData, institution: e.target.value})} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group"><label className="form-label">Start Year</label><input type="text" className="form-input" value={formData.start_year || ''} onChange={e => setFormData({...formData, start_year: e.target.value})} /></div>
            <div className="form-group"><label className="form-label">End Year</label><input type="text" className="form-input" value={formData.end_year || ''} onChange={e => setFormData({...formData, end_year: e.target.value})} /></div>
          </div>
          <div className="form-group"><label className="form-label">Grade</label><input type="text" className="form-input" value={formData.grade || ''} onChange={e => setFormData({...formData, grade: e.target.value})} /></div>
          <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" rows="3" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
          <div className="form-group"><label className="form-label">Sort Order</label><input type="number" className="form-input" value={formData.sort_order || 0} onChange={e => setFormData({...formData, sort_order: e.target.value})} /></div>
          
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={() => setIsFormOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </FormModal>

      <ConfirmDeleteModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleDelete} itemName="education record" isDeleting={isSaving} />
    </div>
  );
};
export default Education;



