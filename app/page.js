'use client';
import { useState, useEffect } from 'react';

export default function GymFlowDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [licenses, setLicenses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    gymName: '',
    ownerName: '',
    phone: '',
    machineId: '',
    plan: 'SaaS Starter',
    expiry: ''
  });

  useEffect(() => {
    const auth = sessionStorage.getItem('gymflow_admin_auth');
    if (auth === 'true') {
      setIsLoggedIn(true);
      fetchLicenses();
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (res.ok) {
        sessionStorage.setItem('gymflow_admin_auth', 'true');
        setIsLoggedIn(true);
        fetchLicenses();
      } else {
        const err = await res.json();
        setLoginError(err.error || 'Invalid passcode');
      }
    } catch (e) {
      setLoginError('Authentication failed');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('gymflow_admin_auth');
    setIsLoggedIn(false);
    setPassword('');
  };

  const fetchLicenses = async () => {
    try {
      const res = await fetch('/api/licenses');
      if (res.ok) {
        const data = await res.json();
        setLicenses(data || []);
      }
    } catch (e) {
      console.error('Failed to fetch licenses', e);
    }
  };

  const activeLicenses = licenses.filter(l => l.status === 'Active');
  const totalRevenue = activeLicenses.reduce((acc, curr) => {
    if (curr.plan === 'SaaS Starter') return acc + 10000;
    if (curr.plan === 'SaaS Pro') return acc + 18000;
    if (curr.plan === 'SaaS Unlimited') return acc + 30000;
    return acc;
  }, 0);
  const expiredLicenses = licenses.filter(l => l.status !== 'Active').length;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleAddClick = () => {
    setFormData({
      gymName: '',
      ownerName: '',
      phone: '',
      machineId: '',
      plan: 'SaaS Starter',
      expiry: ''
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEditClick = (gym) => {
    setFormData({
      gymName: gym.name,
      ownerName: gym.ownerName || '',
      phone: gym.phone,
      machineId: gym.machineId,
      plan: gym.plan,
      expiry: gym.expiry
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setFormData({
      gymName: '',
      ownerName: '',
      phone: '',
      machineId: '',
      plan: 'SaaS Starter',
      expiry: ''
    });
  };

  const handleAddGym = async (e) => {
    e.preventDefault();
    try {
      const existingGym = licenses.find(l => l.machineId.toUpperCase() === formData.machineId.toUpperCase());
      const payload = {
        machineId: formData.machineId.trim().toUpperCase(),
        name: formData.gymName,
        phone: formData.phone,
        plan: formData.plan,
        expiry: formData.expiry,
        status: existingGym ? existingGym.status : 'Active'
      };

      const res = await fetch('/api/licenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        setIsEditing(false);
        fetchLicenses();
        setFormData({ gymName: '', ownerName: '', phone: '', machineId: '', plan: 'SaaS Starter', expiry: '' });
      }
    } catch (e) {
      console.error(e);
      alert('Failed to register gym.');
    }
  };

  const toggleStatus = async (gym) => {
    const newStatus = gym.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await fetch('/api/licenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...gym, status: newStatus })
      });
      fetchLicenses();
    } catch (e) {
      console.error(e);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="brand-header" style={{ marginBottom: '30px' }}>
            <span className="brand-glow"></span>
            <h1 style={{ fontSize: '24px' }}>GYMFLOW HUB</h1>
            <p>ADMIN PORTAL ACCESS</p>
          </div>
          <form onSubmit={handleLogin}>
            <div className="form-group" style={{ marginBottom: '25px' }}>
              <label htmlFor="adminPassword">Security Passcode</label>
              <input
                type="password"
                id="adminPassword"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin passcode"
                required
                autoFocus
              />
              {loginError && <p className="error-text">{loginError}</p>}
            </div>
            <button type="submit" className="primary-btn full-btn" style={{ padding: '14px' }}>
              Verify Credentials
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="hub-container">
      {/* SIDEBAR NAVIGATION */}
      <aside className="sidebar">
        <div className="brand-header">
          <span className="brand-glow"></span>
          <h1>GYMFLOW HUB</h1>
          <p>LICENSING & SAAS SUITE</p>
        </div>
        
        <nav className="nav-links">
          <button className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <span className="nav-icon">📊</span> Overview Dashboard
          </button>
          <button className={`nav-btn ${activeTab === 'roster' ? 'active' : ''}`} onClick={() => setActiveTab('roster')}>
            <span className="nav-icon">🏢</span> Gym Directory
          </button>
          <button className="nav-btn" onClick={handleLogout} style={{ marginTop: '20px', backgroundColor: 'transparent', border: '1.5px dashed #3a3a4c', color: 'var(--accent-red)' }}>
            <span className="nav-icon">🔒</span> Log Out Session
          </button>
        </nav>

        <div className="key-status">
          <div className="status-indicator">
            <span className="dot-green"></span> Live Cloud API
          </div>
          <div className="key-label">Vercel KV Powered</div>
        </div>
      </aside>

      {/* MAIN WINDOW PANEL */}
      <main className="content-panel">

        {/* VIEW 1: OVERVIEW DASHBOARD */}
        {activeTab === 'dashboard' && (
          <section className="view-section active">
            <div className="view-header">
              <h2>Overview Dashboard</h2>
              <p>Monitor your offline gym network licensing statuses, revenue, and active activations.</p>
            </div>

            <div className="kpi-grid">
              <div className="kpi-card revenue-glow">
                <h3>SaaS Monthly Revenue</h3>
                <div className="kpi-value">Rs. {totalRevenue.toLocaleString()}</div>
                <div className="kpi-badge">Active Subscriptions</div>
              </div>
              <div className="kpi-card active-glow">
                <h3>Total Gym Clients</h3>
                <div className="kpi-value">{licenses.length}</div>
                <div className="kpi-badge">Registered Sites</div>
              </div>
              <div className="kpi-card overdue-glow">
                <h3>Licensing Locks</h3>
                <div className="kpi-value">{expiredLicenses}</div>
                <div className="kpi-badge">Expired / Unpaid Gyms</div>
              </div>
            </div>

            <div className="quick-banner">
              <div className="banner-content">
                <h3>Quick Client Onboarding</h3>
                <p>A new gym owner installed GymFlow Pro? Input their Machine Key to instantly issue their first monthly license.</p>
              </div>
              <button className="banner-action-btn" onClick={handleAddClick}>
                + Register Gym Client
              </button>
            </div>
          </section>
        )}

        {/* VIEW 2: GYM ROSTER DIRECTORY */}
        {activeTab === 'roster' && (
          <section className="view-section active">
            <div className="view-header">
              <div className="header-flex">
                <div>
                  <h2>Gym Clients Directory</h2>
                  <p>Manage registered gym owners, monitor payments, and extend subscriptions.</p>
                </div>
                <button className="primary-btn" onClick={handleAddClick}>+ Add New Gym Owner</button>
              </div>
            </div>

            <div className="directory-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Gym Details</th>
                    <th>Hardware Lock Key</th>
                    <th>Plan Package</th>
                    <th>Licensing Expiry</th>
                    <th>Payment</th>
                    <th className="actions-header">Remote License Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {licenses.map(gym => (
                    <tr key={gym.machineId}>
                      <td className="gym-cell">
                        <h4>{gym.name}</h4>
                        <p>{gym.phone}</p>
                      </td>
                      <td className="key-cell">{gym.machineId}</td>
                      <td>
                        <span className={`plan-badge ${gym.plan.includes('Unlimited') ? 'saas-unlimited' : ''}`}>
                          {gym.plan}
                        </span>
                      </td>
                      <td>{gym.expiry}</td>
                      <td>
                        <span className={`payment-status ${gym.status === 'Active' ? 'paid' : 'overdue'}`}>
                          {gym.status}
                        </span>
                      </td>
                      <td className="table-actions">
                        <button className="action-btn extend-btn" onClick={() => handleEditClick(gym)}>Edit</button>
                        <button className="action-btn delete-btn" onClick={() => toggleStatus(gym)}>
                          {gym.status === 'Active' ? 'Revoke' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {licenses.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{textAlign: 'center', padding: '30px', color: '#555870'}}>No gyms registered yet. Add one!</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      {/* REGISTER NEW GYM DIALOG MODAL Overlay */}
      <div className={`modal-overlay ${isModalOpen ? 'open' : ''}`}>
        <div className="modal-card">
          <div className="modal-header">
            <h3>{isEditing ? 'Edit Gym Client License' : 'Onboard New Gym Owner'}</h3>
            <button className="close-modal" onClick={handleCloseModal}>&times;</button>
          </div>
          <form onSubmit={handleAddGym}>
            <div className="form-group">
              <label htmlFor="gymName">Gym / Center Name</label>
              <input type="text" id="gymName" value={formData.gymName} onChange={handleInputChange} placeholder="e.g. FitZone Arena" required />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Contact Phone Number</label>
              <input type="text" id="phone" value={formData.phone} onChange={handleInputChange} placeholder="e.g. +92 300 9876543" required />
            </div>
            <div className="form-group">
              <label htmlFor="machineId">Machine Unique Lock ID (from WPF Client)</label>
              <input 
                type="text" 
                id="machineId" 
                value={formData.machineId} 
                onChange={handleInputChange} 
                placeholder="Copy-paste WPF Hardware Key" 
                required 
                readOnly={isEditing} 
                style={isEditing ? { opacity: 0.5, cursor: 'not-allowed', backgroundColor: '#17171d' } : {}}
              />
            </div>
            <div className="form-group-row">
              <div className="form-group">
                <label htmlFor="plan">Plan Tier Package</label>
                <select id="plan" value={formData.plan} onChange={handleInputChange}>
                  <option value="SaaS Starter">SaaS Starter (Rs. 10,000/mo)</option>
                  <option value="SaaS Pro">SaaS Pro (Rs. 18,000/mo)</option>
                  <option value="SaaS Unlimited">SaaS Unlimited (Rs. 30,000/mo)</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="expiry">First Payment Expiry Date</label>
                <input type="date" id="expiry" value={formData.expiry} onChange={handleInputChange} required />
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="sec-btn" onClick={handleCloseModal}>Cancel</button>
              <button type="submit" className="primary-btn">{isEditing ? 'Save Changes' : 'Complete Onboarding'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
