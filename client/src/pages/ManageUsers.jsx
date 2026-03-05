import React, { useState, useEffect, useContext, useRef } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashTopbar from '../components/DashTopbar';
import DashFooter from '../components/DashFooter';
import UserProfileModals from '../components/UserProfileModals';
import './Dashboard.css';
import './ManageUsers.css';
import celLogo from '../assets/cel_logo.png';

const ManageUsers = () => {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);

    // Authentication strict check (Optionally enforce Admin logic here)
    useEffect(() => {
        if (user && user.role_type !== 1) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [timeStr, setTimeStr] = useState('Loading...');
    const [dateStr, setDateStr] = useState('Loading...');

    // Dashboard Shell State
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const userMenuRef = useRef(null);
    const settingsBtnRef = useRef(null);
    const notifBtnRef = useRef(null);

    const [isLightMode, setIsLightMode] = useState(false);

    // Profile & Password Modals State
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isPasswordOpen, setIsPasswordOpen] = useState(false);

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null); // null means creating NEW
    const [formData, setFormData] = useState({ name: '', username: '', password: '', role_type: 2, status: 'Active' });
    const [actionMsg, setActionMsg] = useState('');
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);

    // Activity Logs Modal States
    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
    const [activityUser, setActivityUser] = useState(null);
    const [activityLogs, setActivityLogs] = useState([]);
    const [isActivityLoading, setIsActivityLoading] = useState(false);

    const openActivityModal = async (usr) => {
        setActivityUser(usr);
        setIsActivityLoading(true);
        setIsActivityModalOpen(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/users/${usr.id}/activity`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setActivityLogs(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch activity logs:', err);
        } finally {
            setIsActivityLoading(false);
        }
    };

    const closeActivityModal = () => {
        setIsActivityModalOpen(false);
        setActivityUser(null);
        setActivityLogs([]);
    };

    const nameDisplay = user?.name || 'User';
    const roleDisplay = user?.role_type === 1 ? 'Admin' : 'Staff';
    const initials = nameDisplay.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    // Fetch Users
    const loadUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setUsers(data.data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();

        const savedTheme = 'light';
        const prefersLight = true;
        const isLight = true;
        setIsLightMode(true);
        document.documentElement.setAttribute('data-theme', 'light');

        const tick = () => {
            const now = new Date();
            setTimeStr(now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
            setDateStr(now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }));
        };
        tick();
        const timer = setInterval(tick, 30000);

        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) setIsUserMenuOpen(false);
            if (settingsBtnRef.current && !settingsBtnRef.current.contains(event.target)) setIsSettingsOpen(false);
            if (notifBtnRef.current && !notifBtnRef.current.contains(event.target)) setIsNotifOpen(false);
            // Close profile/password modals if clicked outside
            if (isProfileOpen) setIsProfileOpen(false);
            if (isPasswordOpen) setIsPasswordOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                setIsUserMenuOpen(false);
                setIsSettingsOpen(false);
                setIsNotifOpen(false);
                setIsProfileOpen(false);
                setIsPasswordOpen(false);
            }
        });

        return () => {
            clearInterval(timer);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleThemeToggle = () => {
        const newMode = !isLightMode;
        setIsLightMode(newMode);
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    };

    const toggleSettingsMenu = (e) => { e.stopPropagation(); setIsUserMenuOpen(false); setIsNotifOpen(false); setIsProfileOpen(false); setIsPasswordOpen(false); setIsSettingsOpen(!isSettingsOpen); };
    const toggleUserMenu = (e) => { e.stopPropagation(); setIsSettingsOpen(false); setIsNotifOpen(false); setIsProfileOpen(false); setIsPasswordOpen(false); setIsUserMenuOpen(!isUserMenuOpen); };
    const toggleNotifMenu = (e) => { e.stopPropagation(); setIsUserMenuOpen(false); setIsSettingsOpen(false); setIsProfileOpen(false); setIsPasswordOpen(false); setIsNotifOpen(!isNotifOpen); };

    const handleLogout = () => { logout(); navigate('/login'); };

    const openModal = (usr = null) => {
        setEditingUser(usr);
        if (usr) {
            setFormData({ name: usr.name, username: usr.username, password: '', role_type: usr.role_type, status: usr.status });
        } else {
            setFormData({ name: '', username: '', password: '', role_type: 2, status: 'Active' });
        }
        setActionMsg('');
        setErrors({});
        setShowPassword(false);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setErrors({});
        setShowPassword(false);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear specific error when user starts typing
        if (errors[name] || errors.general) {
            setErrors(prev => ({ ...prev, [name]: null, general: null }));
        }
        setActionMsg('');
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "This field is required";
        if (!formData.username.trim()) newErrors.username = "This field is required";
        if (!editingUser && !formData.password.trim()) newErrors.password = "This field is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setActionMsg('Saving...');
        try {
            const token = localStorage.getItem('token');
            const url = editingUser ? `http://localhost:5000/api/users/${editingUser.id}` : 'http://localhost:5000/api/users';
            const method = editingUser ? 'PUT' : 'POST';

            // Filter out empty password on edit
            const payload = { ...formData };
            if (editingUser && !payload.password) delete payload.password;

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (data.success) {
                setActionMsg(editingUser ? 'User updated!' : 'User created!');
                setTimeout(() => {
                    closeModal();
                    loadUsers();
                }, 1000);
            } else {
                if (data.message.toLowerCase().includes('username')) {
                    setErrors({ username: 'Username already exists. Please choose another.' });
                    setActionMsg('');
                } else {
                    setActionMsg(`Error: ${data.message}`);
                }
            }
        } catch (err) {
            console.error(err);
            setActionMsg('An error occurred during save.');
        }
    };


    return (
        <div className="dashboard-layout">
            <div className="dash-bg-wrap"></div>
            <div className="dash-bg-grid"></div>
            <div className="dash-orb dash-orb-1"></div>
            <div className="dash-orb dash-orb-2"></div>
            <div className="dash-stars"></div>

            {(isUserMenuOpen || isSettingsOpen || isNotifOpen || isProfileOpen || isPasswordOpen) && (
                <div
                    className="dash-overlay active"
                    onClick={() => { setIsUserMenuOpen(false); setIsSettingsOpen(false); setIsNotifOpen(false); setIsProfileOpen(false); setIsPasswordOpen(false); }}
                ></div>
            )}

            <div className="dash-page">
                <DashTopbar
                    user={user}
                    logout={logout}
                    nameDisplay={nameDisplay}
                    roleDisplay={roleDisplay}
                    initials={initials}
                    isLightMode={isLightMode}
                    handleThemeToggle={handleThemeToggle}
                    isUserMenuOpen={isUserMenuOpen}
                    toggleUserMenu={toggleUserMenu}
                    userMenuRef={userMenuRef}
                    isSettingsOpen={isSettingsOpen}
                    toggleSettingsMenu={toggleSettingsMenu}
                    settingsBtnRef={settingsBtnRef}
                    isNotifOpen={isNotifOpen}
                    toggleNotifMenu={toggleNotifMenu}
                    notifBtnRef={notifBtnRef}
                    setIsProfileOpen={setIsProfileOpen}
                    setIsPasswordOpen={setIsPasswordOpen}
                    setIsUserMenuOpen={setIsUserMenuOpen}
                    setIsSettingsOpen={setIsSettingsOpen}
                    setIsNotifOpen={setIsNotifOpen}
                    currentPage="Manage Users"
                    parentPage="Dashboard"
                    parentPageLink="/dashboard"
                />

                {/* MAIN TABLE AREA */}
                <div style={{ padding: '32px' }}>
                    <div className="dash-content-topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
                        <div className="dash-content-heading">
                            <h1 className="dash-content-title" style={{ fontSize: '1.6rem', color: 'var(--dash-tx-1)', margin: 0 }}>Manage Users</h1>
                            <div className="dash-content-meta" style={{ marginTop: '8px', color: 'var(--dash-tx-3)' }}>
                                <span>Administration</span>
                                <span className="dash-content-meta-sep" style={{ margin: '0 8px' }}>·</span>
                                <span>{users.length} Active Accounts</span>
                            </div>
                        </div>
                        <button className="dash-btn-add user" onClick={() => openModal(null)}>
                            <div className="dash-btn-add-inner">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                                Add New User
                            </div>
                        </button>
                    </div>

                    <div className="dash-kpi-panel">
                        {isLoading ? (
                            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--dash-tx-2)' }}>Loading users...</div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table className="dash-kpi-table" id="kpi-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Name</th>
                                            <th>Username</th>
                                            <th>Role</th>
                                            <th>Status</th>
                                            <th>Last Login</th>
                                            <th>Total Records</th>
                                            <th style={{ textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(u => (
                                            <tr key={u.id}>
                                                <td>{u.id}</td>
                                                <td style={{ fontWeight: 500 }}>{u.name}</td>
                                                <td>{u.username}</td>
                                                <td>
                                                    <span className="mu-role-pill" data-type={u.role_type === 1 ? 'admin' : 'staff'}>
                                                        {u.role_type === 1 ? 'Admin' : 'Staff'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="mu-status-pill" data-status={u.status.toLowerCase()}>
                                                        {u.status}
                                                    </span>
                                                </td>
                                                <td style={{ fontSize: '0.85rem', color: u.last_login ? 'var(--dash-tx-2)' : 'var(--dash-tx-3)' }}>
                                                    {u.last_login ? new Date(u.last_login).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' }) : 'Never'}
                                                </td>
                                                <td style={{ fontWeight: 600, color: 'var(--dash-tx-1)' }}>
                                                    {u.total_records || 0}
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <button className="mu-action-btn view" title="View Activity Logs" onClick={() => openActivityModal(u)}>
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                                    </button>
                                                    <button className="mu-action-btn edit" title="Edit Admin" onClick={() => openModal(u)}>
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {users.length === 0 && (
                                            <tr>
                                                <td colSpan="8" style={{ textAlign: 'center', padding: '24px' }}>No users found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* ACTIVITY LOGS MODAL */}
                <div className={`modal-overlay ${isActivityModalOpen ? 'show' : ''}`} onClick={(e) => { if (e.target.classList.contains('modal-overlay')) closeActivityModal(); }}>
                    <div className="modal modal-lg" style={{ maxWidth: '800px', width: '90%' }}>
                        <div className="modal-head">
                            <span className="modal-title">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                {activityUser ? `${activityUser.name} - Activity Logs` : 'Activity Logs'}
                            </span>
                            <button className="modal-close" onClick={closeActivityModal}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="modal-body" style={{ padding: 0 }}>
                            {isActivityLoading ? (
                                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--dash-tx-3)' }}>Loading Activity Logs...</div>
                            ) : (
                                <div style={{ overflowX: 'auto', maxHeight: '500px', overflowY: 'auto' }}>
                                    <table className="dash-kpi-table" style={{ borderTop: 'none' }}>
                                        <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                                            <tr>
                                                <th>Action</th>
                                                <th>Time</th>
                                                <th>Duration</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {activityLogs.map((log, idx) => (
                                                <tr key={idx}>
                                                    <td style={{ fontWeight: 500 }}>{log.action}</td>
                                                    <td style={{ color: 'var(--dash-tx-2)' }}>{new Date(log.action_time).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                                                    <td>
                                                        {log.action === 'Logout' && log.session_duration_minutes
                                                            ? `${log.session_duration_minutes} min`
                                                            : '—'}
                                                    </td>
                                                    <td>
                                                        <span className="mu-status-pill" data-status={log.status === 'Success' ? 'active' : 'inactive'}>
                                                            {log.status === 'Success' ? 'Success' : 'Failed'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {activityLogs.length === 0 && (
                                                <tr>
                                                    <td colSpan="4" style={{ textAlign: 'center', padding: '32px', color: 'var(--dash-tx-3)' }}>No activity logs recorded yet.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <DashFooter />
            </div>

            {/* User Modal */}
            {isModalOpen && (
                <div className="mu-modal-overlay">
                    <div className="mu-modal-content scale-in">
                        <div className="mu-modal-header">
                            <h2>{editingUser ? 'Edit User' : 'Add New User'}</h2>
                            <button className="mu-close-btn" onClick={closeModal}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="mu-modal-form" noValidate>
                            <div className="mu-input-group">
                                <label>Full Name *</label>
                                <input type="text" name="name" className={errors.name ? 'mu-input-error' : ''} value={formData.name} onChange={handleFormChange} />
                                {errors.name && <span className="mu-error-text">{errors.name}</span>}
                            </div>
                            <div className="mu-input-group">
                                <label>Username (Email) *</label>
                                <input type="email" name="username" className={errors.username ? 'mu-input-error' : ''} value={formData.username} onChange={handleFormChange} />
                                {errors.username && <span className="mu-error-text">{errors.username}</span>}
                            </div>
                            <div className="mu-input-group">
                                <label>Password {editingUser ? '(leave blank to keep current)' : '*'}</label>
                                <div className="mu-pwd-wrap">
                                    <input type={showPassword ? "text" : "password"} name="password" className={errors.password ? 'mu-input-error' : ''} value={formData.password} onChange={handleFormChange} />
                                    <button type="button" className="mu-pwd-toggle" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" /></svg>
                                        ) : (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                        )}
                                    </button>
                                </div>
                                {errors.password && <span className="mu-error-text">{errors.password}</span>}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="mu-input-group" style={{ width: '100%' }}>
                                    <label>Role</label>
                                    <select name="role_type" value={formData.role_type} onChange={(e) => setFormData({ ...formData, role_type: parseInt(e.target.value) })}>
                                        <option value={1}>Admin</option>
                                        <option value={2}>Staff</option>
                                    </select>
                                </div>
                                <div className="mu-input-group" style={{ width: '100%' }}>
                                    <label>Status</label>
                                    <select name="status" value={formData.status} onChange={handleFormChange}>
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            {actionMsg && <div className="mu-action-msg">{actionMsg}</div>}

                            <div className="mu-modal-actions">
                                <button type="button" className="mu-btn-cancel" onClick={closeModal}>Cancel</button>
                                <button type="submit" className="mu-btn-save">
                                    {editingUser ? 'Save Changes' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <UserProfileModals
                isProfileOpen={isProfileOpen}
                setIsProfileOpen={setIsProfileOpen}
                isPasswordOpen={isPasswordOpen}
                setIsPasswordOpen={setIsPasswordOpen}
            />
        </div>
    );
};

export default ManageUsers;
