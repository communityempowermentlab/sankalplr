import React, { useState, useEffect, useContext, useRef } from 'react';
import AuthContext from '../context/AuthContext';
import DashTopbar from '../components/DashTopbar';
import DashFooter from '../components/DashFooter';
import UserProfileModals from '../components/UserProfileModals';
import './AddPatient.css';
import './Dashboard.css';
import { useNavigate, useLocation } from 'react-router-dom';
import celLogo from '../assets/cel_logo.png';

const STEPS = [
    { id: 1, label: 'Registration & Profile' },
    { id: 2, label: 'Delivery & Complications' },
    { id: 3, label: 'Newborn Care' },
    { id: 4, label: 'Postnatal & Outcome' }
];

const AddPatient = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errors, setErrors] = useState({});

    // Dashboard Shell State
    const { user, logout } = useContext(AuthContext);

    // Profile & Password Modals State
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isPasswordOpen, setIsPasswordOpen] = useState(false);

    // Dashboard Header State
    const [isLightMode, setIsLightMode] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    const userMenuRef = useRef(null);
    const settingsBtnRef = useRef(null);
    const notifBtnRef = useRef(null);

    // Form Data State
    const [formData, setFormData] = useState({
        db_id: '',
        q1: new Date().toISOString().split('T')[0],
        q2: '',
        q3: '', q4: '', q5: '', q7: new Date().toISOString().split('T')[0], q8: '',
        q9: '', q10: '', q11: '', q12: '', q13: '', q14: '', q15: '', q16: '', q17: '', q18: '',
        q19: '', q20: '', q21: '', q22: '', q23: '',
        q24: '', q25: '', q26: '', q27: '', q28: '', q29: '', q30: '', q31: '', q32: '', q33: '',
        q34: '', q35: '', q36: '', q37: '', timeOfDecision: '', timeOfIncision: '', dti_interval: '', is_timely: '', delay_reason: '', q38: '', q39: '', q40: '', q41: '', q42: '', q43: '',
        q44: '', q45: '', q46: '', q47: '', q48: '', q49: '', q50: '', q51: '', q52: '',
        q53: '', q54: '', q55: '', q56: '', q57: '', q58: '', q59: '', q60: '', q61: '', q62: '', q63: '', q64: ''
    });

    // --- PRE-FILL LOGIC FOR EDIT MODE ---
    useEffect(() => {
        if (location.state && location.state.patient) {
            const p = location.state.patient;
            setFormData(prev => ({
                ...prev,
                db_id: p.db_id || p.id || '',
                q1: p.observation_date ? new Date(p.observation_date).toISOString().split('T')[0] : prev.q1,
                q2: p.case_id || '',
                q3: p.patient_name || '',
                q4: p.facility || '',
                q5: p.shift || '',
                q7: p.admission_date ? new Date(p.admission_date).toISOString().split('T')[0] : prev.q7,
                q8: p.admission_time || '',
                q9: p.gravida || '',
                q10: p.parity || '',
                q11: p.gestational_age || '',
                q12: p.triage_under_30_min || '',
                q13: p.risk_status || '',
                q14: p.fhr_monitored || '',
                q15: p.abnormal_fhr_action || '',
                q16: p.partograph_filled || '',
                q17: p.ancs_given || '',
                q18: p.dose_count || '',
                q19: p.labour_augmentation || '',
                q20: p.indication_documented || '',
                q21: p.oxytocin_monitoring || '',
                q22: p.augmentation_appropriate || '',
                q23: p.fundal_pressure_applied || '',
                q24: p.complications_developed || '',
                q25: p.complication_type || '',
                q26: p.complication_description || '',
                q27: p.complication_managed || '',
                q28: p.senior_support_sought || '',
                q29: p.referral_status || '',
                q30: p.referral_delay || '',
                q31: p.delivery_mode || '',
                q32: p.csection_indication || '',
                q33: p.csection_indication_other || '',
                timeOfDecision: p.timeOfDecision || '',
                timeOfIncision: p.timeOfIncision || '',
                dti_interval: p.dti_interval || '',
                is_timely: p.is_timely || '',
                delay_reason: p.delay_reason || '',
                q39: p.episiotomy_given || '',
                q40: p.episiotomy_appropriate || '',
                q41: p.amtsl_followed || '',
                q44: p.baby_stable || p.outcome_of_baby || '',
                q45: p.baby_dried || '',
                q46: p.immediate_skin_to_skin || '',
                q47: p.delayed_cord_clamping || '',
                av_dcc: p.delayed_cord_clamping || '',
                q48: p.baby_cried || p.baby_cried_immediately || '',
                q49: p.stimulation_if_no_cry || '',
                q50: p.bag_mask_if_needed || '',
                q51: p.early_breastfeeding || p.initiation_of_breastfeeding || '',
                q52: p.clean_practices || '',
                q53: p.birth_weight_taken || '',
                q54: p.birth_weight_gms || '',
                q55: p.vit_k_given || '',
                q56: p.kmc_required || '',
                q57: p.mother_counselled_kmc || '',
                q58: p.kmc_given || '',
                q59: p.kmc_duration_lr || '',
                q60: p.kmc_provider || '',
                q61: p.ref_nicu_sncu || '',
                q63: p.outcome_of_labour || '',
                q64: p.any_other_comments || ''
            }));
            console.log("Edit Mode Loaded with Patient:", p);
        }
    }, [location.state]);

    // --- NEW: Auto-redirect to Listing Page after 3.5 seconds on Success ---
    useEffect(() => {
        let timer;
        if (isSuccess) {
            timer = setTimeout(() => {
                navigate('/list');
            }, 3500);
        }
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [isSuccess, navigate]);

    useEffect(() => {
        const savedTheme = 'light';
        const prefersLight = true;
        const isLight = true;
        setIsLightMode(true);
        document.documentElement.setAttribute('data-theme', 'light');
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) setIsUserMenuOpen(false);
            if (settingsBtnRef.current && !settingsBtnRef.current.contains(event.target)) setIsSettingsOpen(false);
            if (notifBtnRef.current && !notifBtnRef.current.contains(event.target)) setIsNotifOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsUserMenuOpen(false);
                setIsSettingsOpen(false);
                setIsNotifOpen(false);
                setIsProfileOpen(false);
                setIsPasswordOpen(false);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const handleThemeToggle = () => {
        const newMode = !isLightMode;
        setIsLightMode(newMode);
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    };

    const toggleUserMenu = (e) => { e.stopPropagation(); setIsSettingsOpen(false); setIsNotifOpen(false); setIsUserMenuOpen(!isUserMenuOpen); };
    const toggleSettingsMenu = (e) => { e.stopPropagation(); setIsUserMenuOpen(false); setIsNotifOpen(false); setIsSettingsOpen(!isSettingsOpen); };
    const toggleNotifMenu = (e) => { e.stopPropagation(); setIsUserMenuOpen(false); setIsSettingsOpen(false); setIsNotifOpen(!isNotifOpen); };

    const handleLogout = () => { logout(); navigate('/login'); };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => { const newErr = { ...prev }; delete newErr[name]; return newErr; });
    };

    // Auto-calculate DTI interval when timeOfDecision and timeOfIncision change
    useEffect(() => {
        if (formData.timeOfDecision && formData.timeOfIncision && (formData.q31 === 'Emergency C-Section' || formData.q31 === 'Elective C-Section')) {
            const [decH, decM] = formData.timeOfDecision.split(':').map(Number);
            const [incH, incM] = formData.timeOfIncision.split(':').map(Number);

            // Assume both times are usually on the same day unless incision is smaller (crossed midnight)
            let decTime = decH * 60 + decM;
            let incTime = incH * 60 + incM;

            if (incTime < decTime) {
                incTime += 24 * 60; // Next day
            }

            const diffMinutes = incTime - decTime;
            const isTimely = diffMinutes <= 30 ? 'Yes' : 'No';

            setFormData(prev => ({
                ...prev,
                dti_interval: diffMinutes.toString(),
                is_timely: isTimely,
                ...(isTimely === 'Yes' ? { delay_reason: '' } : {}) // Clear delay reason if it becomes timely again
            }));
        } else if (formData.dti_interval !== '') {
            // Clear if times are removed
            setFormData(prev => ({
                ...prev,
                dti_interval: '',
                is_timely: '',
                delay_reason: ''
            }));
        }
    }, [formData.timeOfDecision, formData.timeOfIncision, formData.q31]);

    const validateStep = (step) => {
        const newErrors = {};
        const reqFields = [];

        if (step === 1) { // Registration & Admission (Q1-Q23)
            reqFields.push('q1', 'q2', 'q3', 'q4', 'q5', 'q7', 'q8', 'q9', 'q10', 'q11', 'q12', 'q13', 'q14', 'q15', 'q16', 'q19', 'q20', 'q21', 'q22', 'q23');
            if (formData.q11 === 'Preterm') reqFields.push('q17', 'q18');
        }
        else if (step === 2) { // Delivery & Complications (Q24-Q41)
            reqFields.push('q24');
            if (formData.q24 === 'Yes') {
                reqFields.push('q25', 'q27', 'q29');
                if (formData.q25 === 'Other') reqFields.push('q26');
                if (formData.q27 === 'Yes') reqFields.push('q28');
                if (formData.q29 && formData.q29 !== 'No') reqFields.push('q30');
            }

            reqFields.push('q31');
            if (formData.q31 === 'Elective C-Section' || formData.q31 === 'Emergency C-Section') {
                reqFields.push('q32', 'timeOfDecision', 'timeOfIncision');
                if (formData.q32 === 'Other') reqFields.push('q33');
                if (formData.timeOfDecision && formData.timeOfIncision) {
                    if (formData.is_timely === 'No') reqFields.push('delay_reason');
                }
            }
            else if (formData.q31 === 'Vaginal' || formData.q31 === 'Assisted Vaginal') {
                reqFields.push('q39', 'q41', 'av_oxytocin', 'av_placenta', 'av_dcc');
                if (formData.q39 === 'Yes') reqFields.push('q40');
            }
        }
        else if (step === 3) { // Newborn Care (Q44-Q55)
            reqFields.push('q44');
            if (formData.q44 === 'Yes') {
                reqFields.push('q45', 'q46');
                if (formData.q31 === 'Vaginal' || formData.q31 === 'Assisted Vaginal') reqFields.push('q47');
                reqFields.push('q48');
                if (formData.q48 === 'No') reqFields.push('q49', 'q50');
                reqFields.push('q51', 'q52', 'q53');
                if (formData.q53 !== 'Birth weight not taken') {
                    reqFields.push('q54', 'q55');
                }
            }
        }
        else if (step === 4) { // Postnatal & Outcome (Q56-Q64)
            if (['2499 gm – 1800 gm', '>1500 gm but <1800 gm', '>1000 gm but <1500 gm', '<1000 gm'].includes(formData.q54)) {
                reqFields.push('q56');
                if (formData.q56 === 'Yes') reqFields.push('q58', 'q59', 'q60', 'q62');
            }
            reqFields.push('q61', 'q63');
        }

        reqFields.forEach(f => { if (!formData[f] || formData[f].trim() === '') newErrors[f] = true; });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return newErrors;
        }
        return {};
    }

    const nextStep = () => {
        const stepErrors = validateStep(currentStep);
        if (Object.keys(stepErrors).length === 0) {
            setCurrentStep(prev => Math.min(prev + 1, 4));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    const prevStep = () => { setCurrentStep(prev => Math.max(prev - 1, 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        const stepErrors = validateStep(4);
        if (Object.keys(stepErrors).length === 0) {
            setIsSubmitting(true);
            try {
                const mappedPayload = {
                    observation_date: formData.q1,
                    case_id: formData.q2,
                    patient_name: formData.q3,
                    facility: formData.q4,
                    shift: formData.q5,
                    admission_date: formData.q7,
                    admission_time: formData.q8,
                    gravida: formData.q9,
                    parity: formData.q10,
                    gestational_age: formData.q11,
                    triage_under_30_min: formData.q12,
                    risk_status: formData.q13,
                    fhr_monitored: formData.q14,
                    abnormal_fhr_action: formData.q15,
                    partograph_filled: formData.q16,
                    ancs_given: formData.q17,
                    dose_count: formData.q18,
                    labour_augmentation: formData.q19,
                    indication_documented: formData.q20,
                    oxytocin_monitoring: formData.q21,
                    augmentation_appropriate: formData.q22,
                    fundal_pressure_applied: formData.q23,
                    complications_developed: formData.q24,
                    complication_type: formData.q25,
                    complication_description: formData.q26,
                    complication_managed: formData.q27,
                    senior_support_sought: formData.q28,
                    referral_status: formData.q29,
                    referral_delay: formData.q30,
                    delivery_mode: formData.q31,
                    csection_indication: formData.q32,
                    csection_indication_other: formData.q33,
                    timeOfDecision: formData.timeOfDecision,
                    timeOfIncision: formData.timeOfIncision,
                    dti_interval: formData.dti_interval,
                    is_timely: formData.is_timely,
                    delay_reason: formData.delay_reason,
                    episiotomy_given: formData.q39,
                    episiotomy_appropriate: formData.q40,
                    amtsl_followed: formData.q41,
                    baby_stable: formData.q44,
                    baby_dried: formData.q45,
                    immediate_skin_to_skin: formData.q46,
                    delayed_cord_clamping: formData.q47 || formData.av_dcc,
                    baby_cried: formData.q48,
                    stimulation_if_no_cry: formData.q49,
                    bag_mask_if_needed: formData.q50,
                    early_breastfeeding: formData.q51,
                    clean_practices: formData.q52,
                    birth_weight_taken: formData.q53,
                    birth_weight_gms: formData.q54,
                    vit_k_given: formData.q55,
                    kmc_required: formData.q56,
                    mother_counselled_kmc: formData.q57,
                    kmc_given: formData.q58,
                    kmc_duration_lr: formData.q59,
                    kmc_provider: formData.q60,
                    ref_nicu_sncu: formData.q61,
                    outcome_of_labour: formData.q63,
                    any_other_comments: formData.q64,
                    // Additional derivations for backend DB schema
                    initiation_of_breastfeeding: formData.q51,
                    baby_cried_immediately: formData.q48,
                    newborn_resuscitated: (formData.q49 === 'Yes' || formData.q50 === 'Yes') ? 'Yes' : 'No',
                    outcome_of_baby: formData.q44
                };

                const token = localStorage.getItem('token');

                const isEdit = !!formData.db_id;
                const url = isEdit
                    ? `http://localhost:5000/api/labour/update-patient/${formData.db_id}`
                    : 'http://localhost:5000/api/labour/add-patient';
                const method = isEdit ? 'PUT' : 'POST';

                const res = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(mappedPayload)
                });

                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.message || 'Failed to submit data');
                }

                setIsSubmitting(false);
                setIsSuccess(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } catch (error) {
                console.error('Submission error:', error);
                setIsSubmitting(false);
                alert(`Error: ${error.message} `);
            }
        }
    };

    const renderPilGroup = (name, options) => (
        <div className="ap-pill-group">
            {options.map((opt, i) => {
                const id = `${name} -${i + 1} `;
                return (
                    <React.Fragment key={id}>
                        <input className={`ap-pill ${opt.variant ? `ap-pill-${opt.variant}` : ''}`} type="radio" name={name} id={id} value={opt.value} checked={formData[name] === opt.value} onChange={handleChange} />
                        <label htmlFor={id}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                            {opt.label}
                        </label>
                    </React.Fragment>
                );
            })}
        </div>
    );

    const renderStepIcon = (num) => {
        if (num < currentStep) return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>;
        return num;
    };

    if (isSuccess) {
        return (

            <div className="dashboard-layout">
                <div className="dash-bg-wrap"></div>
                <div className="dash-bg-grid"></div>
                <div className="dash-orb dash-orb-1"></div>
                <div className="dash-orb dash-orb-2"></div>
                <div className="dash-stars"></div>

                {(isUserMenuOpen || isSettingsOpen || isNotifOpen || isProfileOpen || isPasswordOpen) && <div className="dash-overlay active" onClick={() => { setIsUserMenuOpen(false); setIsSettingsOpen(false); setIsNotifOpen(false); setIsProfileOpen(false); setIsPasswordOpen(false); }}></div>}

                <div className="dash-page">
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
                        pageTitle="Add Patient"
                    />

                    <div className="ap-wrapper" style={{ minHeight: 'auto', background: 'transparent', flex: 1 }}>
                        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 28px', marginBottom: '16px' }}>
                                <button className="ap-btn-cancel" onClick={() => navigate('/dashboard')}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                    Cancel
                                </button>
                            </div>

                            <div className="ap-main" style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '60px' }}>
                                <div className="ap-success-screen show" style={{ textAlign: 'center', margin: '0 auto' }}>
                                    <div className="ap-success-icon" style={{ margin: '0 auto 20px', width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--teal), var(--tb))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                    </div>
                                    <h2 className="ap-sec-title">Patient Record Saved</h2>
                                    <p className="ap-sec-sub" style={{ marginBottom: '20px' }}>The labour case has been successfully registered in the system. All data points have been captured and stored.</p>
                                    <div className="ap-calc-display" style={{ justifyContent: 'center', marginBottom: '20px' }}>Case ID: {formData.q2}</div>
                                    <button className="ap-btn-next" style={{ margin: '0 auto' }} onClick={() => navigate('/dashboard')}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>&nbsp; Return to Dashboard
                                    </button>
                                </div>
                            </div>
                        </div>

                        <DashFooter />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="dashboard-layout">
                <div className="dash-bg-wrap"></div>
                <div className="dash-bg-grid"></div>
                <div className="dash-orb dash-orb-1"></div>
                <div className="dash-orb dash-orb-2"></div>
                <div className="dash-stars"></div>

                {(isUserMenuOpen || isSettingsOpen || isNotifOpen || isProfileOpen || isPasswordOpen) && <div className="dash-overlay active" onClick={() => { setIsUserMenuOpen(false); setIsSettingsOpen(false); setIsNotifOpen(false); setIsProfileOpen(false); setIsPasswordOpen(false); }}></div>}

                <div className="dash-page">
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
                        pageTitle="Add Patient"
                    />

                    <div className="ap-wizard-wrap" style={{ borderBottom: 'none', background: 'transparent' }}>
                        <div className="ap-wizard" style={{ justifyContent: 'center', padding: '24px 28px' }}>
                            {STEPS.map((step, index) => {
                                const isActive = currentStep === step.id;
                                const isCompleted = currentStep > step.id;

                                return (
                                    <React.Fragment key={step.id}>
                                        <div className={`ap-step-item ${isCompleted ? 'completed' : isActive ? 'active' : 'upcoming'}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div className="ap-st-circle" style={{
                                                width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                                background: isCompleted ? '#e0f2fe' : isActive ? 'var(--teal)' : 'var(--bg2)',
                                                border: isCompleted ? '1px solid #7dd3fc' : isActive ? 'none' : '1px solid var(--bd2)',
                                                color: isCompleted ? '#0284c7' : isActive ? '#fff' : 'var(--tx3)',
                                                fontSize: '12px', fontWeight: '600', transition: 'all 0.3s'
                                            }}>
                                                {isCompleted ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg> : step.id}
                                            </div>
                                            <div className="ap-st-label" style={{
                                                fontSize: '0.78rem',
                                                fontWeight: isActive ? '600' : '500',
                                                color: isActive ? 'var(--tx1)' : isCompleted ? 'var(--tx2)' : 'var(--tx3)'
                                            }}>{step.label}</div>
                                        </div>
                                        {index < STEPS.length - 1 && (
                                            <div className="ap-st-line" style={{
                                                width: '40px', height: '2px', margin: '0 12px', flexShrink: 0, borderRadius: '4px',
                                                background: currentStep > index + 1 ? 'var(--teal)' : 'var(--bd2)'
                                            }}></div>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>

                    <div className="ap-wrapper">
                        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '10px 28px 0', display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="ap-btn-cancel" onClick={() => navigate('/dashboard')} style={{ background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                Cancel
                            </button>
                        </div>
                        <main className="ap-main" style={{ paddingTop: '16px' }}>

                            {/* STEP 1 */}
                            <div className={`ap-step-panel ${currentStep === 1 ? 'active' : ''}`}>
                                <div className="ap-sec-head">
                                    <div className="ap-sec-icon"><svg viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="2" /><path d="M9 12h6M9 16h4" /></svg></div>
                                    <div>
                                        <div className="ap-sec-title">Observation Details</div>
                                        <div className="ap-sec-sub">Basic case identification and facility information</div>
                                    </div>
                                </div>
                                <div className="ap-card">
                                    <div className="ap-card-title">Case Identification</div>
                                    <div className="ap-grid-2">
                                        <div className="ap-field">
                                            <label className="ap-field-label"><span className="ap-q-badge">Q1</span> Observation Date</label>
                                            <input type="date" name="q1" value={formData.q1} readOnly style={{ backgroundColor: 'var(--bg2)', cursor: 'not-allowed', color: 'var(--tx2)' }} className="ap-input" />
                                        </div>
                                        <div className="ap-field">
                                            <label className="ap-field-label"><span className="ap-q-badge">Q2</span> Case ID <span className="ap-req">*</span></label>
                                            <input type="text" name="q2" value={formData.q2} onChange={handleChange} placeholder="Enter Case ID manually" className={`ap-input ${errors.q2 ? 'err' : ''}`} />
                                        </div>
                                        <div className="ap-field ap-col-span-2">
                                            <label className="ap-field-label"><span className="ap-q-badge">Q3</span> Name of Patient <span className="ap-req">*</span></label>
                                            <input type="text" name="q3" value={formData.q3} onChange={handleChange} placeholder="Full name of patient" className={errors.q3 ? 'err' : ''} />
                                        </div>
                                    </div>
                                </div>
                                <div className="ap-card">
                                    <div className="ap-card-title">Facility &amp; Shift</div>
                                    <div className="ap-grid-2">
                                        <div className="ap-field">
                                            <label className="ap-field-label"><span className="ap-q-badge">Q4</span> Facility <span className="ap-req">*</span></label>
                                            <select name="q4" value={formData.q4} onChange={handleChange} className={errors.q4 ? 'err' : ''}>
                                                <option value="">— Select Facility —</option>
                                                <option value="DWH">DWH</option><option value="PPP">PPP</option>
                                                <option value="CHC Cholapur">CHC Cholapur</option><option value="CHC Chiraigaon">CHC Chiraigaon</option>
                                                <option value="CHC Pindra">CHC Pindra</option><option value="CHC Sarnath">CHC Sarnath</option>
                                            </select>
                                        </div>
                                        <div className="ap-field">
                                            <label className="ap-field-label"><span className="ap-q-badge">Q5</span> Shift <span className="ap-req">*</span></label>
                                            {renderPilGroup('q5', [{ value: 'Morning', label: 'Morning', variant: 'ok' }, { value: 'Evening', label: 'Evening', variant: 'ok' }, { value: 'Night', label: 'Night', variant: 'ok' }])}
                                            {errors.q5 && <div className="ap-req">Required</div>}
                                        </div>
                                    </div>
                                </div>
                                <div className="ap-card">
                                    <div className="ap-card-title">Admission Information</div>
                                    <div className="ap-grid-2">
                                        <div className="ap-field">
                                            <label className="ap-field-label"><span className="ap-q-badge">Q7</span> Date of Admission <span className="ap-req">*</span></label>
                                            <input type="date" name="q7" value={formData.q7} onChange={handleChange} max={new Date().toISOString().split('T')[0]} className={errors.q7 ? 'err' : ''} />
                                        </div>
                                        <div className="ap-field">
                                            <label className="ap-field-label"><span className="ap-q-badge">Q8</span> Time of Admission <span className="ap-req">*</span></label>
                                            <input type="time" name="q8" value={formData.q8} onChange={handleChange} className={errors.q8 ? 'err' : ''} />
                                        </div>
                                    </div>
                                </div>

                                <div className="ap-sec-head" style={{ marginTop: '24px' }}>
                                    <div className="ap-sec-icon"><svg viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg></div>
                                    <div>
                                        <div className="ap-sec-title">Clinical Profile</div>
                                        <div className="ap-sec-sub">Obstetric history, risk assessment and monitoring protocols</div>
                                    </div>
                                </div>
                                <div className="ap-card">
                                    <div className="ap-card-title">Obstetric History</div>
                                    <div className="ap-grid-2">
                                        <div className="ap-field">
                                            <label className="ap-field-label"><span className="ap-q-badge">Q9</span> Gravida <span className="ap-req">*</span></label>
                                            {renderPilGroup('q9', [{ value: '1', label: '1' }, { value: '>1', label: '>1' }, { value: 'Unknown', label: 'Unknown', variant: 'warn' }])}
                                            {errors.q9 && <div className="ap-req">Required</div>}
                                        </div>
                                        <div className="ap-field">
                                            <label className="ap-field-label"><span className="ap-q-badge">Q10</span> Parity <span className="ap-req">*</span></label>
                                            {renderPilGroup('q10', [{ value: 'Primi', label: 'Primi' }, { value: 'Multipara', label: 'Multipara' }])}
                                            {errors.q10 && <div className="ap-req">Required</div>}
                                        </div>
                                        <div className="ap-field">
                                            <label className="ap-field-label"><span className="ap-q-badge">Q11</span> Gestational Age <span className="ap-req">*</span></label>
                                            {renderPilGroup('q11', [{ value: 'Term', label: 'Term', variant: 'ok' }, { value: 'Preterm', label: 'Preterm', variant: 'warn' }])}
                                            {errors.q11 && <div className="ap-req">Required</div>}
                                        </div>
                                        <div className="ap-field">
                                            <label className="ap-field-label"><span className="ap-q-badge">Q12</span> Triage within 30 min <span className="ap-req">*</span></label>
                                            {renderPilGroup('q12', [{ value: 'Yes', label: 'Yes', variant: 'ok' }, { value: 'No', label: 'No', variant: 'danger' }])}
                                            {errors.q12 && <div className="ap-req">Required</div>}
                                        </div>
                                    </div>
                                </div>
                                <div className="ap-card">
                                    <div className="ap-card-title">Risk &amp; Monitoring</div>
                                    <div className="ap-grid-2">
                                        <div className="ap-field">
                                            <label className="ap-field-label"><span className="ap-q-badge">Q13</span> Risk Status <span className="ap-req">*</span></label>
                                            {renderPilGroup('q13', [{ value: 'High Risk', label: 'High Risk', variant: 'danger' }, { value: 'Moderate Risk', label: 'Moderate Risk', variant: 'warn' }, { value: 'Low Risk', label: 'Low Risk', variant: 'ok' }])}
                                            {errors.q13 && <div className="ap-req">Required</div>}
                                        </div>
                                        <div className="ap-field">
                                            <label className="ap-field-label"><span className="ap-q-badge">Q14</span> FHR Monitored <span className="ap-req">*</span></label>
                                            {renderPilGroup('q14', [{ value: 'Yes', label: 'Yes', variant: 'ok' }, { value: 'No', label: 'No', variant: 'danger' }, { value: 'NA', label: 'N/A' }])}
                                            {errors.q14 && <div className="ap-req">Required</div>}
                                        </div>
                                        <div className="ap-field">
                                            <label className="ap-field-label"><span className="ap-q-badge">Q15</span> Abnormal FHR Action <span className="ap-req">*</span></label>
                                            {renderPilGroup('q15', [{ value: 'Yes', label: 'Yes', variant: 'ok' }, { value: 'No', label: 'No', variant: 'danger' }, { value: 'NA', label: 'N/A' }])}
                                            {errors.q15 && <div className="ap-req">Required</div>}
                                        </div>
                                        <div className="ap-field">
                                            <label className="ap-field-label"><span className="ap-q-badge">Q16</span> Partograph Filled <span className="ap-req">*</span></label>
                                            {renderPilGroup('q16', [{ value: 'Yes', label: 'Yes', variant: 'ok' }, { value: 'No', label: 'No', variant: 'danger' }, { value: 'NA', label: 'N/A' }])}
                                            {errors.q16 && <div className="ap-req">Required</div>}
                                        </div>
                                    </div>
                                    {formData.q11 === 'Preterm' && (
                                        <>
                                            <div className="ap-divider"></div>
                                            <div className="ap-grid-2">
                                                <div className="ap-field">
                                                    <label className="ap-field-label"><span className="ap-q-badge">Q17</span> ANCS Given <span className="ap-req">*</span></label>
                                                    {renderPilGroup('q17', [{ value: 'Yes', label: 'Yes', variant: 'ok' }, { value: 'No', label: 'No', variant: 'danger' }, { value: 'NA', label: 'N/A' }])}
                                                    {errors.q17 && <div className="ap-req">Required</div>}
                                                </div>
                                                <div className="ap-field">
                                                    <label className="ap-field-label"><span className="ap-q-badge">Q18</span> Number of Doses <span className="ap-req">*</span></label>
                                                    {renderPilGroup('q18', [{ value: '1', label: '1' }, { value: '2', label: '2' }, { value: '3', label: '3' }, { value: 'NA', label: 'N/A' }])}
                                                    {errors.q18 && <div className="ap-req">Required</div>}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="ap-card">
                                    <div className="ap-card-title">Labour Augmentation</div>
                                    <div className="ap-grid-2">
                                        <div className="ap-field">
                                            <label className="ap-field-label"><span className="ap-q-badge">Q19</span> Labour Augmentation <span className="ap-req">*</span></label>
                                            {renderPilGroup('q19', [{ value: 'Yes', label: 'Yes', variant: 'ok' }, { value: 'No', label: 'No' }])}
                                            {errors.q19 && <div className="ap-req">Required</div>}
                                        </div>
                                        <div className="ap-field">
                                            <label className="ap-field-label"><span className="ap-q-badge">Q20</span> Indication Documented <span className="ap-req">*</span></label>
                                            {renderPilGroup('q20', [{ value: 'Yes', label: 'Yes', variant: 'ok' }, { value: 'No', label: 'No', variant: 'danger' }])}
                                            {errors.q20 && <div className="ap-req">Required</div>}
                                        </div>
                                        <div className="ap-field">
                                            <label className="ap-field-label"><span className="ap-q-badge">Q21</span> Oxytocin Monitoring <span className="ap-req">*</span></label>
                                            {renderPilGroup('q21', [{ value: 'Yes', label: 'Yes', variant: 'ok' }, { value: 'No', label: 'No', variant: 'danger' }, { value: 'NA', label: 'N/A' }])}
                                            {errors.q21 && <div className="ap-req">Required</div>}
                                        </div>
                                        <div className="ap-field">
                                            <label className="ap-field-label"><span className="ap-q-badge">Q22</span> Augmentation Appropriate <span className="ap-req">*</span></label>
                                            {renderPilGroup('q22', [{ value: 'Yes', label: 'Yes', variant: 'ok' }, { value: 'No', label: 'No', variant: 'danger' }, { value: 'NA', label: 'N/A' }])}
                                            {errors.q22 && <div className="ap-req">Required</div>}
                                        </div>
                                        <div className="ap-field ap-col-span-2">
                                            <label className="ap-field-label"><span className="ap-q-badge">Q23</span> Fundal Pressure Applied <span className="ap-req">*</span></label>
                                            {renderPilGroup('q23', [{ value: 'Yes', label: 'Yes', variant: 'danger' }, { value: 'No', label: 'No', variant: 'ok' }, { value: 'NA', label: 'N/A' }])}
                                            {errors.q23 && <div className="ap-req">Required</div>}
                                        </div>
                                    </div>
                                </div>
                                <div className="ap-form-nav">
                                    <button className="ap-btn-prev" onClick={prevStep}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>Back</button>
                                    <span className="ap-step-counter">Step 1 of 4</span>
                                    <button className="ap-btn-next" onClick={nextStep}>Next: Delivery &amp; Complications <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg></button>
                                </div>
                            </div>

                            {/* STEP 2 */}
                            <div className={`ap-step-panel ${currentStep === 2 ? 'active' : ''}`}>
                                <div className="ap-sec-head">
                                    <div className="ap-sec-icon"><svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg></div>
                                    <div>
                                        <div className="ap-sec-title">Complications &amp; Referral</div>
                                        <div className="ap-sec-sub">Complication management and referral tracking</div>
                                    </div>
                                </div>
                                <div className="ap-card">
                                    <div className="ap-card-title">Complication Assessment</div>
                                    <div className="ap-grid-2">
                                        <div className="ap-field ap-col-span-2">
                                            <label className="ap-field-label"><span className="ap-q-badge">Q24</span> Complications Developed <span className="ap-req">*</span></label>
                                            {renderPilGroup('q24', [{ value: 'Yes', label: 'Yes', variant: 'danger' }, { value: 'No', label: 'No', variant: 'ok' }])}
                                            {errors.q24 && <div className="ap-req">Required</div>}
                                        </div>
                                        {formData.q24 === 'Yes' && (
                                            <div className="ap-field ap-col-span-2">
                                                <label className="ap-field-label"><span className="ap-q-badge">Q25</span> Type of Complication <span className="ap-req">*</span></label>
                                                <select name="q25" value={formData.q25} onChange={handleChange} className={errors.q25 ? 'err' : ''}>
                                                    <option value="">— Select type —</option>
                                                    <option>Fetal Distress</option><option>Prolonged labour</option>
                                                    <option>Obstructed labour</option><option>Severe PIH/Eclampsia</option>
                                                    <option>PPH</option><option>Cord Prolapse</option>
                                                    <option>Meconium</option><option>Other</option>
                                                </select>
                                                {formData.q25 === 'Other' && (
                                                    <div style={{ marginTop: '12px' }}>
                                                        <input type="text" name="q26" value={formData.q26} onChange={handleChange} placeholder="Describe complication…" className={errors.q26 ? 'err' : ''} />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="ap-card">
                                    <div className="ap-card-title">Complication Management</div>
                                    <div className="ap-grid-2">
                                        <div className="ap-field">
                                            <label className="ap-field-label"><span className="ap-q-badge">Q27</span> Complication Managed <span className="ap-req">*</span></label>
                                            {renderPilGroup('q27', [{ value: 'Yes', label: 'Yes', variant: 'ok' }, { value: 'No', label: 'No', variant: 'danger' }, { value: 'NA', label: 'N/A' }])}
                                            {errors.q27 && <div className="ap-req">Required</div>}
                                        </div>
                                        {formData.q27 === 'Yes' && (
                                            <div className="ap-field">
                                                <label className="ap-field-label"><span className="ap-q-badge">Q28</span> Senior Support Sought <span className="ap-req">*</span></label>
                                                {renderPilGroup('q28', [{ value: 'Yes', label: 'Yes', variant: 'ok' }, { value: 'No', label: 'No' }])}
                                                {errors.q28 && <div className="ap-req">Required</div>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {formData.q24 === 'Yes' && (
                                    <div className="ap-card">
                                        <div className="ap-card-title">Referral Details</div>
                                        <div className="ap-grid-2">
                                            <div className="ap-field">
                                                <label className="ap-field-label"><span className="ap-q-badge">Q29</span> Referral <span className="ap-req">*</span></label>
                                                <select name="q29" value={formData.q29} onChange={handleChange} className={errors.q29 ? 'err' : ''}>
                                                    <option value="">— Select —</option>
                                                    <option value="No">No</option>
                                                    <option value="Yes - within facility">Yes — within facility</option>
                                                    <option value="Yes - outside facility">Yes — outside facility</option>
                                                </select>
                                            </div>
                                            {formData.q29 && formData.q29 !== 'No' && (
                                                <div className="ap-field">
                                                    <label className="ap-field-label"><span className="ap-q-badge">Q30</span> Delay in Referral <span className="ap-req">*</span></label>
                                                    <select name="q30" value={formData.q30} onChange={handleChange} className={errors.q30 ? 'err' : ''}>
                                                        <option value="">— Select —</option><option value="No">No</option>
                                                        <option value="Type 1 (Family delay)">Type 1 — Family delay</option>
                                                        <option value="Type 2 (Provider delay)">Type 2 — Provider delay</option>
                                                        <option value="Type 3 (System delay)">Type 3 — System delay</option>
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="ap-card" style={{ marginTop: '24px' }}>
                                    <div className="ap-card-title">Delivery Details</div>
                                    <div className="ap-field">
                                        <label className="ap-field-label"><span className="ap-q-badge">Q31</span> Mode of Delivery <span className="ap-req">*</span></label>
                                        {renderPilGroup('q31', [
                                            { value: 'Vaginal', label: 'Vaginal', variant: 'ok' }, { value: 'Assisted Vaginal', label: 'Assisted Vaginal' },
                                            { value: 'Emergency C-Section', label: 'Emergency C-Section', variant: 'warn' },
                                            { value: 'Elective C-Section', label: 'Elective C-Section' }, { value: 'Referred out', label: 'Referred out', variant: 'danger' }
                                        ])}
                                        {errors.q31 && <div className="ap-req">Required</div>}
                                    </div>
                                    {(formData.q31 === 'Emergency C-Section' || formData.q31 === 'Elective C-Section') && (
                                        <>
                                            <div className="ap-divider"></div>
                                            <div className="ap-grid-2">
                                                <div className="ap-field ap-col-span-2">
                                                    <label className="ap-field-label"><span className="ap-q-badge">Q32</span> Indication for C-Section <span className="ap-req">*</span></label>
                                                    <select name="q32" value={formData.q32} onChange={handleChange} className={errors.q32 ? 'err' : ''}>
                                                        <option value="">— Select indication —</option>
                                                        <option>Fetal Distress</option><option>Failed Progress of Labour</option>
                                                        <option>Obstructed Labour</option><option>Severe PIH/Eclampsia</option>
                                                        <option>Previous C-Section</option><option>APH</option><option>Cord Prolapse</option><option>Malpresentation</option><option>Other</option>
                                                    </select>
                                                    {formData.q32 === 'Other' && (
                                                        <input type="text" name="q33" value={formData.q33} onChange={handleChange} placeholder="Describe indication…" style={{ marginTop: '12px' }} className={errors.q33 ? 'err' : ''} />
                                                    )}
                                                </div>
                                            </div>
                                            <div className="ap-grid-2" style={{ marginTop: '16px' }}>
                                                <div className="ap-field">
                                                    <label className="ap-field-label"><span className="ap-q-badge">T1</span> Time of Decision <span className="ap-req">*</span></label>
                                                    <input type="time" name="timeOfDecision" value={formData.timeOfDecision} onChange={handleChange} className={errors.timeOfDecision ? 'err' : ''} />
                                                </div>
                                                <div className="ap-field">
                                                    <label className="ap-field-label"><span className="ap-q-badge">T2</span> Time of Incision <span className="ap-req">*</span></label>
                                                    <input type="time" name="timeOfIncision" value={formData.timeOfIncision} onChange={handleChange} className={errors.timeOfIncision ? 'err' : ''} />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    {(formData.timeOfDecision && formData.timeOfIncision && (formData.q31 === 'Emergency C-Section' || formData.q31 === 'Elective C-Section')) && (
                                        <div className="ap-card" style={{ marginTop: '16px', backgroundColor: 'var(--bg2)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                            <div className="ap-grid-2">
                                                <div className="ap-field">
                                                    <label className="ap-field-label">Decision to Incision Interval (in minutes)</label>
                                                    <div className="ap-field-help" style={{ fontSize: '0.8rem', color: 'var(--tx3)', marginTop: '-8px', marginBottom: '8px' }}>
                                                        Formula: Time of Incision – Time of Decision for C-Section
                                                    </div>
                                                    <input type="text" value={formData.dti_interval ? `${formData.dti_interval} minutes` : ''} readOnly className={errors.dti_interval ? 'err' : ''} style={{ backgroundColor: 'var(--bg1)', color: 'var(--tx2)', cursor: 'not-allowed' }} />
                                                </div>
                                                <div className="ap-field">
                                                    <label className="ap-field-label">Is Timely Conduction of C-Section Took Place?</label>
                                                    <div style={{ pointerEvents: 'none', opacity: 0.85 }}>
                                                        {renderPilGroup('is_timely', [{ value: 'Yes', label: 'Yes', variant: 'ok' }, { value: 'No', label: 'No', variant: 'danger' }])}
                                                    </div>
                                                </div>

                                                {formData.is_timely === 'No' && (
                                                    <div className="ap-field ap-col-span-2" style={{ marginTop: '12px' }}>
                                                        <label className="ap-field-label">Primary reason for delay in C-Section <span className="ap-req">*</span></label>
                                                        <select name="delay_reason" value={formData.delay_reason} onChange={handleChange} className={errors.delay_reason ? 'err' : ''}>
                                                            <option value="">— Select Reason —</option>
                                                            <option value="OT Not Available">OT Not Available</option>
                                                            <option value="Anaesthesia Delay">Anaesthesia Delay</option>
                                                            <option value="Consent Delay">Consent Delay</option>
                                                            <option value="Blood Arrangement Delay">Blood Arrangement Delay</option>
                                                            <option value="Senior Approval Delay">Senior Approval Delay</option>
                                                            <option value="Staff Shortage">Staff Shortage</option>
                                                            <option value="Equipment Issue">Equipment Issue</option>
                                                            <option value="Referral Delay">Referral Delay</option>
                                                            <option value="Documentation Delay">Documentation Delay</option>
                                                            <option value="Unknown">Unknown</option>
                                                        </select>
                                                        {errors.delay_reason && <div className="ap-req">Required</div>}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {(formData.q31 === 'Vaginal' || formData.q31 === 'Assisted Vaginal') && (
                                        <>
                                            <div className="ap-divider"></div>
                                            <div className="ap-grid-2">
                                                {/* Common Vaginal Questions */}
                                                <div className="ap-field ap-col-span-2">
                                                    <div className="ap-grid-2">
                                                        <div className="ap-field">
                                                            <label className="ap-field-label"><span className="ap-q-badge">Q39</span> Episiotomy Given <span className="ap-req">*</span></label>
                                                            {renderPilGroup('q39', [{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }, { value: 'NA', label: 'N/A' }])}
                                                            {errors.q39 && <div className="ap-req">Required</div>}
                                                        </div>
                                                        {formData.q39 === 'Yes' && (
                                                            <div className="ap-field">
                                                                <label className="ap-field-label"><span className="ap-q-badge">Q40</span> Episiotomy Appropriate <span className="ap-req">*</span></label>
                                                                {renderPilGroup('q40', [{ value: 'Yes', label: 'Yes', variant: 'ok' }, { value: 'No', label: 'No', variant: 'danger' }, { value: 'NA', label: 'N/A' }])}
                                                                {errors.q40 && <div className="ap-req">Required</div>}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="ap-field">
                                                    <label className="ap-field-label"><span className="ap-q-badge">Q41</span> AMTSL Followed <span className="ap-req">*</span></label>
                                                    {renderPilGroup('q41', [{ value: 'Yes', label: 'Yes', variant: 'ok' }, { value: 'No', label: 'No', variant: 'danger' }, { value: 'NA', label: 'N/A' }])}
                                                    {errors.q41 && <div className="ap-req">Required</div>}
                                                </div>

                                                {/* Specifically for Assisted and Normal Vaginal */}
                                                {(formData.q31 === 'Assisted Vaginal' || formData.q31 === 'Vaginal') && (
                                                    <>
                                                        <div className="ap-field">
                                                            <label className="ap-field-label"><span className="ap-q-badge">AV1</span> Oxytocin within 1 minute <span className="ap-req">*</span></label>
                                                            {renderPilGroup('av_oxytocin', [{ value: 'Yes', label: 'Yes', variant: 'ok' }, { value: 'No', label: 'No', variant: 'danger' }, { value: 'NA', label: 'N/A' }])}
                                                            {errors.av_oxytocin && <div className="ap-req">Required</div>}
                                                        </div>
                                                        <div className="ap-field">
                                                            <label className="ap-field-label"><span className="ap-q-badge">AV2</span> Placenta delivered without manipulation <span className="ap-req">*</span></label>
                                                            {renderPilGroup('av_placenta', [{ value: 'Yes', label: 'Yes', variant: 'ok' }, { value: 'No', label: 'No', variant: 'danger' }, { value: 'NA', label: 'N/A' }])}
                                                            {errors.av_placenta && <div className="ap-req">Required</div>}
                                                        </div>
                                                        <div className="ap-field">
                                                            <label className="ap-field-label"><span className="ap-q-badge">AV3</span> Delayed cord clamping <span className="ap-req">*</span></label>
                                                            {renderPilGroup('av_dcc', [{ value: 'Yes', label: 'Yes', variant: 'ok' }, { value: 'No', label: 'No', variant: 'danger' }, { value: 'NA', label: 'N/A' }])}
                                                            {errors.av_dcc && <div className="ap-req">Required</div>}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="ap-form-nav">
                                    <button className="ap-btn-prev" onClick={prevStep}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>Back</button>
                                    <span className="ap-step-counter">Step 2 of 4</span>
                                    <button className="ap-btn-next" onClick={nextStep}>Next: Newborn Care <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg></button>
                                </div>
                            </div>

                            {/* STEP 3 */}
                            <div className={`ap-step-panel ${currentStep === 3 ? 'active' : ''}`}>
                                <div className="ap-sec-head">
                                    <div className="ap-sec-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg></div>
                                    <div>
                                        <div className="ap-sec-title">Newborn Care</div>
                                        <div className="ap-sec-sub">Resuscitation and immediate newborn care</div>
                                    </div>
                                </div>
                                <div className="ap-card">
                                    <div className="ap-grid-2">
                                        <div className="ap-field ap-col-span-2">
                                            <label className="ap-field-label"><span className="ap-q-badge">Q44</span> Baby Stable <span className="ap-req">*</span></label>
                                            {renderPilGroup('q44', [{ value: 'Yes', label: 'Yes', variant: 'ok' }, { value: 'No', label: 'No', variant: 'warn' }, { value: 'Still birth Baby died', label: 'Still birth / Baby died', variant: 'danger' }])}
                                            {errors.q44 && <div className="ap-req">Required</div>}
                                        </div>

                                        {formData.q44 === 'Yes' && (
                                            <>
                                                <div className="ap-field">
                                                    <label className="ap-field-label"><span className="ap-q-badge">Q45</span> Baby dried <span className="ap-req">*</span></label>
                                                    {renderPilGroup('q45', [{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }, { value: 'NA', label: 'N/A' }])}
                                                    {errors.q45 && <div className="ap-req">Required</div>}
                                                </div>
                                                <div className="ap-field">
                                                    <label className="ap-field-label"><span className="ap-q-badge">Q46</span> Immediate Skin-to-skin <span className="ap-req">*</span></label>
                                                    {renderPilGroup('q46', [{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }, { value: 'NA', label: 'N/A' }])}
                                                    {errors.q46 && <div className="ap-req">Required</div>}
                                                </div>
                                            </>
                                        )}

                                        {(formData.q31 === 'Vaginal' || formData.q31 === 'Assisted Vaginal') && (
                                            <div className="ap-field ap-col-span-2">
                                                <label className="ap-field-label"><span className="ap-q-badge">Q47</span> Delayed cord clamping <span className="ap-req">*</span></label>
                                                {renderPilGroup('q47', [{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }, { value: 'NA', label: 'N/A' }])}
                                                {errors.q47 && <div className="ap-req">Required</div>}
                                            </div>
                                        )}

                                        <div className="ap-field ap-col-span-2">
                                            <label className="ap-field-label"><span className="ap-q-badge">Q48</span> Baby cried <span className="ap-req">*</span></label>
                                            {renderPilGroup('q48', [{ value: 'Yes', label: 'Yes', variant: 'ok' }, { value: 'No', label: 'No', variant: 'danger' }, { value: 'NA', label: 'N/A' }])}
                                            {errors.q48 && <div className="ap-req">Required</div>}
                                        </div>

                                        {formData.q48 === 'No' && (
                                            <>
                                                <div className="ap-field">
                                                    <label className="ap-field-label"><span className="ap-q-badge">Q49</span> Stimulation if no cry <span className="ap-req">*</span></label>
                                                    {renderPilGroup('q49', [{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }, { value: 'NA', label: 'N/A' }])}
                                                    {errors.q49 && <div className="ap-req">Required</div>}
                                                </div>
                                                <div className="ap-field">
                                                    <label className="ap-field-label"><span className="ap-q-badge">Q50</span> Bag & mask if needed <span className="ap-req">*</span></label>
                                                    {renderPilGroup('q50', [{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }, { value: 'NA', label: 'N/A' }])}
                                                    {errors.q50 && <div className="ap-req">Required</div>}
                                                </div>
                                            </>
                                        )}

                                        <div className="ap-field">
                                            <label className="ap-field-label"><span className="ap-q-badge">Q51</span> Early breastfeeding (With in 1 hr) <span className="ap-req">*</span></label>
                                            {renderPilGroup('q51', [{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }, { value: 'NA', label: 'N/A' }])}
                                            {errors.q51 && <div className="ap-req">Required</div>}
                                        </div>

                                        <div className="ap-field">
                                            <label className="ap-field-label"><span className="ap-q-badge">Q52</span> Clean practices <span className="ap-req">*</span></label>
                                            {renderPilGroup('q52', [{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }, { value: 'NA', label: 'N/A' }])}
                                            {errors.q52 && <div className="ap-req">Required</div>}
                                        </div>
                                    </div>
                                </div>
                                <div className="ap-sec-head" style={{ marginTop: '24px' }}>
                                    <div className="ap-sec-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg></div>
                                    <div>
                                        <div className="ap-sec-title">Birth Weight & Vitamins</div>
                                        <div className="ap-sec-sub">Birth weight tracking and Vitamin K protocols</div>
                                    </div>
                                </div>
                                <div className="ap-card">
                                    <div className="ap-grid-2">
                                        <div className="ap-field ap-col-span-2">
                                            <label className="ap-field-label"><span className="ap-q-badge">Q53</span> Birth weight taken appropriately <span className="ap-req">*</span></label>
                                            {renderPilGroup('q53', [{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }, { value: 'Birth weight not taken', label: 'Birth weight not taken' }])}
                                            {errors.q53 && <div className="ap-req">Required</div>}
                                        </div>

                                        {formData.q53 !== 'Birth weight not taken' && (
                                            <div className="ap-field ap-col-span-2">
                                                <label className="ap-field-label"><span className="ap-q-badge">Q54</span> Birth weight (in gms) <span className="ap-req">*</span></label>
                                                <select name="q54" value={formData.q54} onChange={handleChange} className={errors.q54 ? 'err' : ''}>
                                                    <option value="">— Select range —</option>
                                                    <option value="≥2500 gm">≥2500 gm</option>
                                                    <option value="2499 gm – 1800 gm">2499 gm – 1800 gm</option>
                                                    <option value=">1500 gm but <1800 gm">{'>1500 gm but <1800 gm'}</option>
                                                    <option value=">1000 gm but <1500 gm">{'>1000 gm but <1500 gm'}</option>
                                                    <option value="<1000 gm">{'<1000 gm'}</option>
                                                </select>
                                                {errors.q54 && <div className="ap-req">Required</div>}
                                            </div>
                                        )}

                                        {(() => {
                                            let flagMsg = null;
                                            if (formData.q54) {
                                                const lessThan1000 = formData.q54 === '<1000 gm';

                                                if (lessThan1000 && formData.q55 !== '' && formData.q55 !== '0.5 mg') {
                                                    flagMsg = "⚠️ FLAG: For <1000 gm, recommended dose is 0.5 mg.";
                                                } else if (!lessThan1000 && formData.q55 !== '' && formData.q55 !== '1 mg') {
                                                    flagMsg = "⚠️ FLAG: For ≥1000 gm, recommended dose is 1 mg.";
                                                }
                                            }

                                            return (
                                                <div className="ap-field ap-col-span-2">
                                                    <label className="ap-field-label"><span className="ap-q-badge">Q55</span> Vit K (1mg/ 0.5 mg) <span className="ap-req">*</span></label>
                                                    {renderPilGroup('q55', [{ value: '1 mg', label: '1 mg' }, { value: '0.5 mg', label: '0.5 mg' }, { value: 'Not Given', label: 'Not Given', variant: 'danger' }])}
                                                    {errors.q55 && <div className="ap-req">Required</div>}
                                                    {flagMsg && <div style={{ color: 'red', fontSize: '0.85rem', marginTop: '6px', fontWeight: 'bold' }}>{flagMsg}</div>}
                                                </div>
                                            );
                                        })()}

                                    </div>
                                </div>
                                <div className="ap-form-nav">
                                    <button className="ap-btn-prev" onClick={prevStep}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>Back</button>
                                    <span className="ap-step-counter">Step 3 of 4</span>
                                    <button className="ap-btn-next" onClick={nextStep}>Next: Postnatal & Outcome <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg></button>
                                </div>
                            </div>


                            {/* STEP 4 */}
                            <div className={`ap-step-panel ${currentStep === 4 ? 'active' : ''}`}>
                                <div className="ap-sec-head">
                                    <div className="ap-sec-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg></div>
                                    <div>
                                        <div className="ap-sec-title">Postnatal &amp; Outcome</div>
                                        <div className="ap-sec-sub">KMC protocols, referral status, and overall outcome tracking</div>
                                    </div>
                                </div>
                                <div className="ap-card">
                                    <div className="ap-grid-2">
                                        {['2499 gm – 1800 gm', '>1500 gm but <1800 gm', '>1000 gm but <1500 gm', '<1000 gm'].includes(formData.q54) && (
                                            <>
                                                <div className="ap-field ap-col-span-2">
                                                    <label className="ap-field-label"><span className="ap-q-badge">Q56</span> KMC Required <span className="ap-req">*</span></label>
                                                    {renderPilGroup('q56', [{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }])}
                                                    {errors.q56 && <div className="ap-req">Required</div>}
                                                    {formData.q56 === 'No' && <div style={{ color: 'red', fontSize: '0.85rem', marginTop: '6px', fontWeight: 'bold' }}>⚠️ FLAG: Weight is less than 2500 gm but KMC not required/initiated.</div>}
                                                </div>

                                                {formData.q56 === 'Yes' && (
                                                    <>
                                                        <div className="ap-field">
                                                            <label className="ap-field-label"><span className="ap-q-badge">Q57</span> Mother/family Counselled on KMC</label>
                                                            {renderPilGroup('q57', [{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }])}
                                                        </div>
                                                        <div className="ap-field">
                                                            <label className="ap-field-label"><span className="ap-q-badge">Q58</span> KMC Given <span className="ap-req">*</span></label>
                                                            {renderPilGroup('q58', [{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }])}
                                                            {errors.q58 && <div className="ap-req">Required</div>}
                                                            {formData.q58 === 'No' && <div style={{ color: 'red', fontSize: '0.85rem', marginTop: '6px', fontWeight: 'bold' }}>⚠️ FLAG: Weight is less than 2500 gm but KMC not given.</div>}
                                                        </div>

                                                        <div className="ap-field">
                                                            <label className="ap-field-label"><span className="ap-q-badge">Q59</span> Total duration of KMC at LR <span className="ap-req">*</span></label>
                                                            <select name="q59" value={formData.q59} onChange={handleChange} className={errors.q59 ? 'err' : ''}>
                                                                <option value="">— Select —</option>
                                                                <option value="≤30 min">≤ 30 min</option>
                                                                <option value="≤1 hour">≤ 1 hour</option>
                                                                <option value=">1 hour">{'> 1 hour'}</option>
                                                                <option value="NA">NA</option>
                                                            </select>
                                                            {errors.q59 && <div className="ap-req">Required</div>}
                                                        </div>

                                                        <div className="ap-field">
                                                            <label className="ap-field-label"><span className="ap-q-badge">Q60</span> KMC by <span className="ap-req">*</span></label>
                                                            <select name="q60" value={formData.q60} onChange={handleChange} className={errors.q60 ? 'err' : ''}>
                                                                <option value="">— Select —</option>
                                                                <option value="Mother">Mother</option>
                                                                <option value="Father">Father</option>
                                                                <option value="Any other family member">Any other family member</option>
                                                                <option value="Surrogate">Surrogate</option>
                                                                <option value="Not given KMC">Not given KMC</option>
                                                                <option value="NA">NA</option>
                                                            </select>
                                                            {errors.q60 && <div className="ap-req">Required</div>}
                                                        </div>

                                                        <div className="ap-field">
                                                            <label className="ap-field-label"><span className="ap-q-badge">Q62</span> Transportation in KMC Position <span className="ap-req">*</span></label>
                                                            {renderPilGroup('q62', [{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }, { value: 'NA', label: 'N/A' }])}
                                                            {errors.q62 && <div className="ap-req">Required</div>}
                                                        </div>
                                                    </>
                                                )}
                                            </>
                                        )}

                                        <div className="ap-divider ap-col-span-2"></div>

                                        <div className="ap-field">
                                            <label className="ap-field-label"><span className="ap-q-badge">Q61</span> SNCU/NBSU Referral <span className="ap-req">*</span></label>
                                            {renderPilGroup('q61', [{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }, { value: 'NA', label: 'N/A' }])}
                                            {errors.q61 && <div className="ap-req">Required</div>}
                                        </div>

                                        <div className="ap-field">
                                            <label className="ap-field-label"><span className="ap-q-badge">Q63</span> Mother Stable <span className="ap-req">*</span></label>
                                            {renderPilGroup('q63', [{ value: 'Yes', label: 'Yes', variant: 'ok' }, { value: 'No', label: 'No', variant: 'danger' }])}
                                            {errors.q63 && <div className="ap-req">Required</div>}
                                        </div>

                                        <div className="ap-field ap-col-span-2">
                                            <label className="ap-field-label"><span className="ap-q-badge">Q64</span> Comment (if any)</label>
                                            <textarea className="ap-input" style={{ width: '100%', minHeight: '80px', padding: '12px' }} name="q64" value={formData.q64} onChange={handleChange} rows="3" placeholder="Enter comments here..."></textarea>
                                        </div>

                                    </div>
                                </div>
                                <div className="ap-form-nav">
                                    <button className="ap-btn-prev" onClick={prevStep}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>Back</button>
                                    <span className="ap-step-counter">Final Step</span>
                                    {!isSubmitting ? (
                                        <button className="ap-btn-submit ap-btn-next" onClick={handleSubmit}>Save Patient Record</button>
                                    ) : (
                                        <button className="ap-btn-submit ap-btn-next" disabled>Saving...</button>
                                    )}
                                </div>
                            </div>

                        </main>
                    </div>
                </div>

                <DashFooter />

                <UserProfileModals
                    isProfileOpen={isProfileOpen}
                    setIsProfileOpen={setIsProfileOpen}
                    isPasswordOpen={isPasswordOpen}
                    setIsPasswordOpen={setIsPasswordOpen}
                />
            </div>
        </>
    );
};

export default AddPatient;
