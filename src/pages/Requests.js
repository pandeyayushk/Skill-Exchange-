import React, { useState, useEffect } from 'react';
import api from '../api';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/users/requests');
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (id) => {
    try {
      await api.post('/users/accept', { requestUserId: id });
      toast.success('Connection accepted!');
      fetchRequests();
    } catch (err) {
      toast.error('Failed to accept request');
    }
  };

  const handleRejectRequest = async (id) => {
    try {
      await api.post('/users/reject', { requestUserId: id });
      toast.success('Connection rejected');
      fetchRequests();
    } catch (err) {
      toast.error('Failed to reject request');
    }
  };

  return (
    <div className="page container" style={{ maxWidth: '900px' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
        <Clock size={28} className="gradient-text" /> 
        Pending Connection Requests
      </h2>
      
      {loading ? (
        <div className="glass-panel" style={{ padding: '22px', textAlign: 'center' }}>
          <div style={{ fontWeight: 600, marginBottom: '6px' }}>Loading requests…</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>People who want to connect will show up here.</div>
        </div>
      ) : requests.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ fontWeight: 600, marginBottom: '8px' }}>No pending requests</p>
          <p style={{ color: 'var(--text-muted)' }}>When someone sends you a request, you can accept or reject it here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {requests.map(req => (
            <div key={req._id} className="glass-panel" style={{ 
              padding: '18px 20px', 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '15px'
            }}>
              <div>
                <p style={{ fontWeight: '600', fontSize: '18px', margin: '0 0 8px 0' }}>{req.name}</p>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <p style={{ fontSize: '14px', margin: 0, color: 'var(--text-muted)' }}>
                    <strong>Offers:</strong> {req.skillsOffered?.join(', ') || 'None'}
                  </p>
                  <p style={{ fontSize: '14px', margin: 0, color: 'var(--text-muted)' }}>
                    <strong>Needs:</strong> {req.skillsNeeded?.join(', ') || 'None'}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => handleAcceptRequest(req._id)}
                  className="glass-button"
                  style={{ width: 'auto', padding: '8px 16px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}
                >
                  <CheckCircle size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Accept
                </button>
                <button 
                  onClick={() => handleRejectRequest(req._id)}
                  className="glass-button"
                  style={{ width: 'auto', padding: '8px 16px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
                >
                  <XCircle size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Requests;
