import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardContent = ({ dateStr }) => {
    const navigate = useNavigate();
    const [totalCases, setTotalCases] = useState(null);
    const [minDate, setMinDate] = useState(null);
    const [maxDate, setMaxDate] = useState(null);
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const [systemLogs, setSystemLogs] = useState([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState(true);

    const [allPatients, setAllPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [activeFilters, setActiveFilters] = useState({ startDate: '', endDate: '', facility: '' });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('http://localhost:5000/api/dashboard/stats', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setTotalCases(data.totalCases);

                    if (data.minDate && data.maxDate) {
                        const mn = data.minDate.split('T')[0];
                        const mx = data.maxDate.split('T')[0];
                        setMinDate(mn);
                        setMaxDate(mx);
                        setActiveFilters(prev => ({ ...prev, startDate: mn, endDate: mx }));
                        document.getElementById('f-start').value = mn;
                        document.getElementById('f-end').value = mx;
                    }
                } else {
                    console.error("Failed to fetch dashboard stats");
                }
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setIsLoadingStats(false);
            }
        };

        const fetchPatients = async () => {
            try {
                const token = localStorage.getItem('token');
                const rs = await fetch('http://localhost:5000/api/labour/list', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (rs.ok) {
                    const data = await rs.json();
                    setAllPatients(data);
                }
            } catch (err) {
                console.error("Error fetching patients:", err);
            }
        };
        fetchPatients();

        const fetchLogs = async () => {
            try {
                // Must attach token for system logs route
                const token = localStorage.getItem('token');
                const rs = await fetch('http://localhost:5000/api/system-activity?limit=20', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (rs.ok) {
                    const data = await rs.json();
                    if (data.success) {
                        setSystemLogs(data.data);
                    }
                }
            } catch (err) {
                console.error("Error fetching system logs:", err);
            } finally {
                setIsLoadingLogs(false);
            }
        };

        fetchStats();
        fetchLogs();
    }, []);

    useEffect(() => {
        let filtered = [...allPatients];
        if (activeFilters.facility) {
            filtered = filtered.filter(p => p.facility && p.facility.trim() === activeFilters.facility.trim());
        }
        if (activeFilters.startDate) {
            filtered = filtered.filter(p => !p.observation_date || p.observation_date.split('T')[0] >= activeFilters.startDate);
        }
        if (activeFilters.endDate) {
            filtered = filtered.filter(p => !p.observation_date || p.observation_date.split('T')[0] <= activeFilters.endDate);
        }
        setFilteredPatients(filtered);
    }, [allPatients, activeFilters]);

    // Active filter state mock


    const handleFilterChange = () => {
        const s = document.getElementById('f-start').value;
        const e = document.getElementById('f-end').value;
        if (s && e && e < s) {
            document.getElementById('f-end').style.borderColor = 'var(--dash-danger)';
            document.getElementById('f-end').title = 'End date must be on or after start date';
        } else {
            document.getElementById('f-end').style.borderColor = '';
            document.getElementById('f-end').title = '';
        }
    };

    const applyFilters = () => {
        const s = document.getElementById('f-start').value;
        const e = document.getElementById('f-end').value;
        const fcEl = document.getElementById('f-facility');
        const fc = fcEl.value;

        if (s && e && e < s) {
            document.getElementById('f-end').style.borderColor = 'var(--dash-danger)';
            document.getElementById('f-end').focus();
            return;
        }

        setActiveFilters({ startDate: s, endDate: e, facility: fc });

        let filtered = [...allPatients];
        if (fc) filtered = filtered.filter(p => (p.facility && p.facility.trim() === fc.trim()));
        if (s) filtered = filtered.filter(p => !p.observation_date || p.observation_date.split('T')[0] >= s);
        if (e) filtered = filtered.filter(p => !p.observation_date || p.observation_date.split('T')[0] <= e);
        setFilteredPatients(filtered);
    };

    const resetFilters = () => {
        const fallBackAgo = new Date(); fallBackAgo.setDate(fallBackAgo.getDate() - 30);
        const fallBackToday = new Date();
        const toISO = d => d.toISOString().slice(0, 10);

        const s = minDate || toISO(fallBackAgo);
        const e = maxDate || toISO(fallBackToday);

        document.getElementById('f-start').value = s;
        document.getElementById('f-end').value = e;
        document.getElementById('f-facility').value = '';
        document.getElementById('f-end').style.borderColor = '';

        setActiveFilters({ startDate: s, endDate: e, facility: '' });
    };

    const filterKpi = (cat, btnId) => {
        document.querySelectorAll('.dash-kpi-tag-btn').forEach(b => b.classList.remove('active'));
        document.getElementById(btnId).classList.add('active');
        document.querySelectorAll('#kpi-table tr[data-cat]').forEach(row => {
            row.style.display = (cat === 'all' || row.dataset.cat === cat) ? '' : 'none';
        });
    };

    const toggleKpiFilter = () => {
        const bar = document.getElementById('kpi-filter-bar');
        bar.style.display = bar.style.display === 'none' ? 'block' : 'none';
    };

    const removeChip = (key) => {
        let newFilters = { ...activeFilters };
        if (key === 'startDate') { newFilters.startDate = ''; document.getElementById('f-start').value = ''; }
        if (key === 'endDate') { newFilters.endDate = ''; document.getElementById('f-end').value = ''; }
        if (key === 'facility') { newFilters.facility = ''; document.getElementById('f-facility').value = ''; }
        setActiveFilters(newFilters);
    };

    const fmtDateShort = (str) => {
        if (!str) return null;
        const d = new Date(str + 'T00:00:00');
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const renderChips = () => {
        const chips = [];
        if (activeFilters.startDate) chips.push({ label: 'From: ' + fmtDateShort(activeFilters.startDate), key: 'startDate' });
        if (activeFilters.endDate) chips.push({ label: 'To: ' + fmtDateShort(activeFilters.endDate), key: 'endDate' });
        if (activeFilters.facility) {
            const fcEl = document.getElementById('f-facility');
            const lbl = fcEl ? fcEl.options[fcEl.selectedIndex].text : '';
            chips.push({ label: 'Facility: ' + lbl.split('—')[0].trim(), key: 'facility' });
        }

        if (chips.length === 0) return null;

        return (
            <div className="dash-filter-chips" style={{ display: 'flex' }}>
                {chips.map(c => (
                    <div key={c.key} className="dash-filter-chip">
                        {c.label}
                        <span className="dash-filter-chip-x" onClick={() => removeChip(c.key)} title="Remove filter">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    const timeAgo = (dateStr) => {
        const min = Math.round((new Date() - new Date(dateStr)) / 60000);
        if (min < 1) return 'Just now';
        if (min < 60) return `${min}m ago`;
        const hrs = Math.floor(min / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    const getLogVisuals = (log) => {
        let type = (log.activity_type || '').toLowerCase();
        let desc = (log.description || '').toLowerCase();

        let icon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
        let badgeTxt = log.activity_type ? log.activity_type.toUpperCase() : 'SYSTEM';
        let badgeColor = 'rgba(var(--dash-t-rgb), 0.1)';
        let badgeTxColor = 'var(--dash-tx-2)';
        let title = log.activity_type || 'System Event';
        let bgIconColor = 'var(--dash-surface-2)';

        if (type.includes('login') || desc.includes('session') || type.includes('auth')) {
            title = 'Dashboard session started';
            icon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
            badgeTxt = 'SYSTEM';
            badgeTxColor = 'var(--dash-tx-2)';
            badgeColor = 'var(--dash-bd)';
            bgIconColor = 'var(--dash-surface-2)';
        } else if (type.includes('user') || desc.includes('staff')) {
            title = 'Staff member registered';
            if (desc.includes('updat')) title = 'Staff member updated';
            badgeTxt = 'NEW STAFF';
            badgeTxColor = '#B8860B';
            badgeColor = '#FDF5E6';
            bgIconColor = '#FDF5E6';
            icon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>;
        } else if (type.includes('patient') && (desc.includes('add') || desc.includes('new'))) {
            title = 'New patient case added';
            badgeTxt = 'NEW CASE';
            badgeTxColor = 'var(--dash-teal)';
            badgeColor = 'rgba(var(--dash-p-rgb), 0.15)';
            bgIconColor = 'rgba(var(--dash-p-rgb), 0.1)';
            icon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
        } else if (type.includes('patient') && (desc.includes('update') || desc.includes('edit') || desc.includes('partograph'))) {
            title = 'Record updated';
            if (desc.includes('partograph')) title = 'Partograph updated';
            badgeTxt = 'RECORD UPDATED';
            badgeTxColor = '#2E8B57';
            badgeColor = 'rgba(46, 139, 87, 0.15)';
            bgIconColor = 'rgba(46, 139, 87, 0.1)';
            icon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>;
        }

        return { icon, title, badgeTxt, badgeColor, badgeTxColor, bgIconColor };
    };

    return (
        <div className="dash-content-wrap">
            {/* Top bar: heading + add button */}
            <div className="dash-content-topbar">
                <div className="dash-content-heading">
                    <h1 className="dash-content-title">Labour Cases Overview</h1>
                    <div className="dash-content-meta">
                        <span><span className="dash-live-dot"></span>Live monitoring active</span>
                        <span className="dash-content-meta-sep"></span>
                        <span id="content-date">{dateStr}</span>
                        <span className="dash-content-meta-sep"></span>
                        <span id="content-facility">All Facilities</span>
                    </div>
                </div>

                <button className="dash-btn-add" onClick={() => navigate('/add-patient')}>
                    <div className="dash-btn-add-inner">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
                        Add New Patient
                    </div>
                </button>
            </div>

            {/* FILTER BAR */}
            <div className="dash-filter-bar" id="filter-bar">
                {/* Start Date */}
                <div className="dash-filter-group">
                    <label className="dash-filter-label" htmlFor="f-start">Start Date</label>
                    <div className="dash-filter-input-wrap">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                        <input type="date" className="dash-filter-input" id="f-start" onChange={handleFilterChange} />
                    </div>
                </div>

                {/* End Date */}
                <div className="dash-filter-group">
                    <label className="dash-filter-label" htmlFor="f-end">End Date</label>
                    <div className="dash-filter-input-wrap">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                        <input type="date" className="dash-filter-input" id="f-end" onChange={handleFilterChange} />
                    </div>
                </div>

                <div className="dash-filter-divider"></div>

                {/* Facility */}
                <div className="dash-filter-group" style={{ minWidth: '180px' }}>
                    <label className="dash-filter-label" htmlFor="f-facility">Facility</label>
                    <div className="dash-filter-input-wrap dash-filter-select-wrap">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                        <select className="dash-filter-input" id="f-facility" onChange={handleFilterChange} style={{ paddingRight: '28px' }}>
                            <option value="">All Facilities</option>
                            <option value="DWH">DWH</option>
                            <option value="PPP">PPP</option>
                            <option value="CHC Cholapur">CHC Cholapur</option>
                            <option value="CHC Chiraigaon">CHC Chiraigaon</option>
                            <option value="CHC Pindra">CHC Pindra</option>
                            <option value="CHC Sarnath">CHC Sarnath</option>
                        </select>
                    </div>
                </div>

                <div className="dash-filter-divider"></div>

                {/* Actions */}
                <div className="dash-filter-actions">
                    <button className="dash-btn-filter-apply" onClick={applyFilters}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                        Apply Filters
                    </button>
                    <button className="dash-btn-filter-reset" onClick={resetFilters} title="Clear all filters">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3.5" /></svg>
                        Reset
                    </button>
                </div>
            </div>

            {/* Active filter chips */}
            {renderChips()}

            {/* PREMIUM STAT CARDS (V2) */}
            <div className="dash-stats-strip-v2">
                <div className="dash-stat-card-v2 variant-blue" onClick={() => navigate('/list')} style={{ cursor: 'pointer' }} title="View Patient List">
                    <div className="dash-stat-v2-header">
                        <span className="dash-stat-v2-title">Total Cases</span>
                        <div className="dash-stat-v2-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                        </div>
                    </div>
                    <div className="dash-stat-v2-main">
                        <div className="dash-stat-v2-num">{isLoadingStats ? '...' : (totalCases !== null ? totalCases : '—')}</div>
                        <div className="dash-stat-v2-sub">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                            All registered records
                        </div>
                    </div>
                </div>

                <div className="dash-stat-card-v2 variant-green">
                    <div className="dash-stat-v2-header">
                        <span className="dash-stat-v2-title">Deliveries Today</span>
                        <div className="dash-stat-v2-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                        </div>
                    </div>
                    <div className="dash-stat-v2-main">
                        <div className="dash-stat-v2-num">
                            {(() => {
                                if (isLoadingStats) return '...';
                                if (!allPatients || allPatients.length === 0) return '0';

                                // Strictly grab today's local date string YYYY-MM-DD
                                const todayStrLocal = new Date().toLocaleDateString('en-CA');

                                // Count how many patients have a created_at string that corresponds to today physically
                                const todayCount = allPatients.filter(p => {
                                    if (!p.created_at) return false;
                                    const createdLocal = new Date(p.created_at).toLocaleDateString('en-CA');
                                    return createdLocal === todayStrLocal;
                                }).length;

                                return todayCount;
                            })()}
                        </div>
                        <div className="dash-stat-v2-sub">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                            {dateStr || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                    </div>
                </div>

                <div className="dash-stat-card-v2 variant-gold">
                    <div className="dash-stat-v2-header">
                        <span className="dash-stat-v2-title">Active Admissions</span>
                        <div className="dash-stat-v2-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                        </div>
                    </div>
                    <div className="dash-stat-v2-main">
                        <div className="dash-stat-v2-num">—</div>
                        <div className="dash-stat-v2-sub">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                            Currently in facility
                        </div>
                    </div>
                </div>

                <div className="dash-stat-card-v2 variant-rose">
                    <div className="dash-stat-v2-header">
                        <span className="dash-stat-v2-title">Complicated Cases</span>
                        <div className="dash-stat-v2-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                        </div>
                    </div>
                    <div className="dash-stat-v2-main">
                        <div className="dash-stat-v2-num">
                            {(() => {
                                if (isLoadingStats) return '...';
                                if (!allPatients) return '0';
                                return allPatients.filter(p => p.complications_developed === 'Yes' || p.complications_developed === 'yes').length;
                            })()}
                        </div>
                        <div className="dash-stat-v2-sub">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" /></svg>
                            Total recorded cases
                        </div>
                    </div>
                </div>
            </div>


            {/* MAIN GRID: Chart area + sidebar */}
            <div className="dash-main-grid">

                {/* KPI Table Panel */}
                <div className="dash-kpi-panel">
                    <div className="dash-panel-header">
                        <div className="dash-panel-title-wrap">
                            <span className="dash-panel-title">SANKALP — Labour Room Practice KPIs</span>
                            <span className="dash-panel-sub">Clinical quality indicators with formulas, numerators &amp; denominators</span>
                        </div>
                        <span className="dash-panel-action" onClick={toggleKpiFilter} id="kpi-filter-btn">Filter</span>
                    </div>

                    {/* Filter bar */}
                    <div id="kpi-filter-bar" style={{ display: 'none', padding: '12px 24px', borderBottom: '1px solid var(--dash-bd)', background: 'var(--dash-surface-2)', transition: 'background var(--dash-T),border-color var(--dash-T)' }}>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                            <span style={{ fontSize: '.68rem', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--dash-tx-3)', marginRight: '4px' }}>Category:</span>
                            <button id="btn-kpi-all" className="dash-kpi-tag-btn active" onClick={() => filterKpi('all', 'btn-kpi-all')}>All</button>
                            <button id="btn-kpi-admission" className="dash-kpi-tag-btn" onClick={() => filterKpi('admission', 'btn-kpi-admission')}>Admission & Monitoring</button>
                            <button id="btn-kpi-labour" className="dash-kpi-tag-btn" onClick={() => filterKpi('labour', 'btn-kpi-labour')}>Labour Management</button>
                            <button id="btn-kpi-delivery" className="dash-kpi-tag-btn" onClick={() => filterKpi('delivery', 'btn-kpi-delivery')}>Delivery Care</button>
                            <button id="btn-kpi-newborn" className="dash-kpi-tag-btn" onClick={() => filterKpi('newborn', 'btn-kpi-newborn')}>Newborn Care</button>
                        </div>
                    </div>

                    {filteredPatients.length === 0 ? (
                        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', background: 'var(--dash-surface-2)', marginBottom: '16px' }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="var(--dash-tx-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--dash-tx-1)', fontWeight: 600 }}>No Data Available</h3>
                            <p style={{ margin: '8px 0 0 0', fontSize: '.85rem', color: 'var(--dash-tx-3)' }}>There are no patient records matching the current filters.</p>
                        </div>
                    ) : (
                        <>
                            <div style={{ overflowX: 'auto' }}>
                                <table className="dash-kpi-table" id="kpi-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>KPI Name &amp; Code</th>
                                            <th>Formula</th>
                                            <th>Formula with Values</th>
                                            <th>Final Calculated Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(() => {
                                            const cases = filteredPatients || [];

                                            // Computations
                                            const totalObserved = cases.length;

                                            // Helper function to safely check 'Yes' (case-insensitive and null-safe)
                                            const isYes = (val) => val && String(val).trim().toLowerCase() === 'yes';
                                            const isPreterm = (val) => val && String(val).trim().toLowerCase() === 'preterm';
                                            const isVaginal = (val) => val && (String(val).trim().toLowerCase() === 'vaginal' || String(val).trim().toLowerCase() === 'assisted vaginal');

                                            const triageNum = cases.filter(c => isYes(c.triage_under_30_min)).length;
                                            const fhrNum = cases.filter(c => isYes(c.fhr_monitored)).length;
                                            const partographNum = cases.filter(c => isYes(c.partograph_filled)).length;

                                            const pretermCases = cases.filter(c => isPreterm(c.gestational_age));
                                            const ancsNum = pretermCases.filter(c => isYes(c.ancs_given)).length;

                                            const augCases = cases.filter(c => isYes(c.labour_augmentation));
                                            const augAppNum = augCases.filter(c => isYes(c.augmentation_appropriate)).length;

                                            // Aug documentation should realistically be against *ALL* augmented cases, not just appropriate ones
                                            const augDocNum = augCases.filter(c => isYes(c.indication_documented)).length;
                                            const augDocDenom = augCases.length;

                                            const fundalNum = cases.filter(c => isYes(c.fundal_pressure_applied)).length;

                                            const epiCases = cases.filter(c => isYes(c.episiotomy_given));
                                            const epiAppNum = epiCases.filter(c => isYes(c.episiotomy_appropriate)).length;

                                            const vagCases = cases.filter(c => isVaginal(c.delivery_mode));
                                            const amtslNum = vagCases.filter(c => isYes(c.amtsl_followed)).length;

                                            const oxyNum = vagCases.filter(c => isYes(c.av_oxytocin)).length;
                                            const dccNum = vagCases.filter(c => isYes(c.delayed_cord_clamping)).length;

                                            const allDeliv = cases;
                                            const s2sNum = allDeliv.filter(c => isYes(c.immediate_skin_to_skin)).length;

                                            const ebNum = allDeliv.filter(c => isYes(c.early_breastfeeding) || isYes(c.initiation_of_breastfeeding)).length;

                                            const calcPct = (num, den) => {
                                                if (den === 0) return num === 0 ? '0%' : 'N/A';
                                                return Math.round((num / den) * 100) + '%';
                                            };

                                            const kpis = [
                                                { type: 'section', cat: 'admission', label: 'Baseline & Admission', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13" style={{ opacity: .7 }}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg> },
                                                { cat: 'admission', num: 'X', name: 'Total Observed Deliveries', code: 'X — Baseline Count', formula: null, dValue: null, nValue: totalObserved, pct: totalObserved, baseFormula: 'Count of all deliveries in selected period & facility' },

                                                { type: 'section', cat: 'admission', label: 'Admission & Monitoring', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13" style={{ opacity: .7 }}><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg> },
                                                { cat: 'admission', num: '', name: 'Triage within 30 Minutes', code: 'Q12 — Triage Timeliness', desc: 'Proportion of patients triaged within 30 minutes of arrival', formula: true, baseF1: 'Q12 = Yes', baseF2: 'X', nValue: triageNum, dValue: totalObserved, pct: calcPct(triageNum, totalObserved) },
                                                { cat: 'admission', num: '', name: 'FHR Monitored as per Protocol', code: 'Q14 — Foetal Heart Rate Monitoring', desc: 'Cases where foetal heart rate was monitored per clinical protocol', formula: true, baseF1: 'Q14 = Yes', baseF2: 'X', nValue: fhrNum, dValue: totalObserved, pct: calcPct(fhrNum, totalObserved) },
                                                { cat: 'admission', num: '', name: 'Partograph Filled Real-Time', code: 'Q16 — Partograph Compliance', desc: 'Cases where partograph was filled in real-time during labour', formula: true, baseF1: 'Q16 = Yes', baseF2: 'X', nValue: partographNum, dValue: totalObserved, pct: calcPct(partographNum, totalObserved) },
                                                { cat: 'admission', num: '', name: 'ANCS Given in Preterm Labour', code: 'Q17 — Antenatal Corticosteroids', desc: 'Proportion of preterm cases receiving antenatal corticosteroids', formula: true, baseF1: 'Q17 = Yes', baseF2: 'Q11 = Preterm', nValue: ancsNum, dValue: pretermCases.length, pct: calcPct(ancsNum, pretermCases.length) },

                                                { type: 'section', cat: 'labour', label: 'Labour Management', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13" style={{ opacity: .7 }}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg> },
                                                { cat: 'labour', num: '', name: 'Augmentation Appropriate', code: 'Q22 — Augmentation Appropriateness', desc: 'Cases with augmentation where the procedure was clinically appropriate', formula: true, baseF1: 'Q22 = Yes', baseF2: 'X (with augmentation)', nValue: augAppNum, dValue: augCases.length, pct: calcPct(augAppNum, augCases.length) },
                                                { cat: 'labour', num: '', name: 'Indication for Augmentation Documented', code: 'Q20 — Augmentation Documentation', desc: 'Proportion of augmentation cases with clinical indication documented', formula: true, baseF1: 'Q20 = Yes', baseF2: 'Q22 = Yes', nValue: augDocNum, dValue: augDocDenom, pct: calcPct(augDocNum, augDocDenom) },
                                                { cat: 'labour', num: '', name: 'Fundal Pressure Applied', code: 'Q23 — Fundal Pressure Usage', desc: 'Cases where fundal pressure was applied — ideally should be zero', formula: true, baseF1: 'Q23 = Yes', baseF2: 'X', nValue: fundalNum, dValue: totalObserved, pct: calcPct(fundalNum, totalObserved) },

                                                { type: 'section', cat: 'delivery', label: 'Delivery Care', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13" style={{ opacity: .7 }}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" /></svg> },
                                                { cat: 'delivery', num: '', name: 'Episiotomy Appropriate', code: 'Q40 — Episiotomy Appropriateness', desc: 'Proportion of episiotomies that were clinically indicated', formula: true, baseF1: 'Q40 = Yes', baseF2: 'Q39 = Yes', nValue: epiAppNum, dValue: epiCases.length, pct: calcPct(epiAppNum, epiCases.length) },
                                                { cat: 'delivery', num: '', name: 'AMTSL Followed', code: 'Q41 — Active Management of Third Stage of Labour', desc: 'Vaginal delivery cases where AMTSL protocol was followed', formula: true, baseF1: 'Q41 = Yes', baseF2: 'Q31 = Vaginal + Assisted Vaginal', nValue: amtslNum, dValue: vagCases.length, pct: calcPct(amtslNum, vagCases.length) },
                                                { cat: 'delivery', num: '', name: 'Oxytocin within 1 Min of Delivery', code: 'Q42 — Oxytocin Timeliness', desc: 'Vaginal delivery cases where oxytocin was administered within 1 minute', formula: true, baseF1: 'Q42 = Yes', baseF2: 'Q31 = Vaginal + Assisted Vaginal', nValue: oxyNum, dValue: vagCases.length, pct: calcPct(oxyNum, vagCases.length) },
                                                { cat: 'delivery', num: '', name: 'Delayed Cord Clamping Done', code: 'Q47 — Delayed Cord Clamping', desc: 'Vaginal delivery cases where cord clamping was delayed per protocol', formula: true, baseF1: 'Q47 = Yes', baseF2: 'Q31 = Vaginal + Assisted Vaginal', nValue: dccNum, dValue: vagCases.length, pct: calcPct(dccNum, vagCases.length) },

                                                { type: 'section', cat: 'newborn', label: 'Newborn Care', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13" style={{ opacity: .7 }}><path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" /></svg> },
                                                { cat: 'newborn', num: '', name: 'Immediate Skin-to-Skin Done', code: 'Q46 — Skin-to-Skin Contact', desc: 'All deliveries where immediate skin-to-skin contact was initiated', formula: true, baseF1: 'Q46 = Yes', baseF2: 'All Vaginal + All C-Section', nValue: s2sNum, dValue: allDeliv.length, pct: calcPct(s2sNum, allDeliv.length) },
                                                { cat: 'newborn', num: '', name: 'Early Breastfeeding within 1 Hour', code: 'Q51 — Early Initiation of Breastfeeding', desc: 'All deliveries where breastfeeding was initiated within 1 hour', formula: true, baseF1: 'Q51 = Yes', baseF2: 'All Vaginal + All C-Section', nValue: ebNum, dValue: allDeliv.length, pct: calcPct(ebNum, allDeliv.length) }
                                            ];

                                            return kpis.map((kpi, index) => {
                                                if (kpi.type === 'section') {
                                                    return (
                                                        <tr key={"sec-" + index} className="dash-kpi-section-row" data-cat={kpi.cat} style={{ background: 'rgba(var(--dash-t-rgb),.07)', borderTop: '1px solid rgba(var(--dash-t-rgb),.12)', borderBottom: '1px solid rgba(var(--dash-t-rgb),.12)' }}>
                                                            <td colSpan="4" className="dash-kpi-section-label">
                                                                {kpi.icon} {kpi.label}
                                                            </td>
                                                        </tr>
                                                    );
                                                }

                                                return (
                                                    <tr key={"kpi-" + index} data-cat={kpi.cat}>

                                                        <td>
                                                            <div className="dash-kpi-name">{kpi.name}</div>
                                                            <div className="dash-kpi-code">{kpi.code}</div>
                                                            {kpi.desc && <div className="dash-kpi-desc">{kpi.desc}</div>}
                                                        </td>
                                                        <td>
                                                            <div className="dash-kpi-formula-wrap">
                                                                {kpi.formula ? (
                                                                    <>
                                                                        <div className="dash-kpi-frac">
                                                                            <div className="dash-kpi-frac-num" style={{ fontSize: '.75rem' }}>{kpi.baseF1}</div>
                                                                            <div className="dash-kpi-frac-line"></div>
                                                                            <div className="dash-kpi-frac-den" style={{ fontSize: '.75rem' }}>{kpi.baseF2}</div>
                                                                        </div>
                                                                        <span className="dash-kpi-pct">× 100%</span>
                                                                    </>
                                                                ) : (
                                                                    <span className="dash-kpi-formula dash-kpi-formula--base" style={{ fontSize: '.85rem' }}>{kpi.baseFormula}</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="dash-kpi-formula-wrap">
                                                                {kpi.formula ? (
                                                                    <>
                                                                        <span style={{ color: 'var(--dash-tx-3)', fontSize: '1.2rem' }}>(</span>
                                                                        <div className="dash-kpi-frac" style={{ fontSize: '1rem', fontWeight: 600, padding: '0 6px', margin: 0, border: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                                            <span className="dash-kpi-frac-num" style={{ padding: '0', display: 'inline-block' }}>{kpi.nValue}</span>
                                                                            <span style={{ margin: '0', color: 'var(--dash-tx-3)' }}>÷</span>
                                                                            <span className="dash-kpi-frac-den" style={{ padding: '0', display: 'inline-block' }}>{kpi.dValue}</span>
                                                                        </div>
                                                                        <span style={{ color: 'var(--dash-tx-3)', fontSize: '1.2rem' }}>)</span>
                                                                        <span className="dash-kpi-pct" style={{ fontSize: '.9rem', marginLeft: '8px', color: 'var(--dash-tx-2)' }}>× 100</span>
                                                                    </>
                                                                ) : (
                                                                    <span className="dash-kpi-formula dash-kpi-formula--base" style={{ fontSize: '.9rem', color: 'var(--dash-tx-2)' }}>Total count</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span style={{ fontSize: kpi.formula ? '1.2rem' : '1.1rem', fontWeight: 700, color: kpi.formula ? 'var(--dash-teal-b)' : 'var(--dash-tx-1)' }}>
                                                                {kpi.pct}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            });
                                        })()}
                                    </tbody>
                                </table>

                            </div>

                            {/* Legend */}
                            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--dash-bd)', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', transition: 'border-color var(--dash-T)' }}>
                                <span style={{ fontSize: '.65rem', fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--dash-tx-3)' }}>Legend:</span>
                                <span className="dash-kpi-pill dash-kpi-pill--teal" style={{ fontSize: '.65rem' }}>Numerator (met criterion)</span>
                                <span className="dash-kpi-pill dash-kpi-pill--gold" style={{ fontSize: '.65rem' }}>Conditional denominator</span>
                                <span className="dash-kpi-pill dash-kpi-pill--blue" style={{ fontSize: '.65rem' }}>Vaginal deliveries</span>
                                <span className="dash-kpi-pill dash-kpi-pill--purple" style={{ fontSize: '.65rem' }}>All deliveries (vaginal + CS)</span>
                                <span className="dash-kpi-pill dash-kpi-pill--rose" style={{ fontSize: '.65rem' }}>Flag / adverse indicator</span>
                                <span className="dash-kpi-pill dash-kpi-pill--muted" style={{ fontSize: '.65rem' }}>Universal denominator (X)</span>
                            </div>
                        </>
                    )}
                </div>

                <div className="dash-side-panel">
                    <div className="dash-panel-header">
                        <div className="dash-panel-title-wrap">
                            <span className="dash-panel-title">Recent Activity</span>
                            <span className="dash-panel-sub">Latest case &amp; system updates</span>
                        </div>
                        <span className="dash-panel-action" title="Clear feed">Clear</span>
                    </div>

                    <div className="dash-side-list" id="case-summary-area">
                        <div style={{ padding: '24px 16px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--dash-surface-2)', border: '1px solid var(--dash-bd)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--dash-tx-3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
                            </div>
                            <p style={{ fontSize: '.76rem', color: 'var(--dash-tx-3)', lineHeight: '1.6', maxWidth: '200px' }}>No cases recorded yet. Add your first patient to see activity here.</p>
                            <button className="dash-btn-add" style={{ fontSize: '.73rem', padding: '7px 14px' }} onClick={() => navigate('/add-patient')}>
                                <div className="dash-btn-add-inner">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                                    Add Patient
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Quick reference */}
                    <div style={{ borderTop: '1px solid var(--dash-bd)', padding: '14px 16px', transition: 'border-color var(--dash-T)' }}>
                        <div style={{ fontSize: '.63rem', fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--dash-tx-3)', marginBottom: '10px', padding: '0 2px' }}>Quick Reference</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', borderRadius: '8px', background: 'var(--dash-surface-2)', transition: 'background var(--dash-T)' }}>
                                <span style={{ fontSize: '.73rem', color: 'var(--dash-tx-2)' }}>Delivery Mode</span>
                                <span style={{ fontSize: '.68rem', color: 'var(--dash-tx-3)' }} id="qr-mode">—</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', borderRadius: '8px', background: 'var(--dash-surface-2)', transition: 'background var(--dash-T)' }}>
                                <span style={{ fontSize: '.73rem', color: 'var(--dash-tx-2)' }}>Avg. Labour Duration</span>
                                <span style={{ fontSize: '.68rem', color: 'var(--dash-tx-3)' }} id="qr-duration">—</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', borderRadius: '8px', background: 'var(--dash-surface-2)', transition: 'background var(--dash-T)' }}>
                                <span style={{ fontSize: '.73rem', color: 'var(--dash-tx-2)' }}>APGAR ≥ 7 Rate</span>
                                <span style={{ fontSize: '.68rem', color: 'var(--dash-tx-3)' }} id="qr-apgar">—</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', borderRadius: '8px', background: 'var(--dash-surface-2)', transition: 'background var(--dash-T)' }}>
                                <span style={{ fontSize: '.73rem', color: 'var(--dash-tx-2)' }}>Active Filter Period</span>
                                <span style={{ fontSize: '.68rem', color: 'var(--dash-teal-b)', fontWeight: 500 }} id="qr-period">All Dates</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', borderRadius: '8px', background: 'var(--dash-surface-2)', transition: 'background var(--dash-T)' }}>
                                <span style={{ fontSize: '.73rem', color: 'var(--dash-tx-2)' }}>Active Facility</span>
                                <span style={{ fontSize: '.68rem', color: 'var(--dash-teal-b)', fontWeight: 500 }} id="qr-facility">All</span>
                            </div>
                        </div>
                    </div>

                    {/* ACTIVITY FEED */}
                    <div className="dash-activity-feed">
                        <div className="dash-activity-feed-hdr">
                            <span className="dash-activity-feed-title">System Activity Log</span>
                            <span className="dash-activity-feed-count" id="activity-count">{systemLogs.length}</span>
                        </div>
                        <div className="dash-activity-scroll" id="activity-scroll" style={{ maxHeight: '650px', overflowY: 'auto', paddingBottom: '16px' }}>
                            {isLoadingLogs ? (
                                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--dash-tx-3)', fontSize: '0.8rem' }}>Loading activity logs...</div>
                            ) : systemLogs.length === 0 ? (
                                <div className="dash-activity-empty" id="activity-empty">No activity recorded yet.</div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', padding: '0 16px' }}>
                                    {systemLogs.map(log => {
                                        const { icon, title, badgeTxt, badgeColor, badgeTxColor, bgIconColor } = getLogVisuals(log);

                                        return (
                                            <div key={log.id} style={{ display: 'flex', gap: '16px', padding: '16px 0', borderBottom: '1px solid var(--dash-bd)' }}>
                                                <div style={{ flexShrink: 0, width: '42px', height: '42px', borderRadius: '12px', background: bgIconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: badgeTxColor }}>
                                                    {icon}
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                            <strong style={{ fontSize: '0.9rem', color: 'var(--dash-tx-1)', fontWeight: '600' }}>{title}</strong>
                                                            {badgeTxt && (
                                                                <span style={{ fontSize: '0.62rem', fontWeight: '700', padding: '3px 8px', borderRadius: '12px', background: badgeColor, color: badgeTxColor, letterSpacing: '0.05em' }}>
                                                                    {badgeTxt}
                                                                </span>
                                                            )}
                                                            {log.case_id && (
                                                                <span style={{ fontSize: '0.65rem', fontWeight: '600', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--dash-bd)', color: 'var(--dash-tx-2)' }}>
                                                                    ID: {log.case_id}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--dash-tx-3)', whiteSpace: 'nowrap', marginLeft: '8px' }}>{timeAgo(log.created_at)}</span>
                                                    </div>
                                                    <div style={{ fontSize: '0.86rem', color: 'var(--dash-tx-1)', lineHeight: '1.4' }}>
                                                        {log.description}
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--dash-tx-3)', marginTop: '4px' }}>
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                                        <span>{log.username || 'System'}</span>
                                                        <span style={{ opacity: 0.5 }}>•</span>
                                                        <span>{log.role || 'Automated'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>

            {/* SECOND ROW MINICARDS */}
            <div className="dash-second-row">

                <div className="dash-mini-card">
                    <div className="dash-panel-header">
                        <div className="dash-panel-title-wrap">
                            <span className="dash-panel-title">Delivery Trend</span>
                            <span className="dash-panel-sub">Monthly overview</span>
                        </div>
                        <span className="dash-panel-action">Soon</span>
                    </div>
                    <div style={{ padding: '20px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '6px', height: '100px' }}>
                        <div style={{ background: 'rgba(var(--dash-t-rgb),.12)', borderRadius: '4px', width: '16px', flex: 1, animation: 'dash-grow .6s ease .1s both', transformOrigin: 'bottom' }} className="dash-bar-anim" data-h="35%"></div>
                        <div style={{ background: 'rgba(var(--dash-t-rgb),.18)', borderRadius: '4px', width: '16px', flex: 1, animation: 'dash-grow .6s ease .2s both', transformOrigin: 'bottom' }} className="dash-bar-anim" data-h="55%"></div>
                        <div style={{ background: 'rgba(var(--dash-t-rgb),.22)', borderRadius: '4px', width: '16px', flex: 1, animation: 'dash-grow .6s ease .3s both', transformOrigin: 'bottom' }} className="dash-bar-anim" data-h="45%"></div>
                        <div style={{ background: 'rgba(var(--dash-t-rgb),.28)', borderRadius: '4px', width: '16px', flex: 1, animation: 'dash-grow .6s ease .4s both', transformOrigin: 'bottom' }} className="dash-bar-anim" data-h="70%"></div>
                        <div style={{ background: 'rgba(var(--dash-t-rgb),.35)', borderRadius: '4px', width: '16px', flex: 1, animation: 'dash-grow .6s ease .5s both', transformOrigin: 'bottom' }} className="dash-bar-anim" data-h="60%"></div>
                        <div style={{ background: 'rgba(var(--dash-t-rgb),.42)', borderRadius: '4px', width: '16px', flex: 1, animation: 'dash-grow .6s ease .6s both', transformOrigin: 'bottom' }} className="dash-bar-anim" data-h="80%"></div>
                        <div style={{ background: 'linear-gradient(to top,var(--dash-teal),var(--dash-teal-b))', borderRadius: '4px', width: '16px', flex: 1, opacity: .3, animation: 'dash-grow .6s ease .7s both', transformOrigin: 'bottom' }} className="dash-bar-anim" data-h="40%"></div>
                    </div>
                </div>

                <div className="dash-mini-card">
                    <div className="dash-panel-header">
                        <div className="dash-panel-title-wrap">
                            <span className="dash-panel-title">Case Outcomes</span>
                            <span className="dash-panel-sub">Mother &amp; baby health</span>
                        </div>
                        <span className="dash-panel-action">Soon</span>
                    </div>
                    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--dash-success)', flexShrink: 0 }}></div>
                            <div style={{ fontSize: '.78rem', color: 'var(--dash-tx-2)', flex: 1 }}>Normal Deliveries</div>
                            <div style={{ height: '6px', borderRadius: '99px', flex: 2, background: 'var(--dash-surface-2)', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: '0%', borderRadius: '99px', background: 'var(--dash-success)', transition: 'width 1s' }}></div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--dash-teal-b)', flexShrink: 0 }}></div>
                            <div style={{ fontSize: '.78rem', color: 'var(--dash-tx-2)', flex: 1 }}>C-Section</div>
                            <div style={{ height: '6px', borderRadius: '99px', flex: 2, background: 'var(--dash-surface-2)', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: '0%', borderRadius: '99px', background: 'var(--dash-teal-b)', transition: 'width 1s' }}></div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--dash-accent)', flexShrink: 0 }}></div>
                            <div style={{ fontSize: '.78rem', color: 'var(--dash-tx-2)', flex: 1 }}>Instrumental</div>
                            <div style={{ height: '6px', borderRadius: '99px', flex: 2, background: 'var(--dash-surface-2)', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: '0%', borderRadius: '99px', background: 'var(--dash-accent)', transition: 'width 1s' }}></div>
                            </div>
                        </div>
                        <p style={{ fontSize: '.68rem', color: 'var(--dash-tx-3)', textAlign: 'center', marginTop: '4px', fontStyle: 'italic' }}>Awaiting data entry</p>
                    </div>
                </div>

                <div className="dash-mini-card">
                    <div className="dash-panel-header">
                        <div className="dash-panel-title-wrap">
                            <span className="dash-panel-title">System Status</span>
                            <span className="dash-panel-sub">Platform health</span>
                        </div>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '.68rem', color: 'var(--dash-success)' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--dash-success)', display: 'inline-block', animation: 'dash-pulse-dot 2s ease-in-out infinite' }}></span>All Systems OK
                        </span>
                    </div>
                    <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '8px', background: 'var(--dash-surface-2)' }}>
                            <span style={{ fontSize: '.76rem', color: 'var(--dash-tx-2)' }}>Database</span>
                            <span style={{ fontSize: '.68rem', color: 'var(--dash-success)', fontWeight: 500 }}>Online</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '8px', background: 'var(--dash-surface-2)' }}>
                            <span style={{ fontSize: '.76rem', color: 'var(--dash-tx-2)' }}>API Services</span>
                            <span style={{ fontSize: '.68rem', color: 'var(--dash-success)', fontWeight: 500 }}>Online</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '8px', background: 'var(--dash-surface-2)' }}>
                            <span style={{ fontSize: '.76rem', color: 'var(--dash-tx-2)' }}>Last Backup</span>
                            <span style={{ fontSize: '.68rem', color: 'var(--dash-tx-3)' }} id="last-backup">—</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '8px', background: 'var(--dash-surface-2)' }}>
                            <span style={{ fontSize: '.76rem', color: 'var(--dash-tx-2)' }}>Session</span>
                            <span style={{ fontSize: '.68rem', color: 'var(--dash-teal-b)' }} id="sess-time">Active</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DashboardContent;
