import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Launch: March 5, 2026 12:00 AM PKT = March 4, 2026 19:00:00 UTC
const LAUNCH_UTC = new Date("2026-03-05T00:00:00+05:00").getTime();

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

export function LaunchCountdown() {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft());
    const [isLaunched, setIsLaunched] = useState(Date.now() >= LAUNCH_UTC);
    const [isAdmin, setIsAdmin] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);

    // Check if current user is admin/superadmin
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
                    if (data && (data.role === "admin" || data.role === "superadmin")) {
                        setIsAdmin(true);
                    }
                }
            } catch {
                // Not logged in or no admin role — stay on countdown
            } finally {
                setCheckingAuth(false);
            }
        };
        checkAdmin();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            const now = Date.now();
            if (now >= LAUNCH_UTC) {
                setIsLaunched(true);
                clearInterval(timer);
                window.location.reload();
            } else {
                setTimeLeft(getTimeLeft());
            }
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    if (isLaunched || isAdmin) return null;

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
                        <span className="launch-logo-text">IR</span>
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
                    width: 72px; height: 72px;
                    border-radius: 50%;
                    border: 2px solid rgba(59,130,246,0.3);
                    display: flex; align-items: center; justify-content: center;
                    background: rgba(59,130,246,0.05);
                    animation: launchRingSpin 12s linear infinite;
                    box-shadow: 0 0 30px rgba(59,130,246,0.15), inset 0 0 20px rgba(59,130,246,0.05);
                }
                @keyframes launchRingSpin {
                    0% { border-color: rgba(59,130,246,0.3); box-shadow: 0 0 30px rgba(59,130,246,0.15); }
                    50% { border-color: rgba(139,92,246,0.3); box-shadow: 0 0 30px rgba(139,92,246,0.15); }
                    100% { border-color: rgba(59,130,246,0.3); box-shadow: 0 0 30px rgba(59,130,246,0.15); }
                }
                .launch-logo-text {
                    font-size: 22px;
                    font-weight: 800;
                    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    letter-spacing: 2px;
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

                /* Responsive */
                @media (max-width: 640px) {
                    .launch-title { font-size: 28px; letter-spacing: 8px; }
                    .launch-subtitle { font-size: 11px; letter-spacing: 2px; }
                    .launch-unit-value { width: 56px; height: 56px; font-size: 22px; border-radius: 12px; }
                    .launch-countdown { gap: 6px; }
                    .launch-separator { font-size: 20px; padding-bottom: 16px; }
                    .launch-unit-label { font-size: 9px; letter-spacing: 2px; }
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
