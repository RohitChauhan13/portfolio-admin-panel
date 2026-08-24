import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';
import ImagePicker from '../components/ImagePicker';
import { PageLoader } from '../components/Loader';
import { Mail, Phone, MapPin, Link, FileText, User, Hash } from 'lucide-react';

const GithubIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const LinkedinIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const TwitterIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const Personal = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    tagline: '',
    bio: '',
    profile_image_url: '',
    resume_url: '',
    email: '',
    phone: '',
    location: '',
    chat_message_limit: 10,
    github_url: '',
    linkedin_url: '',
    twitter_url: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPersonal();
  }, []);

  const fetchPersonal = async () => {
    try {
      const { data } = await axiosClient.get('/personal');
      if (data.data) {
        setFormData(prev => ({ ...prev, ...data.data }));
      }
    } catch (error) {
      toast.error('Failed to load personal data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (url) => {
    setFormData(prev => ({ ...prev, profile_image_url: url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Sanitize payload: convert empty strings to null
    const payload = { ...formData };
    Object.keys(payload).forEach(key => {
      if (payload[key] === '') {
        payload[key] = null;
      }
    });

    try {
      await axiosClient.put('/personal', payload);
      toast.success('Personal info updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update personal info');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <PageLoader text="Loading personal info..." />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Personal Information</h1>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            
            {/* Top Row: Profile Media & Basic Info */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
              
              {/* Left: Media */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <ImagePicker 
                  label="Profile Image" 
                  value={formData.profile_image_url} 
                  onChange={handleImageChange}
                  aspectRatio={1}
                />
                
                <div className="form-group">
                  <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Resume Link</label>
                  <div className="input-with-icon">
                    <div className="input-icon"><FileText size={18} /></div>
                    <input 
                      type="url" 
                      name="resume_url"
                      placeholder="https://drive.google.com/..."
                      className="form-input" 
                      value={formData.resume_url || ''} 
                      onChange={handleChange} 
                    />
                  </div>
                </div>
              </div>

              {/* Right: Basic Info */}
              <section>
                <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>Basic Info</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div className="form-group">
                    <div className="input-with-icon">
                      <div className="input-icon"><User size={18} /></div>
                      <input 
                        type="text" 
                        name="full_name"
                        placeholder="Full Name *"
                        required
                        className="form-input" 
                        value={formData.full_name || ''} 
                        onChange={handleChange} 
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="input-with-icon">
                      <div className="input-icon"><Hash size={18} /></div>
                      <input 
                        type="text" 
                        name="tagline"
                        placeholder="Tagline (e.g. Fullstack Developer)"
                        className="form-input" 
                        value={formData.tagline || ''} 
                        onChange={handleChange} 
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <textarea 
                    name="bio"
                    placeholder="Write a short bio about yourself..."
                    className="form-input" 
                    rows={6}
                    style={{ resize: 'vertical' }}
                    value={formData.bio || ''} 
                    onChange={handleChange} 
                  />
                </div>
              </section>
            </div>

            {/* Bottom Row: Contact & Socials */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
              
              {/* Contact Section */}
              <section>
                <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>Contact & Location</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div className="form-group">
                    <div className="input-with-icon">
                      <div className="input-icon"><Mail size={18} /></div>
                      <input type="email" name="email" placeholder="Email Address" className="form-input" value={formData.email || ''} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="input-with-icon">
                      <div className="input-icon"><Phone size={18} /></div>
                      <input type="text" name="phone" placeholder="Phone Number" className="form-input" value={formData.phone || ''} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="input-with-icon">
                      <div className="input-icon"><MapPin size={18} /></div>
                      <input type="text" name="location" placeholder="City, Country" className="form-input" value={formData.location || ''} onChange={handleChange} />
                    </div>
                  </div>
                </div>
              </section>
              
              {/* Social Links Section */}
              <section>
                <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>Social Profiles</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div className="form-group">
                    <div className="input-with-icon">
                      <div className="input-icon"><GithubIcon size={18} /></div>
                      <input type="url" name="github_url" placeholder="GitHub URL" className="form-input" value={formData.github_url || ''} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="input-with-icon">
                      <div className="input-icon"><LinkedinIcon size={18} /></div>
                      <input type="url" name="linkedin_url" placeholder="LinkedIn URL" className="form-input" value={formData.linkedin_url || ''} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="input-with-icon">
                      <div className="input-icon"><TwitterIcon size={18} /></div>
                      <input type="url" name="twitter_url" placeholder="Twitter URL" className="form-input" value={formData.twitter_url || ''} onChange={handleChange} />
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
              <button type="submit" className="btn btn-primary" disabled={isSaving} style={{ padding: '0.75rem 2rem' }}>
                {isSaving ? 'Saving...' : 'Save All Changes'}
              </button>
            </div>
            
          </div>
        </form>
      </div>
    </div>
  );
};

export default Personal;


