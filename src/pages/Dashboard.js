import React, { useState, useEffect } from 'react';
import api from '../api';
import { UserPlus, Sparkles, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sentRequests, setSentRequests] = useState(new Set());

  useEffect(() => {
    fetchMatches();
  }, []);


  const fetchMatches = async () => {
    try {
      const res = await api.get('/users/matches');
      setMatches(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (targetUserId) => {
    try {
      await api.post('/users/connect', { targetUserId });
      setSentRequests(new Set([...sentRequests, targetUserId]));
      toast.success('Connection request sent!');
      fetchMatches();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error sending request');
    }
  };


  return (
    <div className="page container">

      {/* Matches Section */}
      <div style={{ textAlign: 'center', marginBottom: '26px' }}>
        <h1 className="gradient-text" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', margin: '0 0 10px 0' }}>
          <Sparkles size={32} color="#ec4899" />
          Your Automatic Matches
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Based on the skills you need and what others offer.</p>
      </div>

      {loading ? (
        <div className="glass-panel" style={{ padding: '22px', textAlign: 'center' }}>
          <div style={{ fontWeight: 600, marginBottom: '6px' }}>Finding matches…</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>We’ll show people who offer what you need.</div>
        </div>
      ) : matches.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ fontWeight: 600, marginBottom: '8px' }}>No matches yet</p>
          <p style={{ color: 'var(--text-muted)' }}>Update your “Skills Needed” in Profile, then come back.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {matches.map(match => (
            <div key={match._id} className="glass-panel" style={{ padding: '22px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ flexGrow: 1 }}>
                <h3 style={{ fontSize: '20px', margin: '0 0 15px 0' }}>{match.name}</h3>
                
                <div style={{ marginBottom: '15px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Offers</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '5px' }}>
                    {match.skillsOffered?.map((skill, i) => (
                      <span key={i} style={{ background: 'rgba(79, 70, 229, 0.2)', color: '#818cf8', padding: '4px 10px', borderRadius: '12px', fontSize: '14px' }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Needs</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '5px' }}>
                    {match.skillsNeeded?.map((skill, i) => (
                      <span key={i} style={{ background: 'rgba(236, 72, 153, 0.2)', color: '#f472b6', padding: '4px 10px', borderRadius: '12px', fontSize: '14px' }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => handleConnect(match._id)} 
                className="glass-button" 
                disabled={sentRequests.has(match._id)}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  gap: '8px',
                  background: sentRequests.has(match._id) ? 'rgba(16, 185, 129, 0.2)' : undefined,
                  color: sentRequests.has(match._id) ? '#10b981' : 'white'
                }}
              >
                {sentRequests.has(match._id) ? (
                  <><CheckCircle size={18} /> Request Sent</>
                ) : (
                  <><UserPlus size={18} /> Connect</>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
