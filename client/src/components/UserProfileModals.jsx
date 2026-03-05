import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import './UserProfileModals.css';

const UserProfileModals = ({
    isProfileOpen, setIsProfileOpen,
    isPasswordOpen, setIsPasswordOpen
}) => {
    const { user, updateUserContext } = useAuth();

    const [profileName, setProfileName] = useState(user?.name || '');
    const [profileError, setProfileError] = useState('');
    const [profileSuccess, setProfileSuccess] = useState('');
    const [isProfileSaving, setIsProfileSaving] = useState(false);

    const [pwdData, setPwdData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [pwdErrors, setPwdErrors] = useState({});
    const [pwdSuccess, setPwdSuccess] = useState('');
    const [isPwdSaving, setIsPwdSaving] = useState(false);

    // Toggles
    const [showCurrentPwd, setShowCurrentPwd] = useState(false);
    const [showNewPwd, setShowNewPwd] = useState(false);
    const [showConfirmPwd, setShowConfirmPwd] = useState(false);

    // Profile Logic
    const closeProfile = () => {
        setIsProfileOpen(false);
        setProfileError('');
        setProfileSuccess('');
        setProfileName(user?.name || '');
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileError('');
        setProfileSuccess('');

        if (!profileName.trim()) {
            setProfileError('Name field is required');
            return;
        }

        setIsProfileSaving(true);
        try {
            const { data } = await api.put('/auth/profile', { name: profileName });
            if (data.success) {
                updateUserContext({ name: data.user.name });
                setProfileSuccess('Profile updated successfully!');
                setTimeout(closeProfile, 2000);
            }
        } catch (err) {
            setProfileError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsProfileSaving(false);
        }
    };

    // Password Logic
    const closePassword = () => {
        setIsPasswordOpen(false);
        setPwdErrors({});
        setPwdSuccess('');
        setPwdData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowCurrentPwd(false);
        setShowNewPwd(false);
        setShowConfirmPwd(false);
    };

    const validatePwd = () => {
        const errors = {};
        if (!pwdData.currentPassword) errors.currentPassword = 'This field is required';
        if (!pwdData.newPassword) errors.newPassword = 'This field is required';
        else {
            const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!pwdRegex.test(pwdData.newPassword)) {
                errors.newPassword = 'Password must be 8+ chars, with 1 uppercase, 1 lowercase, 1 number, and 1 special character.';
            }
        }
        if (!pwdData.confirmPassword) errors.confirmPassword = 'This field is required';
        else if (pwdData.newPassword !== pwdData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        setPwdErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPwdSuccess('');
        if (!validatePwd()) return;

        setIsPwdSaving(true);
        try {
            const { data } = await api.put('/auth/password', {
                currentPassword: pwdData.currentPassword,
                newPassword: pwdData.newPassword
            });
            if (data.success) {
                setPwdSuccess('Password changed successfully!');
                setTimeout(closePassword, 2000);
            }
        } catch (err) {
            setPwdErrors({ general: err.response?.data?.message || 'Failed to change password' });
        } finally {
            setIsPwdSaving(false);
        }
    };

    return (
        <>
            {/* PROFILE MODAL */}
            <div className={`modal-overlay ${isProfileOpen ? 'show' : ''}`} onClick={(e) => { if (e.target.classList.contains('modal-overlay')) closeProfile(); }}>
                <div className="modal">
                    <div className="modal-head">
                        <span className="modal-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            Update Profile
                        </span>
                        <button className="modal-close" onClick={closeProfile} disabled={isProfileSaving}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <form onSubmit={handleProfileSubmit}>
                        <div className="modal-body">
                            <div className={`form-success-msg ${profileSuccess ? 'show' : ''}`}>
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                {profileSuccess || 'Success'}
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="pro-username">Username (Email) <span style={{ color: 'var(--tx3)' }}>(Read-only)</span></label>
                                <input type="text" id="pro-username" className="form-input" value={user?.username || ''} disabled placeholder="shiblee@celworld.com" />
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="pro-name">Full Name <span className="req">*</span></label>
                                <input type="text" id="pro-name" className={`form-input ${profileError ? 'error-border' : ''}`} value={profileName} onChange={(e) => { setProfileName(e.target.value); setProfileError(''); }} disabled={isProfileSaving} placeholder="Enter full name" />
                                {profileError && <div className="form-error-msg">{profileError}</div>}
                            </div>
                        </div>
                        <div className="modal-foot">
                            <button type="button" className="dash-btn-outline" onClick={closeProfile} disabled={isProfileSaving}>Cancel</button>
                            <button type="submit" className="dash-btn-primary" disabled={isProfileSaving}>
                                {isProfileSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* PASSWORD MODAL */}
            <div className={`modal-overlay ${isPasswordOpen ? 'show' : ''}`} onClick={(e) => { if (e.target.classList.contains('modal-overlay')) closePassword(); }}>
                <div className="modal">
                    <div className="modal-head">
                        <span className="modal-title">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                            Change Password
                        </span>
                        <button className="modal-close" onClick={closePassword} disabled={isPwdSaving}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <form onSubmit={handlePasswordSubmit}>
                        <div className="modal-body">
                            <div className={`form-success-msg ${pwdSuccess ? 'show' : ''}`}>
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                                {pwdSuccess || 'Success'}
                            </div>

                            {pwdErrors.general && <div style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '10px 12px', borderRadius: '6px', marginBottom: '16px', fontSize: '0.9rem' }}>
                                {pwdErrors.general}
                            </div>}

                            <div className="form-group">
                                <label className="form-label" htmlFor="pwd-current">Current Password <span className="req">*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <input type={showCurrentPwd ? "text" : "password"} id="pwd-current" className={`form-input ${pwdErrors.currentPassword ? 'error-border' : ''}`} value={pwdData.currentPassword} onChange={(e) => { setPwdData({ ...pwdData, currentPassword: e.target.value }); setPwdErrors({ ...pwdErrors, currentPassword: '', general: '' }); }} disabled={isPwdSaving} placeholder="Enter current password" style={{ paddingRight: '40px' }} />
                                    <button type="button" onClick={() => setShowCurrentPwd(!showCurrentPwd)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--tx3)', cursor: 'pointer', padding: 0 }}>
                                        {showCurrentPwd ? <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" /></svg> : <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>}
                                    </button>
                                </div>
                                {pwdErrors.currentPassword && <div className="form-error-msg">{pwdErrors.currentPassword}</div>}
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="pwd-new">New Password <span className="req">*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <input type={showNewPwd ? "text" : "password"} id="pwd-new" className={`form-input ${pwdErrors.newPassword ? 'error-border' : ''}`} value={pwdData.newPassword} onChange={(e) => { setPwdData({ ...pwdData, newPassword: e.target.value }); setPwdErrors({ ...pwdErrors, newPassword: '', general: '' }); }} disabled={isPwdSaving} placeholder="Enter new password" style={{ paddingRight: '40px' }} />
                                    <button type="button" onClick={() => setShowNewPwd(!showNewPwd)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--tx3)', cursor: 'pointer', padding: 0 }}>
                                        {showNewPwd ? <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" /></svg> : <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>}
                                    </button>
                                </div>
                                {pwdErrors.newPassword && <div className="form-error-msg">{pwdErrors.newPassword}</div>}
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="pwd-confirm">Confirm Password <span className="req">*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <input type={showConfirmPwd ? "text" : "password"} id="pwd-confirm" className={`form-input ${pwdErrors.confirmPassword ? 'error-border' : ''}`} value={pwdData.confirmPassword} onChange={(e) => { setPwdData({ ...pwdData, confirmPassword: e.target.value }); setPwdErrors({ ...pwdErrors, confirmPassword: '', general: '' }); }} disabled={isPwdSaving} placeholder="Confirm new password" style={{ paddingRight: '40px' }} />
                                    <button type="button" onClick={() => setShowConfirmPwd(!showConfirmPwd)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--tx3)', cursor: 'pointer', padding: 0 }}>
                                        {showConfirmPwd ? <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" /></svg> : <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>}
                                    </button>
                                </div>
                                {pwdErrors.confirmPassword && <div className="form-error-msg">{pwdErrors.confirmPassword}</div>}
                            </div>

                        </div>
                        <div className="modal-foot">
                            <button type="button" className="dash-btn-outline" onClick={closePassword} disabled={isPwdSaving}>Cancel</button>
                            <button type="submit" className="dash-btn-primary" disabled={isPwdSaving}>
                                {isPwdSaving ? 'Changing...' : 'Change Password'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default UserProfileModals;
