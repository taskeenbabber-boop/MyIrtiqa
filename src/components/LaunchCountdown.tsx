import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import logoIcon from "@/assets/logo-icon.png";

// Launch: March 5, 2026 12:00 AM PKT = March 4, 2026 19:00:00 UTC
const LAUNCH_UTC = new Date("2026-03-05T00:00:00+05:00").getTime();

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

interface LaunchCountdownProps {
    onBypass: () => void;
}

export function LaunchCountdown({ onBypass }: LaunchCountdownProps) {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft());
    const [isAdmin, setIsAdmin] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [loginError, setLoginError] = useState("");
    const [loginLoading, setLoginLoading] = useState(false);

    // Check if already logged in as admin on mount
    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data } = await (supabase as any)
                        .from("user_roles")
                        .select("role")
                        .eq("user_id", user.id)
                        .single();
                    if (data && (data.role === "admin" || data.role === "superadmin" || data.role === "super_admin")) {
                        setIsAdmin(true);
                    }
                }
            } catch {
                // Not logged in
            }
        };
        checkAdmin();
    }, []);

    // Countdown timer
    useEffect(() => {
        const timer = setInterval(() => {
            const now = Date.now();
            if (now >= LAUNCH_UTC) {
                clearInterval(timer);
                onBypass(); // Auto-launch when time arrives
            } else {
                setTimeLeft(getTimeLeft());
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [onBypass]);

    // Admin login handler
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginLoading(true);
        setLoginError("");
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: loginEmail,
                password: loginPassword,
            });
            if (error) throw error;
            if (data.user) {
                const { data: roleData, error: roleError } = await (supabase as any)
                    .from("user_roles")
                    .select("role")
                    .eq("user_id", data.user.id)
                    .maybeSingle();

                if (roleError) {
                    setLoginError("Error checking permissions.");
                    await supabase.auth.signOut();
                    return;
                }

                if (!roleData) {
                    setLoginError("Account exists, but has no role assigned in 'user_roles' table. Please run the SQL to make this email an admin.");
                    await supabase.auth.signOut();
                } else if (roleData.role === "admin" || roleData.role === "superadmin" || roleData.role === "super_admin") {
                    setIsAdmin(true);
                    setShowLogin(false);
                } else {
                    setLoginError(`Access denied. Your current role is '${roleData.role}', which does not have admin privileges.`);
                    await supabase.auth.signOut();
                }
            }
        } catch (err: any) {
            setLoginError(err.message || "Login failed");
        } finally {
            setLoginLoading(false);
        }
    };

    return (
        <div className="launch-screen">
            {/* Animated background particles */}
            <div className="launch-particles">
                {Array.from({ length: 30 }).map((_, i) => (
                    <div key={i} className="launch-particle" style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 8}s`,
                        animationDuration: `${4 + Math.random() * 6}s`,
                        width: `${2 + Math.random() * 4}px`,
                        height: `${2 + Math.random() * 4}px`,
                    }} />
                ))}
            </div>

            {/* Radial glow orbs */}
            <div className="launch-orb launch-orb-1" />
            <div className="launch-orb launch-orb-2" />
            <div className="launch-orb launch-orb-3" />

            {/* Grid lines */}
            <div className="launch-grid" />

            {/* Content */}
            <div className="launch-content">
                {/* DNA helix animation */}
                <div className="launch-dna">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="launch-dna-pair" style={{ animationDelay: `${i * 0.15}s` }}>
                            <div className="launch-dna-dot launch-dna-dot-left" />
                            <div className="launch-dna-bridge" />
                            <div className="launch-dna-dot launch-dna-dot-right" />
                        </div>
                    ))}
                </div>

                {/* Logo and brand */}
                <div className="launch-brand">
                    <div className="launch-logo-ring">
                        <img src={logoIcon} alt="IRTIQA" className="launch-logo-img" />
                    </div>
                    <h1 className="launch-title">IRTIQA</h1>
                    <p className="launch-subtitle">Advancing Research Culture in Medical Education</p>
                </div>

                {/* Countdown */}
                <div className="launch-countdown">
                    <CountdownUnit value={timeLeft.days} label="Days" />
                    <div className="launch-separator">:</div>
                    <CountdownUnit value={timeLeft.hours} label="Hours" />
                    <div className="launch-separator">:</div>
                    <CountdownUnit value={timeLeft.minutes} label="Minutes" />
                    <div className="launch-separator">:</div>
                    <CountdownUnit value={timeLeft.seconds} label="Seconds" />
                </div>

                {/* Status message */}
                <div className="launch-status">
                    <div className="launch-pulse" />
                    <span>Launching Soon — March 5, 2026</span>
                </div>

                {/* Bottom tagline */}
                <p className="launch-tagline">
                    Something extraordinary is being crafted. Stay tuned.
                </p>

                {/* Developer credit */}
                <div className="launch-credit">
                    Designed & Developed by <span className="launch-credit-name">Taskeen</span>
                </div>

                {/* ═══ Admin Section ═══ */}
                {isAdmin ? (
                    /* Admin is authenticated — show "Visit Site" button */
                    <button onClick={onBypass} className="launch-admin-btn launch-visit-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                            <polyline points="10 17 15 12 10 7" />
                            <line x1="15" y1="12" x2="3" y2="12" />
                        </svg>
                        Visit Site
                    </button>
                ) : showLogin ? (
                    /* Login form */
                    <form onSubmit={handleLogin} className="launch-login-form">
                        <div className="launch-login-header">
                            <span>Admin Access</span>
                            <button type="button" onClick={() => setShowLogin(false)} className="launch-login-close">✕</button>
                        </div>
                        <input
                            type="email"
                            placeholder="Email"
                            value={loginEmail}
                            onChange={e => setLoginEmail(e.target.value)}
                            className="launch-login-input"
                            required
                            autoFocus
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={loginPassword}
                            onChange={e => setLoginPassword(e.target.value)}
                            className="launch-login-input"
                            required
                        />
                        {loginError && <div className="launch-login-error">{loginError}</div>}
                        <button type="submit" disabled={loginLoading} className="launch-admin-btn launch-login-submit">
                            {loginLoading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>
                ) : (
                    /* Small admin login trigger */
                    <button onClick={() => setShowLogin(true)} className="launch-admin-trigger">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        Admin
                    </button>
                )}
            </div>

            <style>{`
                .launch-screen {
                    position: fixed;
                    inset: 0;
                    z-index: 99999;
                    background: #030712;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
                }

                /* Particles */
                .launch-particles { position: absolute; inset: 0; pointer-events: none; }
                .launch-particle {
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(59, 130, 246, 0.4);
                    animation: launchFloat linear infinite;
                    box-shadow: 0 0 6px rgba(59, 130, 246, 0.6);
                }
                @keyframes launchFloat {
                    0% { opacity: 0; transform: translateY(0) scale(0); }
                    20% { opacity: 1; transform: translateY(-30px) scale(1); }
                    80% { opacity: 0.6; }
                    100% { opacity: 0; transform: translateY(-120px) scale(0.3); }
                }

                /* Glow orbs */
                .launch-orb {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(80px);
                    pointer-events: none;
                }
                .launch-orb-1 {
                    width: 500px; height: 500px;
                    background: radial-gradient(circle, rgba(59,130,246,0.12), transparent 70%);
                    top: -150px; left: -100px;
                    animation: launchOrb1 8s ease-in-out infinite;
                }
                .launch-orb-2 {
                    width: 400px; height: 400px;
                    background: radial-gradient(circle, rgba(139,92,246,0.08), transparent 70%);
                    bottom: -100px; right: -80px;
                    animation: launchOrb2 10s ease-in-out infinite;
                }
                .launch-orb-3 {
                    width: 300px; height: 300px;
                    background: radial-gradient(circle, rgba(59,130,246,0.06), transparent 70%);
                    top: 50%; left: 50%;
                    transform: translate(-50%, -50%);
                    animation: launchOrb3 6s ease-in-out infinite;
                }
                @keyframes launchOrb1 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(40px, 30px); } }
                @keyframes launchOrb2 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-30px, -40px); } }
                @keyframes launchOrb3 { 0%,100% { transform: translate(-50%,-50%) scale(1); } 50% { transform: translate(-50%,-50%) scale(1.3); } }

                /* Grid */
                .launch-grid {
                    position: absolute;
                    inset: 0;
                    background-image:
                        linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px);
                    background-size: 60px 60px;
                    pointer-events: none;
                    mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%);
                    -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%);
                }

                /* Content */
                .launch-content {
                    position: relative;
                    z-index: 10;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 32px;
                    padding: 24px;
                    text-align: center;
                    animation: launchFadeIn 1s ease-out;
                }
                @keyframes launchFadeIn {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* DNA helix */
                .launch-dna {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    margin-bottom: -8px;
                }
                .launch-dna-pair {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    animation: launchDna 2s ease-in-out infinite alternate;
                }
                .launch-dna-dot {
                    width: 6px; height: 6px;
                    border-radius: 50%;
                    background: #3b82f6;
                    box-shadow: 0 0 8px rgba(59,130,246,0.6);
                }
                .launch-dna-dot-right { background: #8b5cf6; box-shadow: 0 0 8px rgba(139,92,246,0.6); }
                .launch-dna-bridge {
                    width: 24px; height: 1px;
                    background: linear-gradient(90deg, #3b82f6, #8b5cf6);
                    opacity: 0.4;
                }
                @keyframes launchDna {
                    0% { transform: scaleX(0.6) translateX(-4px); }
                    100% { transform: scaleX(1.4) translateX(4px); }
                }

                /* Brand */
                .launch-brand { display: flex; flex-direction: column; align-items: center; gap: 12px; }
                .launch-logo-ring {
                    width: 120px; height: 120px;
                    border-radius: 50%;
                    border: 2px solid rgba(59,130,246,0.3);
                    display: flex; align-items: center; justify-content: center;
                    background: rgba(59,130,246,0.05);
                    animation: launchRingSpin 12s linear infinite;
                    box-shadow: 0 0 40px rgba(59,130,246,0.2), inset 0 0 20px rgba(59,130,246,0.05);
                }
                @keyframes launchRingSpin {
                    0% { border-color: rgba(59,130,246,0.3); box-shadow: 0 0 40px rgba(59,130,246,0.2), 0 0 80px rgba(59,130,246,0.05); }
                    50% { border-color: rgba(139,92,246,0.3); box-shadow: 0 0 40px rgba(139,92,246,0.2), 0 0 80px rgba(139,92,246,0.05); }
                    100% { border-color: rgba(59,130,246,0.3); box-shadow: 0 0 40px rgba(59,130,246,0.2), 0 0 80px rgba(59,130,246,0.05); }
                }
                .launch-logo-img {
                    width: 80px; height: 80px;
                    object-fit: contain;
                    filter: drop-shadow(0 0 12px rgba(59,130,246,0.5)) brightness(1.1);
                    animation: launchLogoGlow 3s ease-in-out infinite;
                }
                @keyframes launchLogoGlow {
                    0%, 100% { filter: drop-shadow(0 0 12px rgba(59,130,246,0.5)) brightness(1.1); }
                    50% { filter: drop-shadow(0 0 20px rgba(59,130,246,0.8)) brightness(1.3); }
                }
                .launch-title {
                    font-size: 40px;
                    font-weight: 800;
                    letter-spacing: 12px;
                    background: linear-gradient(135deg, #e2e8f0, #94a3b8);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    margin: 0;
                }
                .launch-subtitle {
                    font-size: 13px;
                    color: rgba(148, 163, 184, 0.6);
                    letter-spacing: 3px;
                    text-transform: uppercase;
                    max-width: 340px;
                    margin: 0;
                }

                /* Countdown */
                .launch-countdown {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .launch-separator {
                    font-size: 28px;
                    font-weight: 200;
                    color: rgba(59,130,246,0.3);
                    padding-bottom: 20px;
                }
                .launch-unit {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                }
                .launch-unit-value {
                    width: 72px; height: 72px;
                    display: flex; align-items: center; justify-content: center;
                    border-radius: 16px;
                    background: rgba(59,130,246,0.06);
                    border: 1px solid rgba(59,130,246,0.12);
                    font-size: 28px;
                    font-weight: 700;
                    color: #e2e8f0;
                    font-variant-numeric: tabular-nums;
                    box-shadow: 0 4px 20px rgba(59,130,246,0.08), inset 0 1px 0 rgba(255,255,255,0.03);
                    backdrop-filter: blur(10px);
                    transition: all 0.3s ease;
                }
                .launch-unit-label {
                    font-size: 10px;
                    text-transform: uppercase;
                    letter-spacing: 3px;
                    color: rgba(148, 163, 184, 0.4);
                    font-weight: 500;
                }

                /* Status */
                .launch-status {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 8px 20px;
                    border-radius: 999px;
                    background: rgba(59,130,246,0.06);
                    border: 1px solid rgba(59,130,246,0.1);
                    font-size: 13px;
                    color: rgba(148, 163, 184, 0.7);
                    letter-spacing: 1px;
                }
                .launch-pulse {
                    width: 8px; height: 8px;
                    border-radius: 50%;
                    background: #3b82f6;
                    box-shadow: 0 0 10px rgba(59,130,246,0.6);
                    animation: launchPulse 2s ease-in-out infinite;
                }
                @keyframes launchPulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.4; transform: scale(0.8); }
                }

                /* Tagline */
                .launch-tagline {
                    font-size: 14px;
                    color: rgba(148, 163, 184, 0.35);
                    font-style: italic;
                    margin: 0;
                }

                /* Developer Credit */
                .launch-credit {
                    font-size: 10px;
                    color: rgba(148, 163, 184, 0.2);
                    letter-spacing: 1.5px;
                    text-transform: uppercase;
                    font-weight: 400;
                }
                .launch-credit-name {
                    color: rgba(59, 130, 246, 0.4);
                    font-weight: 600;
                }

                /* ═══ Admin Controls ═══ */
                .launch-admin-trigger {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 16px;
                    border-radius: 999px;
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.08);
                    color: rgba(148,163,184,0.4);
                    font-size: 11px;
                    font-weight: 500;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .launch-admin-trigger:hover {
                    background: rgba(59,130,246,0.08);
                    border-color: rgba(59,130,246,0.2);
                    color: rgba(148,163,184,0.7);
                }

                .launch-login-form {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    width: 100%;
                    max-width: 300px;
                    padding: 20px;
                    border-radius: 16px;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    backdrop-filter: blur(20px);
                    animation: launchFadeIn 0.3s ease-out;
                }
                .launch-login-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 12px;
                    font-weight: 600;
                    color: rgba(148,163,184,0.6);
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    margin-bottom: 4px;
                }
                .launch-login-close {
                    background: none;
                    border: none;
                    color: rgba(148,163,184,0.4);
                    cursor: pointer;
                    font-size: 14px;
                    padding: 4px;
                    transition: color 0.2s;
                }
                .launch-login-close:hover { color: #e2e8f0; }
                .launch-login-input {
                    width: 100%;
                    padding: 10px 14px;
                    border-radius: 10px;
                    background: rgba(0,0,0,0.3);
                    border: 1px solid rgba(59,130,246,0.15);
                    color: #e2e8f0;
                    font-size: 14px;
                    outline: none;
                    transition: border-color 0.2s;
                    box-sizing: border-box;
                }
                .launch-login-input:focus {
                    border-color: rgba(59,130,246,0.5);
                }
                .launch-login-input::placeholder {
                    color: rgba(148,163,184,0.3);
                }
                .launch-login-error {
                    font-size: 12px;
                    color: #f87171;
                    text-align: center;
                }
                .launch-login-submit {
                    width: 100%;
                }
                .launch-admin-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 10px 24px;
                    border-radius: 999px;
                    font-size: 13px;
                    font-weight: 600;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    cursor: pointer;
                    transition: all 0.3s;
                    border: none;
                }
                .launch-visit-btn {
                    background: linear-gradient(135deg, #3b82f6, #2563eb);
                    color: #fff;
                    box-shadow: 0 4px 20px rgba(59,130,246,0.3);
                    animation: launchFadeIn 0.3s ease-out;
                }
                .launch-visit-btn:hover {
                    transform: scale(1.05);
                    box-shadow: 0 6px 30px rgba(59,130,246,0.4);
                }
                .launch-login-submit {
                    background: rgba(59,130,246,0.15);
                    color: #3b82f6;
                    border: 1px solid rgba(59,130,246,0.3);
                }
                .launch-login-submit:hover {
                    background: rgba(59,130,246,0.25);
                }
                .launch-login-submit:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                /* Responsive */
                @media (max-width: 640px) {
                    .launch-title { font-size: 28px; letter-spacing: 8px; }
                    .launch-subtitle { font-size: 11px; letter-spacing: 2px; }
                    .launch-unit-value { width: 56px; height: 56px; font-size: 22px; border-radius: 12px; }
                    .launch-countdown { gap: 6px; }
                    .launch-separator { font-size: 20px; padding-bottom: 16px; }
                    .launch-unit-label { font-size: 9px; letter-spacing: 2px; }
                    .launch-login-form { max-width: 260px; padding: 16px; }
                }
            `}</style>
        </div>
    );
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
    return (
        <div className="launch-unit">
            <div className="launch-unit-value">{String(value).padStart(2, "0")}</div>
            <div className="launch-unit-label">{label}</div>
        </div>
    );
}

function getTimeLeft(): TimeLeft {
    const diff = Math.max(0, LAUNCH_UTC - Date.now());
    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
    };
}

export function isBeforeLaunch(): boolean {
    return Date.now() < LAUNCH_UTC;
}
