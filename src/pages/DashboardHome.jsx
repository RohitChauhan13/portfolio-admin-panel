import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { MessageSquare, Loader, Users, Calendar, BarChart3, Bot, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardHome = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosClient.get('/analytics/dashboard');
        setStats(res.data.data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Dashboard Overview</h1>
      </div>
      
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Welcome back, Admin 👋</h2>
        <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
          Here is a quick overview of your portfolio content and analytics.
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
          <Loader className="spin" size={18} /> Loading statistics...
        </div>
      ) : stats ? (
        <>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={20} /> Visitor Traffic
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={16} /> Today
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--accent-color)', lineHeight: 1 }}>{stats.visits.today}</div>
            </div>
            
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={16} /> This Week
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--accent-color)', lineHeight: 1 }}>{stats.visits.week}</div>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={16} /> This Month
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--accent-color)', lineHeight: 1 }}>{stats.visits.month}</div>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart3 size={16} /> This Year
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--accent-color)', lineHeight: 1 }}>{stats.visits.year}</div>
            </div>

          </div>

          <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Star size={20} /> Engagement & Content
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            
            <Link to="/messages" className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', transition: 'transform var(--transition-fast)' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
              <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning-color)', borderRadius: 'var(--radius-md)' }}>
                <MessageSquare size={32} />
              </div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: '700', lineHeight: 1 }}>{stats.engagement.contact_messages}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Contact Messages</div>
              </div>
            </Link>

            <Link to="/feedback" className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', transition: 'transform var(--transition-fast)' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
              <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: 'var(--radius-md)' }}>
                <Star size={32} />
              </div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: '700', lineHeight: 1 }}>{stats.engagement.feedback}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Feedback Received</div>
              </div>
            </Link>

            <Link to="/chat-logs" className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', transition: 'transform var(--transition-fast)', textDecoration: 'none' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
              <div style={{ padding: '1rem', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', borderRadius: 'var(--radius-md)' }}>
                <Bot size={32} />
              </div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: '700', lineHeight: 1 }}>{stats.engagement.bot_conversations}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Bot Conversations</div>
              </div>
            </Link>

          </div>
        </>
      ) : (
        <div className="empty-state card">Failed to load statistics.</div>
      )}

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default DashboardHome;

