import React, { useState, useEffect, useContext, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import celLogo from '../assets/cel_logo.png';
import UserProfileModals from '../components/UserProfileModals';
import DashTopbar from '../components/DashTopbar';
import DashFooter from '../components/DashFooter';
import './LabourList.css';
import './Dashboard.css';


// --- DATA GENERATION (from original script) ---
const FACILITIES = ['DWH', 'PPP', 'CHC Cholapur', 'CHC Chiraigaon', 'CHC Pindra', 'CHC Sarnath'];
const STATUSES = ['Active', 'Admitted', 'Critical', 'Observation', 'Discharged'];
const RISKS = ['High Risk', 'Moderate Risk', 'Low Risk'];
const MODES = ['Vaginal', 'Emergency C-Section', 'Elective C-Section', 'Assisted Vaginal', 'Referred out'];
const STAFF = ['Dr. Priya Singh', 'Dr. Anjali Rao', 'Dr. Kavita Gupta', 'Sr. Meena Devi', 'Dr. Suresh Kumar', 'Dr. Neha Sharma'];
const NAMES_F = ['Sunita Devi', 'Radha Kumari', 'Meera Sharma', 'Kiran Bala', 'Anita Singh', 'Poonam Gupta', 'Savita Yadav', 'Geeta Patel', 'Rekha Verma', 'Usha Mishra', 'Laxmi Shukla', 'Vandana Tiwari', 'Rita Dubey', 'Sona Pandey', 'Mamta Chauhan', 'Pushpa Rajput', 'Seema Jaiswal', 'Durga Srivastava', 'Asha Bajpai', 'Nirmala Keshari'];

function rnd(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function rndNum(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a }
function daysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().split('T')[0] }
function fmtDate(d) { if (!d) return '—'; return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) }

function genPatients(n) {
    const pts = [];
    for (let i = 1; i <= n; i++) {
        const regDate = daysAgo(rndNum(0, 90));
        pts.push({
            id: 'LT-2025-' + String(1000 + i).padStart(4, '0'),
            name: NAMES_F[(i - 1) % NAMES_F.length] + (i > NAMES_F.length ? ' ' + (Math.ceil(i / NAMES_F.length)) : ' '),
            age: rndNum(18, 42),
            regDate,
            admDate: daysAgo(rndNum(0, 3)),
            facility: rnd(FACILITIES),
            status: rnd(STATUSES),
            risk: rnd(RISKS),
            gravida: rnd(['1', '>1']),
            gest: rnd(['Term', 'Preterm']),
            mode: rnd(MODES),
            staff: rnd(STAFF),
            shift: rnd(['Morning', 'Evening', 'Night']),
            babyWt: rnd(['≥2500 gm', '2499–1800 gm', '<1500 gm']),
            updatedAt: daysAgo(rndNum(0, 5)),
            updatedBy: rnd(STAFF),
            createdBy: rnd(STAFF),
            notes: rnd(['Normal progress', 'Monitoring ongoing', 'Referred for complications', 'Stable post-delivery', 'Requires follow-up', 'No remarks'])
        });
    }
    return pts;
}

// const INITIAL_DATA = genPatients(87);

const COLUMN_GROUPS = [
    {
        sectionName: '1. Observation & Facility',
        columns: [
            { key: 'id', label: 'Case ID', sticky: true },
            { key: 'name', label: 'Patient Name' },
            { key: 'regDate', label: 'Reg. Date' },
            { key: 'observation_date', label: 'Observation Date' },
            { key: 'facility', label: 'Facility' },
            { key: 'shift', label: 'Shift' },
            { key: 'addedBy', label: 'Added By' }
        ]
    },
    {
        sectionName: '2. Admission & Clinical Profile',
        columns: [
            { key: 'admDate', label: 'Admission Date' },
            { key: 'admission_time', label: 'Admission Time' },
            { key: 'gravida', label: 'Gravida' },
            { key: 'parity', label: 'Parity' },
            { key: 'gest', label: 'Gest. Age' },
            { key: 'risk', label: 'Risk' },
            { key: 'triage_under_30_min', label: 'Triage < 30 Min' },
            { key: 'fhr_monitored', label: 'FHR Monitored' },
            { key: 'abnormal_fhr_action', label: 'Abnormal FHR Action' },
            { key: 'partograph_filled', label: 'Partograph Filled' },
            { key: 'ancs_given', label: 'ANCS Given' },
            { key: 'dose_count', label: 'Dose Count' },
            { key: 'labour_augmentation', label: 'Labour Augmentation' },
            { key: 'indication_documented', label: 'Indication Documented' },
            { key: 'oxytocin_monitoring', label: 'Oxytocin Monitoring' },
            { key: 'augmentation_appropriate', label: 'Augmentation Appropriate' },
            { key: 'fundal_pressure_applied', label: 'Fundal Pressure' }
        ]
    },
    {
        sectionName: '3. Complications & Referral',
        columns: [
            { key: 'complications_developed', label: 'Complications Developed' },
            { key: 'complication_type', label: 'Complication Type' },
            { key: 'complication_description', label: 'Complication Desc.' },
            { key: 'complication_managed', label: 'Complication Managed' },
            { key: 'senior_support_sought', label: 'Senior Support' },
            { key: 'referral_status', label: 'Referral Status' },
            { key: 'referral_delay', label: 'Referral Delay' }
        ]
    },
    {
        sectionName: '4. Delivery Details',
        columns: [
            { key: 'mode', label: 'Delivery Mode' },
            { key: 'csection_indication', label: 'C-Section Indication' },
            { key: 'csection_indication_other', label: 'C-Section Ind. Other' },
            { key: 'timeOfDecision', label: 'Time of Decision' },
            { key: 'timeOfIncision', label: 'Time of Incision' },
            { key: 'dti_interval', label: 'DTI Interval' },
            { key: 'is_timely', label: 'Is Timely' },
            { key: 'delay_reason', label: 'Delay Reason' },
            { key: 'amtsl_followed', label: 'AMTSL Followed' },
            { key: 'episiotomy_given', label: 'Episiotomy' },
            { key: 'episiotomy_appropriate', label: 'Episiotomy Approp.' },
            { key: 'staff', label: 'Assigned Staff' },
            { key: 'assistant_name', label: 'Assistant Name' },
            { key: 'anesthetist_name', label: 'Anesthetist Name' },
            { key: 'outcome_of_labour', label: 'Outcome of Labour' }
        ]
    },
    {
        sectionName: '5. Newborn Care',
        columns: [
            { key: 'gender_of_baby', label: 'Baby Gender' },
            { key: 'babyWt', label: 'Birth Weight' },
            { key: 'baby_cried_immediately', label: 'Baby Cried Immed.' },
            { key: 'eye_drops_given', label: 'Eye Drops Given' },
            { key: 'initiation_of_breastfeeding', label: 'Breastfeeding Init.' },
            { key: 'baby_stable', label: 'Baby Stable' },
            { key: 'baby_dried', label: 'Baby Dried' },
            { key: 'immediate_skin_to_skin', label: 'Skin to Skin' },
            { key: 'delayed_cord_clamping', label: 'Delayed Cord Clamp' },
            { key: 'baby_cried', label: 'Baby Cried' },
            { key: 'stimulation_if_no_cry', label: 'Stimulation (No Cry)' },
            { key: 'bag_mask_if_needed', label: 'Bag Mask Needed' },
            { key: 'early_breastfeeding', label: 'Early Breastfeeding' },
            { key: 'clean_practices', label: 'Clean Practices' },
            { key: 'vit_k_given', label: 'Vit K Given' },
            { key: 'newborn_resuscitated', label: 'Newborn Resuscitated' },
            { key: 'outcome_of_baby', label: 'Outcome of Baby' }
        ]
    },
    {
        sectionName: '6. Postnatal & Outcome',
        columns: [
            { key: 'kmc_required', label: 'KMC Required' },
            { key: 'mother_counselled_kmc', label: 'Mother Counselled KMC' },
            { key: 'kmc_given', label: 'KMC Given' },
            { key: 'kmc_duration_lr', label: 'KMC Duration' },
            { key: 'kmc_provider', label: 'KMC Provider' },
            { key: 'ref_nicu_sncu', label: 'Ref NICU/SNCU' },
            { key: 'notes', label: 'Notes' },
            { key: 'updatedAt', label: 'Last Updated' },
            { key: 'actions', label: 'Actions', noSort: true }
        ]
    }
];

const ALL_COLS = COLUMN_GROUPS.flatMap(g => g.columns);

// Context Helpers
function statusBadge(s) {
    const map = { Active: 's-active', Admitted: 's-admitted', Critical: 's-critical', Observation: 's-observation', Discharged: 's-discharged' };
    return <span className={`status ${map[s] || 's-discharged'}`}>{s}</span>;
}

function riskBadge(r) {
    const map = { 'High Risk': 'r-high', 'Moderate Risk': 'r-mod', 'Low Risk': 'r-low' };
    return <span className={`risk ${map[r] || 'r-low'}`}>{r}</span>;
}

function initials(n) {
    if (!n) return 'NA';
    const parts = String(n).trim().split(' ');
    return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
}


const LabourList = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    // State matching vanilla logic
    const [allData, setAllData] = useState([]);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/labour/list`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    // Map IDs to match the UI format if needed, or use DB ID
                    const formattedData = data.map(pt => {
                        // Reg Date formatting: Add DateTime
                        let fmtRegDate = pt.created_at ? new Date(pt.created_at).toLocaleString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit', hour12: true
                        }) : 'N/A';

                        // Observation Date formatting: Date only
                        let fmtObsDate = pt.observation_date ? new Date(pt.observation_date).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric'
                        }) : 'N/A';

                        return {
                            ...pt,
                            db_id: pt.id,
                            id: pt.case_id || pt.id, // Only use raw Case ID, no prefix!
                            regDate: fmtRegDate,
                            observation_date: fmtObsDate,
                            addedBy: pt.addedBy || 'System',
                            // Ensure other necessary fields from backend map properly, like delivery_mode etc if we rely on pt.mode
                            mode: pt.delivery_mode,
                            status: pt.outcome_of_labour || 'N/A' // Though hidden, keep it for whatever else might need it. We hid the column above.
                        };
                    });
                    setAllData(formattedData);
                } else {
                    console.error('Failed to fetch patients');
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchPatients();
    }, []);
    const [isLightMode, setIsLightMode] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    const [searchQ, setSearchQ] = useState('');
    const [sortCol, setSortCol] = useState('regDate');
    const [sortDir, setSortDir] = useState('desc');
    const [showFilters, setShowFilters] = useState(false);
    const [showColDD, setShowColDD] = useState(false);

    // Profile & Password Modals State
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isPasswordOpen, setIsPasswordOpen] = useState(false);

    // Filters
    const [filters, setFilters] = useState({ status: '', facility: '', risk: '', mode: '', dateFrom: '', dateTo: '' });

    // Modals
    const [viewTarget, setViewTarget] = useState(null);
    const [delTarget, setDelTarget] = useState(null);

    // Dashboard Header States
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [timeStr, setTimeStr] = useState('Loading...');
    const [dateStr, setDateStr] = useState('Loading...');
    const userMenuRef = useRef(null);
    const settingsBtnRef = useRef(null);
    const notifBtnRef = useRef(null);

    const [visCols, setVisCols] = useState(() => {
        const initialVis = {};
        ALL_COLS.forEach(c => { initialVis[c.key] = true; });
        return initialVis;
    });

    // Subheader dates
    const [todayStr, setTodayStr] = useState('');

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
            }
        });
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
        // Assume context logout exists or clear local config natively
        localStorage.removeItem('token');
        navigate('/login');
    };

    const nameDisplay = user?.name || 'User';
    const roleDisplay = user?.role_type === 1 ? 'Admin' : 'Staff';
    const initDisplay = nameDisplay.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    useEffect(() => {
        const savedTheme = 'light';
        const prefersLight = true;
        const hr = new Date().getHours();
        const autoLight = hr >= 6 && hr < 19;
        const isLight = savedTheme ? savedTheme === 'light' : autoLight;

        setIsLightMode(true);
        document.documentElement.setAttribute('data-theme', 'light');

        setTodayStr(new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }));
    }, []);

    const toggleTheme = () => {
        const next = !isLightMode;
        setIsLightMode(next);
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    };

    // Filter Logic
    const filteredData = useMemo(() => {
        return allData.filter(r => {
            if (searchQ) {
                const hay = [r.id, r.name, r.facility, r.status, r.staff, r.mode].join(' ').toLowerCase();
                if (!hay.includes(searchQ.toLowerCase())) return false;
            }
            if (filters.status && r.status !== filters.status) return false;
            if (filters.facility && r.facility !== filters.facility) return false;
            if (filters.risk && r.risk !== filters.risk) return false;
            if (filters.mode && r.mode !== filters.mode) return false;
            if (filters.dateFrom && r.regDate < filters.dateFrom) return false;
            if (filters.dateTo && r.regDate > filters.dateTo) return false;
            return true;
        });
    }, [allData, searchQ, filters]);

    // Sorting Logic
    const sortedData = useMemo(() => {
        const sorted = [...filteredData].sort((a, b) => {
            let av = a[sortCol] || '', bv = b[sortCol] || '';
            if (sortDir === 'desc') [av, bv] = [bv, av];
            return String(av).localeCompare(String(bv), undefined, { numeric: true });
        });
        return sorted;
    }, [filteredData, sortCol, sortDir]);

    // Pagination Logic
    const totalRecords = sortedData.length;
    const totalPages = Math.ceil(totalRecords / pageSize);
    const paginatedData = sortedData.slice((page - 1) * pageSize, page * pageSize);

    // Header actions
    const handleSort = (key) => {
        if (sortCol === key) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortCol(key);
            setSortDir('asc');
        }
    };

    const clearFilters = () => {
        setFilters({ status: '', facility: '', risk: '', mode: '', dateFrom: '', dateTo: '' });
        setSearchQ('');
        setPage(1);
    };

    const confirmDelete = () => {
        if (!delTarget) return;
        setAllData(prev => prev.filter(r => r.id !== delTarget));
        setDelTarget(null);
    };

    const highlightText = (text, q) => {
        if (!text) return text || '';
        if (!q) return text;
        const strText = String(text);
        const idx = strText.toLowerCase().indexOf(q.toLowerCase());
        if (idx < 0) return strText;
        return (
            <>
                {strText.slice(0, idx)}
                <mark className="hl">{strText.slice(idx, idx + q.length)}</mark>
                {strText.slice(idx + q.length)}
            </>
        );
    };

    const exportCSV = () => {
        const headers = ALL_COLS.filter(c => !c.noSort).map(c => c.label);
        const rows = filteredData.map(r => ALL_COLS.filter(c => !c.noSort).map(c => r[c.key] || ''));
        const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `LabourTrack_patients_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    // Calculate Badges for UI
    const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

    // Delivery Today robust calculation
    const todayStrLocal = new Date().toLocaleDateString('en-CA');
    const sToday = allData.filter(r => {
        if (!r.created_at) return false;
        return new Date(r.created_at).toLocaleDateString('en-CA') === todayStrLocal;
    }).length;

    const sActive = allData.filter(r => r.status === 'Active' || r.status === 'Admitted').length;
    const sCritical = allData.filter(r => r.status === 'Critical').length;
    const sDisc = allData.filter(r => r.status === 'Discharged').length;

    // Build visible columns list respecting order
    const visibleColumns = ALL_COLS.filter(c => visCols[c.key]);

    return (
        <div className="patient-records-page">
            <div className="bg-wrap"></div>
            <div className="bg-grid"></div>
            <div className="orb orb-1"></div>
            <div className="orb orb-2"></div>








            {/* View Modal */}
            <div className={`modal-overlay ${viewTarget ? 'show' : ''}`} onClick={(e) => { if (e.target.classList.contains('modal-overlay')) setViewTarget(null) }}>
                <div className="modal modal-lg">
                    <div className="modal-head">
                        <span className="modal-title">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                            Patient Record
                        </span>
                        <button className="modal-close" onClick={() => setViewTarget(null)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                        </button>
                    </div>
                    {viewTarget && (
                        <div className="modal-body">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px', paddingBottom: '18px', borderBottom: '1px solid var(--bd)' }}>
                                <div style={{ width: '52px', height: '52px', borderRadius: '13px', background: 'linear-gradient(135deg,var(--teal),var(--tl))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                                    {initials(viewTarget.name)}
                                </div>
                                <div>
                                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', fontWeight: 500, color: 'var(--tx1)' }}>{viewTarget.name}</div>
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>{statusBadge(viewTarget.status)} {riskBadge(viewTarget.risk)}</div>
                                </div>
                            </div>
                            <div className="detail-section" style={{ marginTop: '0', paddingTop: '0', borderTop: 'none' }}>
                                <div style={{ fontSize: '.85rem', fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--tx1)', marginBottom: '12px', borderBottom: '1px solid var(--bd2)', paddingBottom: '6px' }}>1. Observation & Facility</div>
                                <div className="detail-grid">
                                    <div className="detail-row"><div className="detail-lbl">Case ID</div><div className="detail-val" style={{ color: 'var(--tb)', fontWeight: 600 }}>{viewTarget.case_id || viewTarget.id}</div></div>
                                    <div className="detail-row"><div className="detail-lbl">Observation Date</div><div className="detail-val">{viewTarget.observation_date ? fmtDate(viewTarget.observation_date) : 'N/A'}</div></div>
                                    <div className="detail-row"><div className="detail-lbl">Facility</div><div className="detail-val">{viewTarget.facility || 'N/A'}</div></div>
                                    <div className="detail-row"><div className="detail-lbl">Shift</div><div className="detail-val">{viewTarget.shift || 'N/A'}</div></div>
                                </div>
                            </div>

                            <div className="detail-section" style={{ marginTop: '20px' }}>
                                <div style={{ fontSize: '.85rem', fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--tx1)', marginBottom: '12px', borderBottom: '1px solid var(--bd2)', paddingBottom: '6px' }}>2. Admission & Clinical Profile</div>
                                <div className="detail-grid">
                                    <div className="detail-row"><div className="detail-lbl">Admission Date</div><div className="detail-val">{viewTarget.admission_date ? fmtDate(viewTarget.admission_date) : 'N/A'}</div></div>
                                    <div className="detail-row"><div className="detail-lbl">Admission Time</div><div className="detail-val">{viewTarget.admission_time || 'N/A'}</div></div>
                                    <div className="detail-row"><div className="detail-lbl">Gravida</div><div className="detail-val">{viewTarget.gravida || 'N/A'}</div></div>
                                    <div className="detail-row"><div className="detail-lbl">Parity</div><div className="detail-val">{viewTarget.parity || 'N/A'}</div></div>
                                    <div className="detail-row"><div className="detail-lbl">Gestational Age</div><div className="detail-val">{viewTarget.gestational_age || 'N/A'}</div></div>
                                    <div className="detail-row"><div className="detail-lbl">Risk Status</div><div className="detail-val">{viewTarget.risk_status || 'N/A'}</div></div>
                                    <div className="detail-row"><div className="detail-lbl">Triage &lt; 30 min</div><div className="detail-val">{viewTarget.triage_under_30_min || 'N/A'}</div></div>
                                    <div className="detail-row"><div className="detail-lbl">FHR Monitored</div><div className="detail-val">{viewTarget.fhr_monitored || 'N/A'}</div></div>
                                    <div className="detail-row"><div className="detail-lbl">Abnormal FHR Action</div><div className="detail-val">{viewTarget.abnormal_fhr_action || 'N/A'}</div></div>
                                    <div className="detail-row"><div className="detail-lbl">Partograph Filled</div><div className="detail-val">{viewTarget.partograph_filled || 'N/A'}</div></div>
                                    <div className="detail-row"><div className="detail-lbl">ANCS Given</div><div className="detail-val">{viewTarget.ancs_given || 'N/A'}</div></div>
                                    <div className="detail-row"><div className="detail-lbl">Dose Count</div><div className="detail-val">{viewTarget.dose_count || 'N/A'}</div></div>
                                    <div className="detail-row"><div className="detail-lbl">Labour Augmentation</div><div className="detail-val">{viewTarget.labour_augmentation || 'N/A'}</div></div>
                                    <div className="detail-row"><div className="detail-lbl">Indication Documented</div><div className="detail-val">{viewTarget.indication_documented || 'N/A'}</div></div>
                                    <div className="detail-row"><div className="detail-lbl">Oxytocin Monitoring</div><div className="detail-val">{viewTarget.oxytocin_monitoring || 'N/A'}</div></div>
                                    <div className="detail-row"><div className="detail-lbl">Augmentation Appropriate</div><div className="detail-val">{viewTarget.augmentation_appropriate || 'N/A'}</div></div>
                                    <div className="detail-row"><div className="detail-lbl">Fundal Pressure Applied</div><div className="detail-val">{viewTarget.fundal_pressure_applied || 'N/A'}</div></div>
                                </div>
                            </div>

                            <div className="detail-section" style={{ marginTop: '20px' }}>
                                <div style={{ fontSize: '.85rem', fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--tx1)', marginBottom: '12px', borderBottom: '1px solid var(--bd2)', paddingBottom: '6px' }}>3. Complications & Referral</div>
                                <div className="detail-grid">
                                    <div className="detail-row"><div className="detail-lbl">Complications Developed</div><div className="detail-val">{viewTarget.complications_developed || 'N/A'}</div></div>
                                    {(viewTarget.complications_developed === 'Yes' || viewTarget.complication_type) && <div className="detail-row"><div className="detail-lbl">Complication Type</div><div className="detail-val">{viewTarget.complication_type || 'N/A'}</div></div>}
                                    {(viewTarget.complications_developed === 'Yes' || viewTarget.complication_description) && <div className="detail-row full"><div className="detail-lbl">Complication Description</div><div className="detail-val">{viewTarget.complication_description || 'N/A'}</div></div>}
                                    <div className="detail-row"><div className="detail-lbl">Complication Managed</div><div className="detail-val">{viewTarget.complication_managed || 'N/A'}</div></div>
                                    <div className="detail-row"><div className="detail-lbl">Senior Support Sought</div><div className="detail-val">{viewTarget.senior_support_sought || 'N/A'}</div></div>
                                    <div className="detail-row"><div className="detail-lbl">Referral Status</div><div className="detail-val">{viewTarget.referral_status || 'N/A'}</div></div>
                                    {viewTarget.referral_status !== 'No' && viewTarget.referral_delay && <div className="detail-row"><div className="detail-lbl">Referral Delay</div><div className="detail-val">{viewTarget.referral_delay || 'N/A'}</div></div>}
                                </div>
                            </div>

                            <div className="detail-section" style={{ marginTop: '20px' }}>
                                <div style={{ fontSize: '.85rem', fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--tx1)', marginBottom: '12px', borderBottom: '1px solid var(--bd2)', paddingBottom: '6px' }}>4. Delivery Details</div>
                                <div className="detail-grid">
                                    <div className="detail-row"><div className="detail-lbl">Delivery Mode</div><div className="detail-val">{viewTarget.delivery_mode || 'N/A'}</div></div>
                                    {(viewTarget.delivery_mode === 'Emergency C-Section' || viewTarget.delivery_mode === 'Elective C-Section' || viewTarget.csection_indication) && <div className="detail-row"><div className="detail-lbl">C-Section Indication</div><div className="detail-val">{viewTarget.csection_indication === 'Other' ? viewTarget.csection_indication_other : viewTarget.csection_indication || 'N/A'}</div></div>}
                                    {(viewTarget.delivery_mode === 'Emergency C-Section' || viewTarget.delivery_mode === 'Elective C-Section' || viewTarget.timeOfDecision) && <div className="detail-row"><div className="detail-lbl">Time of Decision</div><div className="detail-val">{viewTarget.timeOfDecision || 'N/A'}</div></div>}
                                    {(viewTarget.delivery_mode === 'Emergency C-Section' || viewTarget.delivery_mode === 'Elective C-Section' || viewTarget.timeOfIncision) && <div className="detail-row"><div className="detail-lbl">Time of Incision</div><div className="detail-val">{viewTarget.timeOfIncision || 'N/A'}</div></div>}
                                    {(viewTarget.delivery_mode === 'Emergency C-Section' || viewTarget.delivery_mode === 'Elective C-Section' || viewTarget.dti_interval) && <div className="detail-row"><div className="detail-lbl">DTI Interval</div><div className="detail-val">{viewTarget.dti_interval ? viewTarget.dti_interval + ' mins' : 'N/A'}</div></div>}
                                    {(viewTarget.delivery_mode === 'Emergency C-Section' || viewTarget.delivery_mode === 'Elective C-Section' || viewTarget.is_timely) && <div className="detail-row"><div className="detail-lbl">Timely C-Section?</div><div className="detail-val">{viewTarget.is_timely || 'N/A'}</div></div>}
                                    {(viewTarget.is_timely === 'No' || viewTarget.delay_reason) && <div className="detail-row"><div className="detail-lbl">Delay Reason</div><div className="detail-val">{viewTarget.delay_reason || 'N/A'}</div></div>}

                                    <div className="detail-row"><div className="detail-lbl">AMTSL Followed</div><div className="detail-val">{viewTarget.amtsl_followed || 'N/A'}</div></div>
                                    <div className="detail-row"><div className="detail-lbl">Episiotomy Given</div><div className="detail-val">{viewTarget.episiotomy_given || 'N/A'}</div></div>
                                    {viewTarget.episiotomy_given === 'Yes' && <div className="detail-row"><div className="detail-lbl">Episiotomy Appropriate</div><div className="detail-val">{viewTarget.episiotomy_appropriate || 'N/A'}</div></div>}
                                    <div className="detail-row"><div className="detail-lbl">Assistant Name</div><div className="detail-val">{viewTarget.assistant_name || 'N/A'}</div></div>
                                    <div className="detail-row"><div className="detail-lbl">Anesthetist Name</div><div className="detail-val">{viewTarget.anesthetist_name || 'N/A'}</div></div>
                                    <div className="detail-row"><div className="detail-lbl">Outcome of Labour</div><div className="detail-val">{viewTarget.outcome_of_labour || 'N/A'}</div></div>
                                </div>
                            </div>

                            <div className="detail-section" style={{ marginTop: '20px' }}>
                                <div style={{ fontSize: '.85rem', fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--tx1)', marginBottom: '12px', borderBottom: '1px solid var(--bd2)', paddingBottom: '6px' }}>5. Newborn Care & Outcome</div>
                                <div className="detail-grid">
                                    <div className="detail-row"><div className="detail-lbl">Gender</div><div className="detail-val">{viewTarget.gender_of_baby || 'N/A'}</div></div>
                                    <div className="detail-row"><div className="detail-lbl">Baby Cried Immediately</div><div className="detail-val">{viewTarget.baby_cried_immediately || viewTarget.baby_cried || 'N/A'}</div></div>
                                    <div className="detail-row"><div className="detail-lbl">Baby Stable</div><div className="detail-val">{viewTarget.baby_stable || 'N/A'}</div></div>
                                    <div className="detail-row"><div className="detail-lbl">Baby Dried</div><div className="detail-val">{viewTarget.baby_dried || 'N/A'}</div></div>
                                    <div className="detail-row"><div className="detail-lbl">Immediate Skin-to-Skin</div><div className="detail-val">{viewTarget.immediate_skin_to_skin || 'N/A'}</div></div>
                                    <div className="detail-row"><div className="detail-lbl">Delayed Cord Clamping</div><div className="detail-val">{viewTarget.delayed_cord_clamping || 'N/A'}</div></div>
                                    {viewTarget.baby_cried_immediately === 'No' && <div className="detail-row"><div className="detail-lbl">Stimulation (If No Cry)</div><div className="detail-val">{viewTarget.stimulation_if_no_cry || 'N/A'}</div></div>}
                                    {viewTarget.baby_cried_immediately === 'No' && <div className="detail-row"><div className="detail-lbl">Bag & Mask (If Needed)</div><div className="detail-val">{viewTarget.bag_mask_if_needed || 'N/A'}</div></div>}
                                    <div className="detail-row"><div className="detail-lbl">Early Breastfeeding</div><div className="detail-val">{viewTarget.early_breastfeeding || viewTarget.initiation_of_breastfeeding || 'N/A'}</div></div>
                                    <div className="detail-row"><div className="detail-lbl">Clean Practices</div><div className="detail-val">{viewTarget.clean_practices || 'N/A'}</div></div>
                                    <div className="detail-row"><div className="detail-lbl">Eye Drops Given</div><div className="detail-val">{viewTarget.eye_drops_given || 'N/A'}</div></div>
                                    <div className="detail-row"><div className="detail-lbl">Vit K Given</div><div className="detail-val">{viewTarget.vit_k_given || 'N/A'}</div></div>
                                    <div className="detail-row"><div className="detail-lbl">Birth Weight Taken</div><div className="detail-val">{viewTarget.birth_weight_taken || 'N/A'}</div></div>
                                    <div className="detail-row"><div className="detail-lbl">Birth Weight (Gms)</div><div className="detail-val">{viewTarget.birth_weight_gms || 'N/A'}</div></div>
                                    <div className="detail-row"><div className="detail-lbl">KMC Required</div><div className="detail-val">{viewTarget.kmc_required || 'N/A'}</div></div>
                                    {viewTarget.kmc_required === 'Yes' && <div className="detail-row"><div className="detail-lbl">Mother Counselled KMC</div><div className="detail-val">{viewTarget.mother_counselled_kmc || 'N/A'}</div></div>}
                                    {viewTarget.kmc_required === 'Yes' && <div className="detail-row"><div className="detail-lbl">KMC Given</div><div className="detail-val">{viewTarget.kmc_given || 'N/A'}</div></div>}
                                    {viewTarget.kmc_given === 'Yes' && <div className="detail-row"><div className="detail-lbl">KMC Duration (LR)</div><div className="detail-val">{viewTarget.kmc_duration_lr || 'N/A'}</div></div>}
                                    {viewTarget.kmc_given === 'Yes' && <div className="detail-row"><div className="detail-lbl">KMC Provider</div><div className="detail-val">{viewTarget.kmc_provider || 'N/A'}</div></div>}
                                    <div className="detail-row"><div className="detail-lbl">Newborn Resuscitated</div><div className="detail-val">{viewTarget.newborn_resuscitated || 'N/A'}</div></div>
                                    <div className="detail-row"><div className="detail-lbl">Referred to NICU/SNCU</div><div className="detail-val">{viewTarget.ref_nicu_sncu || 'N/A'}</div></div>
                                    <div className="detail-row"><div className="detail-lbl">Outcome of Baby</div><div className="detail-val">{viewTarget.outcome_of_baby || 'N/A'}</div></div>
                                    <div className="detail-row full"><div className="detail-lbl">Any Other Comments</div><div className="detail-val">{viewTarget.any_other_comments || 'N/A'}</div></div>
                                </div>
                            </div>
                            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--bd)' }}>
                                <div style={{ fontSize: '.72rem', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--tx3)', marginBottom: '12px' }}>Audit Trail</div>
                                <div className="audit-item"><div className="audit-dot" style={{ background: 'var(--ok)' }}></div><div className="audit-content"><div className="audit-action">Record created</div><div className="audit-meta">{viewTarget.createdBy} · {fmtDate(viewTarget.regDate)}</div></div></div>
                                <div className="audit-item"><div className="audit-dot" style={{ background: 'var(--tb)' }}></div><div className="audit-content"><div className="audit-action">Last modification</div><div className="audit-meta">{viewTarget.updatedBy} · {fmtDate(viewTarget.updatedAt)}</div></div></div>
                            </div>
                        </div>
                    )}
                    <div className="modal-foot">
                        <button className="btn-modal-cancel" onClick={() => setViewTarget(null)}>Close</button>
                        <button className="btn-modal-confirm" style={{ background: 'linear-gradient(135deg,var(--teal),var(--tl))' }} onClick={() => navigate('/add-patient', { state: { patient: viewTarget } })}>Edit Record</button>
                    </div>
                </div>
            </div>

            <div className="page" onClick={(e) => { if (showColDD && !e.target.closest('.col-dd-container')) setShowColDD(false) }}>
                {/* TOPBAR */}
                <DashTopbar
                    isLightMode={isLightMode}
                    handleThemeToggle={() => setIsLightMode(!isLightMode)}
                    isUserMenuOpen={isUserMenuOpen}
                    toggleUserMenu={(e) => { e.stopPropagation(); setIsSettingsOpen(false); setIsNotifOpen(false); setIsUserMenuOpen(!isUserMenuOpen); }}
                    userMenuRef={userMenuRef}
                    isSettingsOpen={isSettingsOpen}
                    toggleSettingsMenu={(e) => { e.stopPropagation(); setIsUserMenuOpen(false); setIsNotifOpen(false); setIsSettingsOpen(!isSettingsOpen); }}
                    settingsBtnRef={settingsBtnRef}
                    isNotifOpen={isNotifOpen}
                    toggleNotifMenu={(e) => { e.stopPropagation(); setIsUserMenuOpen(false); setIsSettingsOpen(false); setIsNotifOpen(!isNotifOpen); }}
                    notifBtnRef={notifBtnRef}
                    setIsProfileOpen={setIsProfileOpen}
                    setIsPasswordOpen={setIsPasswordOpen}
                    setIsUserMenuOpen={setIsUserMenuOpen}
                    setIsSettingsOpen={setIsSettingsOpen}
                    setIsNotifOpen={setIsNotifOpen}
                    pageTitle="Patient Records"
                    currentPage={`${dateStr} · ${timeStr}`}
                    parentPage="Dashboard"
                    parentPageLink="/dashboard"
                />


                <div className="content">
                    {/* Header */}
                    <div className="pg-head">
                        <div className="pg-title-w">
                            <h1 className="pg-title">Patient Records</h1>
                            <div className="pg-meta">
                                <span><span className="live-dot"></span> Live data</span>
                                <span className="meta-sep"></span>
                                <span>{allData.length} total records</span>
                                <span className="meta-sep"></span>
                                <span>{todayStr}</span>
                            </div>
                        </div>
                        <div className="pg-actions">
                            <button className="btn-export" onClick={exportCSV}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                Export CSV
                            </button>
                            <button className="btn-add" onClick={() => navigate('/add-patient')}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
                                <span>Add New Patient</span>
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="dash-stats-strip-v2" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: '24px' }}>
                        <div className="dash-stat-card-v2 variant-blue" style={{ padding: '16px' }}>
                            <div className="dash-stat-v2-header">
                                <span className="dash-stat-v2-title">Total Records</span>
                                <div className="dash-stat-v2-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg></div>
                            </div>
                            <div className="dash-stat-v2-main"><div className="dash-stat-v2-num" style={{ fontSize: '2.2rem' }}>{allData.length}</div></div>
                        </div>

                        <div className="dash-stat-card-v2 variant-green" style={{ padding: '16px' }}>
                            <div className="dash-stat-v2-header">
                                <span className="dash-stat-v2-title">Active</span>
                                <div className="dash-stat-v2-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg></div>
                            </div>
                            <div className="dash-stat-v2-main"><div className="dash-stat-v2-num" style={{ fontSize: '2.2rem' }}>{sActive}</div></div>
                        </div>

                        <div className="dash-stat-card-v2 variant-rose" style={{ padding: '16px' }}>
                            <div className="dash-stat-v2-header">
                                <span className="dash-stat-v2-title">Critical</span>
                                <div className="dash-stat-v2-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg></div>
                            </div>
                            <div className="dash-stat-v2-main"><div className="dash-stat-v2-num" style={{ fontSize: '2.2rem' }}>{sCritical}</div></div>
                        </div>

                        <div className="dash-stat-card-v2 variant-gold" style={{ padding: '16px' }}>
                            <div className="dash-stat-v2-header">
                                <span className="dash-stat-v2-title">Today's Cases</span>
                                <div className="dash-stat-v2-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 9h6M9 12h6M9 15h4" /></svg></div>
                            </div>
                            <div className="dash-stat-v2-main">
                                <div className="dash-stat-v2-num" style={{ fontSize: '2.2rem' }}>{sToday}</div>
                                <div className="dash-stat-v2-sub">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                                    {todayStrLocal || dateStr}
                                </div>
                            </div>
                        </div>

                        <div className="dash-stat-card-v2" style={{ padding: '16px' }}>
                            <div className="dash-stat-v2-header">
                                <span className="dash-stat-v2-title" style={{ color: 'var(--dash-tx-2)' }}>Discharged</span>
                                <div className="dash-stat-v2-icon" style={{ background: 'var(--dash-surface-2)', color: 'var(--dash-tx-3)', boxShadow: 'none' }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg></div>
                            </div>
                            <div className="dash-stat-v2-main"><div className="dash-stat-v2-num" style={{ fontSize: '2.2rem', color: 'var(--dash-tx-2)' }}>{sDisc}</div></div>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="toolbar">
                        <div className="toolbar-top">
                            <div className="search-w">
                                <span className="search-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg></span>
                                <input
                                    type="text"
                                    placeholder="Search by name, ID, facility, status…"
                                    value={searchQ}
                                    onChange={(e) => { setSearchQ(e.target.value); setPage(1); }}
                                />
                                {searchQ && (
                                    <button className="search-clear show" onClick={() => { setSearchQ(''); setPage(1); }}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                    </button>
                                )}
                            </div>
                            <button className={`toolbar-btn ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(!showFilters)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
                                Filters {activeFiltersCount > 0 && <span className="tb-badge">{activeFiltersCount}</span>}
                            </button>
                            <div className="col-dd-container" style={{ position: 'relative' }}>
                                <button className="toolbar-btn" onClick={() => setShowColDD(!showColDD)}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
                                    Columns
                                </button>
                                <div className={`col-toggle-dd ${showColDD ? 'show' : ''}`}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', gap: '8px' }}>
                                        <button
                                            style={{ flex: 1, padding: '6px', fontSize: '.75rem', borderRadius: '6px', border: '1px solid var(--bd)', background: 'var(--surH)', color: 'var(--tx1)', cursor: 'pointer' }}
                                            onClick={() => {
                                                const allChecked = ALL_COLS.reduce((acc, c) => ({ ...acc, [c.key]: true }), {});
                                                setVisCols(allChecked);
                                            }}>
                                            Select All
                                        </button>
                                        <button
                                            style={{ flex: 1, padding: '6px', fontSize: '.75rem', borderRadius: '6px', border: 'none', background: 'transparent', color: 'var(--tx3)', cursor: 'pointer', textDecoration: 'underline' }}
                                            onClick={() => {
                                                const reset = ALL_COLS.reduce((acc, c) => ({ ...acc, [c.key]: true }), {});
                                                reset['q64'] = false; // Hide comments by default
                                                setVisCols(reset);
                                            }}>
                                            Reset
                                        </button>
                                    </div>
                                    <div style={{ height: '1px', background: 'var(--bd)', margin: '4px 0 8px 0' }}></div>

                                    {COLUMN_GROUPS.map((group, gIdx) => (
                                        <div key={`g-${gIdx}`} style={{ marginBottom: '12px' }}>
                                            <div style={{ fontSize: '.7rem', fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--tx3)', marginBottom: '8px', paddingLeft: '4px' }}>
                                                {group.sectionName}
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '4px' }}>
                                                {group.columns.filter(c => c.key !== 'actions' && c.key !== 'id').map(c => (
                                                    <div className="col-toggle-item" key={c.key} style={{ padding: '6px 8px', borderRadius: '4px' }}>
                                                        <input
                                                            type="checkbox"
                                                            id={`col-${c.key}`}
                                                            checked={visCols[c.key]}
                                                            onChange={(e) => setVisCols({ ...visCols, [c.key]: e.target.checked })}
                                                        />
                                                        <label htmlFor={`col-${c.key}`} style={{ fontSize: '.74rem' }}>{c.label}</label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="pg-size">
                                    Rows:
                                    <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
                                        <option value="10">10</option>
                                        <option value="25">25</option>
                                        <option value="50">50</option>
                                        <option value="100">100</option>
                                    </select>
                                </span>
                            </div>
                        </div>

                        {/* Filters Panel */}
                        <div className={`filters-panel ${showFilters ? 'open' : ''}`}>
                            <div className="filters-inner">
                                <div className="filter-field">
                                    <label className="filter-lbl">Status</label>
                                    <select value={filters.status} onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPage(1); }}>
                                        <option value="">All Statuses</option>
                                        {STATUSES.map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="filter-field">
                                    <label className="filter-lbl">Facility</label>
                                    <select value={filters.facility} onChange={(e) => { setFilters({ ...filters, facility: e.target.value }); setPage(1); }}>
                                        <option value="">All Facilities</option>
                                        {FACILITIES.map(f => <option key={f}>{f}</option>)}
                                    </select>
                                </div>
                                <div className="filter-field">
                                    <label className="filter-lbl">Risk</label>
                                    <select value={filters.risk} onChange={(e) => { setFilters({ ...filters, risk: e.target.value }); setPage(1); }}>
                                        <option value="">All Risk Levels</option>
                                        {RISKS.map(r => <option key={r}>{r}</option>)}
                                    </select>
                                </div>
                                <div className="filter-field">
                                    <label className="filter-lbl">Delivery Mode</label>
                                    <select value={filters.mode} onChange={(e) => { setFilters({ ...filters, mode: e.target.value }); setPage(1); }}>
                                        <option value="">All Modes</option>
                                        {MODES.map(m => <option key={m}>{m}</option>)}
                                    </select>
                                </div>
                                <div className="filter-field">
                                    <label className="filter-lbl">From Date</label>
                                    <input type="date" value={filters.dateFrom} onChange={(e) => { setFilters({ ...filters, dateFrom: e.target.value }); setPage(1); }} />
                                </div>
                                <div className="filter-field">
                                    <label className="filter-lbl">To Date</label>
                                    <input type="date" value={filters.dateTo} onChange={(e) => { setFilters({ ...filters, dateTo: e.target.value }); setPage(1); }} />
                                </div>
                                <div className="filter-field filter-actions">
                                    <button className="btn-clear" onClick={clearFilters}>Clear All</button>
                                </div>
                            </div>
                            <div className="filter-badges">
                                {Object.entries(filters).map(([k, v]) => {
                                    if (!v) return null;
                                    let lbl = `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v} `;
                                    if (k.startsWith('date')) lbl = `${k === 'dateFrom' ? 'From' : 'To'}: ${fmtDate(v)} `;
                                    return (
                                        <span className="f-badge" key={k}>
                                            {lbl}
                                            <button onClick={() => { setFilters({ ...filters, [k]: '' }); setPage(1); }} title="Remove">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                            </button>
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* TABLE */}
                    <div className="table-wrap">
                        <div className="table-scroll">
                            <table>
                                <thead>
                                    <tr>
                                        {visibleColumns.map((col) => (
                                            <th
                                                key={col.key}
                                                className={`
                                                    ${col.sticky ? 'sticky-col' : ''}
                                                    ${sortCol === col.key ? (sortDir === 'asc' ? 'sorted-asc' : 'sorted-desc') : ''}
                                                    ${col.noSort ? 'no-sort' : ''}
`}
                                                onClick={col.noSort ? undefined : () => handleSort(col.key)}
                                            >
                                                {col.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedData.length === 0 ? (
                                        <tr>
                                            <td colSpan={visibleColumns.length} style={{ padding: 0 }}>
                                                <div className="empty-state">
                                                    <div className="empty-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg></div>
                                                    <div className="empty-title">No Records Found</div>
                                                    <p className="empty-sub">No patient records match your current search or filter criteria. Try adjusting your filters.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedData.map(r => (
                                            <tr key={r.id}>
                                                {visibleColumns.map((c) => {
                                                    let val = '—';
                                                    switch (c.key) {
                                                        case 'id': val = <span className="cell-id">{highlightText(r.id, searchQ)}</span>; break;
                                                        case 'name': val = <div className="cell-name"><div className="avatar-sm">{initials(r.name)}</div>{highlightText(r.name, searchQ)}</div>; break;
                                                        case 'regDate': val = <span className="cell-date">{r.regDate}</span>; break;
                                                        case 'observation_date': val = <span className="cell-date">{r.observation_date}</span>; break;
                                                        case 'admDate': val = <span className="cell-date">{fmtDate(r.admDate)}</span>; break;
                                                        case 'facility': val = highlightText(r.facility, searchQ); break;
                                                        case 'risk': val = riskBadge(r.risk); break;
                                                        case 'gest': val = <span className="mode-badge">{r.gest}</span>; break;
                                                        case 'mode': val = <span className="mode-badge">{r.mode}</span>; break;
                                                        case 'staff': val = <span style={{ fontSize: '.78rem', color: 'var(--tx2)' }}>{r.staff}</span>; break;
                                                        case 'babyWt': val = <span style={{ fontSize: '.75rem' }}>{r.babyWt}</span>; break;
                                                        case 'updatedAt': val = <span className="cell-date" title={`By ${r.updatedBy} `}>{fmtDate(r.updatedAt)}</span>; break;
                                                        case 'actions': val = (
                                                            <div className="act-row">
                                                                <button className="act-btn view" title="View" onClick={() => setViewTarget(r)}>
                                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                                                </button>
                                                                <button className="act-btn edit" title="Edit" onClick={() => navigate('/add-patient', { state: { patient: r } })}>
                                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                                                </button>
                                                            </div>
                                                        ); break;
                                                        default: val = <span>{r[c.key] !== null && r[c.key] !== undefined ? String(r[c.key]) : '—'}</span>; break;
                                                    }
                                                    return <td key={c.key} className={c.sticky ? 'sticky-col' : ''}>{val}</td>;
                                                })}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="pagination-wrap">
                            <div className="pg-info">
                                {totalRecords > 0 ? (
                                    <>Showing <strong>{((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, totalRecords)}</strong> of <strong>{totalRecords}</strong> records</>
                                ) : (
                                    <><strong>0</strong> records found</>
                                )}
                            </div>
                            <div className="pg-controls">
                                {totalPages > 1 && (
                                    <>
                                        <button className="pg-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
                                        </button>
                                        {[...Array(totalPages)].map((_, i) => {
                                            const p = i + 1;
                                            if (p === 1 || p === totalPages || Math.abs(p - page) <= 2) {
                                                return <button key={p} className={`pg-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>;
                                            }
                                            if (p === 2 || p === totalPages - 1) {
                                                if (Math.abs(p - page) === 3) return <span key={`ellipsis-${p}`} style={{ padding: '0 6px', color: 'var(--tx3)', fontSize: '.8rem' }}>…</span>;
                                            }
                                            return null;
                                        })}
                                        <button className="pg-btn" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* MOBILE CARDS */}
                    <div className="mobile-cards">
                        {paginatedData.length === 0 ? (
                            <div className="table-wrap">
                                <div className="empty-state">
                                    <div className="empty-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg></div>
                                    <div className="empty-title">No Records Found</div>
                                </div>
                            </div>
                        ) : (
                            paginatedData.map(r => (
                                <div className="m-card" key={`m-${r.id}`}>
                                    <div className="m-card-head">
                                        <span className="m-card-id">{r.id}</span>
                                        {statusBadge(r.status)}
                                    </div>
                                    <div className="m-card-name">{r.name}</div>
                                    <div className="m-card-body">
                                        <div className="m-field"><span className="m-label">Facility</span><span className="m-val">{r.facility}</span></div>
                                        <div className="m-field"><span className="m-label">Admitted</span><span className="m-val">{fmtDate(r.admDate)}</span></div>
                                        <div className="m-field"><span className="m-label">Risk</span><span className="m-val">{riskBadge(r.risk)}</span></div>
                                        <div className="m-field"><span className="m-label">Delivery</span><span className="m-val" style={{ fontSize: '.72rem' }}>{r.mode}</span></div>
                                    </div>
                                    <div className="m-card-foot">
                                        <span style={{ fontSize: '.72rem', color: 'var(--tx3)' }}>{r.staff}</span>
                                        <div className="act-row">
                                            <button className="act-btn view" onClick={() => setViewTarget(r)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg></button>
                                            <button className="act-btn edit" onClick={() => navigate('/add-patient', { state: { patient: r } })}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg></button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                </div>

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

export default LabourList;
