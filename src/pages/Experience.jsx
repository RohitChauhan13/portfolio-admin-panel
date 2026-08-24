import { useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';
import FormModal from '../components/FormModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { Plus } from 'lucide-react';

const emptyForm = { company: '', role: '', start_date: '', end_date: '', is_current: false, description: '', tech_stack: [], sort_order: 0 };

const Experience = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [techInput, setTechInput] = useState('');

  const fetchData = useCallback(async (currentPage = page, search = searchTerm, status = filterStatus) => {
    setIsLoading(true);
    try {
      const res = await axiosClient.get(`/experience?page=${currentPage}&search=${search}&is_current=${status}`);
      setData(res.data.data);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      toast.error('Failed to load experience');
    } finally {
      setIsLoading(false);
    }
  }, [page, searchTerm, filterStatus]);

  useEffect(() => {
    fetchData(page, searchTerm, filterStatus);
  }, [page, searchTerm, filterStatus, fetchData]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    setPage(1);
  };

  const handleFilterStatus = (val) => {
    setFilterStatus(val);
    setPage(1);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Strict Frontend Validations
    if (formData.start_date && formData.end_date && !formData.is_current) {
      if (new Date(formData.end_date) < new Date(formData.start_date)) {
        toast.error("End Date cannot be before Start Date.");
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
        await axiosClient.put(`/experience/${editingId}`, payload);
        toast.success('Updated');
      } else {
        await axiosClient.post('/experience', payload);
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
      await axiosClient.delete(`/experience/${itemToDelete.id}`);
      toast.success('Deleted');
      setIsDeleteOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Delete failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTech = () => {
    if (techInput.trim()) {
      setFormData(prev => ({ ...prev, tech_stack: [...(prev.tech_stack || []), techInput.trim()] }));
      setTechInput('');
    }
  };

  const removeTech = (index) => {
    setFormData(prev => ({ ...prev, tech_stack: prev.tech_stack.filter((_, i) => i !== index) }));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toISOString().split('T')[0];
  };

  const columns = [
    { header: 'Role', accessor: 'role' },
    { header: 'Company', accessor: 'company' },
    { header: 'Status', accessor: 'is_current', cell: (row) => row.is_current ? 'Current' : 'Past' },
    { header: 'Order', accessor: 'sort_order', width: '80px' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Experience</h1>
        <button className="btn btn-primary" onClick={() => { setFormData(emptyForm); setEditingId(null); setIsFormOpen(true); }}>
          <Plus size={18} /> Add Experience
        </button>
      </div>

      <DataTable 
        columns={columns} data={data} total={total} page={page} totalPages={totalPages}
        onPageChange={setPage} onSearch={handleSearch}
        onEdit={(item) => { 
          setFormData({
            ...item, 
            start_date: formatDate(item.start_date),
            end_date: formatDate(item.end_date),
            is_current: !!item.is_current,
            tech_stack: Array.isArray(item.tech_stack) ? item.tech_stack : []
          }); 
          setEditingId(item.id); setIsFormOpen(true); 
        }}
        onDelete={(item) => { setItemToDelete(item); setIsDeleteOpen(true); }}
        isLoading={isLoading}
        filters={[
          {
            label: 'Status',
            value: filterStatus,
            onChange: handleFilterStatus,
            options: [
              { value: 'true', label: 'Current' },
              { value: 'false', label: 'Past' },
            ],
          },
        ]}
      />

      <FormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingId ? 'Edit' : 'Add'}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
          <div style={{ padding: "1.5rem", flex: 1, overflowY: "auto" }}>
          <div className="form-group"><label className="form-label">Company *</label><input type="text" className="form-input" required value={formData.company || ''} onChange={e => setFormData({...formData, company: e.target.value})} /></div>
          <div className="form-group"><label className="form-label">Role *</label><input type="text" className="form-input" required value={formData.role || ''} onChange={e => setFormData({...formData, role: e.target.value})} /></div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group"><label className="form-label">Start Date</label><input type="date" className="form-input" value={formData.start_date || ''} onChange={e => setFormData({...formData, start_date: e.target.value})} /></div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input type="date" className="form-input" disabled={formData.is_current} value={formData.end_date || ''} onChange={e => setFormData({...formData, end_date: e.target.value})} />
            </div>
          </div>
          
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" id="is_current" checked={formData.is_current} onChange={e => setFormData({...formData, is_current: e.target.checked})} />
            <label htmlFor="is_current" className="form-label" style={{ marginBottom: 0 }}>I currently work here</label>
          </div>

          <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" rows="3" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
          
          <div className="form-group">
            <label className="form-label">Tech Stack</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input type="text" className="form-input" placeholder="e.g. React" value={techInput} onChange={e => setTechInput(e.target.value)} onKeyDown={(e) => { if(e.key==='Enter'){ e.preventDefault(); handleAddTech();}}} />
              <button type="button" className="btn btn-outline" onClick={handleAddTech}>Add</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {(formData.tech_stack || []).map((t, i) => (
                <span key={i} style={{ background: 'var(--bg-surface-hover)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  {t} <span style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => removeTech(i)}>×</span>
                </span>
              ))}
            </div>
          </div>

          <div className="form-group"><label className="form-label">Sort Order</label><input type="number" className="form-input" value={formData.sort_order || 0} onChange={e => setFormData({...formData, sort_order: e.target.value})} /></div>
          
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={() => setIsFormOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </FormModal>

      <ConfirmDeleteModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleDelete} itemName="experience record" isDeleting={isSaving} />
    </div>
  );
};
export default Experience;



