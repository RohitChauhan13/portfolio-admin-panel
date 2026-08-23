import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserCircle, 
  User,
  GraduationCap, 
  Briefcase, 
  FolderGit2, 
  Wrench, 
  MessageSquare, 
  MessageCircle,
  Star,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  X
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import axiosClient from '../api/axiosClient';
import './Sidebar.css';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/personal', label: 'Personal Info', icon: UserCircle },
  { path: '/education', label: 'Education', icon: GraduationCap },
  { path: '/experience', label: 'Experience', icon: Briefcase },
  { path: '/projects', label: 'Projects', icon: FolderGit2 },
  { path: '/skills', label: 'Skills', icon: Wrench },
  { path: '/messages', label: 'Contact Messages', icon: MessageSquare },
  { path: '/chat-logs', label: 'RAG Chat', icon: MessageCircle },
];

const Sidebar = ({ isOpen, onToggle }) => {
  const { logout } = useAuth();
  const [personalInfo, setPersonalInfo] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const fetchPersonal = async () => {
      try {
        const { data } = await axiosClient.get('/personal');
        if (data.data) {
          setPersonalInfo(data.data);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchPersonal();
  }, []);

  const getInitials = () => {
    if (personalInfo?.full_name) {
      const parts = personalInfo.full_name.trim().split(' ');
      if (parts.length > 1) return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
      return parts[0][0].toUpperCase();
    }
    return 'AD';
  };

  const profileImg = personalInfo?.profile_image_url;

  return (
    <>
      <aside className={`sidebar ${isOpen ? '' : 'collapsed'}`}>
        <div className="sidebar-header">
          {isOpen && <h2>Admin</h2>}
          <button 
            onClick={onToggle} 
            className="btn-icon sidebar-toggle-btn" 
            title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {isOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} end>
            <LayoutDashboard size={20} /> {isOpen && <span className="nav-text">Dashboard</span>}
          </NavLink>
          <NavLink to="/personal" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <User size={20} /> {isOpen && <span className="nav-text">Personal Info</span>}
          </NavLink>
          <NavLink to="/education" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <GraduationCap size={20} /> {isOpen && <span className="nav-text">Education</span>}
          </NavLink>
          <NavLink to="/experience" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <Briefcase size={20} /> {isOpen && <span className="nav-text">Experience</span>}
          </NavLink>
          <NavLink to="/projects" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <FolderGit2 size={20} /> {isOpen && <span className="nav-text">Projects</span>}
          </NavLink>
          <NavLink to="/skills" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <Wrench size={20} /> {isOpen && <span className="nav-text">Skills</span>}
          </NavLink>
          <NavLink to="/messages" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <MessageSquare size={20} /> {isOpen && <span className="nav-text">Messages</span>}
          </NavLink>
          <NavLink to="/feedback" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <Star size={20} /> {isOpen && <span className="nav-text">Feedback</span>}
          </NavLink>
          <NavLink to="/chat-logs" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <MessageCircle size={20} /> {isOpen && <span className="nav-text">RAG Chat</span>}
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-profile-section">
            {profileImg ? (
              <img 
                src={profileImg} 
                alt="Profile" 
                className="sidebar-avatar" 
                onClick={() => setShowPreview(true)}
                title="Click to preview"
              />
            ) : (
              <div className="sidebar-avatar initials" title="Profile">
                {getInitials()}
              </div>
            )}
          </div>

          <button onClick={logout} className={`logout-btn-action ${isOpen ? 'expanded' : 'collapsed'}`} title="Log Out">
            <LogOut size={18} />
            {isOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {showPreview && profileImg && (
        <div className="profile-preview-overlay" onClick={() => setShowPreview(false)}>
          <div className="profile-preview-content" onClick={e => e.stopPropagation()}>
            <button className="close-preview-btn" onClick={() => setShowPreview(false)}>
              <X size={24} />
            </button>
            <img src={profileImg} alt="Profile Full Preview" />
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;

