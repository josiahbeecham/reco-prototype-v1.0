import { useState, useEffect, useRef } from "react";

// ════════════════════════════════════════════════════
// RECO 2.0 — DESIGN TOKENS
// ════════════════════════════════════════════════════

const cream    = "#f5ede0";   // dominant warm
const cream2   = "#ede0cd";   // slightly deeper
const cream3   = "#e2d2bc";   // card edges
const ink      = "#3d2f24";   // primary text — warm near-black
const inkSoft  = "#6b5849";   // secondary text
const inkFaint = "#9a8775";   // tertiary
const ember    = "#a64d2e";   // single accent — burnt sienna
const sage     = "#7a9270";   // for "well"
const amber    = "#c89860";   // for "needs attention"
const ambient  = "linear-gradient(180deg, #f9f1e3 0%, #f0e3cb 100%)";
const ambientDeep = "linear-gradient(180deg, #ede0cd 0%, #e0cfb3 100%)";

const fontSerif = "Georgia, 'Times New Roman', serif";
const fontSans  = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";

// ════════════════════════════════════════════════════
// SHARED — Breathing animation, soft fade-in, etc.
// ════════════════════════════════════════════════════

const Style = () => (
  <style>{`
    @keyframes breathe {
      0%, 100% { transform: scale(0.85); opacity: 0.7; }
      40%, 60% { transform: scale(1.15); opacity: 1; }
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes pulseGlow {
      0%, 100% { box-shadow: 0 0 0 0 rgba(166,77,46,0.0); }
      50%      { box-shadow: 0 0 0 12px rgba(166,77,46,0.08); }
    }
    .fade-up { animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both; }
    .fade-in { animation: fadeIn 0.6s ease both; }
    .breathing-circle { animation: breathe 10s ease-in-out infinite; }
    body, html, * { -webkit-tap-highlight-color: transparent; }
    button:focus, input:focus, textarea:focus { outline: none; }
    textarea, input { font-family: inherit; }
  `}</style>
);

// Persistent breathe button — always reachable
const BreatheButton = ({ onOpen }) => (
  <button
    onClick={onOpen}
    aria-label="Open breathing exercise"
    style={{
      position: "fixed",
      bottom: "24px",
      right: "20px",
      width: "52px",
      height: "52px",
      borderRadius: "50%",
      border: "none",
      background: cream,
      boxShadow: "0 4px 20px rgba(61,47,36,0.12)",
      cursor: "pointer",
      zIndex: 50,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <div style={{
      width: "24px", height: "24px", borderRadius: "50%",
      background: `radial-gradient(circle, ${ember} 0%, ${ember}cc 100%)`,
      animation: "breathe 6s ease-in-out infinite",
    }} />
  </button>
);

// Breathing overlay — full-screen calm
const BreathingOverlay = ({ onClose }) => {
  const [phase, setPhase] = useState("inhale");
  const [count, setCount] = useState(4);

  useEffect(() => {
    const cycle = () => {
      let secs = 4, p = "inhale";
      const tick = setInterval(() => {
        secs--;
        if (secs <= 0) {
          if (p === "inhale")      { p = "hold";    secs = 2; }
          else if (p === "hold")   { p = "exhale";  secs = 6; }
          else                     { p = "inhale";  secs = 4; }
          setPhase(p);
        }
        setCount(secs);
      }, 1000);
      return tick;
    };
    const t = cycle();
    return () => clearInterval(t);
  }, []);

  return (
    <div className="fade-in" style={{
      position: "fixed", inset: 0, background: ambientDeep,
      zIndex: 100, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: fontSerif,
    }}>
      <button onClick={onClose} style={{
        position: "absolute", top: "20px", right: "24px",
        background: "none", border: "none", color: inkSoft,
        fontSize: "14px", cursor: "pointer", fontFamily: fontSans,
        letterSpacing: "0.5px",
      }}>close</button>

      <div style={{
        width: "200px", height: "200px", borderRadius: "50%",
        background: `radial-gradient(circle, ${ember}33 0%, ${ember}11 70%, transparent 100%)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: "40px",
        animation: phase === "inhale" ? "breathe 12s ease-in-out infinite" : "none",
        transition: "transform 1s ease, background 1s ease",
        transform: phase === "exhale" ? "scale(0.7)" : phase === "hold" ? "scale(1.1)" : "scale(1.1)",
      }}>
        <div style={{
          width: "120px", height: "120px", borderRadius: "50%",
          background: `radial-gradient(circle, ${ember} 0%, ${ember}aa 100%)`,
          opacity: 0.3,
        }} />
      </div>

      <p style={{
        fontSize: "28px", color: ink, margin: 0, fontWeight: 300,
        letterSpacing: "1px", textTransform: "lowercase",
      }}>{phase}</p>
      <p style={{ fontSize: "48px", color: inkSoft, margin: "8px 0 0", fontWeight: 200 }}>{count}</p>

      <p style={{ position: "absolute", bottom: "40px", color: inkFaint, fontSize: "13px", fontStyle: "italic" }}>
        breathe with me as long as you need
      </p>
    </div>
  );
};

// Soft close header — gentle back button + soft close text
const SoftHeader = ({ onClose, label = "save and come back" }) => (
  <div style={{
    padding: "16px 20px",
    display: "flex", justifyContent: "flex-end",
    fontFamily: fontSans,
  }}>
    <button onClick={onClose} style={{
      background: "none", border: "none", color: inkSoft,
      fontSize: "13px", cursor: "pointer", letterSpacing: "0.3px",
      padding: "8px 12px",
    }}>
      {label}
    </button>
  </div>
);

// ════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════

export default function RecoApp() {
  const [screen, setScreen]           = useState("welcome");
  const [breathing, setBreathing]     = useState(false);

  // Onboarding (5 steps)
  const [onbStep, setOnbStep]         = useState(0);
  const [userName, setUserName]       = useState("");
  const [userEmail, setUserEmail]     = useState("");
  const [userUsername, setUserUsername] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [whatBrings, setWhatBrings]   = useState("");
  const [coreValue, setCoreValue]     = useState("");
  const [companionName, setCompanionName] = useState("Reco");
  const [tone, setTone]               = useState(50);   // 0 = soft reflection, 100 = sharp reflection

  // Profile (built progressively)
  const [bestSelf, setBestSelf]       = useState("");
  const [lifeAreas, setLifeAreas]     = useState([]);
  const [extraValues, setExtraValues] = useState([]);

  // Daily state
  const [todayState, setTodayState]   = useState(null); // null | 'okay' | 'struggling' | 'celebrating'
  const [todayReflection, setTodayReflection] = useState("");
  const sobrietyDate = "April 19, 2025";
  const sobrietyDays = 15;

  // Active flows
  const [conversationOpen, setConversationOpen] = useState(false);
  const [conversationSeed, setConversationSeed] = useState("");
  const [journalOpen, setJournalOpen] = useState(false);
  const [journalSeed, setJournalSeed] = useState("");

  // ─── WELCOME / AUTH ─────────────────────────────
  if (screen === "welcome") {
    return (
      <div style={{
        minHeight: "100vh", background: ambient,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "space-between",
        padding: "80px 32px 40px", fontFamily: fontSerif,
      }}>
        <Style />
        <div className="fade-up" style={{ textAlign: "center", marginTop: "60px" }}>
          <div style={{
            width: "80px", height: "80px", borderRadius: "50%",
            background: `radial-gradient(circle, ${ember}33 0%, transparent 70%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 32px",
          }}>
            <div className="breathing-circle" style={{
              width: "44px", height: "44px", borderRadius: "50%",
              background: ember,
            }} />
          </div>
          <h1 style={{
            fontSize: "44px", fontWeight: 300, color: ink,
            margin: "0 0 12px", letterSpacing: "6px", textTransform: "lowercase",
          }}>{companionName.toLowerCase()}</h1>
          <p style={{
            color: inkSoft, fontSize: "15px", fontStyle: "italic",
            margin: 0, letterSpacing: "0.3px",
          }}>walk with me</p>
        </div>

        <div className="fade-up" style={{ width: "100%", maxWidth: "320px", animationDelay: "0.3s" }}>
          <button onClick={() => setScreen("onboarding")} style={{
            width: "100%", padding: "18px", borderRadius: "100px",
            border: "none", background: ember, color: "white",
            fontSize: "16px", fontFamily: fontSerif, cursor: "pointer",
            letterSpacing: "0.5px",
            boxShadow: "0 4px 16px rgba(166,77,46,0.25)",
          }}>
            get started
          </button>
          <button onClick={() => setScreen("login")} style={{
            width: "100%", padding: "18px", marginTop: "12px",
            borderRadius: "100px", border: `1.5px solid ${cream3}`,
            background: "transparent", color: ink,
            fontSize: "14px", fontFamily: fontSerif, cursor: "pointer",
            letterSpacing: "0.3px",
          }}>
            log in
          </button>
        </div>

        <p style={{ color: inkFaint, fontSize: "12px", fontStyle: "italic" }}>
          everything you share stays between us
        </p>
      </div>
    );
  }

  // ─── LOGIN ───────────────────────────────────────
  if (screen === "login") {
    return (
      <div style={{
        minHeight: "100vh", background: ambient,
        display: "flex", flexDirection: "column",
        padding: "60px 28px 40px", fontFamily: fontSerif,
      }}>
        <Style />
        <SoftHeader onClose={() => setScreen("welcome")} label="back" />

        <div className="fade-up" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: "360px", margin: "0 auto", width: "100%" }}>
          <h2 style={{
            fontSize: "28px", fontWeight: 300, color: ink,
            margin: "0 0 8px", textAlign: "center",
            letterSpacing: "0.5px",
          }}>welcome back</h2>
          <p style={{
            color: inkSoft, fontSize: "14px", fontStyle: "italic",
            margin: "0 0 40px", textAlign: "center",
          }}>good to see you again</p>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
            <input
              type="text"
              placeholder="email or username"
              style={{
                width: "100%", padding: "18px 22px",
                background: cream, border: `1.5px solid ${cream3}`,
                borderRadius: "100px", fontSize: "15px", color: ink,
                fontFamily: fontSerif,
              }}
            />
            <input
              type="password"
              placeholder="password"
              style={{
                width: "100%", padding: "18px 22px",
                background: cream, border: `1.5px solid ${cream3}`,
                borderRadius: "100px", fontSize: "15px", color: ink,
                fontFamily: fontSerif,
              }}
            />
          </div>

          <button onClick={() => setScreen("home")} style={{
            width: "100%", padding: "18px", borderRadius: "100px",
            border: "none", background: ember, color: "white",
            fontSize: "15px", fontFamily: fontSerif, cursor: "pointer",
            letterSpacing: "0.5px",
            boxShadow: "0 4px 16px rgba(166,77,46,0.2)",
          }}>continue</button>

          <button style={{
            background: "none", border: "none", color: inkSoft,
            fontSize: "13px", fontFamily: fontSerif, fontStyle: "italic",
            marginTop: "20px", cursor: "pointer", textAlign: "center",
          }}>forgot password</button>

          <p style={{
            textAlign: "center", color: inkFaint, fontSize: "13px",
            margin: "32px 0 0", fontStyle: "italic",
          }}>
            new here? <button onClick={() => setScreen("onboarding")} style={{
              background: "none", border: "none", color: ember,
              fontStyle: "italic", fontSize: "13px", cursor: "pointer",
              textDecoration: "underline", fontFamily: fontSerif, padding: 0,
            }}>get started</button>
          </p>
        </div>
      </div>
    );
  }

  // ─── ONBOARDING (4 steps) ────────────────────────
  if (screen === "onboarding") {
    // Step 0 — First breath
    if (onbStep === 0) {
      return (
        <div style={{
          minHeight: "100vh", background: ambient,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "40px 32px", fontFamily: fontSerif, position: "relative",
        }}>
          <Style />
          <div className="fade-up">
            <p style={{
              fontSize: "15px", color: inkSoft, fontStyle: "italic",
              textAlign: "center", marginBottom: "60px", letterSpacing: "0.3px",
            }}>before anything else</p>

            <div style={{
              width: "180px", height: "180px", borderRadius: "50%",
              background: `radial-gradient(circle, ${ember}22 0%, transparent 70%)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 60px",
            }}>
              <div className="breathing-circle" style={{
                width: "100px", height: "100px", borderRadius: "50%",
                background: `radial-gradient(circle, ${ember} 0%, ${ember}aa 100%)`,
                opacity: 0.7,
              }} />
            </div>

            <p style={{
              fontSize: "26px", color: ink, fontWeight: 300,
              textAlign: "center", lineHeight: 1.5, margin: "0 0 60px",
              maxWidth: "360px",
            }}>take one breath with me.</p>

            <button onClick={() => setOnbStep(1)} style={{
              display: "block", margin: "0 auto",
              padding: "16px 48px", borderRadius: "100px",
              border: "none", background: ember, color: "white",
              fontSize: "15px", fontFamily: fontSerif, cursor: "pointer",
              letterSpacing: "0.5px",
              boxShadow: "0 4px 16px rgba(166,77,46,0.2)",
            }}>continue</button>
          </div>
        </div>
      );
    }

    // Step 1 — Mirror explanation
    if (onbStep === 1) {
      return (
        <div style={{
          minHeight: "100vh", background: ambient,
          display: "flex", flexDirection: "column",
          padding: "60px 28px 40px", fontFamily: fontSerif,
        }}>
          <Style />
          <div className="fade-up" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <p style={{
              fontSize: "13px", color: inkFaint, letterSpacing: "2px",
              textTransform: "uppercase", marginBottom: "32px",
            }}>1 of 6</p>

            <p style={{
              fontSize: "22px", fontWeight: 300, color: ink,
              lineHeight: 1.6, margin: "0 0 28px",
              maxWidth: "360px",
            }}>
              before we begin, one thing matters more than anything else.
            </p>

            <p style={{
              fontSize: "22px", fontWeight: 300, color: ink,
              lineHeight: 1.6, margin: "0 0 28px",
              maxWidth: "360px",
            }}>
              i'm not a therapist. i'm not a sponsor.
            </p>

            <p style={{
              fontSize: "22px", fontWeight: 300, color: ink,
              lineHeight: 1.6, margin: "0 0 32px",
              maxWidth: "360px",
            }}>
              i'm a mirror.
            </p>

            <p style={{
              fontSize: "19px", fontWeight: 300, color: inkSoft,
              fontStyle: "italic", lineHeight: 1.7, margin: "0 0 24px",
              maxWidth: "360px",
            }}>
              everything i say back to you comes from what you tell me — your values, your goals, your own words about who you want to become.
            </p>

            <p style={{
              fontSize: "19px", fontWeight: 300, color: inkSoft,
              fontStyle: "italic", lineHeight: 1.7, margin: "0 0 40px",
              maxWidth: "360px",
            }}>
              i hold you to the person you said you wanted to be. nothing more, nothing less.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", paddingTop: "20px" }}>
            <button onClick={() => setOnbStep(0)} style={{
              padding: "16px 24px", borderRadius: "100px",
              border: `1.5px solid ${cream3}`, background: "transparent",
              color: inkSoft, fontSize: "14px", fontFamily: fontSerif, cursor: "pointer",
            }}>back</button>
            <button onClick={() => setOnbStep(2)} style={{
              flex: 1, padding: "16px", borderRadius: "100px", border: "none",
              background: ember, color: "white",
              fontSize: "15px", fontFamily: fontSerif, cursor: "pointer",
              letterSpacing: "0.5px",
              boxShadow: "0 4px 16px rgba(166,77,46,0.2)",
            }}>i'm ready</button>
          </div>
        </div>
      );
    }

    // Step 2 — Account creation
    if (onbStep === 2) {
      const accountValid = userName.trim() && userEmail.trim() && userUsername.trim() && userPassword.length >= 6;
      return (
        <div style={{
          minHeight: "100vh", background: ambient,
          display: "flex", flexDirection: "column",
          padding: "60px 28px 40px", fontFamily: fontSerif,
        }}>
          <Style />
          <div className="fade-up" style={{ flex: 1 }}>
            <p style={{
              fontSize: "13px", color: inkFaint, letterSpacing: "2px",
              textTransform: "uppercase", marginBottom: "16px",
            }}>2 of 6</p>
            <h2 style={{
              fontSize: "28px", fontWeight: 300, color: ink,
              lineHeight: 1.4, margin: "0 0 12px", maxWidth: "340px",
            }}>let's set you up.</h2>
            <p style={{
              color: inkSoft, fontSize: "15px", fontStyle: "italic",
              margin: "0 0 32px", lineHeight: 1.6, maxWidth: "340px",
            }}>so we can find each other again.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input
                type="text"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                placeholder="your first name"
                style={{
                  width: "100%", padding: "18px 22px",
                  background: cream, border: `1.5px solid ${cream3}`,
                  borderRadius: "100px", fontSize: "15px", color: ink,
                  fontFamily: fontSerif,
                }}
              />
              <input
                type="email"
                value={userEmail}
                onChange={e => setUserEmail(e.target.value)}
                placeholder="email"
                style={{
                  width: "100%", padding: "18px 22px",
                  background: cream, border: `1.5px solid ${cream3}`,
                  borderRadius: "100px", fontSize: "15px", color: ink,
                  fontFamily: fontSerif,
                }}
              />
              <input
                type="text"
                value={userUsername}
                onChange={e => setUserUsername(e.target.value.replace(/\s/g, "").toLowerCase())}
                placeholder="username"
                style={{
                  width: "100%", padding: "18px 22px",
                  background: cream, border: `1.5px solid ${cream3}`,
                  borderRadius: "100px", fontSize: "15px", color: ink,
                  fontFamily: fontSerif,
                }}
              />
              <input
                type="password"
                value={userPassword}
                onChange={e => setUserPassword(e.target.value)}
                placeholder="password (6+ characters)"
                style={{
                  width: "100%", padding: "18px 22px",
                  background: cream, border: `1.5px solid ${cream3}`,
                  borderRadius: "100px", fontSize: "15px", color: ink,
                  fontFamily: fontSerif,
                }}
              />
            </div>

            <p style={{
              color: inkFaint, fontSize: "12px", fontStyle: "italic",
              textAlign: "center", marginTop: "20px", lineHeight: 1.6,
            }}>your information stays private. always.</p>
          </div>

          <div style={{ display: "flex", gap: "12px", paddingTop: "20px" }}>
            <button onClick={() => setOnbStep(1)} style={{
              padding: "16px 24px", borderRadius: "100px",
              border: `1.5px solid ${cream3}`, background: "transparent",
              color: inkSoft, fontSize: "14px", fontFamily: fontSerif, cursor: "pointer",
            }}>back</button>
            <button onClick={() => setOnbStep(3)}
              disabled={!accountValid}
              style={{
                flex: 1, padding: "16px", borderRadius: "100px", border: "none",
                background: accountValid ? ember : cream3,
                color: accountValid ? "white" : inkFaint,
                fontSize: "15px", fontFamily: fontSerif,
                cursor: accountValid ? "pointer" : "not-allowed",
                letterSpacing: "0.5px",
              }}>continue</button>
          </div>
        </div>
      );
    }

    // Step 3 — What brings you here
    if (onbStep === 3) {
      return (
        <div style={{
          minHeight: "100vh", background: ambient,
          display: "flex", flexDirection: "column",
          padding: "60px 28px 40px", fontFamily: fontSerif,
        }}>
          <Style />
          <div className="fade-up" style={{ flex: 1 }}>
            <p style={{
              fontSize: "13px", color: inkFaint, letterSpacing: "2px",
              textTransform: "uppercase", marginBottom: "16px",
            }}>3 of 6</p>
            <h2 style={{
              fontSize: "28px", fontWeight: 300, color: ink,
              lineHeight: 1.4, margin: "0 0 12px", maxWidth: "340px",
            }}>what brings you here?</h2>
            <p style={{
              color: inkSoft, fontSize: "15px", fontStyle: "italic",
              margin: "0 0 32px", lineHeight: 1.6, maxWidth: "340px",
            }}>tell me in your own words. anything you say is enough.</p>

            <textarea
              value={whatBrings}
              onChange={e => setWhatBrings(e.target.value)}
              placeholder="i'm working through..."
              rows={8}
              style={{
                width: "100%", padding: "20px 22px",
                background: cream, border: `1.5px solid ${cream3}`,
                borderRadius: "20px", fontSize: "17px", color: ink,
                fontFamily: fontSerif, lineHeight: 1.6, resize: "none",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "12px", paddingTop: "20px" }}>
            <button onClick={() => setOnbStep(2)} style={{
              padding: "16px 24px", borderRadius: "100px",
              border: `1.5px solid ${cream3}`, background: "transparent",
              color: inkSoft, fontSize: "14px", fontFamily: fontSerif,
              cursor: "pointer",
            }}>back</button>
            <button onClick={() => setOnbStep(4)}
              disabled={!whatBrings.trim()}
              style={{
                flex: 1, padding: "16px", borderRadius: "100px",
                border: "none",
                background: whatBrings.trim() ? ember : cream3,
                color: whatBrings.trim() ? "white" : inkFaint,
                fontSize: "15px", fontFamily: fontSerif,
                cursor: whatBrings.trim() ? "pointer" : "not-allowed",
                letterSpacing: "0.5px",
              }}>continue</button>
          </div>
        </div>
      );
    }

    // Step 2 — One value
    if (onbStep === 4) {
      const suggested = ["faith", "family", "honesty", "freedom", "love", "integrity", "peace"];
      return (
        <div style={{
          minHeight: "100vh", background: ambient,
          display: "flex", flexDirection: "column",
          padding: "60px 28px 40px", fontFamily: fontSerif,
        }}>
          <Style />
          <div className="fade-up" style={{ flex: 1 }}>
            <p style={{
              fontSize: "13px", color: inkFaint, letterSpacing: "2px",
              textTransform: "uppercase", marginBottom: "16px",
            }}>4 of 6</p>
            <h2 style={{
              fontSize: "28px", fontWeight: 300, color: ink,
              lineHeight: 1.4, margin: "0 0 12px", maxWidth: "340px",
            }}>what matters most to you right now?</h2>
            <p style={{
              color: inkSoft, fontSize: "15px", fontStyle: "italic",
              margin: "0 0 32px", lineHeight: 1.6, maxWidth: "340px",
            }}>just one. we'll discover the rest together.</p>

            <input
              type="text"
              value={coreValue}
              onChange={e => setCoreValue(e.target.value)}
              placeholder="in one word..."
              style={{
                width: "100%", padding: "22px",
                background: cream, border: `1.5px solid ${cream3}`,
                borderRadius: "20px", fontSize: "22px", color: ink,
                fontFamily: fontSerif, textAlign: "center",
                letterSpacing: "1px", marginBottom: "28px",
              }}
            />

            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
              {suggested.map(v => (
                <button key={v} onClick={() => setCoreValue(v)} style={{
                  padding: "10px 18px", borderRadius: "100px",
                  border: `1.5px solid ${coreValue === v ? ember : cream3}`,
                  background: coreValue === v ? ember : "transparent",
                  color: coreValue === v ? "white" : inkSoft,
                  fontSize: "14px", fontFamily: fontSerif, cursor: "pointer",
                  fontStyle: "italic",
                }}>{v}</button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", paddingTop: "20px" }}>
            <button onClick={() => setOnbStep(3)} style={{
              padding: "16px 24px", borderRadius: "100px",
              border: `1.5px solid ${cream3}`, background: "transparent",
              color: inkSoft, fontSize: "14px", fontFamily: fontSerif, cursor: "pointer",
            }}>back</button>
            <button onClick={() => setOnbStep(5)}
              disabled={!coreValue.trim()}
              style={{
                flex: 1, padding: "16px", borderRadius: "100px", border: "none",
                background: coreValue.trim() ? ember : cream3,
                color: coreValue.trim() ? "white" : inkFaint,
                fontSize: "15px", fontFamily: fontSerif,
                cursor: coreValue.trim() ? "pointer" : "not-allowed",
                letterSpacing: "0.5px",
              }}>continue</button>
          </div>
        </div>
      );
    }

    // Step 3 — Name + tone
    if (onbStep === 5) {
      // Tone reflects how the mirror surfaces the user back to themselves
      // 0 = soft / gentle reflection ; 100 = sharp / direct reflection
      const toneLabel = tone < 25
        ? "softly reflected"
        : tone < 50
        ? "gently reflected"
        : tone < 75
        ? "clearly reflected"
        : "sharply reflected";

      const toneSubtext = tone < 25
        ? "i will hold up the mirror with care"
        : tone < 50
        ? "i will reflect what you said with warmth"
        : tone < 75
        ? "i will show you what you said without softening it"
        : "i will hold up the mirror without flinching";

      // Morphing figure — shape, color, and motion shift with tone
      const morphScale  = 1.0 + (tone / 100) * 0.12;
      const morphRound1 = 50 - (tone / 100) * 18;
      const morphRound2 = 50 + (tone / 100) * 12;
      const morphRound3 = 50 - (tone / 100) * 8;
      const morphRound4 = 50 + (tone / 100) * 16;
      const morphHueR   = 220 - (tone / 100) * 60;
      const morphHueG   = 145 - (tone / 100) * 50;
      const morphHueB   = 110 - (tone / 100) * 50;
      const morphSpeed  = 9 - (tone / 100) * 4;
      const morphOpacity = 0.7 + (tone / 100) * 0.25;

      return (
        <div style={{
          minHeight: "100vh", background: ambient,
          display: "flex", flexDirection: "column",
          padding: "60px 28px 40px", fontFamily: fontSerif,
        }}>
          <Style />
          <style>{`
            @keyframes morphFloat {
              0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
              33%      { transform: translateY(-10px) rotate(2deg) scale(1.02); }
              66%      { transform: translateY(-4px) rotate(-1deg) scale(0.98); }
            }
            @keyframes morphShape {
              0%, 100% { border-radius: var(--r1) var(--r2) var(--r3) var(--r4) / var(--r4) var(--r1) var(--r2) var(--r3); }
              25%      { border-radius: var(--r2) var(--r3) var(--r4) var(--r1) / var(--r3) var(--r4) var(--r1) var(--r2); }
              50%      { border-radius: var(--r3) var(--r4) var(--r1) var(--r2) / var(--r2) var(--r3) var(--r4) var(--r1); }
              75%      { border-radius: var(--r4) var(--r1) var(--r2) var(--r3) / var(--r1) var(--r2) var(--r3) var(--r4); }
            }
          `}</style>

          <div className="fade-up" style={{ flex: 1 }}>
            <p style={{
              fontSize: "13px", color: inkFaint, letterSpacing: "2px",
              textTransform: "uppercase", marginBottom: "16px",
            }}>5 of 6</p>
            <h2 style={{
              fontSize: "26px", fontWeight: 300, color: ink,
              lineHeight: 1.4, margin: "0 0 12px", maxWidth: "340px",
            }}>what should i call myself?</h2>
            <p style={{
              color: inkSoft, fontSize: "15px", fontStyle: "italic",
              margin: "0 0 24px", lineHeight: 1.6,
            }}>and how should i reflect you back?</p>

            <input
              type="text"
              value={companionName}
              onChange={e => setCompanionName(e.target.value)}
              style={{
                width: "100%", padding: "16px 20px",
                background: cream, border: `1.5px solid ${cream3}`,
                borderRadius: "100px", fontSize: "20px", color: ink,
                fontFamily: fontSerif, textAlign: "center",
                letterSpacing: "1.5px", marginBottom: "32px",
                textTransform: "lowercase",
              }}
            />

            {/* Morphing figure */}
            <div style={{
              display: "flex", justifyContent: "center", alignItems: "center",
              height: "180px", marginBottom: "16px", position: "relative",
            }}>
              <div style={{
                position: "absolute",
                width: "180px", height: "180px",
                background: `radial-gradient(circle at 30% 30%, rgba(${morphHueR + 30}, ${morphHueG + 30}, ${morphHueB + 30}, ${morphOpacity * 0.35}) 0%, transparent 60%)`,
                filter: "blur(24px)",
                transform: `scale(${morphScale * 1.2})`,
                transition: "all 1s cubic-bezier(0.22,1,0.36,1)",
              }} />
              <div
                style={{
                  width: "140px", height: "140px",
                  background: `linear-gradient(135deg, rgb(${morphHueR}, ${morphHueG}, ${morphHueB}) 0%, rgb(${Math.max(morphHueR - 35, 90)}, ${Math.max(morphHueG - 35, 60)}, ${Math.max(morphHueB - 25, 50)}) 100%)`,
                  opacity: morphOpacity,
                  transform: `scale(${morphScale})`,
                  transition: "all 1s cubic-bezier(0.22,1,0.36,1)",
                  animation: `morphFloat ${morphSpeed}s ease-in-out infinite, morphShape ${morphSpeed * 1.5}s ease-in-out infinite`,
                  "--r1": `${morphRound1}%`,
                  "--r2": `${morphRound2}%`,
                  "--r3": `${morphRound3}%`,
                  "--r4": `${morphRound4}%`,
                  boxShadow: `0 12px 40px rgba(${morphHueR}, ${morphHueG}, ${morphHueB}, 0.25)`,
                }}
              />
            </div>

            <p style={{
              fontSize: "20px", color: ink, margin: "0 0 6px",
              textAlign: "center", fontWeight: 300,
            }}>{toneLabel}</p>
            <p style={{
              fontSize: "13px", color: inkSoft, margin: "0 0 20px",
              textAlign: "center", fontStyle: "italic", lineHeight: 1.5,
              minHeight: "40px", padding: "0 12px",
            }}>{toneSubtext}</p>

            <input
              type="range" min="0" max="100"
              value={tone}
              onChange={e => setTone(Number(e.target.value))}
              style={{
                width: "100%", appearance: "none",
                height: "4px", borderRadius: "2px",
                background: `linear-gradient(to right, ${ember} 0%, ${ember} ${tone}%, ${cream3} ${tone}%, ${cream3} 100%)`,
                outline: "none",
              }}
            />
            <div style={{
              display: "flex", justifyContent: "space-between",
              marginTop: "8px", fontSize: "11px", color: inkFaint,
              fontStyle: "italic",
            }}>
              <span>soft reflection</span>
              <span>sharp reflection</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", paddingTop: "20px" }}>
            <button onClick={() => setOnbStep(4)} style={{
              padding: "16px 24px", borderRadius: "100px",
              border: `1.5px solid ${cream3}`, background: "transparent",
              color: inkSoft, fontSize: "14px", fontFamily: fontSerif, cursor: "pointer",
            }}>back</button>
            <button onClick={() => { setOnbStep(0); setScreen("home"); }}
              disabled={!companionName.trim()}
              style={{
                flex: 1, padding: "16px", borderRadius: "100px", border: "none",
                background: companionName.trim() ? ember : cream3,
                color: companionName.trim() ? "white" : inkFaint,
                fontSize: "15px", fontFamily: fontSerif,
                cursor: companionName.trim() ? "pointer" : "not-allowed",
                letterSpacing: "0.5px",
              }}>begin</button>
          </div>
        </div>
      );
    }
  }

  // ─── HOME — single question ──────────────────────
  if (screen === "home" && !todayState) {
    return (
      <div style={{
        minHeight: "100vh", background: ambient,
        display: "flex", flexDirection: "column",
        fontFamily: fontSerif, position: "relative",
      }}>
        <Style />
        <div className="fade-up" style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "40px 28px",
        }}>
          <p style={{
            color: inkFaint, fontSize: "13px", letterSpacing: "2px",
            textTransform: "uppercase", margin: "0 0 24px",
          }}>day {sobrietyDays}</p>

          <h1 style={{
            fontSize: "36px", fontWeight: 300, color: ink,
            margin: "0 0 60px", textAlign: "center",
            letterSpacing: "0.5px",
          }}>how are you?</h1>

          <div style={{ width: "100%", maxWidth: "340px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <button onClick={() => setTodayState("okay")} style={{
              padding: "20px 24px", borderRadius: "100px",
              border: `1.5px solid ${cream3}`, background: cream,
              color: ink, fontSize: "16px", fontFamily: fontSerif,
              cursor: "pointer", textAlign: "left",
              letterSpacing: "0.3px", transition: "all 0.3s",
            }}>i'm okay</button>

            <button onClick={() => setTodayState("struggling")} style={{
              padding: "20px 24px", borderRadius: "100px",
              border: `1.5px solid ${ember}66`, background: cream,
              color: ink, fontSize: "16px", fontFamily: fontSerif,
              cursor: "pointer", textAlign: "left",
              letterSpacing: "0.3px",
              animation: "pulseGlow 3s ease-in-out infinite",
            }}>i'm struggling</button>

            <button onClick={() => setTodayState("celebrating")} style={{
              padding: "20px 24px", borderRadius: "100px",
              border: `1.5px solid ${cream3}`, background: cream,
              color: ink, fontSize: "16px", fontFamily: fontSerif,
              cursor: "pointer", textAlign: "left",
              letterSpacing: "0.3px",
            }}>i'm here for something good</button>
          </div>
        </div>

        <BreatheButton onOpen={() => setBreathing(true)} />
        {breathing && <BreathingOverlay onClose={() => setBreathing(false)} />}
      </div>
    );
  }

  // ─── HOME — STRUGGLING (immediate support) ───────
  if (screen === "home" && todayState === "struggling" && !conversationOpen) {
    return (
      <div style={{
        minHeight: "100vh", background: ambient,
        display: "flex", flexDirection: "column",
        fontFamily: fontSerif, position: "relative",
      }}>
        <Style />
        <SoftHeader onClose={() => setTodayState(null)} label="not now" />

        <div className="fade-up" style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "20px 28px",
        }}>
          <div style={{
            width: "120px", height: "120px", borderRadius: "50%",
            background: `radial-gradient(circle, ${ember}22 0%, transparent 70%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: "32px",
          }}>
            <div className="breathing-circle" style={{
              width: "60px", height: "60px", borderRadius: "50%",
              background: `radial-gradient(circle, ${ember} 0%, ${ember}aa 100%)`,
              opacity: 0.7,
            }} />
          </div>

          <h2 style={{
            fontSize: "28px", fontWeight: 300, color: ink,
            margin: "0 0 12px", textAlign: "center",
            lineHeight: 1.4,
          }}>i'm here.</h2>
          <p style={{
            color: inkSoft, fontSize: "16px", fontStyle: "italic",
            textAlign: "center", margin: "0 0 40px",
            maxWidth: "320px", lineHeight: 1.6,
          }}>tell me what's happening. or just sit with me.</p>

          <div style={{ width: "100%", maxWidth: "340px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <button onClick={() => { setConversationSeed("struggling"); setConversationOpen(true); }} style={{
              padding: "18px 22px", borderRadius: "100px",
              border: "none", background: ember, color: "white",
              fontSize: "15px", fontFamily: fontSerif, cursor: "pointer",
              letterSpacing: "0.3px",
              boxShadow: "0 4px 16px rgba(166,77,46,0.2)",
            }}>talk to me</button>

            <button onClick={() => setBreathing(true)} style={{
              padding: "18px 22px", borderRadius: "100px",
              border: `1.5px solid ${cream3}`, background: cream,
              color: ink, fontSize: "15px", fontFamily: fontSerif,
              cursor: "pointer", letterSpacing: "0.3px",
            }}>just breathe with me</button>

            <button onClick={() => { setJournalSeed("struggling"); setJournalOpen(true); }} style={{
              padding: "18px 22px", borderRadius: "100px",
              border: `1.5px solid ${cream3}`, background: cream,
              color: ink, fontSize: "15px", fontFamily: fontSerif,
              cursor: "pointer", letterSpacing: "0.3px",
            }}>write it out</button>
          </div>

          <p style={{
            color: inkFaint, fontSize: "12px", fontStyle: "italic",
            marginTop: "32px", textAlign: "center",
          }}>relapsed? <button onClick={() => setScreen("relapse")} style={{
            background: "none", border: "none", color: ember,
            fontStyle: "italic", fontSize: "12px", cursor: "pointer",
            textDecoration: "underline", fontFamily: fontSerif, padding: 0,
          }}>tell me here.</button></p>
        </div>

        <BreatheButton onOpen={() => setBreathing(true)} />
        {breathing && <BreathingOverlay onClose={() => setBreathing(false)} />}
        {journalOpen && <Journal seed={journalSeed} onClose={() => setJournalOpen(false)} companionName={companionName} coreValue={coreValue} whatBrings={whatBrings} tone={tone} />}
        {conversationOpen && <Conversation seed={conversationSeed} onClose={() => setConversationOpen(false)} companionName={companionName} coreValue={coreValue} whatBrings={whatBrings} tone={tone} />}
      </div>
    );
  }

  // ─── HOME — STEADY (ambient home) ────────────────
  if (screen === "home" && (todayState === "okay" || todayState === "celebrating")) {
    const promptForToday = todayState === "celebrating"
      ? "what are you grateful for right now?"
      : "what's true for you today?";

    return (
      <div style={{
        minHeight: "100vh", background: ambient,
        fontFamily: fontSerif, paddingBottom: "100px", position: "relative",
      }}>
        <Style />

        {/* Gentle top */}
        <div className="fade-up" style={{ padding: "60px 28px 0" }}>
          <p style={{
            color: inkFaint, fontSize: "12px", letterSpacing: "2px",
            textTransform: "uppercase", margin: "0 0 6px",
          }}>day {sobrietyDays}</p>
          <p style={{
            color: inkSoft, fontSize: "13px", fontStyle: "italic",
            margin: "0 0 40px",
          }}>since {sobrietyDate.toLowerCase()}</p>
        </div>

        {/* Today's narrative — what used to be the recovery score */}
        <div className="fade-up" style={{
          padding: "0 28px", marginBottom: "32px",
          animationDelay: "0.15s",
        }}>
          <p style={{
            color: inkFaint, fontSize: "11px", letterSpacing: "2px",
            textTransform: "uppercase", margin: "0 0 12px",
          }}>{companionName.toLowerCase()} sees</p>
          <p style={{
            fontSize: "22px", color: ink, fontWeight: 300,
            lineHeight: 1.55, margin: 0, fontStyle: "italic",
          }}>
            this is your fifteenth day. you wrote four times this week. {coreValue ? `${coreValue} is in everything you've said.` : 'something is steadying.'}
          </p>
        </div>

        {/* Today's invitation */}
        <div className="fade-up" style={{
          padding: "0 28px", marginBottom: "32px",
          animationDelay: "0.3s",
        }}>
          <button onClick={() => { setJournalSeed(promptForToday); setJournalOpen(true); }} style={{
            width: "100%", padding: "28px 24px",
            background: cream, border: `1.5px solid ${cream3}`,
            borderRadius: "24px", textAlign: "left", cursor: "pointer",
            fontFamily: fontSerif,
          }}>
            <p style={{
              color: inkFaint, fontSize: "11px", letterSpacing: "2px",
              textTransform: "uppercase", margin: "0 0 10px",
            }}>today's invitation</p>
            <p style={{
              fontSize: "19px", color: ink, margin: 0, lineHeight: 1.5,
            }}>{promptForToday}</p>
          </button>
        </div>

        {/* Soft access */}
        <div className="fade-up" style={{
          padding: "0 28px", animationDelay: "0.45s",
          display: "flex", flexDirection: "column", gap: "10px",
        }}>
          <SoftLink label="talk with me" onClick={() => { setConversationSeed(""); setConversationOpen(true); }} />
          <SoftLink label="log a meeting" onClick={() => setScreen("meeting")} />
          <SoftLink label="looking back" onClick={() => setScreen("looking-back")} />
        </div>

        {/* Bottom gentle nav */}
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          padding: "16px 24px 28px",
          background: `linear-gradient(to top, ${cream2} 30%, ${cream2}00 100%)`,
          display: "flex", justifyContent: "space-around",
          fontFamily: fontSans, fontSize: "12px",
          letterSpacing: "0.5px", color: inkSoft,
        }}>
          <button onClick={() => setTodayState(null)} style={{
            background: "none", border: "none", color: inkSoft,
            cursor: "pointer", fontFamily: fontSans, fontSize: "12px",
            letterSpacing: "0.5px",
          }}>home</button>
          <span style={{ color: inkFaint }}>·</span>
          <button onClick={() => setScreen("looking-back")} style={{
            background: "none", border: "none", color: inkSoft,
            cursor: "pointer", fontFamily: fontSans, fontSize: "12px",
            letterSpacing: "0.5px",
          }}>looking back</button>
          <span style={{ color: inkFaint }}>·</span>
          <button onClick={() => setScreen("settings")} style={{
            background: "none", border: "none", color: inkSoft,
            cursor: "pointer", fontFamily: fontSans, fontSize: "12px",
            letterSpacing: "0.5px",
          }}>settings</button>
        </div>

        <BreatheButton onOpen={() => setBreathing(true)} />
        {breathing && <BreathingOverlay onClose={() => setBreathing(false)} />}
        {journalOpen && <Journal seed={journalSeed} onClose={() => setJournalOpen(false)} companionName={companionName} coreValue={coreValue} whatBrings={whatBrings} tone={tone} />}
        {conversationOpen && <Conversation seed={conversationSeed} onClose={() => setConversationOpen(false)} companionName={companionName} coreValue={coreValue} whatBrings={whatBrings} tone={tone} />}
      </div>
    );
  }

  // ─── LOOKING BACK ────────────────────────────────
  if (screen === "looking-back") {
    return (
      <div style={{
        minHeight: "100vh", background: ambient,
        fontFamily: fontSerif, position: "relative", paddingBottom: "60px",
      }}>
        <Style />
        <SoftHeader onClose={() => setScreen("home")} label="back home" />

        <div className="fade-up" style={{ padding: "20px 28px" }}>
          <p style={{
            color: inkFaint, fontSize: "12px", letterSpacing: "2px",
            textTransform: "uppercase", margin: "0 0 8px",
          }}>looking back</p>
          <h2 style={{
            fontSize: "28px", fontWeight: 300, color: ink,
            margin: "0 0 32px", lineHeight: 1.3,
          }}>your last seven days</h2>

          <div style={{
            background: cream, borderRadius: "24px",
            padding: "24px", border: `1.5px solid ${cream3}`,
            marginBottom: "16px",
          }}>
            <p style={{
              color: inkFaint, fontSize: "11px", letterSpacing: "2px",
              textTransform: "uppercase", margin: "0 0 14px",
            }}>{companionName.toLowerCase()}'s reflection</p>
            <p style={{
              fontSize: "17px", color: ink, lineHeight: 1.7, margin: 0,
              fontStyle: "italic", fontWeight: 300,
            }}>
              this was a steady week. you showed up four times to write, three times for meetings, and not once did you go silent on me. that's the work. {coreValue ? `${coreValue}` : 'what you said matters'} kept showing up in your words. keep going.
            </p>
          </div>

          <div style={{
            background: cream, borderRadius: "24px",
            padding: "24px", border: `1.5px solid ${cream3}`,
            marginBottom: "16px",
          }}>
            <p style={{
              color: inkFaint, fontSize: "11px", letterSpacing: "2px",
              textTransform: "uppercase", margin: "0 0 16px",
            }}>this week</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <Stat label="days of sobriety" value={sobrietyDays} />
              <Stat label="journal entries" value={4} />
              <Stat label="meetings" value={3} />
              <Stat label="breaths taken with me" value={11} />
            </div>
          </div>

          <div style={{
            background: cream, borderRadius: "24px",
            padding: "24px", border: `1.5px solid ${cream3}`,
          }}>
            <p style={{
              color: inkFaint, fontSize: "11px", letterSpacing: "2px",
              textTransform: "uppercase", margin: "0 0 14px",
            }}>one thing to sit with</p>
            <p style={{
              fontSize: "17px", color: ink, lineHeight: 1.7, margin: 0,
              fontWeight: 300,
            }}>
              what would the version of you a year from now want you to do this week?
            </p>
          </div>
        </div>

        <BreatheButton onOpen={() => setBreathing(true)} />
        {breathing && <BreathingOverlay onClose={() => setBreathing(false)} />}
      </div>
    );
  }

  // ─── RELAPSE ─────────────────────────────────────
  if (screen === "relapse") {
    return <Relapse onClose={() => setScreen("home")} companionName={companionName} coreValue={coreValue} whatBrings={whatBrings} tone={tone} />;
  }

  // ─── MEETING ─────────────────────────────────────
  if (screen === "meeting") {
    return <Meeting onClose={() => setScreen("home")} companionName={companionName} coreValue={coreValue} whatBrings={whatBrings} tone={tone} />;
  }

  // ─── SETTINGS ────────────────────────────────────
  if (screen === "settings") {
    return <Settings
      onClose={() => setScreen("home")}
      companionName={companionName} setCompanionName={setCompanionName}
      tone={tone} setTone={setTone}
      coreValue={coreValue}
      whatBrings={whatBrings}
      sobrietyDate={sobrietyDate}
    />;
  }

  return null;
}

// ════════════════════════════════════════════════════
// SUB-COMPONENTS
// ════════════════════════════════════════════════════

function SoftLink({ label, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", padding: "18px 22px",
      background: "transparent", border: `1px solid ${cream3}`,
      borderRadius: "16px", color: ink, fontSize: "15px",
      fontFamily: fontSerif, cursor: "pointer", textAlign: "left",
      letterSpacing: "0.2px", display: "flex", justifyContent: "space-between",
      alignItems: "center",
    }}>
      <span>{label}</span>
      <span style={{ color: inkFaint, fontSize: "16px" }}>→</span>
    </button>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
      <span style={{ fontSize: "14px", color: inkSoft, fontStyle: "italic" }}>{label}</span>
      <span style={{ fontSize: "22px", color: ink, fontWeight: 300 }}>{value}</span>
    </div>
  );
}

// ─── JOURNAL ─────────────────────────────────────
function Journal({ seed, onClose, companionName, coreValue, whatBrings, tone }) {
  const [entry, setEntry]       = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [response, setResponse] = useState(null);

  const submit = async () => {
    if (!entry.trim()) return;
    setSubmitted(true);
    setResponse(null);

    const toneLabel = tone < 30 ? "softly and warmly. be careful with edges. reflect their words back to them with great care." : tone < 70 ? "warmly and honestly. show them what they said without softening too much, but stay warm." : "sharply and honestly. hold up their words without softening. still warm at the core, but unflinching.";
    const systemPrompt = `you are ${companionName}, this person's recovery companion — their best self reflected back at them. they trusted you with their words. respond in 3-4 sentences. ${toneLabel}. anchor your response in what they wrote. reference their value if it fits naturally.

what they're working through: ${whatBrings}
what matters most to them: ${coreValue}
write in lowercase, like a friend texting. no emojis. no bullet points. no headers.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 500,
          system: systemPrompt,
          messages: [{ role: "user", content: entry }],
        }),
      });
      const data = await res.json();
      setResponse(data.content?.find(b => b.type === "text")?.text || "i hear you.");
    } catch {
      setResponse("i hear you. something went quiet on my end — but what you wrote matters.");
    }
  };

  return (
    <div className="fade-in" style={{
      position: "fixed", inset: 0, background: ambient,
      fontFamily: fontSerif, zIndex: 90, display: "flex", flexDirection: "column",
    }}>
      <Style />
      <SoftHeader onClose={onClose} label="save and come back" />

      <div style={{ flex: 1, padding: "20px 28px 40px", overflowY: "auto" }}>
        {!submitted ? (
          <div className="fade-up">
            {seed && (
              <p style={{
                color: inkSoft, fontSize: "17px", fontStyle: "italic",
                margin: "0 0 24px", lineHeight: 1.6,
              }}>{seed}</p>
            )}
            <textarea
              value={entry}
              onChange={e => setEntry(e.target.value)}
              placeholder={seed ? "" : "write whatever's there..."}
              rows={14}
              autoFocus
              style={{
                width: "100%", padding: "0", marginBottom: "24px",
                background: "transparent", border: "none",
                fontSize: "18px", color: ink,
                fontFamily: fontSerif, lineHeight: 1.7, resize: "none",
              }}
            />

            <button onClick={submit} disabled={!entry.trim()} style={{
              width: "100%", padding: "18px",
              borderRadius: "100px", border: "none",
              background: entry.trim() ? ember : cream3,
              color: entry.trim() ? "white" : inkFaint,
              fontSize: "15px", fontFamily: fontSerif,
              cursor: entry.trim() ? "pointer" : "not-allowed",
              letterSpacing: "0.5px",
            }}>share with {companionName.toLowerCase()}</button>
          </div>
        ) : (
          <div className="fade-up">
            <p style={{
              color: inkFaint, fontSize: "11px", letterSpacing: "2px",
              textTransform: "uppercase", margin: "0 0 14px",
            }}>{companionName.toLowerCase()}</p>

            {response === null ? (
              <div style={{
                width: "40px", height: "40px", borderRadius: "50%",
                background: `radial-gradient(circle, ${ember}aa 0%, transparent 70%)`,
                animation: "breathe 3s ease-in-out infinite",
                margin: "0 0 20px",
              }} />
            ) : (
              <p style={{
                fontSize: "19px", color: ink, lineHeight: 1.7,
                margin: "0 0 32px", fontWeight: 300,
              }}>{response}</p>
            )}

            {response !== null && (
              <button onClick={onClose} style={{
                width: "100%", padding: "18px",
                borderRadius: "100px", border: `1.5px solid ${cream3}`,
                background: cream, color: ink,
                fontSize: "15px", fontFamily: fontSerif, cursor: "pointer",
                letterSpacing: "0.5px",
              }}>close</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CONVERSATION ────────────────────────────────
function Conversation({ seed, onClose, companionName, coreValue, whatBrings, tone }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  // Opening message based on seed
  const openingMsg = seed === "struggling"
    ? "i'm here. tell me what's happening — or just say anything. there's no wrong way to start."
    : "what's on your mind?";

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const newHistory = [...messages, { role: "user", content: text }];
    setMessages(newHistory);
    setInput("");
    setLoading(true);

    const toneLabel = tone < 30 ? "softly and warmly. careful reflections." : tone < 70 ? "clearly and warmly. honest reflections." : "sharply and honestly. unflinching reflections, still warm at the core.";
    const systemPrompt = `you are ${companionName}, this person's recovery companion. ${seed === "struggling" ? "they reached out because they're struggling right now. be a steady, grounding presence." : "respond conversationally."} ${toneLabel}. 2-4 sentences max. lowercase. no emojis. no bullet points. ground responses in their value (${coreValue}) and their reason (${whatBrings}) when natural.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 500,
          system: systemPrompt,
          messages: newHistory,
        }),
      });
      const data = await res.json();
      const reply = data.content?.find(b => b.type === "text")?.text || "i'm here.";
      setMessages([...newHistory, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...newHistory, { role: "assistant", content: "something went quiet on my end. i'm still here." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{
      position: "fixed", inset: 0, background: ambient,
      fontFamily: fontSerif, zIndex: 90, display: "flex", flexDirection: "column",
    }}>
      <Style />
      <SoftHeader onClose={onClose} label="close" />

      <div ref={scrollRef} style={{ flex: 1, padding: "10px 24px 20px", overflowY: "auto" }}>
        <div className="fade-up" style={{ marginBottom: "20px" }}>
          <p style={{
            color: inkFaint, fontSize: "11px", letterSpacing: "2px",
            textTransform: "uppercase", margin: "0 0 10px",
          }}>{companionName.toLowerCase()}</p>
          <p style={{
            fontSize: "18px", color: ink, lineHeight: 1.6,
            margin: 0, fontWeight: 300,
          }}>{openingMsg}</p>
        </div>

        {messages.map((m, i) => (
          <div key={i} className="fade-up" style={{
            marginBottom: "20px",
          }}>
            {m.role === "user" ? (
              <div style={{
                background: cream, padding: "14px 18px",
                borderRadius: "20px 20px 6px 20px",
                marginLeft: "20%", border: `1px solid ${cream3}`,
              }}>
                <p style={{ fontSize: "15px", color: ink, margin: 0, lineHeight: 1.5 }}>{m.content}</p>
              </div>
            ) : (
              <>
                <p style={{
                  color: inkFaint, fontSize: "11px", letterSpacing: "2px",
                  textTransform: "uppercase", margin: "0 0 8px",
                }}>{companionName.toLowerCase()}</p>
                <p style={{
                  fontSize: "17px", color: ink, lineHeight: 1.6,
                  margin: 0, fontWeight: 300,
                }}>{m.content}</p>
              </>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ marginBottom: "20px" }}>
            <p style={{
              color: inkFaint, fontSize: "11px", letterSpacing: "2px",
              textTransform: "uppercase", margin: "0 0 8px",
            }}>{companionName.toLowerCase()}</p>
            <div style={{
              width: "32px", height: "32px", borderRadius: "50%",
              background: `radial-gradient(circle, ${ember}aa 0%, transparent 70%)`,
              animation: "breathe 2.5s ease-in-out infinite",
            }} />
          </div>
        )}
      </div>

      <div style={{
        padding: "12px 16px 20px", display: "flex", gap: "10px",
        background: ambient,
        borderTop: `1px solid ${cream3}`,
      }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }}}
          placeholder="say anything..."
          rows={1}
          style={{
            flex: 1, padding: "14px 18px",
            background: cream, border: `1.5px solid ${cream3}`,
            borderRadius: "100px", color: ink, fontSize: "15px",
            fontFamily: fontSerif, resize: "none", maxHeight: "100px",
          }}
        />
        <button onClick={send} disabled={!input.trim() || loading} style={{
          width: "48px", height: "48px", borderRadius: "50%",
          border: "none", background: input.trim() ? ember : cream3,
          color: "white", fontSize: "18px",
          cursor: input.trim() ? "pointer" : "not-allowed",
          flexShrink: 0,
        }}>↑</button>
      </div>
    </div>
  );
}

// ─── RELAPSE ─────────────────────────────────────
function Relapse({ onClose, companionName, coreValue, whatBrings, tone }) {
  const [text, setText]         = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [response, setResponse] = useState(null);

  const submit = async () => {
    if (!text.trim()) return;
    setSubmitted(true);
    setResponse(null);

    const toneLabel = tone < 30 ? "very softly. extra gentle right now." : tone < 70 ? "warmly and honestly." : "clearly and directly, but with deep compassion. never harsh after a relapse, even at sharp settings.";
    const systemPrompt = `you are ${companionName}, this person's recovery companion. they just told you they relapsed. this is one of the hardest moments. respond with absolute compassion and zero shame. acknowledge what they shared. treat the trigger as data, not failure. anchor them back to their value (${coreValue}) and their reason (${whatBrings}). end with one small, concrete thing they can do in the next 24 hours. ${toneLabel}. 4-5 sentences. lowercase. no emojis. no bullet points.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 700,
          system: systemPrompt,
          messages: [{ role: "user", content: text }],
        }),
      });
      const data = await res.json();
      setResponse(data.content?.find(b => b.type === "text")?.text || "thank you for telling me. you are still here. that matters.");
    } catch {
      setResponse("thank you for telling me. you are still here. a relapse is not the end of your story. come back to your next meeting and tell someone you trust. that's the one step.");
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: ambient,
      fontFamily: fontSerif, position: "relative",
    }}>
      <Style />
      <SoftHeader onClose={onClose} label="not now" />

      <div style={{ padding: "20px 28px 60px" }}>
        {!submitted ? (
          <div className="fade-up">
            <p style={{
              color: inkFaint, fontSize: "11px", letterSpacing: "2px",
              textTransform: "uppercase", margin: "0 0 16px",
            }}>safe space</p>
            <h2 style={{
              fontSize: "26px", fontWeight: 300, color: ink,
              margin: "0 0 12px", lineHeight: 1.4,
            }}>thank you for being here.</h2>
            <p style={{
              color: inkSoft, fontSize: "15px", fontStyle: "italic",
              margin: "0 0 32px", lineHeight: 1.6,
            }}>tell me what happened — or as little or as much as you want. no judgment lives here.</p>

            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="when, what was happening, how you were feeling..."
              rows={10}
              autoFocus
              style={{
                width: "100%", padding: "20px",
                background: cream, border: `1.5px solid ${cream3}`,
                borderRadius: "20px", fontSize: "16px", color: ink,
                fontFamily: fontSerif, lineHeight: 1.7, resize: "none",
                marginBottom: "16px",
              }}
            />

            <p style={{
              color: inkFaint, fontSize: "13px", fontStyle: "italic",
              margin: "0 0 24px", lineHeight: 1.6, textAlign: "center",
            }}>your date of sobriety will simply move to today.<br/>your longest sobriety stays on record.</p>

            <button onClick={submit} disabled={!text.trim()} style={{
              width: "100%", padding: "18px",
              borderRadius: "100px", border: "none",
              background: text.trim() ? ember : cream3,
              color: text.trim() ? "white" : inkFaint,
              fontSize: "15px", fontFamily: fontSerif,
              cursor: text.trim() ? "pointer" : "not-allowed",
              letterSpacing: "0.5px",
            }}>tell {companionName.toLowerCase()}</button>
          </div>
        ) : (
          <div className="fade-up">
            <p style={{
              color: inkFaint, fontSize: "11px", letterSpacing: "2px",
              textTransform: "uppercase", margin: "0 0 14px",
            }}>{companionName.toLowerCase()}</p>

            {response === null ? (
              <div style={{
                width: "40px", height: "40px", borderRadius: "50%",
                background: `radial-gradient(circle, ${ember}aa 0%, transparent 70%)`,
                animation: "breathe 3s ease-in-out infinite",
                margin: "0 0 20px",
              }} />
            ) : (
              <p style={{
                fontSize: "19px", color: ink, lineHeight: 1.75,
                margin: "0 0 32px", fontWeight: 300,
              }}>{response}</p>
            )}

            {response !== null && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <button onClick={onClose} style={{
                  width: "100%", padding: "16px",
                  borderRadius: "100px", border: "none",
                  background: ember, color: "white",
                  fontSize: "15px", fontFamily: fontSerif, cursor: "pointer",
                  letterSpacing: "0.5px",
                }}>back to home</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MEETING ─────────────────────────────────────
function Meeting({ onClose, companionName, coreValue, whatBrings, tone }) {
  const [type, setType]         = useState("");
  const [takeaway, setTakeaway] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [response, setResponse] = useState(null);

  const submit = async () => {
    if (!type || !takeaway.trim()) return;
    setSubmitted(true);
    setResponse(null);

    const toneLabel = tone < 30 ? "softly and warmly" : tone < 70 ? "clearly and warmly" : "sharply but warmly";
    const systemPrompt = `you are ${companionName}, this person's recovery companion. they just logged a ${type} meeting. their takeaway: "${takeaway}". respond in 2-3 sentences. ${toneLabel}. acknowledge their takeaway specifically. tie it back to their value (${coreValue}) or reason (${whatBrings}) if natural. lowercase. no emojis.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 400,
          system: systemPrompt,
          messages: [{ role: "user", content: `i just went to a ${type} meeting. takeaway: ${takeaway}` }],
        }),
      });
      const data = await res.json();
      setResponse(data.content?.find(b => b.type === "text")?.text || "showing up is the work.");
    } catch {
      setResponse("showing up is the work. that takeaway is worth sitting with.");
    }
  };

  const types = ["AA", "NA", "SAA", "therapy", "sponsor", "other"];

  return (
    <div style={{
      minHeight: "100vh", background: ambient,
      fontFamily: fontSerif,
    }}>
      <Style />
      <SoftHeader onClose={onClose} />

      <div style={{ padding: "20px 28px 60px" }}>
        {!submitted ? (
          <div className="fade-up">
            <p style={{
              color: inkFaint, fontSize: "11px", letterSpacing: "2px",
              textTransform: "uppercase", margin: "0 0 12px",
            }}>log a meeting</p>
            <h2 style={{
              fontSize: "26px", fontWeight: 300, color: ink,
              margin: "0 0 32px", lineHeight: 1.3,
            }}>what was the meeting?</h2>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "32px" }}>
              {types.map(t => (
                <button key={t} onClick={() => setType(t)} style={{
                  padding: "12px 20px", borderRadius: "100px",
                  border: `1.5px solid ${type === t ? ember : cream3}`,
                  background: type === t ? ember : "transparent",
                  color: type === t ? "white" : ink,
                  fontSize: "14px", fontFamily: fontSerif, cursor: "pointer",
                }}>{t}</button>
              ))}
            </div>

            <p style={{
              color: ink, fontSize: "17px", margin: "0 0 12px",
              lineHeight: 1.5,
            }}>what's one thing you're taking with you?</p>
            <textarea
              value={takeaway}
              onChange={e => setTakeaway(e.target.value)}
              placeholder="something that landed, something you heard..."
              rows={5}
              style={{
                width: "100%", padding: "20px",
                background: cream, border: `1.5px solid ${cream3}`,
                borderRadius: "20px", fontSize: "16px", color: ink,
                fontFamily: fontSerif, lineHeight: 1.6, resize: "none",
                marginBottom: "24px",
              }}
            />

            <button onClick={submit} disabled={!type || !takeaway.trim()} style={{
              width: "100%", padding: "18px",
              borderRadius: "100px", border: "none",
              background: (type && takeaway.trim()) ? ember : cream3,
              color: (type && takeaway.trim()) ? "white" : inkFaint,
              fontSize: "15px", fontFamily: fontSerif,
              cursor: (type && takeaway.trim()) ? "pointer" : "not-allowed",
              letterSpacing: "0.5px",
            }}>log meeting</button>
          </div>
        ) : (
          <div className="fade-up">
            <p style={{
              color: inkFaint, fontSize: "11px", letterSpacing: "2px",
              textTransform: "uppercase", margin: "0 0 14px",
            }}>{companionName.toLowerCase()}</p>

            {response === null ? (
              <div style={{
                width: "40px", height: "40px", borderRadius: "50%",
                background: `radial-gradient(circle, ${ember}aa 0%, transparent 70%)`,
                animation: "breathe 3s ease-in-out infinite",
                margin: "0 0 20px",
              }} />
            ) : (
              <p style={{
                fontSize: "19px", color: ink, lineHeight: 1.7,
                margin: "0 0 32px", fontWeight: 300,
              }}>{response}</p>
            )}

            {response !== null && (
              <button onClick={onClose} style={{
                width: "100%", padding: "16px",
                borderRadius: "100px", border: "none",
                background: ember, color: "white",
                fontSize: "15px", fontFamily: fontSerif, cursor: "pointer",
                letterSpacing: "0.5px",
              }}>back to home</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SETTINGS ────────────────────────────────────
function Settings({ onClose, companionName, setCompanionName, tone, setTone, coreValue, whatBrings, sobrietyDate }) {
  const toneLabel = tone < 25 ? "softly reflected" : tone < 50 ? "gently reflected" : tone < 75 ? "clearly reflected" : "sharply reflected";

  return (
    <div style={{
      minHeight: "100vh", background: ambient,
      fontFamily: fontSerif,
    }}>
      <Style />
      <SoftHeader onClose={onClose} label="back home" />

      <div style={{ padding: "20px 28px 60px" }}>
        <p style={{
          color: inkFaint, fontSize: "11px", letterSpacing: "2px",
          textTransform: "uppercase", margin: "0 0 12px",
        }}>settings</p>
        <h2 style={{
          fontSize: "28px", fontWeight: 300, color: ink,
          margin: "0 0 32px", lineHeight: 1.3,
        }}>your space</h2>

        <Section label="your companion">
          <input
            type="text"
            value={companionName}
            onChange={e => setCompanionName(e.target.value)}
            style={{
              width: "100%", padding: "18px",
              background: cream, border: `1.5px solid ${cream3}`,
              borderRadius: "16px", fontSize: "20px", color: ink,
              fontFamily: fontSerif, textAlign: "center",
              letterSpacing: "1.5px", textTransform: "lowercase",
            }}
          />
        </Section>

        <Section label="how the mirror reflects you">
          <p style={{
            fontSize: "18px", color: ink, margin: "0 0 16px",
            fontStyle: "italic",
          }}>{toneLabel}</p>
          <input
            type="range" min="0" max="100" value={tone}
            onChange={e => setTone(Number(e.target.value))}
            style={{
              width: "100%", appearance: "none",
              height: "4px", borderRadius: "2px",
              background: `linear-gradient(to right, ${ember} 0%, ${ember} ${tone}%, ${cream3} ${tone}%, ${cream3} 100%)`,
              outline: "none",
            }}
          />
          <div style={{
            display: "flex", justifyContent: "space-between",
            marginTop: "8px", fontSize: "11px", color: inkFaint,
            fontStyle: "italic",
          }}>
            <span>soft reflection</span>
            <span>sharp reflection</span>
          </div>
        </Section>

        <Section label="what brought you here">
          <p style={{
            fontSize: "15px", color: ink, lineHeight: 1.6,
            margin: 0, fontStyle: "italic",
          }}>"{whatBrings || "not yet shared"}"</p>
        </Section>

        <Section label="what matters most">
          <p style={{
            fontSize: "20px", color: ink, margin: 0,
            fontStyle: "italic", textAlign: "center",
          }}>{coreValue || "—"}</p>
        </Section>

        <Section label="date of sobriety">
          <p style={{ fontSize: "16px", color: ink, margin: 0, textAlign: "center" }}>{sobrietyDate}</p>
        </Section>

        <p style={{
          color: inkFaint, fontSize: "13px", fontStyle: "italic",
          textAlign: "center", margin: "32px 0 0", lineHeight: 1.7,
        }}>
          everything you share stays between you and {companionName.toLowerCase()}.<br/>
          your journals, your conversations, your story — yours.
        </p>
      </div>
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div style={{
      background: cream, borderRadius: "20px",
      padding: "20px 22px", border: `1.5px solid ${cream3}`,
      marginBottom: "12px",
    }}>
      <p style={{
        color: inkFaint, fontSize: "11px", letterSpacing: "2px",
        textTransform: "uppercase", margin: "0 0 14px",
      }}>{label}</p>
      {children}
    </div>
  );
}
