import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, MessageSquare, LogOut, User, X } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfile, setShowProfile] = useState(false);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
  const [skillsOffered, setSkillsOffered] = useState(user.skillsOffered?.join(', ') || '');
  const [skillsNeeded, setSkillsNeeded] = useState(user.skillsNeeded?.join(', ') || '');
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/users/profile', { skillsOffered, skillsNeeded });
      localStorage.setItem('user', JSON.stringify(res.data));
      setUser(res.data);
      toast.success('Profile updated successfully!');
      setTimeout(() => setShowProfile(false), 500);
    } catch (err) {
      toast.error('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  // NavItems
  const navItems = [
    { path: '/', label: 'Home', icon: <Home size={20} /> },
    { path: '/requests', label: 'Requests', icon: <User size={20} /> },
    { path: '/chat', label: 'Chat', icon: <MessageSquare size={20} /> }
  ];

  return (
    <>
      <nav className="glass-panel topbar">
        <div className="gradient-text topbar__brand">
          Skill Exchange
        </div>

        <div className="nav">
          {navItems.map(item => (
            <Link 
              key={item.path} 
              to={item.path}
              className={`navlink ${location.pathname === item.path ? 'navlink--active' : ''}`}
            >
              {item.icon}
              <span className="navlink__label">{item.label}</span>
            </Link>
          ))}

          {/* Profile Circle */}
          <div 
            onClick={() => setShowProfile(true)}
            style={{ 
              background: 'linear-gradient(135deg, var(--primary), #ec4899)', 
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              fontWeight: 'bold',
              color: 'white',
              fontSize: '14px',
              cursor: 'pointer',
              marginLeft: '6px',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 10px rgba(79, 70, 229, 0.4)'
            }}
            title="Edit Profile"
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {user.name ? (user.name.split(' ').length > 1 ? (user.name.split(' ')[0][0] + user.name.split(' ')[1][0]).toUpperCase() : user.name.substring(0, 2).toUpperCase()) : 'U'}
          </div>

          <button
          onClick={handleLogout}
          className="icon-button"
          title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      {/* Profile Modal */}
      {showProfile && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div className="glass-panel" style={{ padding: '30px', width: '100%', maxWidth: '400px', position: 'relative' }}>
            <button 
              onClick={() => setShowProfile(false)}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            
            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Your Profile</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>{user.email}</p>

            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Skills You Offer (comma separated)</label>
                <input 
                  type="text" 
                  className="glass-input" 
                  value={skillsOffered}
                  onChange={(e) => setSkillsOffered(e.target.value)}
                  placeholder="e.g. React, Node.js"
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Skills You Need (comma separated)</label>
                <input 
                  type="text" 
                  className="glass-input" 
                  value={skillsNeeded}
                  onChange={(e) => setSkillsNeeded(e.target.value)}
                  placeholder="e.g. Python, UI Design"
                />
              </div>

              <button 
                type="submit" 
                className="glass-button" 
                style={{ marginTop: '10px' }}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
