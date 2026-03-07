import { useState, useEffect, useRef } from "react";
import emailjs from "@emailjs/browser";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import js from "react-syntax-highlighter/dist/esm/languages/hljs/javascript";
import python from "react-syntax-highlighter/dist/esm/languages/hljs/python";
import cpp from "react-syntax-highlighter/dist/esm/languages/hljs/cpp";
import ruby from "react-syntax-highlighter/dist/esm/languages/hljs/ruby";
import swift from "react-syntax-highlighter/dist/esm/languages/hljs/swift";
import logo from "./soptera_logo.jpg";
import thinkingActive from "./thinking_active.png";
import thinkingInactive from "./thinking_inactive.png";

SyntaxHighlighter.registerLanguage("javascript", js);
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("cpp", cpp);
SyntaxHighlighter.registerLanguage("ruby", ruby);
SyntaxHighlighter.registerLanguage("swift", swift);

const LANGUAGES = ["Python", "C", "C++", "Ruby", "Swift"];

const LANG_MAP = {
  "Python": "python",
  "C": "cpp",
  "C++": "cpp",
  "Ruby": "ruby",
  "Swift": "swift",
};

const PAIRS = {
  "Python": ["C++", "Ruby", "Swift"],
  "C":      ["C++", "Python"],
  "C++":    ["C", "Python", "Swift"],
  "Ruby":   ["Python", "Swift"],
  "Swift":  ["C++", "Ruby"],
};

const BACKEND_URL = "https://soptera-backend.onrender.com";

const EMAILJS_SERVICE_ID = "service_nwlb0jm";
const EMAILJS_TEMPLATE_ID = "template_73dyen9";
const EMAILJS_PUBLIC_KEY = "UilYbd3YaZYgCqPkF";
const REACH_OUT_EMAIL = "soptera.reviews@gmail.com";

function useTypewriter(text, speed = 30) {
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);
  const wordsRef = useRef([]);

  useEffect(() => {
    if (!text) {
      setDisplayed("");
      indexRef.current = 0;
      wordsRef.current = [];
      return;
    }
    wordsRef.current = text.split(" ");
    indexRef.current = 0;
    setDisplayed("");

    const interval = setInterval(() => {
      if (indexRef.current < wordsRef.current.length) {
        setDisplayed((prev) =>
          prev ? prev + " " + wordsRef.current[indexRef.current] : wordsRef.current[indexRef.current]
        );
        indexRef.current += 1;
      } else {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return displayed;
}

export default function App() {
  const [sourceLang, setSourceLang] = useState("Python");
  const [targetLang, setTargetLang] = useState("C++");
  const [inputCode, setInputCode] = useState("");
  const [outputCode, setOutputCode] = useState("");
  const [thinking, setThinking] = useState("");
  const [thinkingMode, setThinkingMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [thinkingLoading, setThinkingLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const [showReview, setShowReview] = useState(false);
  const [stars, setStars] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewSending, setReviewSending] = useState(false);
  const [reviewSent, setReviewSent] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const charCount = inputCode.length;
  const lineCount = inputCode.split("\n").length;
  const isOverLimit = charCount > 12000 || lineCount > 300;
  const isDisabled = loading || !inputCode.trim() || isOverLimit;

  const displayedThinking = useTypewriter(thinking, 35);

  function handleSourceChange(e) {
    const newSource = e.target.value;
    setSourceLang(newSource);
    setTargetLang(PAIRS[newSource][0]);
  }

  async function handleTranslate() {
    if (isDisabled) return;
    setLoading(true);
    setError("");
    setOutputCode("");
    setThinking("");

    try {
      const response = await fetch(`${BACKEND_URL}/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_lang: sourceLang,
          target_lang: targetLang,
          code: inputCode,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.detail || "Translation failed.");
        setLoading(false);
        return;
      }
      setOutputCode(data.translated_code);
      setLoading(false);

      if (thinkingMode) {
        setThinkingLoading(true);
        await new Promise((res) => setTimeout(res, 1500));
        try {
          const thinkRes = await fetch(`${BACKEND_URL}/think`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              source_lang: sourceLang,
              target_lang: targetLang,
              source_code: inputCode,
              translated_code: data.translated_code,
            }),
          });
          const thinkData = await thinkRes.json();
          if (thinkRes.ok) {
            setThinking(thinkData.thinking);
          }
        } catch (e) {
          setThinking("Thinking mode unavailable.");
        }
        setThinkingLoading(false);
      }

    } catch (err) {
      setError("Could not reach the server. Please try again.");
      setLoading(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(outputCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleReachOut() {
    window.location.href = `mailto:${REACH_OUT_EMAIL}?subject=Reaching out about Soptera`;
  }

  function openReview() {
    setShowReview(true);
    setStars(0);
    setComment("");
    setReviewSent(false);
    setReviewError("");
  }

  function closeReview() {
    setShowReview(false);
  }

  async function handleSubmitReview() {
    if (stars === 0) {
      setReviewError("Please select a star rating.");
      return;
    }
    setReviewSending(true);
    setReviewError("");
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        { stars: `${stars}`, comment: comment || "No comment provided." },
        EMAILJS_PUBLIC_KEY
      );
      setReviewSent(true);
    } catch (err) {
      setReviewError("Failed to send review. Please try again.");
    }
    setReviewSending(false);
  }

 function parseBullets(text) {
    return text.split("•").filter((b) => b.trim().length > 0).map((b) => b.trim());
}

function renderBulletText(text) {
    const parts = text.split(/('.*?')/g);
    return parts.map((part, i) =>
        part.startsWith("'") && part.endsWith("'")
            ? <span key={i} style={styles.bulletKeyword}>{part}</span>
            : part
    );
}

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #242424; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(12px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        select:focus, textarea:focus { outline: none; }
        ::placeholder { color: rgba(255,255,255,0.35); }
        select option { background: #2e2e2e; color: white; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }
      `}</style>

      <div style={styles.page}>

        {/* Review Modal */}
        {showReview && (
          <div style={styles.modalOverlay} onClick={closeReview}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              {reviewSent ? (
                <div style={styles.modalSuccess}>
                  <p style={styles.modalSuccessIcon}>✓</p>
                  <p style={styles.modalSuccessTitle}>Thank you</p>
                  <p style={styles.modalSuccessSub}>Your review has been received.</p>
                  <button style={styles.modalCloseBtn} onClick={closeReview}>Close</button>
                </div>
              ) : (
                <>
                  <div style={styles.modalHeader}>
                    <p style={styles.modalTitle}>Review Soptera</p>
                    <span style={styles.modalX} onClick={closeReview}>✕</span>
                  </div>
                  <p style={styles.modalSub}>How would you rate your experience?</p>
                  <div style={styles.stars}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span
                        key={s}
                        style={{
                          ...styles.star,
                          color: s <= (hoveredStar || stars) ? "#ffffff" : "rgba(255,255,255,0.2)",
                        }}
                        onMouseEnter={() => setHoveredStar(s)}
                        onMouseLeave={() => setHoveredStar(0)}
                        onClick={() => setStars(s)}
                      >★</span>
                    ))}
                  </div>
                  <textarea
                    style={styles.modalTextarea}
                    placeholder="Leave a comment (optional)..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    spellCheck={false}
                  />
                  {reviewError && <p style={styles.modalError}>{reviewError}</p>}
                  <button
                    style={{
                      ...styles.modalSubmitBtn,
                      opacity: reviewSending ? 0.6 : 1,
                      cursor: reviewSending ? "not-allowed" : "pointer",
                    }}
                    onClick={handleSubmitReview}
                    disabled={reviewSending}
                  >
                    {reviewSending ? "Sending..." : "Submit review"}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Navbar */}
        <nav style={styles.nav}>
          <div style={styles.navInner}>
            <div style={styles.navLeft}>
              <img src={logo} alt="Soptera logo" style={styles.navLogo} />
              <span style={styles.navName}>Soptera</span>
              <span style={styles.navBeta}>Beta</span>
            </div>
            <div style={styles.navRight}>
              <span style={styles.navLink} onClick={openReview}>Review us</span>
              <span style={styles.navLink} onClick={handleReachOut}>Reach out</span>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <div style={styles.hero}>
          <p style={styles.heroEyebrow}>Version b1</p>
          <h1 style={styles.heroTitle}>Translate code.<br />Keep the logic.</h1>
          <p style={styles.heroSub}>
            Paste your code, choose a target language, and get an idiomatic
            translation in seconds. Built for developers who think beyond one language.
          </p>
        </div>

        {/* Translator Card */}
        <div style={styles.card}>

          {/* Toolbar */}
          <div style={styles.toolbar}>

            <button
              style={{
                ...styles.thinkingBtn,
                border: thinkingMode
                  ? "1px solid rgba(255,255,255,0.5)"
                  : "1px solid rgba(255,255,255,0.15)",
                color: thinkingMode ? "#ffffff" : "rgba(255,255,255,0.35)",
                background: "transparent",
              }}
              onClick={() => setThinkingMode(!thinkingMode)}
            >
              <img
                src={thinkingMode ? thinkingActive : thinkingInactive}
                alt="thinking"
                style={styles.thinkingIcon}
              />
              Thinking
            </button>

            <div style={styles.selectorGroup}>
              <label style={styles.label}>From</label>
              <select style={styles.select} value={sourceLang} onChange={handleSourceChange}>
                {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>

            <div style={styles.btnWrapper}>
              <button
                style={{
                  ...styles.translateBtn,
                  opacity: isDisabled ? 0.4 : 1,
                  cursor: isDisabled ? "not-allowed" : "pointer",
                }}
                onClick={handleTranslate}
                disabled={isDisabled}
              >
                {loading ? (
                  <span style={styles.btnInner}>
                    <span style={styles.spinner} />
                    Translating...
                  </span>
                ) : "Translate"}
              </button>
            </div>

            <div style={styles.selectorGroup}>
              <label style={styles.label}>To</label>
              <select style={styles.select} value={targetLang} onChange={(e) => setTargetLang(e.target.value)}>
                {PAIRS[sourceLang].map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>

          </div>

          {/* Error */}
          {error && <div style={styles.error}>{error}</div>}

          {/* Panels */}
          <div style={styles.panels}>

            {/* Input */}
            <div style={styles.panelWrapper}>
              <div style={styles.panelHeader}>
                <span style={styles.panelLang}>{sourceLang}</span>
                <span style={{
                  ...styles.counter,
                  color: isOverLimit ? "#ffaaaa" : "rgba(255,255,255,0.4)"
                }}>
                  {lineCount} lines · {charCount} / 12,000
                </span>
              </div>
              <div style={styles.codeWrapper}>
                <SyntaxHighlighter
                  language={LANG_MAP[sourceLang]}
                  style={atomOneDark}
                  customStyle={styles.syntaxHighlighter}
                  wrapLongLines={false}
                >
                  {inputCode || " "}
                </SyntaxHighlighter>
                <textarea
                  style={styles.codeOverlay}
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  spellCheck={false}
                  placeholder={`Paste your ${sourceLang} code here...`}
                />
              </div>
            </div>

            {/* Divider */}
            <div style={styles.divider} />

            {/* Output */}
            <div style={styles.panelWrapper}>
              <div style={styles.panelHeader}>
                <span style={styles.panelLang}>{targetLang}</span>
                {outputCode && (
                  <button style={styles.copyBtn} onClick={handleCopy}>
                    {copied ? "Copied ✓" : "Copy"}
                  </button>
                )}
              </div>
              <div style={styles.codeWrapper}>
                <SyntaxHighlighter
                  language={LANG_MAP[targetLang]}
                  style={atomOneDark}
                  customStyle={styles.syntaxHighlighter}
                  wrapLongLines={false}
                >
                  {outputCode || " "}
                </SyntaxHighlighter>
              </div>
            </div>

            {/* Thinking panel */}
            {thinkingMode && (
              <>
                <div style={styles.divider} />
                <div style={{ ...styles.panelWrapper, animation: "slideIn 0.3s ease" }}>
                  <div style={styles.panelHeader}>
                    <span style={styles.panelLang}>
                      <img
                        src={thinkingActive}
                        alt=""
                        style={{ width: 18, height: 18, marginRight: 6, verticalAlign: "middle", mixBlendMode: "lighten" }}
                      />
                      Thinking
                    </span>
                  </div>
                  <div style={styles.thinkingPanel}>
                    {thinkingLoading ? (
                      <p style={styles.thinkingFiller}>Analysing translation decisions...</p>
                    ) : thinking ? (
                      <div style={{ animation: "fadeIn 0.4s ease" }}>
                        {parseBullets(displayedThinking).map((bullet, i) => (
                          <div key={i} style={styles.bulletRow}>
                            <span style={styles.bulletDot}>•</span>
                            <p style={styles.bulletText}>{renderBulletText(bullet)}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={styles.thinkingFiller}>Translate with thinking mode on to see the reasoning behind the translation.</p>
                    )}
                  </div>
                </div>
              </>
            )}

          </div>

          {/* Disclaimer */}
          <p style={styles.disclaimer}>
            Always recheck translated code before usage. · Soptera can make mistakes.
          </p>

        </div>

        {/* Footer */}
        <footer style={styles.footer}>
          <span>© 2025 Soptera · Built for developers</span>
          <span>Powered by change</span>
        </footer>

      </div>
    </>
  );
}

const styles = {
  page: {
    fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    background: "#242424",
    minHeight: "100vh",
    color: "#ffffff",
    display: "flex",
    flexDirection: "column",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    backdropFilter: "blur(4px)",
  },
  modal: {
    background: "#1e1e1e",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "16px",
    padding: "32px",
    width: "100%",
    maxWidth: "420px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: "17px",
    fontWeight: "600",
    color: "#ffffff",
  },
  modalX: {
    fontSize: "14px",
    color: "rgba(255,255,255,0.4)",
    cursor: "pointer",
  },
  modalSub: {
    fontSize: "14px",
    color: "rgba(255,255,255,0.5)",
  },
  stars: {
    display: "flex",
    gap: "8px",
  },
  star: {
    fontSize: "32px",
    cursor: "pointer",
    transition: "color 0.1s",
    userSelect: "none",
  },
  modalTextarea: {
    padding: "12px",
    fontSize: "13px",
    fontFamily: "'DM Sans', sans-serif",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    background: "rgba(255,255,255,0.05)",
    color: "#ffffff",
    resize: "none",
    height: "100px",
    outline: "none",
  },
  modalError: {
    fontSize: "12px",
    color: "#ffcccc",
  },
  modalSubmitBtn: {
    padding: "10px",
    fontSize: "14px",
    fontWeight: "500",
    background: "#ffffff",
    color: "#242424",
    border: "none",
    borderRadius: "8px",
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
  },
  modalSuccess: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    padding: "16px 0",
  },
  modalSuccessIcon: {
    fontSize: "32px",
    color: "#ffffff",
  },
  modalSuccessTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#ffffff",
  },
  modalSuccessSub: {
    fontSize: "14px",
    color: "rgba(255,255,255,0.5)",
  },
  modalCloseBtn: {
    marginTop: "8px",
    padding: "8px 24px",
    fontSize: "13px",
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "8px",
    color: "#ffffff",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },

  nav: {
    padding: "0 48px",
    height: "64px",
    display: "flex",
    alignItems: "center",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    background: "#242424",
  },
  navInner: {
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  navLogo: {
    width: "44px",
    height: "44px",
    objectFit: "contain",
    mixBlendMode: "lighten",
  },
  navName: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#ffffff",
    letterSpacing: "-0.3px",
  },
  navBeta: {
    fontSize: "11px",
    fontWeight: "500",
    background: "rgba(255,255,255,0.1)",
    color: "rgba(255,255,255,0.7)",
    padding: "2px 9px",
    borderRadius: "20px",
    letterSpacing: "0.4px",
  },
  navRight: {
    display: "flex",
    gap: "40px",
  },
  navLink: {
    fontSize: "14px",
    color: "rgba(255,255,255,0.5)",
    cursor: "pointer",
    fontWeight: "400",
  },

  hero: {
    textAlign: "center",
    padding: "64px 24px 44px",
    maxWidth: "600px",
    margin: "0 auto",
  },
  heroEyebrow: {
    fontSize: "12px",
    fontWeight: "500",
    color: "rgba(255,255,255,0.4)",
    letterSpacing: "1.2px",
    textTransform: "uppercase",
    marginBottom: "16px",
  },
  heroTitle: {
    fontSize: "44px",
    fontWeight: "600",
    letterSpacing: "-1px",
    lineHeight: "1.15",
    color: "#ffffff",
    marginBottom: "16px",
  },
  heroSub: {
    fontSize: "16px",
    color: "rgba(255,255,255,0.5)",
    lineHeight: "1.75",
    fontWeight: "300",
  },

  card: {
    maxWidth: "1160px",
    margin: "0 auto 40px",
    width: "calc(100% - 96px)",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "16px",
    padding: "28px",
  },

  toolbar: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: "20px",
    marginBottom: "22px",
  },
  thinkingBtn: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    padding: "0 14px",
    height: "38px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    transition: "all 0.2s",
  },
  thinkingIcon: {
    width: "22px",
    height: "22px",
    objectFit: "contain",
    mixBlendMode: "lighten",
  },
  selectorGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  btnWrapper: {
    paddingBottom: "0px",
  },
  label: {
    fontSize: "11px",
    color: "rgba(255,255,255,0.4)",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
  },
  select: {
    padding: "9px 14px",
    fontSize: "14px",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "8px",
    background: "rgba(255,255,255,0.08)",
    color: "#ffffff",
    cursor: "pointer",
    minWidth: "120px",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: "400",
    height: "38px",
  },
  translateBtn: {
    padding: "0 28px",
    fontSize: "14px",
    fontWeight: "500",
    background: "#ffffff",
    color: "#242424",
    border: "none",
    borderRadius: "8px",
    fontFamily: "'DM Sans', sans-serif",
    minWidth: "145px",
    letterSpacing: "0.1px",
    height: "38px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  btnInner: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    justifyContent: "center",
  },
  spinner: {
    width: "12px",
    height: "12px",
    border: "2px solid rgba(255,255,255,0.2)",
    borderTop: "2px solid #242424",
    borderRadius: "50%",
    display: "inline-block",
    animation: "spin 0.8s linear infinite",
  },

  panels: {
    display: "flex",
    gap: "0",
    height: "440px",
  },
  panelWrapper: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    minWidth: 0,
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  panelLang: {
    fontSize: "13px",
    fontWeight: "500",
    color: "rgba(255,255,255,0.5)",
    display: "flex",
    alignItems: "center",
  },
  divider: {
    width: "1px",
    background: "rgba(255,255,255,0.1)",
    margin: "0 20px",
    flexShrink: 0,
  },

codeWrapper: {
    flex: 1,
    position: "relative",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.1)",
    overflow: "hidden",
},
syntaxHighlighter: {
    margin: 0,
    padding: "16px",
    minHeight: "100%",
    height: "100%",
    background: "rgba(255,255,255,0.05)",
    fontSize: "13px",
    fontFamily: "'DM Mono', 'Menlo', 'Monaco', monospace",
    lineHeight: "1.65",
    overflow: "auto",
},
  codeOverlay: {
    position: "absolute",
    inset: 0,
    padding: "16px",
    fontSize: "13px",
    fontFamily: "'DM Mono', 'Menlo', 'Monaco', monospace",
    lineHeight: "1.65",
    background: "transparent",
    color: "transparent",
    caretColor: "#ffffff",
    border: "none",
    resize: "none",
    outline: "none",
    zIndex: 2,
    width: "100%",
    height: "100%",
  },

  counter: {
    fontSize: "12px",
    transition: "color 0.2s",
  },
  copyBtn: {
    padding: "5px 14px",
    fontSize: "12px",
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "6px",
    cursor: "pointer",
    color: "#ffffff",
    fontFamily: "'DM Sans', sans-serif",
  },
  error: {
    background: "rgba(255,100,100,0.1)",
    border: "1px solid rgba(255,100,100,0.25)",
    color: "#ffcccc",
    borderRadius: "8px",
    padding: "10px 16px",
    fontSize: "13px",
    marginBottom: "16px",
    textAlign: "center",
  },
  disclaimer: {
    fontSize: "11px",
    color: "rgba(255,255,255,0.2)",
    textAlign: "center",
    marginTop: "16px",
  },

  thinkingPanel: {
    flex: 1,
    padding: "16px",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.03)",
    overflowY: "auto",
  },
  bulletRow: {
    display: "flex",
    gap: "10px",
    marginBottom: "14px",
  },
  bulletDot: {
    color: "rgba(255,255,255,0.3)",
    fontSize: "16px",
    flexShrink: 0,
    marginTop: "1px",
  },
  bulletText: {
    fontSize: "13px",
    color: "rgba(255,255,255,0.7)",
    lineHeight: "1.8",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: "300",
  },
  bulletKeyword: {
    color: "#79b8ff",
    fontFamily: "'DM Mono', monospace",
    fontSize: "12px",
  },
  thinkingFiller: {
    fontSize: "13px",
    color: "rgba(255,255,255,0.25)",
    lineHeight: "1.8",
    fontFamily: "'DM Sans', sans-serif",
    fontStyle: "italic",
  },

  footer: {
    marginTop: "auto",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    padding: "20px 48px",
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    color: "rgba(255,255,255,0.3)",
  },
};
