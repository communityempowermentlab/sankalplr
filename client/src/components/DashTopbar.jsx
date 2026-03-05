import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import AuthContext from '../context/AuthContext';
import celLogo from '../assets/cel_logo.png';

const DashTopbar = ({
    isLightMode,
    handleThemeToggle,
    isUserMenuOpen,
    toggleUserMenu,
    userMenuRef,
    isSettingsOpen,
    toggleSettingsMenu,
    settingsBtnRef,
    isNotifOpen,
    toggleNotifMenu,
    notifBtnRef,
    setIsProfileOpen,
    setIsPasswordOpen,
    setIsUserMenuOpen,
    setIsSettingsOpen,
    setIsNotifOpen,
    pageTitle,
    currentPage,
    parentPage,
    parentPageLink
}) => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [isSupportOpen, setIsSupportOpen] = useState(false);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isSupportOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [isSupportOpen]);

    // In some pages, handleLogout is passed explicitly; or we synthesize it from logout + navigate
    const handleSignOut = (e) => {
        if (e) e.preventDefault();
        logout();
        navigate('/login');
    };

    // Synthesize display texts if missing
    const finalName = user?.name ? user.name : 'User';
    const finalRole = user?.role_type === 1 ? 'Admin' : 'Staff';
    const finalInitials = finalName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    return (
        <header className="dash-topbar" style={{ animation: 'dash-fade-down .7s cubic-bezier(.16,1,.3,1) both' }}>
            <div className="dash-topbar-inner">
                <a className="dash-logo-wrap" href="#" onClick={(e) => { e.preventDefault(); if (navigate) navigate('/dashboard'); }}>
                    <img
                        src={celLogo}
                        alt="CEL Logo"
                        style={{
                            height: '42px',
                            width: 'auto',
                            filter: isLightMode ? 'none' : 'invert(1) hue-rotate(180deg) brightness(1.5)'
                        }}
                    />
                </a>

                <div className="dash-nav-div"></div>

                <div className="dash-page-context">
                    {parentPage && (
                        <>
                            <span className="dash-page-title" style={{ cursor: 'pointer' }} onClick={() => navigate(parentPageLink || '/dashboard')}>{parentPage}</span>
                            <span className="dash-page-sub">/ {currentPage || pageTitle}</span>
                        </>
                    )}
                    {!parentPage && (
                        <span className="dash-page-title">{pageTitle || currentPage || 'Dashboard'}</span>
                    )}
                </div>

                <div className="dash-spacer"></div>

                <div className="dash-hdr-right">
                    {/* Theme toggle */}
                    {handleThemeToggle && (
                        <label className="dash-th-pill" title="Toggle light/dark">
                            <input type="checkbox" id="theme-toggle" checked={true} readOnly style={{ display: 'none' }} />
                            <div className="dash-th-track"></div>
                            <div className="dash-th-thumb">
                                <svg className="dash-i-sun" viewBox="0 0 24 24" fill="none" stroke="#a87030" strokeWidth="2.5" strokeLinecap="round">
                                    <circle cx="12" cy="12" r="4" />
                                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                                </svg>
                                <svg className="dash-i-moon" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                </svg>
                            </div>
                        </label>
                    )}

                    {/* Notifications (Admins Only) */}
                    {toggleNotifMenu && user?.role_type === 1 && (
                        <div ref={notifBtnRef} style={{ position: 'relative' }}>
                            <button className={`dash-icon-btn ${isNotifOpen ? 'active' : ''}`} title="Notifications" onClick={toggleNotifMenu}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                                <span className="dash-notif-badge"></span>
                            </button>

                            <div className={`dash-dd-menu dash-notif-dd ${isNotifOpen ? 'show' : ''}`} style={{ top: 'calc(100% + 14px)', right: '-8px', width: '320px' }}>
                                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--dash-bd)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--dash-tx-1)' }}>Notifications</span>
                                    <span style={{ fontSize: '.65rem', background: 'var(--dash-surface-2)', padding: '2px 8px', borderRadius: '99px', color: 'var(--dash-tx-2)' }}>2 New</span>
                                </div>
                                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    <div className="dash-notif-item unread">
                                        <div className="dash-notif-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg></div>
                                        <div className="dash-notif-content">
                                            <div className="dash-notif-text">New patient <b>Sangeeta M.</b> admitted to triage.</div>
                                            <div className="dash-notif-time">2 mins ago</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Settings */}
                    {toggleSettingsMenu && (
                        <div ref={settingsBtnRef} style={{ position: 'relative' }}>
                            <button className={`dash-icon-btn ${isSettingsOpen ? 'active' : ''}`} title="Settings" onClick={toggleSettingsMenu}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" /></svg>
                            </button>
                            <div className={`dash-dd-menu dash-settings-dd ${isSettingsOpen ? 'show' : ''}`} style={{ top: 'calc(100% + 14px)', right: '-8px', padding: '8px' }}>
                                <a className="dash-dd-item" href="#">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" /></svg>
                                    General Settings
                                </a>
                                <a className="dash-dd-item" href="#">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10M12 20V4M6 20v-6" /></svg>
                                    Reports &amp; Export
                                </a>
                                {(user?.role_type === 1) && (
                                    <a className="dash-dd-item" href="#" onClick={(e) => { e.preventDefault(); navigate('/manage-users'); }}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                                        User Management
                                    </a>
                                )}
                                <div style={{ height: '1px', background: 'var(--dash-bd)', margin: '4px 8px' }}></div>
                                <a className="dash-dd-item" href="#" onClick={(e) => { e.preventDefault(); setIsSupportOpen(true); if (toggleSettingsMenu) toggleSettingsMenu(e); }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
                                    Help &amp; Support
                                </a>
                            </div>
                        </div>
                    )}

                    {/* User menu */}
                    <div ref={userMenuRef} style={{ position: 'relative' }}>
                        <div className={`dash-user-btn ${isUserMenuOpen ? 'open' : ''}`} onClick={(e) => { if (toggleUserMenu) toggleUserMenu(e); else { if (setIsUserMenuOpen) setIsUserMenuOpen(!isUserMenuOpen); } }}>
                            <div className="dash-user-avatar">{finalInitials}</div>
                            <div className="dash-user-info">
                                <span className="dash-user-name">{finalName}</span>
                                <span className="dash-user-role">{finalRole}</span>
                            </div>
                            <span className="dash-user-chevron">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                            </span>
                        </div>

                        <div className={`dash-dd-menu ${isUserMenuOpen ? 'show' : ''}`} style={{ position: 'absolute', top: 'calc(100% + 12px)', right: 0 }}>
                            <div className="dash-dd-top">
                                <div className="dash-dd-avatar">{finalInitials}</div>
                                <div>
                                    <div className="dash-dd-name">{finalName}</div>
                                    <div className="dash-dd-role">{finalRole}</div>
                                </div>
                            </div>
                            <div className="dash-dd-section">
                                <a className="dash-dd-item" href="#" onClick={(e) => { e.preventDefault(); if (setIsProfileOpen) setIsProfileOpen(true); if (setIsUserMenuOpen) setIsUserMenuOpen(false); }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                    Update Profile
                                </a>
                                <a className="dash-dd-item" href="#" onClick={(e) => { e.preventDefault(); if (setIsPasswordOpen) setIsPasswordOpen(true); if (setIsUserMenuOpen) setIsUserMenuOpen(false); }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                    Change Password
                                    <span className="dash-dd-item-badge">Secure</span>
                                </a>
                            </div>
                            <div className="dash-dd-section">
                                <a className="dash-dd-item danger" onClick={handleSignOut} style={{ border: 'none', background: 'transparent', width: '100%', cursor: 'pointer', display: 'flex' }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                                    Sign Out
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Help & Support Modal */}
            {isSupportOpen && createPortal(
                <div className="dash-support-overlay" onClick={() => setIsSupportOpen(false)}>
                    <div className="dash-support-modal" onClick={e => e.stopPropagation()}>
                        <button className="dash-support-close" onClick={() => setIsSupportOpen(false)} title="Close">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>

                        <div className="dash-support-header">
                            <div className="dash-support-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            </div>
                            <h2 className="dash-support-title">Help &amp; Support</h2>
                            <p className="dash-support-text">
                                If you face any issue while using this portal or would like to share feedback or suggestions, please contact our support team.
                            </p>
                        </div>

                        <div className="dash-support-actions">
                            <a href="tel:+919807562620" className="dash-support-btn">
                                <div className="dash-support-btn-icon ic-call">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                </div>
                                <div className="dash-support-btn-body">
                                    <span className="dash-support-btn-lbl">Call Now</span>
                                    <span className="dash-support-btn-val">+91-9807562620</span>
                                </div>
                            </a>

                            <a href="mailto:shiblee@celworld.org" className="dash-support-btn">
                                <div className="dash-support-btn-icon ic-mail">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                                </div>
                                <div className="dash-support-btn-body">
                                    <span className="dash-support-btn-lbl">Send Email</span>
                                    <span className="dash-support-btn-val">shiblee@celworld.org</span>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </header>
    );
};

export default DashTopbar;
