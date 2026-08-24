import { useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';
import DataTable from '../components/DataTable';
import FormModal from '../components/FormModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import ImagePicker from '../components/ImagePicker';
import { Plus } from 'lucide-react';

const emptyForm = { title: '', slug: '', short_description: '', full_description: '', tech_stack: [], thumbnail_url: '', images: [], video_url: '', github_url: '', live_url: '', is_featured: false, sort_order: 0 };

const Projects = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFeatured, setFilterFeatured] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [techInput, setTechInput] = useState('');

  const fetchData = useCallback(async (currentPage = page, search = searchTerm, featured = filterFeatured) => {
    setIsLoading(true);
    try {
      const res = await axiosClient.get(`/projects?page=${currentPage}&search=${search}&featured=${featured}`);
      setData(res.data.data);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  }, [page, searchTerm, filterFeatured]);

  useEffect(() => {
    fetchData(page, searchTerm, filterFeatured);
  }, [page, searchTerm, filterFeatured, fetchData]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    setPage(1);
  };

  const handleFilterFeatured = (val) => {
    setFilterFeatured(val);
    setPage(1);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const basePayload = { ...formData, sort_order: Number(formData.sort_order) };
      
      // Sanitize: convert empty strings to null, and strip empty items from arrays
      const payload = { ...basePayload };
      Object.keys(payload).forEach(key => {
        if (Array.isArray(payload[key])) {
          // Remove any falsy / empty-string entries from arrays
          payload[key] = payload[key].filter(v => v && String(v).trim() !== '');
        } else if (payload[key] === '') {
          payload[key] = null;
        }
      });
      
      if (editingId) {
        await axiosClient.put(`/projects/${editingId}`, payload);
        toast.success('Updated');
      } else {
        await axiosClient.post('/projects', payload);
        toast.success('Added');
      }
      setIsFormOpen(false);
      fetchData();
    } catch (error) {
      const responseData = error.response?.data;
      let msg = responseData?.message || 'Save failed';

      // If message is still generic, try to extract from errors array directly
      if (msg === 'Validation failed' && Array.isArray(responseData?.errors)) {
        const details = responseData.errors.map(e => {
          const field = (e.path || []).filter(p => p !== 'body' && p !== 'query' && p !== 'params').join('.');
          return field ? `${field}: ${e.message}` : e.message;
        }).join(' | ');
        if (details) msg = details;
      }

      toast.error(msg, { duration: 8000, style: { maxWidth: '520px' } });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsSaving(true);
    try {
      await axiosClient.delete(`/projects/${itemToDelete.id}`);
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

  const columns = [
    { header: 'Title', accessor: 'title' },
    { header: 'Featured', accessor: 'is_featured', cell: (row) => row.is_featured ? 'Yes' : 'No' },
    { header: 'Slug', accessor: 'slug' },
    { header: 'Order', accessor: 'sort_order', width: '80px' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Projects</h1>
        <button className="btn btn-primary" onClick={() => { setFormData(emptyForm); setEditingId(null); setIsFormOpen(true); }}>
          <Plus size={18} /> Add Project
        </button>
      </div>

      <DataTable 
        columns={columns} data={data} total={total} page={page} totalPages={totalPages}
        onPageChange={setPage} onSearch={handleSearch}
        onEdit={(item) => { 
          setFormData({
            ...item,
            is_featured: !!item.is_featured,
            tech_stack: Array.isArray(item.tech_stack) ? item.tech_stack : [],
            images: Array.isArray(item.images) ? item.images : []
          }); 
          setEditingId(item.id); setIsFormOpen(true); 
        }}
        onDelete={(item) => { setItemToDelete(item); setIsDeleteOpen(true); }}
        isLoading={isLoading}
        filters={[
          {
            label: 'Featured',
            value: filterFeatured,
            onChange: handleFilterFeatured,
            options: [
              { value: 'true', label: 'Featured' },
              { value: 'false', label: 'Not Featured' },
            ],
          },
        ]}
      />

      <FormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingId ? 'Edit Project' : 'Add Project'}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
          <div style={{ padding: "1.5rem", flex: 1, overflowY: "auto" }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group"><label className="form-label">Title *</label><input type="text" className="form-input" required value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Slug</label><input type="text" className="form-input" placeholder="Leave blank to auto-generate" value={formData.slug || ''} onChange={e => setFormData({...formData, slug: e.target.value})} /></div>
          </div>

          <div className="form-group"><label className="form-label">Short Description</label><textarea className="form-input" rows="2" value={formData.short_description || ''} onChange={e => setFormData({...formData, short_description: e.target.value})} /></div>
          <div className="form-group"><label className="form-label">Full Description</label><textarea className="form-input" rows="4" value={formData.full_description || ''} onChange={e => setFormData({...formData, full_description: e.target.value})} /></div>
          
          <div className="form-group">
            <label className="form-label">Tech Stack</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input type="text" className="form-input" placeholder="e.g. Next.js" value={techInput} onChange={e => setTechInput(e.target.value)} onKeyDown={(e) => { if(e.key==='Enter'){ e.preventDefault(); handleAddTech();}}} />
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

          <ImagePicker label="Thumbnail Image" value={formData.thumbnail_url} onChange={(url) => setFormData({...formData, thumbnail_url: url})} />
          <ImagePicker label="Gallery Images" multiple value={formData.images} onChange={(urls) => setFormData({...formData, images: urls})} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
             <div className="form-group"><label className="form-label">Video URL (Demo)</label><input type="url" className="form-input" value={formData.video_url || ''} onChange={e => setFormData({...formData, video_url: e.target.value})} /></div>
             <div className="form-group"><label className="form-label">GitHub URL</label><input type="url" className="form-input" value={formData.github_url || ''} onChange={e => setFormData({...formData, github_url: e.target.value})} /></div>
             <div className="form-group"><label className="form-label">Live URL</label><input type="url" className="form-input" value={formData.live_url || ''} onChange={e => setFormData({...formData, live_url: e.target.value})} /></div>
             <div className="form-group"><label className="form-label">Sort Order</label><input type="number" className="form-input" value={formData.sort_order || 0} onChange={e => setFormData({...formData, sort_order: e.target.value})} /></div>
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" id="is_featured" checked={formData.is_featured} onChange={e => setFormData({...formData, is_featured: e.target.checked})} />
            <label htmlFor="is_featured" className="form-label" style={{ marginBottom: 0 }}>Featured Project</label>
          </div>
          
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={() => setIsFormOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </FormModal>

      <ConfirmDeleteModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleDelete} itemName="project" isDeleting={isSaving} />
    </div>
  );
};
export default Projects;



