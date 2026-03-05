import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardContent from './DashboardContent';
import UserProfileModals from '../components/UserProfileModals';
import DashTopbar from '../components/DashTopbar';
import DashFooter from '../components/DashFooter';
import './Dashboard.css';
import celLogo from '../assets/cel_logo.png';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [isLightMode, setIsLightMode] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [timeStr, setTimeStr] = useState('Loading...');
    const [dateStr, setDateStr] = useState('Loading...');
    // Profile & Password Modals State
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isPasswordOpen, setIsPasswordOpen] = useState(false);

    const userMenuRef = useRef(null);
    const settingsBtnRef = useRef(null);
    const notifBtnRef = useRef(null);

    useEffect(() => {
        // Check initial system preference or localStorage for theme
        const savedTheme = 'light';
        const prefersLight = true;

        // Default to dark if not set, or follow system if no saved theme
        const isLight = true;
        setIsLightMode(true);
        document.documentElement.setAttribute('data-theme', 'light');
    }, []);

    useEffect(() => {
        const tick = () => {
            const now = new Date();
            setTimeStr(now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
            setDateStr(now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }));
        };

        tick();
        const timer = setInterval(tick, 30000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
            if (settingsBtnRef.current && !settingsBtnRef.current.contains(event.target)) {
                setIsSettingsOpen(false);
            }
            if (notifBtnRef.current && !notifBtnRef.current.contains(event.target)) {
                setIsNotifOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                setIsUserMenuOpen(false);
                setIsSettingsOpen(false);
                setIsNotifOpen(false);
                setIsProfileOpen(false); // Close profile modal on escape
                setIsPasswordOpen(false); // Close password modal on escape
            }
        });

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleThemeToggle = () => {
        const newMode = !isLightMode;
        setIsLightMode(newMode);
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    };

    const toggleUserMenu = (e) => {
        e.stopPropagation();
        setIsSettingsOpen(false);
        setIsNotifOpen(false);
        setIsUserMenuOpen(!isUserMenuOpen);
    };

    const toggleSettingsMenu = (e) => {
        e.stopPropagation();
        setIsUserMenuOpen(false);
        setIsNotifOpen(false);
        setIsSettingsOpen(!isSettingsOpen);
    };

    const toggleNotifMenu = (e) => {
        e.stopPropagation();
        setIsUserMenuOpen(false);
        setIsSettingsOpen(false);
        setIsNotifOpen(!isNotifOpen);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const nameDisplay = user?.name || 'User';
    const roleDisplay = user?.role_type === 1 ? 'Admin' : 'Staff';
    const initials = nameDisplay.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    return (
        <div className="dashboard-layout">
            <div className="dash-bg-wrap"></div>
            <div className="dash-bg-grid"></div>
            <div className="dash-orb dash-orb-1"></div>
            <div className="dash-orb dash-orb-2"></div>
            <div className="dash-stars"></div>

            {(isUserMenuOpen || isSettingsOpen || isNotifOpen || isProfileOpen || isPasswordOpen) && <div className="dash-overlay active" onClick={() => { setIsUserMenuOpen(false); setIsSettingsOpen(false); setIsNotifOpen(false); setIsProfileOpen(false); setIsPasswordOpen(false); }}></div>}

            <div className="dash-page">
                {/* TOPBAR */}
                <DashTopbar
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
                    pageTitle="Dashboard"
                    currentPage={`${dateStr} · ${timeStr}`}
                    parentPage={null}
                    parentPageLink={null}
                />

                <DashboardContent dateStr={dateStr} />

                <DashFooter />

            </div>
            <UserProfileModals
                isProfileOpen={isProfileOpen}
                setIsProfileOpen={setIsProfileOpen}
                isPasswordOpen={isPasswordOpen}
                setIsPasswordOpen={setIsPasswordOpen}
            />
        </div>
    );
};

export default Dashboard;
