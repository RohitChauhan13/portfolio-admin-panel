import { useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';
import FormModal from '../components/FormModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { Plus } from 'lucide-react';

const emptyForm = { name: '', category: 'frontend', proficiency: '', sort_order: 0, icon_url: '' };

const Skills = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = useCallback(async (currentPage = page, search = searchTerm) => {
    setIsLoading(true);
    try {
      const res = await axiosClient.get(`/skills?page=${currentPage}&search=${search}`);
      setData(res.data.data);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      toast.error('Failed to load skills');
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

  const openAddModal = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setIsFormOpen(true);
  };

  const openEditModal = (item) => {
    setFormData(item);
    setEditingId(item.id);
    setIsFormOpen(true);
  };

  const openDeleteModal = (item) => {
    setItemToDelete(item);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Ensure sort_order is a number
      const basePayload = { ...formData, sort_order: Number(formData.sort_order) };
      
      // Sanitize payload: convert empty strings to null for Zod
      const payload = { ...basePayload };
      Object.keys(payload).forEach(key => {
        if (payload[key] === '') {
          payload[key] = null;
        }
      });
      
      if (editingId) {
        await axiosClient.put(`/skills/${editingId}`, payload);
        toast.success('Skill updated');
      } else {
        await axiosClient.post('/skills', payload);
        toast.success('Skill added');
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
      await axiosClient.delete(`/skills/${itemToDelete.id}`);
      toast.success('Skill deleted');
      setIsDeleteOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Delete failed');
    } finally {
      setIsSaving(false);
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Category', accessor: 'category', cell: (row) => <span style={{ textTransform: 'capitalize' }}>{row.category}</span> },
    { header: 'Proficiency', accessor: 'proficiency' },
    { header: 'Order', accessor: 'sort_order', width: '80px' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Skills</h1>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={18} /> Add Skill
        </button>
      </div>

      <DataTable 
        columns={columns}
        data={data}
        total={total}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onSearch={handleSearch}
        onEdit={openEditModal}
        onDelete={openDeleteModal}
        isLoading={isLoading}
      />

      <FormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        title={editingId ? 'Edit Skill' : 'Add Skill'}
      >
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
          <div style={{ padding: "1.5rem", flex: 1, overflowY: "auto" }}>
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input type="text" className="form-input" required
              value={formData.name || ''} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select className="form-input" required
              value={formData.category || 'frontend'} 
              onChange={e => setFormData({...formData, category: e.target.value})}
            >
              <option value="frontend">Frontend</option>
              <option value="backend">Backend</option>
              <option value="database">Database</option>
              <option value="tools">Tools</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Proficiency</label>
              <input type="text" className="form-input" placeholder="e.g. Advanced or 90%"
                value={formData.proficiency || ''} 
                onChange={e => setFormData({...formData, proficiency: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Sort Order</label>
              <input type="number" className="form-input" 
                value={formData.sort_order || 0} 
                onChange={e => setFormData({...formData, sort_order: e.target.value})} 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Icon URL</label>
            <input type="text" className="form-input" placeholder="SVG or Image URL"
              value={formData.icon_url || ''} 
              onChange={e => setFormData({...formData, icon_url: e.target.value})} 
            />
          </div>

          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={() => setIsFormOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </FormModal>

      <ConfirmDeleteModal 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        itemName="skill"
        isDeleting={isSaving}
      />
    </div>
  );
};

export default Skills;



