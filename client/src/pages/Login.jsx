import { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import celLogo from '../assets/cel_logo.png';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorParse, setErrorParse] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Validation visual state tracking
    const [invalidFields, setInvalidFields] = useState({ username: false, password: false });

    // Time and Theme state
    const [timeStr, setTimeStr] = useState('--:--');
    const [greeting, setGreeting] = useState('Welcome Back');
    const [isLightMode, setIsLightMode] = useState(false);
    const [isManualTheme, setIsManualTheme] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const particlesRef = useRef(null);

    // Helper functions
    const isDay = () => {
        const h = new Date().getHours();
        return h >= 6 && h < 19;
    };

    const calculateGreeting = () => {
        const h = new Date().getHours();
        if (h >= 5 && h < 12) return 'Good Morning ☀️';
        if (h >= 12 && h < 17) return 'Good Afternoon 🌤';
        if (h >= 17 && h < 21) return 'Good Evening 🌇';
        return 'Good Night 🌙';
    };

    const applyTheme = (light, man) => {
        document.documentElement.setAttribute('data-theme', 'light');
        setIsLightMode(light);
        setIsManualTheme(man);
    };

    const tick = () => {
        const now = new Date();
        setTimeStr(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
        setGreeting(calculateGreeting());

        if (!isManualTheme) {
            applyTheme(isDay(), false);
        }
    };

    const handleThemeToggle = (e) => {
        applyTheme(e.target.checked, true);
    };

    // Setup component effects (particles, ticking clock, initial theme)
    useEffect(() => {
        tick(); // Initial check
        const interval = setInterval(tick, 30000);

        // Initial root theme setup based on time
        if (!isManualTheme) {
            document.documentElement.setAttribute('data-theme', 'light');
            setIsLightMode(isDay());
        }

        if (particlesRef.current) {
            particlesRef.current.innerHTML = '';
            for (let i = 0; i < 20; i++) {
                const p = document.createElement('div');
                p.className = 'particle';
                const s = Math.random() * 2.5 + 1;
                p.style.cssText = `
          width:${s}px; height:${s}px;
          left:${Math.random() * 100}%;
          animation-duration:${12 + Math.random() * 18}s;
          animation-delay:${Math.random() * 22}s
        `;
                particlesRef.current.appendChild(p);
            }
        }

        return () => clearInterval(interval);
    }, [isManualTheme]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorParse('');
        setInvalidFields({ username: false, password: false });
        setIsLoading(true);

        // Highlight specific fields clearly in red if left blank
        let hasErrors = false;
        const newInvalidFields = { username: false, password: false };

        if (!username) {
            newInvalidFields.username = true;
            hasErrors = true;
        }
        if (!password) {
            newInvalidFields.password = true;
            hasErrors = true;
        }

        if (hasErrors) {
            setInvalidFields(newInvalidFields);
            setErrorParse('Please fill in all highlighted fields');
            setIsLoading(false);
            return;
        }

        const result = await login(username, password);

        if (result.success) {
            setTimeout(() => {
                navigate('/dashboard');
            }, 1800);
        } else {
            setErrorParse(result.message);
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="bg"></div>
            <div className="bg-grid"></div>
            <div className="orb orb-1"></div>
            <div className="orb orb-2"></div>
            <div className="orb orb-3"></div>
            <div className="sky-layer stars"></div>
            <div className="sky-layer sun-disc"></div>
            <div className="sky-layer sun-rays"></div>
            <div className="particles" ref={particlesRef}></div>

            <div className="sd sd-l">
                <div className="dl"></div>
                <div className="dd"></div>
                <div className="dt">Labour Room Case Monitoring</div>
                <div className="dd"></div>
                <div className="dl"></div>
            </div>
            <div className="sd sd-r">
                <div className="dl"></div>
                <div className="dd"></div>
                <div className="dt">Quality Tracker</div>
                <div className="dd"></div>
                <div className="dl"></div>
            </div>

            <div className="page">
                {/* HEADER */}
                <header className="auth-header">
                    <div className="logo-wrap" style={{ gap: '12px' }}>
                        <div className="mr-5 shrink-0 flex items-center justify-center overflow-visible z-10">
                            <img
                                src={celLogo}
                                alt="CEL Logo"
                                className="drop-shadow-md"
                                style={{
                                    maxWidth: '360px',
                                    height: 'auto',
                                    filter: isLightMode ? 'none' : 'invert(1) hue-rotate(180deg) brightness(1.5)'
                                }}
                            />
                        </div>
                    </div>

                    <div className="theme-ctrl">
                        {/* Clock */}
                        <div className="time-badge">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 6v6l4 2" />
                            </svg>
                            <span>{timeStr}</span>
                        </div>

                        {/* Auto badge */}
                        <div className={`auto-pill ${isManualTheme ? 'off' : ''}`}>Auto</div>

                        {/* Toggle */}
                        <label className="pill-label" title="Switch theme">
                            <span className={`pill-txt ${isLightMode ? 'active' : ''}`}>Light</span>
                            <div className="toggle-pill">
                                <input
                                    type="checkbox"
                                    checked={isLightMode}
                                    onChange={handleThemeToggle}
                                />
                                <div className="pill-track"></div>
                                <div className="pill-thumb">
                                    <svg className="i-sun" viewBox="0 0 24 24" fill="none" stroke="#a87030" strokeWidth="2.5" strokeLinecap="round">
                                        <circle cx="12" cy="12" r="4" />
                                        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                                    </svg>
                                    <svg className="i-moon" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                    </svg>
                                </div>
                            </div>
                            <span className={`pill-txt ${!isLightMode ? 'active' : ''}`}>Dark</span>
                        </label>
                    </div>
                </header>

                {/* CARD */}
                <main className="center" style={{ flexDirection: 'column', gap: '32px' }}>
                    <div className="w-full max-w-[900px] text-center z-10 px-4" style={{ animation: 'fade-down 0.8s cubic-bezier(0.16, 1, 0.3, 1) both' }}>
                        <h1 className="logo-name m-0" style={{ fontSize: '2.5rem', lineHeight: 1.2, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--tx-1)', textShadow: isLightMode ? 'none' : '0 2px 14px rgba(0,0,0,0.3)' }}>
                            Labor Room Patient Monitoring Quality Tracker
                        </h1>
                    </div>
                    <div className="login-wrap" style={{ margin: '0 auto' }}>
                        <div className="card-bar"></div>
                        <div className="card">
                            <div className="ch">
                                <div className="greet-tag">{greeting}</div>
                                <h1 className="card-title">Welcome Back</h1>
                                <p className="card-desc">Sign in to access your monitoring dashboard</p>
                            </div>

                            <div className="div" style={{ marginBottom: errorParse ? '-6px' : '24px' }}></div>

                            <form onSubmit={handleSubmit}>
                                {errorParse && (
                                    <div className="bg-red-900/40 border border-red-500/50 text-red-200 px-4 py-2 rounded-xl mb-4 flex gap-3 text-sm transition-all duration-300">
                                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <span>{errorParse}</span>
                                    </div>
                                )}
                                <div className="field">
                                    <label className="flabel" htmlFor="un">Email Address</label>
                                    <div className="iwrap">
                                        <span className="iicon">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                                <polyline points="22,6 12,13 2,6" />
                                            </svg>
                                        </span>
                                        <input
                                            type="text"
                                            id="un"
                                            placeholder="Enter your email address"
                                            autoComplete="email"
                                            value={username}
                                            onChange={(e) => {
                                                setUsername(e.target.value);
                                                if (invalidFields.username) setInvalidFields(prev => ({ ...prev, username: false }));
                                            }}
                                            className={invalidFields.username ? 'error-field' : ''}
                                        />
                                    </div>
                                </div>
                                <div className="field">
                                    <label className="flabel" htmlFor="pw">Password</label>
                                    <div className="iwrap">
                                        <span className="iicon">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="11" width="18" height="11" rx="2" />
                                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                            </svg>
                                        </span>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            id="pw"
                                            placeholder="Enter your password"
                                            autoComplete="current-password"
                                            value={password}
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                                if (invalidFields.password) setInvalidFields(prev => ({ ...prev, password: false }));
                                            }}
                                            className={invalidFields.password ? 'error-field' : ''}
                                        />
                                        <button
                                            type="button"
                                            className="show-pass"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                                    <line x1="1" y1="1" x2="23" y2="23" />
                                                </svg>
                                            ) : (
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                    <circle cx="12" cy="12" r="3" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div className="extras">
                                    <label className="remember">
                                        <input
                                            type="checkbox"
                                            id="rem"
                                            checked={rememberMe}
                                            onChange={() => setRememberMe(!rememberMe)}
                                        />
                                        <span className="cbx">
                                            <svg viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M2 6l3 3 5-5" />
                                            </svg>
                                        </span>
                                        Remember me
                                    </label>
                                </div>
                                <button
                                    type="submit"
                                    className="btn-login"
                                    disabled={isLoading}
                                    style={isLoading ? { opacity: 0.8, pointerEvents: 'none' } : {}}
                                >
                                    <div className="bi">
                                        {isLoading ? (
                                            <>
                                                <svg style={{ animation: "spin 0.8s linear infinite" }} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                                                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                                </svg>
                                                <span>Signing in…</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Sign In</span>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                                </svg>
                                            </>
                                        )}
                                    </div>
                                </button>
                            </form>

                            <div className="sec-note">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                                256-bit SSL encrypted · HIPAA compliant session
                            </div>
                        </div>
                    </div>
                </main>

                <footer className="auth-footer">
                    &copy; {new Date().getFullYear()} - All rights reserved Community Empowerment Lab
                </footer>
            </div>
        </>
    );
};

export default Login;
