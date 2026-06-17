/* ============================================================
   RECO — vanilla JS prototype
   A recovery companion that acts as a mirror.
   AI responses are simulated for this static demo (see aiRespond).
   ============================================================ */

// ---- State ----
const state = {
  screen: "welcome",
  onbStep: 0,
  // account
  userName: "", userEmail: "", userUsername: "", userPassword: "",
  // profile
  whatBrings: [],          // selected entry points
  whatBringsText: "",      // optional free text
  coreValue: "",
  companionName: "Reco",
  tone: 50,                // 0 soft reflection .. 100 sharp reflection
  sponsorName: "", sponsorContact: "",
  // daily
  todayState: null,        // okay | struggling | fighting | celebrating
  sobrietyDate: "April 19, 2025",
  sobrietyDays: 15,
  // transient
  journalEntries: [
    { date: "may 1", preview: "had a hard morning but i made it through without...", response: "that you made it through — that's the whole thing. you didn't need it to be easy. you just needed to not give up, and you didn't." },
    { date: "apr 29", preview: "felt clear today. went for a walk instead of...", response: "clarity like that doesn't come from nowhere. you chose the walk. small choices like that are how you become the person you described to me." },
  ],
};

const root = document.getElementById("root");
const fab = document.getElementById("breathe-fab");

// ---- Helpers ----
const C = {
  cream: "#f5ede0", cream2: "#ede0cd", cream3: "#e2d2bc",
  ink: "#3d2f24", inkSoft: "#6b5849", inkFaint: "#9a8775",
  ember: "#a64d2e", sage: "#7a9270", amber: "#c89860",
};

function el(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstChild;
}

function clear() { root.innerHTML = ""; }

function go(screen) { state.screen = screen; render(); }

function showFab(show) { fab.classList.toggle("hidden", !show); }

// Lowercase the companion name for display
function cn() { return (state.companionName || "Reco").toLowerCase(); }

// ---- Simulated AI (profile-aware) ----
// Replace this with a real backend call when you deploy with a server.
function aiRespond(kind, userText) {
  const v = state.coreValue || "what matters to you";
  const soft = state.tone < 40;
  const sharp = state.tone > 70;

  const pools = {
    journal: [
      `there's real honesty in what you just wrote. naming it like that is the work most people avoid for years. keep coming back to ${v} — it's the thread running through everything you said.`,
      `i hear you. what stands out is how clearly you can see yourself in this. that kind of self-awareness is exactly what becoming who you described requires. you're closer than it feels.`,
      `thank you for putting that on the page. this matters more than it seems right now — one day you'll read it back and see the moment something started to shift. ${v} is in here, even where you didn't name it.`,
    ],
    conversation: [
      `i'm here. tell me more about that — what was underneath it?`,
      `that makes sense. you said ${v} matters to you. how does this moment line up with that?`,
      `i'm not going anywhere. what would the version of you that you described do right now?`,
    ],
    sos: [
      `okay. you reached out instead of disappearing — that already changes this moment. let's slow it down. breathe in for four, hold, out for six. this urge is a wave, not a command. it will crest and pass, usually inside twenty minutes. you don't have to fight it. just don't feed it. stay with me. you said ${v} matters — this is what protecting it looks like, right now.`,
      `i've got you. notice where you feel this in your body and just name it — tight chest, restless hands, whatever it is. you're not in danger. this feeling is allowed to be here without you acting on it. you've made it ${state.sobrietyDays} days. that version of you is still here. one breath at a time.`,
    ],
    relapse: [
      `thank you for telling me. that took more courage than acting out ever did. this isn't the end of anything — it's information. something led here, and now we get to understand it instead of hiding from it. you are still the person who wants ${v}. that didn't disappear. for the next 24 hours, just do one thing: reach out to one person you trust and say you had a hard day. that's it. i'm still here.`,
    ],
    meeting: [
      `showing up is the work, and you showed up. that takeaway is worth sitting with — let it stay with you today. this is how ${v} gets built, one room at a time.`,
    ],
  };

  let arr = pools[kind] || pools.conversation;
  let text = arr[Math.floor(Math.random() * arr.length)];

  // tone flavor
  if (sharp && kind !== "relapse") {
    text = text.replace(/i'm not going anywhere\.?/i, "no softening this one.");
  }
  return new Promise(res => setTimeout(() => res(text), 1100 + Math.random() * 900));
}

// ============================================================
// MORPHING FIGURE (tone slider)
// ============================================================
function morphStyle(tone) {
  // sharp (100) = perfect sphere; soft (0) = asymmetric blob
  const t = tone / 100;
  const asym = 1 - t; // 1 at soft, 0 at sharp
  const r1 = 50 - asym * 18;
  const r2 = 50 + asym * 12;
  const r3 = 50 - asym * 8;
  const r4 = 50 + asym * 16;
  const hueR = 220 - t * 60;
  const hueG = 145 - t * 50;
  const hueB = 110 - t * 50;
  const speed = 9 - t * 4;
  const opacity = 0.7 + t * 0.25;
  const scale = 1.0 + t * 0.12;
  return { r1, r2, r3, r4, hueR, hueG, hueB, speed, opacity, scale };
}

function toneLabel(tone) {
  return tone < 25 ? "softly reflected"
    : tone < 50 ? "gently reflected"
    : tone < 75 ? "clearly reflected"
    : "sharply reflected";
}
function toneSubtext(tone) {
  return tone < 25 ? "i will hold up the mirror with care"
    : tone < 50 ? "i will reflect what you said with warmth"
    : tone < 75 ? "i will show you what you said without softening it"
    : "i will hold up the mirror without flinching";
}

// ============================================================
// RENDER
// ============================================================
function render() {
  clear();
  showFab(false);
  const s = state.screen;

  if (s === "welcome")      return renderWelcome();
  if (s === "login")        return renderLogin();
  if (s === "onboarding")   return renderOnboarding();
  if (s === "home")         return renderHome();
  if (s === "journal")      return renderJournal();
  if (s === "conversation") return renderConversation();
  if (s === "sos")          return renderSOS();
  if (s === "relapse")      return renderRelapse();
  if (s === "meeting")      return renderMeeting();
  if (s === "looking-back") return renderLookingBack();
  if (s === "settings")     return renderSettings();
}

// ---- WELCOME ----
function renderWelcome() {
  const scr = el(`<div class="screen" style="align-items:center;justify-content:space-between;padding:80px 32px 40px;text-align:center;"></div>`);
  scr.innerHTML = `
    <div class="fade-up" style="margin-top:60px;">
      <div style="width:80px;height:80px;border-radius:50%;background:radial-gradient(circle, #a64d2e33 0%, transparent 70%);display:flex;align-items:center;justify-content:center;margin:0 auto 32px;">
        <div class="breathing-circle" style="width:44px;height:44px;border-radius:50%;background:${C.ember};"></div>
      </div>
      <h1 style="font-size:44px;font-weight:300;letter-spacing:6px;margin:0 0 12px;">${cn()}</h1>
      <p style="color:${C.inkSoft};font-size:15px;font-style:italic;">walk with me</p>
    </div>
    <div class="fade-up" style="width:100%;max-width:320px;animation-delay:0.3s;">
      <button class="btn-primary" id="w-start">get started</button>
      <button class="btn-outline" id="w-login" style="margin-top:12px;">log in</button>
    </div>
    <p style="color:${C.inkFaint};font-size:12px;font-style:italic;">everything you share stays between us</p>
  `;
  scr.querySelector("#w-start").onclick = () => { state.onbStep = 0; go("onboarding"); };
  scr.querySelector("#w-login").onclick = () => go("login");
  root.appendChild(scr);
}

// ---- LOGIN ----
function renderLogin() {
  const scr = el(`<div class="screen" style="padding:0 28px 40px;"></div>`);
  scr.innerHTML = `
    <div class="soft-header"><button id="lg-back">back</button></div>
    <div class="fade-up" style="flex:1;display:flex;flex-direction:column;justify-content:center;max-width:360px;margin:0 auto;width:100%;">
      <h2 style="font-size:28px;font-weight:300;margin:0 0 8px;text-align:center;">welcome back</h2>
      <p style="color:${C.inkSoft};font-size:14px;font-style:italic;margin:0 0 40px;text-align:center;">good to see you again</p>
      <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:24px;">
        <input class="input-field" type="text" placeholder="email or username" />
        <input class="input-field" type="password" placeholder="password" />
      </div>
      <button class="btn-primary" id="lg-continue">continue</button>
      <button style="color:${C.inkSoft};font-size:13px;font-style:italic;margin-top:20px;">forgot password</button>
      <p style="text-align:center;color:${C.inkFaint};font-size:13px;margin:32px 0 0;font-style:italic;">
        new here? <button id="lg-start" style="color:${C.ember};font-style:italic;font-size:13px;text-decoration:underline;padding:0;">get started</button>
      </p>
    </div>
  `;
  scr.querySelector("#lg-back").onclick = () => go("welcome");
  scr.querySelector("#lg-continue").onclick = () => { state.todayState = null; go("home"); };
  scr.querySelector("#lg-start").onclick = () => { state.onbStep = 0; go("onboarding"); };
  root.appendChild(scr);
}

// ---- ONBOARDING ----
function renderOnboarding() {
  const step = state.onbStep;
  if (step === 0) return onbBreath();
  if (step === 1) return onbMirror();
  if (step === 2) return onbAccount();
  if (step === 3) return onbWhatBrings();
  if (step === 4) return onbValue();
  if (step === 5) return onbCalibrate();
}

function onbBreath() {
  const scr = el(`<div class="screen" style="align-items:center;justify-content:center;padding:40px 32px;text-align:center;"></div>`);
  scr.innerHTML = `
    <div class="fade-up">
      <p style="font-size:15px;color:${C.inkSoft};font-style:italic;margin-bottom:36px;line-height:1.6;max-width:320px;">whatever just happened — you're here now. that's enough.</p>
      <div style="width:180px;height:180px;border-radius:50%;background:radial-gradient(circle, #a64d2e22 0%, transparent 70%);display:flex;align-items:center;justify-content:center;margin:0 auto 56px;">
        <div class="breathing-circle" style="width:100px;height:100px;border-radius:50%;background:radial-gradient(circle, ${C.ember} 0%, #a64d2eaa 100%);opacity:0.7;"></div>
      </div>
      <p style="font-size:26px;font-weight:300;line-height:1.5;margin:0 0 56px;">take one breath with me.</p>
      <button class="btn-primary" id="o-next" style="width:auto;padding:16px 48px;">continue</button>
    </div>
  `;
  scr.querySelector("#o-next").onclick = () => { state.onbStep = 1; render(); };
  root.appendChild(scr);
}

function onbMirror() {
  const scr = el(`<div class="screen" style="padding:60px 28px 40px;"></div>`);
  scr.innerHTML = `
    <div class="fade-up" style="flex:1;display:flex;flex-direction:column;justify-content:center;">
      <p class="label-caps" style="margin-bottom:32px;">1 of 6</p>
      <p style="font-size:20px;font-weight:300;line-height:1.6;margin:0 0 24px;max-width:360px;">most tools in this space will track your streak, remind you of your goals, and make you feel like you failed every time you slip.</p>
      <p style="font-size:22px;font-weight:300;line-height:1.6;margin:0 0 24px;">that's not what this is.</p>
      <p style="font-size:19px;font-weight:300;line-height:1.65;margin:0 0 24px;color:${C.inkSoft};">i don't keep score. i don't lecture. i don't compare you to anyone else.</p>
      <p style="font-size:22px;font-weight:300;line-height:1.5;margin:0 0 24px;">i'm a mirror.</p>
      <p style="font-size:19px;font-weight:300;line-height:1.65;margin:0 0 24px;color:${C.inkSoft};font-style:italic;">everything i say back to you comes from what you tell me — who you said you wanted to be, what you said matters to you.</p>
      <p style="font-size:19px;font-weight:300;line-height:1.65;margin:0;color:${C.inkSoft};font-style:italic;">your job is to be honest with me. my job is to reflect that back so you can grow into the person you already know you want to be.</p>
    </div>
    <div style="display:flex;gap:12px;padding-top:20px;">
      <button id="o-back" style="padding:16px 24px;border-radius:100px;border:1.5px solid ${C.cream3};color:${C.inkSoft};font-size:14px;">back</button>
      <button class="btn-primary" id="o-next" style="flex:1;">i'm ready</button>
    </div>
  `;
  scr.querySelector("#o-back").onclick = () => { state.onbStep = 0; render(); };
  scr.querySelector("#o-next").onclick = () => { state.onbStep = 2; render(); };
  root.appendChild(scr);
}

function onbAccount() {
  const scr = el(`<div class="screen" style="padding:60px 28px 40px;"></div>`);
  scr.innerHTML = `
    <div class="fade-up" style="flex:1;">
      <p class="label-caps" style="margin-bottom:16px;">2 of 6</p>
      <h2 style="font-size:28px;font-weight:300;line-height:1.4;margin:0 0 12px;">let's set you up.</h2>
      <p style="color:${C.inkSoft};font-size:15px;font-style:italic;margin:0 0 32px;line-height:1.6;">so we can find each other again.</p>
      <div style="display:flex;flex-direction:column;gap:12px;">
        <input class="input-field" id="ac-name" type="text" placeholder="your first name" value="${state.userName}" />
        <input class="input-field" id="ac-email" type="email" placeholder="email" value="${state.userEmail}" />
        <input class="input-field" id="ac-user" type="text" placeholder="username" value="${state.userUsername}" />
        <input class="input-field" id="ac-pass" type="password" placeholder="password (6+ characters)" value="${state.userPassword}" />
      </div>
      <p style="color:${C.inkFaint};font-size:12px;font-style:italic;text-align:center;margin-top:20px;line-height:1.6;">your information stays private. always.</p>
    </div>
    <div style="display:flex;gap:12px;padding-top:20px;">
      <button id="o-back" style="padding:16px 24px;border-radius:100px;border:1.5px solid ${C.cream3};color:${C.inkSoft};font-size:14px;">back</button>
      <button class="btn-primary" id="o-next" style="flex:1;" disabled>continue</button>
    </div>
  `;
  const name = scr.querySelector("#ac-name");
  const email = scr.querySelector("#ac-email");
  const user = scr.querySelector("#ac-user");
  const pass = scr.querySelector("#ac-pass");
  const next = scr.querySelector("#o-next");
  const validate = () => {
    state.userName = name.value; state.userEmail = email.value;
    state.userUsername = user.value.replace(/\s/g, "").toLowerCase();
    user.value = state.userUsername;
    state.userPassword = pass.value;
    next.disabled = !(name.value.trim() && email.value.trim() && user.value.trim() && pass.value.length >= 6);
  };
  [name, email, user, pass].forEach(i => i.addEventListener("input", validate));
  validate();
  scr.querySelector("#o-back").onclick = () => { state.onbStep = 1; render(); };
  next.onclick = () => { if (!next.disabled) { state.onbStep = 3; render(); } };
  root.appendChild(scr);
}

function onbWhatBrings() {
  const opts = [
    "i keep doing something i don't want to do",
    "i feel like i'm living two versions of myself",
    "i've tried to stop before and it didn't stick",
    "i want to become someone i'm not yet",
    "something happened and i'm ready to change",
  ];
  const scr = el(`<div class="screen" style="padding:60px 28px 40px;"></div>`);
  scr.innerHTML = `
    <div class="fade-up" style="flex:1;">
      <p class="label-caps" style="margin-bottom:16px;">3 of 6</p>
      <h2 style="font-size:28px;font-weight:300;line-height:1.4;margin:0 0 12px;">what's true for you right now?</h2>
      <p style="color:${C.inkSoft};font-size:15px;font-style:italic;margin:0 0 28px;line-height:1.6;">choose what fits. there's no wrong answer here.</p>
      <div id="wb-opts" style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px;"></div>
      <textarea class="input-soft" id="wb-text" rows="3" placeholder="say more if you want to.">${state.whatBringsText}</textarea>
    </div>
    <div style="display:flex;gap:12px;padding-top:20px;">
      <button id="o-back" style="padding:16px 24px;border-radius:100px;border:1.5px solid ${C.cream3};color:${C.inkSoft};font-size:14px;">back</button>
      <button class="btn-primary" id="o-next" style="flex:1;" disabled>continue</button>
    </div>
  `;
  const optsWrap = scr.querySelector("#wb-opts");
  const next = scr.querySelector("#o-next");
  const text = scr.querySelector("#wb-text");
  const refresh = () => {
    next.disabled = !(state.whatBrings.length > 0 || text.value.trim());
  };
  opts.forEach(o => {
    const selected = state.whatBrings.includes(o);
    const b = el(`<button style="text-align:left;padding:16px 20px;border-radius:18px;border:1.5px solid ${selected ? C.ember : C.cream3};background:${selected ? '#f0dcc8' : C.cream};color:${C.ink};font-size:15px;line-height:1.4;">${o}</button>`);
    b.onclick = () => {
      if (state.whatBrings.includes(o)) state.whatBrings = state.whatBrings.filter(x => x !== o);
      else state.whatBrings.push(o);
      onbWhatBrings();
    };
    optsWrap.appendChild(b);
  });
  text.addEventListener("input", () => { state.whatBringsText = text.value; refresh(); });
  refresh();
  scr.querySelector("#o-back").onclick = () => { state.onbStep = 2; render(); };
  next.onclick = () => { if (!next.disabled) { state.onbStep = 4; render(); } };
  clear(); showFab(false); root.appendChild(scr);
}

function onbValue() {
  const suggested = ["faith","family","honesty","integrity","freedom","self-respect","clarity","discipline","presence","love","peace"];
  const scr = el(`<div class="screen" style="padding:60px 28px 40px;"></div>`);
  scr.innerHTML = `
    <div class="fade-up" style="flex:1;">
      <p class="label-caps" style="margin-bottom:16px;">4 of 6</p>
      <h2 style="font-size:28px;font-weight:300;line-height:1.4;margin:0 0 12px;">what matters most to you right now?</h2>
      <p style="color:${C.inkSoft};font-size:15px;font-style:italic;margin:0 0 28px;line-height:1.6;">just one. we'll discover the rest together.</p>
      <input class="input-soft" id="cv-input" style="text-align:center;font-size:22px;letter-spacing:1px;margin-bottom:24px;border-radius:100px;padding:18px;" placeholder="in one word..." value="${state.coreValue}" />
      <div id="cv-tags" style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;"></div>
    </div>
    <div style="display:flex;gap:12px;padding-top:20px;">
      <button id="o-back" style="padding:16px 24px;border-radius:100px;border:1.5px solid ${C.cream3};color:${C.inkSoft};font-size:14px;">back</button>
      <button class="btn-primary" id="o-next" style="flex:1;" disabled>continue</button>
    </div>
  `;
  const input = scr.querySelector("#cv-input");
  const tags = scr.querySelector("#cv-tags");
  const next = scr.querySelector("#o-next");
  const refresh = () => { next.disabled = !input.value.trim(); };
  suggested.forEach(v => {
    const sel = state.coreValue === v;
    const t = el(`<button style="padding:10px 18px;border-radius:100px;border:1.5px solid ${sel ? C.ember : C.cream3};background:${sel ? C.ember : 'transparent'};color:${sel ? 'white' : C.inkSoft};font-size:14px;font-style:italic;">${v}</button>`);
    t.onclick = () => { state.coreValue = v; onbValue(); };
    tags.appendChild(t);
  });
  input.addEventListener("input", () => { state.coreValue = input.value; refresh(); });
  refresh();
  scr.querySelector("#o-back").onclick = () => { state.onbStep = 3; render(); };
  next.onclick = () => { if (!next.disabled) { state.onbStep = 5; render(); } };
  clear(); showFab(false); root.appendChild(scr);
}

function onbCalibrate() {
  const m = morphStyle(state.tone);
  const scr = el(`<div class="screen" style="padding:60px 28px 40px;"></div>`);
  scr.innerHTML = `
    <div class="fade-up" style="flex:1;">
      <p class="label-caps" style="margin-bottom:16px;">5 of 6</p>
      <h2 style="font-size:26px;font-weight:300;line-height:1.4;margin:0 0 12px;">what should i call myself?</h2>
      <p style="color:${C.inkSoft};font-size:15px;font-style:italic;margin:0 0 24px;line-height:1.6;">and how should i reflect you back?</p>
      <input class="input-field" id="cal-name" style="text-align:center;font-size:20px;letter-spacing:1.5px;margin-bottom:28px;text-transform:lowercase;" value="${state.companionName}" />

      <div style="display:flex;justify-content:center;align-items:center;height:170px;margin-bottom:14px;position:relative;">
        <div style="position:absolute;width:180px;height:180px;background:radial-gradient(circle at 30% 30%, rgba(${m.hueR+30},${m.hueG+30},${m.hueB+30},${m.opacity*0.35}) 0%, transparent 60%);filter:blur(24px);transform:scale(${m.scale*1.2});transition:all 1s cubic-bezier(0.22,1,0.36,1);"></div>
        <div id="morph" style="width:140px;height:140px;background:linear-gradient(135deg, rgb(${m.hueR},${m.hueG},${m.hueB}) 0%, rgb(${Math.max(m.hueR-35,90)},${Math.max(m.hueG-35,60)},${Math.max(m.hueB-25,50)}) 100%);opacity:${m.opacity};transform:scale(${m.scale});transition:all 1s cubic-bezier(0.22,1,0.36,1);animation:morphFloat ${m.speed}s ease-in-out infinite, morphShape ${m.speed*1.5}s ease-in-out infinite;--r1:${m.r1}%;--r2:${m.r2}%;--r3:${m.r3}%;--r4:${m.r4}%;box-shadow:0 12px 40px rgba(${m.hueR},${m.hueG},${m.hueB},0.25);"></div>
      </div>

      <p id="cal-label" style="font-size:20px;text-align:center;font-weight:300;margin:0 0 6px;">${toneLabel(state.tone)}</p>
      <p id="cal-sub" style="font-size:13px;color:${C.inkSoft};text-align:center;font-style:italic;line-height:1.5;min-height:40px;padding:0 12px;">${toneSubtext(state.tone)}</p>

      <input type="range" min="0" max="100" id="cal-tone" value="${state.tone}" style="background:linear-gradient(to right, ${C.ember} 0%, ${C.ember} ${state.tone}%, ${C.cream3} ${state.tone}%, ${C.cream3} 100%);" />
      <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:11px;color:${C.inkFaint};font-style:italic;">
        <span>soft reflection</span><span>sharp reflection</span>
      </div>
    </div>
    <div style="display:flex;gap:12px;padding-top:20px;">
      <button id="o-back" style="padding:16px 24px;border-radius:100px;border:1.5px solid ${C.cream3};color:${C.inkSoft};font-size:14px;">back</button>
      <button class="btn-primary" id="o-next" style="flex:1;">begin</button>
    </div>
  `;
  const nameInput = scr.querySelector("#cal-name");
  nameInput.addEventListener("input", () => { state.companionName = nameInput.value || "Reco"; });
  const slider = scr.querySelector("#cal-tone");
  slider.addEventListener("input", () => {
    state.tone = Number(slider.value);
    // live update without full re-render to keep slider smooth
    const mm = morphStyle(state.tone);
    const morph = scr.querySelector("#morph");
    morph.style.background = `linear-gradient(135deg, rgb(${mm.hueR},${mm.hueG},${mm.hueB}) 0%, rgb(${Math.max(mm.hueR-35,90)},${Math.max(mm.hueG-35,60)},${Math.max(mm.hueB-25,50)}) 100%)`;
    morph.style.opacity = mm.opacity;
    morph.style.transform = `scale(${mm.scale})`;
    morph.style.setProperty("--r1", mm.r1 + "%");
    morph.style.setProperty("--r2", mm.r2 + "%");
    morph.style.setProperty("--r3", mm.r3 + "%");
    morph.style.setProperty("--r4", mm.r4 + "%");
    morph.style.animation = `morphFloat ${mm.speed}s ease-in-out infinite, morphShape ${mm.speed*1.5}s ease-in-out infinite`;
    scr.querySelector("#cal-label").textContent = toneLabel(state.tone);
    scr.querySelector("#cal-sub").textContent = toneSubtext(state.tone);
    slider.style.background = `linear-gradient(to right, ${C.ember} 0%, ${C.ember} ${state.tone}%, ${C.cream3} ${state.tone}%, ${C.cream3} 100%)`;
  });
  scr.querySelector("#o-back").onclick = () => { state.onbStep = 4; render(); };
  scr.querySelector("#o-next").onclick = () => { state.onbStep = 0; state.todayState = null; go("home"); };
  clear(); showFab(false); root.appendChild(scr);
}

// ---- HOME ----
function renderHome() {
  if (!state.todayState) return homeQuestion();
  if (state.todayState === "struggling" || state.todayState === "fighting") return homeStruggling();
  return homeSteady();
}

function homeQuestion() {
  const scr = el(`<div class="screen" style="align-items:center;justify-content:center;padding:40px 28px;"></div>`);
  scr.innerHTML = `
    <div class="fade-up" style="width:100%;display:flex;flex-direction:column;align-items:center;">
      <p class="label-caps" style="margin:0 0 24px;">day ${state.sobrietyDays}</p>
      <h1 style="font-size:36px;font-weight:300;margin:0 0 56px;text-align:center;">how are you?</h1>
      <div style="width:100%;max-width:340px;display:flex;flex-direction:column;gap:12px;">
        <button id="h-okay" style="padding:20px 24px;border-radius:100px;border:1.5px solid ${C.cream3};background:${C.cream};color:${C.ink};font-size:16px;text-align:left;">i'm okay</button>
        <button id="h-fighting" style="padding:20px 24px;border-radius:100px;border:1.5px solid #a64d2e66;background:${C.cream};color:${C.ink};font-size:16px;text-align:left;animation:pulseGlow 3s ease-in-out infinite;">i'm fighting something right now</button>
        <button id="h-struggling" style="padding:20px 24px;border-radius:100px;border:1.5px solid ${C.cream3};background:${C.cream};color:${C.ink};font-size:16px;text-align:left;">i'm struggling</button>
        <button id="h-good" style="padding:20px 24px;border-radius:100px;border:1.5px solid ${C.cream3};background:${C.cream};color:${C.ink};font-size:16px;text-align:left;">i'm here for something good</button>
      </div>
    </div>
  `;
  scr.querySelector("#h-okay").onclick = () => { state.todayState = "okay"; render(); };
  scr.querySelector("#h-fighting").onclick = () => { state.todayState = "fighting"; go("sos"); };
  scr.querySelector("#h-struggling").onclick = () => { state.todayState = "struggling"; render(); };
  scr.querySelector("#h-good").onclick = () => { state.todayState = "celebrating"; render(); };
  root.appendChild(scr);
  showFab(true); fab.onclick = openBreathing;
}

function homeStruggling() {
  const scr = el(`<div class="screen"></div>`);
  scr.innerHTML = `
    <div class="soft-header"><button id="st-close">not now</button></div>
    <div class="fade-up" style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px 28px;text-align:center;">
      <div style="width:120px;height:120px;border-radius:50%;background:radial-gradient(circle, #a64d2e22 0%, transparent 70%);display:flex;align-items:center;justify-content:center;margin-bottom:32px;">
        <div class="breathing-circle" style="width:60px;height:60px;border-radius:50%;background:radial-gradient(circle, ${C.ember} 0%, #a64d2eaa 100%);opacity:0.7;"></div>
      </div>
      <h2 style="font-size:28px;font-weight:300;margin:0 0 12px;">i'm here.</h2>
      <p style="color:${C.inkSoft};font-size:16px;font-style:italic;margin:0 0 40px;max-width:320px;line-height:1.6;">tell me what's happening. or just sit with me.</p>
      <div style="width:100%;max-width:340px;display:flex;flex-direction:column;gap:10px;">
        <button class="btn-primary" id="st-talk">talk to me</button>
        <button id="st-breathe" style="padding:18px 22px;border-radius:100px;border:1.5px solid ${C.cream3};background:${C.cream};color:${C.ink};font-size:15px;">just breathe with me</button>
        <button id="st-write" style="padding:18px 22px;border-radius:100px;border:1.5px solid ${C.cream3};background:${C.cream};color:${C.ink};font-size:15px;">write it out</button>
      </div>
      <p style="color:${C.inkFaint};font-size:12px;font-style:italic;margin-top:32px;">had a hard moment? <button id="st-relapse" style="color:${C.ember};font-style:italic;font-size:12px;text-decoration:underline;padding:0;">tell me here.</button></p>
    </div>
  `;
  scr.querySelector("#st-close").onclick = () => { state.todayState = null; render(); };
  scr.querySelector("#st-talk").onclick = () => go("conversation");
  scr.querySelector("#st-breathe").onclick = openBreathing;
  scr.querySelector("#st-write").onclick = () => go("journal");
  scr.querySelector("#st-relapse").onclick = () => go("relapse");
  root.appendChild(scr);
  showFab(true); fab.onclick = openBreathing;
}

function homeSteady() {
  const prompt = state.todayState === "celebrating"
    ? "what are you grateful for right now?"
    : "what's true for you today?";
  const scr = el(`<div class="screen" style="padding-bottom:100px;"></div>`);
  scr.innerHTML = `
    <div class="fade-up" style="padding:60px 28px 0;">
      <p class="label-caps" style="margin:0 0 6px;">day ${state.sobrietyDays}</p>
      <p style="color:${C.inkSoft};font-size:13px;font-style:italic;margin:0 0 40px;">since ${state.sobrietyDate.toLowerCase()}</p>
    </div>
    <div class="fade-up" style="padding:0 28px;margin-bottom:32px;animation-delay:0.15s;">
      <p class="label-caps" style="margin:0 0 12px;">${cn()} sees</p>
      <p style="font-size:22px;font-weight:300;line-height:1.55;margin:0;font-style:italic;">
        this is your fifteenth day. you wrote four times this week. ${state.coreValue ? state.coreValue + " is in everything you've said." : "something is steadying."}
      </p>
    </div>
    <div class="fade-up" style="padding:0 28px;margin-bottom:32px;animation-delay:0.3s;">
      <button id="hs-journal" style="width:100%;padding:28px 24px;background:${C.cream};border:1.5px solid ${C.cream3};border-radius:24px;text-align:left;">
        <p class="label-caps" style="margin:0 0 10px;">today's invitation</p>
        <p style="font-size:19px;margin:0;line-height:1.5;">${prompt}</p>
      </button>
    </div>
    <div class="fade-up" style="padding:0 28px;animation-delay:0.45s;display:flex;flex-direction:column;gap:10px;">
      <button class="soft-link" data-go="conversation">talk with me</button>
      <button class="soft-link" data-go="meeting">log a meeting</button>
      <button class="soft-link" data-go="looking-back">looking back</button>
    </div>
    <div style="position:fixed;bottom:0;left:0;right:0;max-width:440px;margin:0 auto;padding:16px 24px 28px;background:linear-gradient(to top, ${C.cream2} 30%, transparent 100%);display:flex;justify-content:space-around;font-family:var(--sans);font-size:12px;letter-spacing:0.5px;color:${C.inkSoft};">
      <button id="nav-home" style="color:${C.inkSoft};font-family:var(--sans);font-size:12px;">home</button>
      <span style="color:${C.inkFaint};">·</span>
      <button id="nav-back" style="color:${C.inkSoft};font-family:var(--sans);font-size:12px;">looking back</button>
      <span style="color:${C.inkFaint};">·</span>
      <button id="nav-settings" style="color:${C.inkSoft};font-family:var(--sans);font-size:12px;">settings</button>
    </div>
  `;
  scr.querySelector("#hs-journal").onclick = () => { state.journalSeed = prompt; go("journal"); };
  scr.querySelectorAll(".soft-link").forEach(b => {
    b.style.cssText = `width:100%;padding:18px 22px;background:transparent;border:1px solid ${C.cream3};border-radius:16px;color:${C.ink};font-size:15px;text-align:left;display:flex;justify-content:space-between;align-items:center;`;
    b.innerHTML = `<span>${b.textContent}</span><span style="color:${C.inkFaint};font-size:16px;">→</span>`;
    b.onclick = () => go(b.dataset.go);
  });
  scr.querySelector("#nav-home").onclick = () => { state.todayState = null; render(); };
  scr.querySelector("#nav-back").onclick = () => go("looking-back");
  scr.querySelector("#nav-settings").onclick = () => go("settings");
  root.appendChild(scr);
  showFab(true); fab.onclick = openBreathing;
}

// ---- JOURNAL ----
function renderJournal() {
  const seed = state.journalSeed || "";
  state.journalSeed = null;
  const scr = el(`<div class="screen"></div>`);
  scr.innerHTML = `
    <div class="soft-header"><button id="j-close">save and come back</button></div>
    <div style="flex:1;padding:20px 28px 40px;overflow-y:auto;" id="j-body">
      <div class="fade-up">
        ${seed ? `<p style="color:${C.inkSoft};font-size:17px;font-style:italic;margin:0 0 24px;line-height:1.6;">${seed}</p>` : ""}
        <textarea id="j-entry" class="input-soft" rows="12" style="border:none;background:transparent;padding:0;font-size:18px;line-height:1.7;margin-bottom:24px;" placeholder="${seed ? '' : "write whatever's there..."}"></textarea>
        <button class="btn-primary" id="j-submit" disabled>share with ${cn()}</button>
      </div>
    </div>
  `;
  const entry = scr.querySelector("#j-entry");
  const submit = scr.querySelector("#j-submit");
  entry.addEventListener("input", () => { submit.disabled = !entry.value.trim(); });
  scr.querySelector("#j-close").onclick = () => go(state.todayState ? "home" : "home");
  submit.onclick = async () => {
    const text = entry.value.trim();
    if (!text) return;
    const body = scr.querySelector("#j-body");
    body.innerHTML = `
      <div class="fade-up">
        <p class="label-caps" style="margin:0 0 14px;">${cn()}</p>
        <div id="j-loading" style="width:40px;height:40px;border-radius:50%;background:radial-gradient(circle, #a64d2eaa 0%, transparent 70%);animation:breathe 3s ease-in-out infinite;margin:0 0 20px;"></div>
      </div>`;
    const resp = await aiRespond("journal", text);
    state.journalEntries.unshift({ date: "today", preview: text.slice(0,60) + (text.length>60?"...":""), response: resp });
    body.innerHTML = `
      <div class="fade-up">
        <p class="label-caps" style="margin:0 0 14px;">${cn()}</p>
        <p style="font-size:19px;line-height:1.7;margin:0 0 32px;font-weight:300;">${resp}</p>
        <button class="btn-outline" id="j-again" style="margin-bottom:12px;">write another</button>
        <button class="btn-primary" id="j-done">close</button>
      </div>`;
    body.querySelector("#j-again").onclick = () => go("journal");
    body.querySelector("#j-done").onclick = () => go("home");
  };
  root.appendChild(scr);
  showFab(true); fab.onclick = openBreathing;
}

// ---- CONVERSATION ----
function renderConversation() {
  const messages = [];
  const opening = (state.todayState === "struggling" || state.todayState === "fighting")
    ? "i'm here. tell me what's happening — or just say anything. there's no wrong way to start."
    : "what's on your mind?";
  const scr = el(`<div class="screen"></div>`);
  scr.innerHTML = `
    <div class="soft-header"><button id="cv-close">close</button></div>
    <div id="cv-scroll" style="flex:1;padding:10px 24px 20px;overflow-y:auto;">
      <div class="fade-up" style="margin-bottom:20px;">
        <p class="label-caps" style="margin:0 0 10px;">${cn()}</p>
        <p style="font-size:18px;line-height:1.6;margin:0;font-weight:300;">${opening}</p>
      </div>
    </div>
    <div style="padding:12px 16px 20px;display:flex;gap:10px;border-top:1px solid ${C.cream3};">
      <textarea id="cv-input" rows="1" class="input-field" style="flex:1;border-radius:100px;padding:14px 18px;max-height:100px;" placeholder="say anything..."></textarea>
      <button id="cv-send" style="width:48px;height:48px;border-radius:50%;background:${C.cream3};color:white;font-size:18px;flex-shrink:0;">↑</button>
    </div>
  `;
  const scroll = scr.querySelector("#cv-scroll");
  const input = scr.querySelector("#cv-input");
  const sendBtn = scr.querySelector("#cv-send");
  const refresh = () => { sendBtn.style.background = input.value.trim() ? C.ember : C.cream3; };
  input.addEventListener("input", refresh);
  input.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }});
  async function send() {
    const text = input.value.trim();
    if (!text) return;
    const userMsg = el(`<div class="fade-up" style="margin-bottom:20px;"><div style="background:${C.cream};padding:14px 18px;border-radius:20px 20px 6px 20px;margin-left:20%;border:1px solid ${C.cream3};"><p style="font-size:15px;margin:0;line-height:1.5;">${text}</p></div></div>`);
    scroll.appendChild(userMsg);
    input.value = ""; refresh();
    scroll.scrollTop = scroll.scrollHeight;
    const loading = el(`<div style="margin-bottom:20px;"><p class="label-caps" style="margin:0 0 8px;">${cn()}</p><div style="width:32px;height:32px;border-radius:50%;background:radial-gradient(circle, #a64d2eaa 0%, transparent 70%);animation:breathe 2.5s ease-in-out infinite;"></div></div>`);
    scroll.appendChild(loading);
    scroll.scrollTop = scroll.scrollHeight;
    const resp = await aiRespond("conversation", text);
    loading.remove();
    const botMsg = el(`<div class="fade-up" style="margin-bottom:20px;"><p class="label-caps" style="margin:0 0 8px;">${cn()}</p><p style="font-size:17px;line-height:1.6;margin:0;font-weight:300;">${resp}</p></div>`);
    scroll.appendChild(botMsg);
    scroll.scrollTop = scroll.scrollHeight;
  }
  sendBtn.onclick = send;
  scr.querySelector("#cv-close").onclick = () => go("home");
  root.appendChild(scr);
  showFab(false);
}

// ---- SOS ----
function renderSOS() {
  const cats = [
    { id:"pull",  label:"i'm feeling a strong pull right now", tech:"urge surfing" },
    { id:"emo",   label:"something set me off emotionally",     tech:"sober breathing space" },
    { id:"shame", label:"i'm spiraling in shame",               tech:"shame resilience" },
    { id:"alone", label:"i'm bored, lonely, or it's late",      tech:"connection grounding" },
  ];
  let selected = null;
  const scr = el(`<div class="screen"></div>`);
  scr.innerHTML = `
    <div class="soft-header"><button id="sos-close">not now</button></div>
    <div id="sos-body" style="flex:1;padding:8px 28px 40px;overflow-y:auto;">
      <div class="fade-up">
        <p style="font-size:20px;font-weight:300;line-height:1.6;margin:0 0 8px;">i'm here.</p>
        <p style="color:${C.inkSoft};font-size:14px;font-style:italic;margin:0 0 28px;line-height:1.6;">what kind of moment are you in? pick what fits — or just tell me.</p>
        <div id="sos-cats" style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px;"></div>
        <textarea id="sos-text" class="input-soft" rows="3" placeholder="or just tell me what's going on..."></textarea>
        <button class="btn-primary" id="sos-submit" style="margin-top:20px;" disabled>reach out to ${cn()}</button>
      </div>
    </div>
  `;
  const catsWrap = scr.querySelector("#sos-cats");
  const text = scr.querySelector("#sos-text");
  const submit = scr.querySelector("#sos-submit");
  const refresh = () => { submit.disabled = !(selected || text.value.trim()); };
  cats.forEach(c => {
    const b = el(`<button data-id="${c.id}" style="text-align:left;padding:16px 18px;border-radius:18px;border:1.5px solid ${C.cream3};background:${C.cream};color:${C.ink};font-size:15px;line-height:1.4;"><div>${c.label}</div></button>`);
    b.onclick = () => {
      selected = selected === c.id ? null : c.id;
      [...catsWrap.children].forEach(ch => {
        const on = ch.dataset.id === selected;
        ch.style.border = `1.5px solid ${on ? C.ember : C.cream3}`;
        ch.style.background = on ? "#f0dcc8" : C.cream;
        ch.querySelector(".tech")?.remove();
        if (on) ch.appendChild(el(`<div class="tech" style="margin-top:8px;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:${C.ember};font-family:var(--sans);">${c.tech}</div>`));
      });
      refresh();
    };
    catsWrap.appendChild(b);
  });
  text.addEventListener("input", refresh);
  scr.querySelector("#sos-close").onclick = () => { state.todayState = null; go("home"); };
  submit.onclick = async () => {
    const body = scr.querySelector("#sos-body");
    body.innerHTML = `
      <div class="fade-up">
        <p class="label-caps" style="margin:0 0 14px;">${cn()}</p>
        <p style="font-size:15px;color:${C.inkSoft};font-style:italic;margin:0 0 20px;">${cn()} is with you...</p>
        <div style="background:#ecdfc8;border-radius:16px;padding:16px;text-align:center;">
          <p style="color:${C.ink};font-size:14px;margin:0;line-height:1.8;">while you wait — take one slow breath.<br><span style="color:${C.inkSoft};font-style:italic;font-size:13px;">in through your nose. out through your mouth.</span></p>
        </div>
      </div>`;
    const resp = await aiRespond("sos", text.value);
    body.innerHTML = `
      <div class="fade-up">
        <p class="label-caps" style="margin:0 0 14px;">${cn()}</p>
        <p style="font-size:18px;line-height:1.8;margin:0 0 32px;font-weight:300;">${resp}</p>
        <button class="btn-outline" id="sos-more" style="margin-bottom:10px;">i need more support</button>
        <button class="btn-primary" id="sos-ok">i'm okay — back home</button>
      </div>`;
    body.querySelector("#sos-more").onclick = () => go("conversation");
    body.querySelector("#sos-ok").onclick = () => { state.todayState = null; go("home"); };
  };
  root.appendChild(scr);
  showFab(true); fab.onclick = openBreathing;
}

// ---- RELAPSE ----
function renderRelapse() {
  const scr = el(`<div class="screen"></div>`);
  scr.innerHTML = `
    <div class="soft-header"><button id="r-close">not now</button></div>
    <div id="r-body" style="flex:1;padding:8px 28px 60px;overflow-y:auto;">
      <div class="fade-up">
        <p class="label-caps" style="margin:0 0 16px;">safe space</p>
        <h2 style="font-size:26px;font-weight:300;margin:0 0 12px;line-height:1.4;">thank you for being here.</h2>
        <p style="color:${C.inkSoft};font-size:15px;font-style:italic;margin:0 0 32px;line-height:1.6;">this is the safest place in the app. what you share stays between you and ${cn()}. no judgment. no score. just honesty and what comes next.</p>
        <p style="font-size:15px;margin:0 0 8px;">when did this happen?</p>
        <input class="input-field" id="r-when" placeholder="today, last night, this morning..." style="margin-bottom:16px;" />
        <p style="font-size:15px;margin:0 0 8px;">what were you feeling beforehand?</p>
        <textarea class="input-soft" id="r-feel" rows="3" placeholder="stressed, lonely, numb..." style="margin-bottom:16px;"></textarea>
        <p style="font-size:15px;margin:0 0 8px;">what do you think led to it? <span style="color:${C.inkFaint};font-size:13px;font-style:italic;">(optional)</span></p>
        <textarea class="input-soft" id="r-led" rows="3" placeholder="a moment, a feeling, a time of day..." style="margin-bottom:24px;"></textarea>
        <p style="color:${C.inkFaint};font-size:13px;font-style:italic;text-align:center;margin:0 0 24px;line-height:1.6;">your date of sobriety moves to today.<br>your longest sobriety stays on record.</p>
        <button class="btn-primary" id="r-submit" disabled>tell ${cn()}</button>
      </div>
    </div>
  `;
  const when = scr.querySelector("#r-when");
  const submit = scr.querySelector("#r-submit");
  when.addEventListener("input", () => { submit.disabled = !when.value.trim(); });
  scr.querySelector("#r-close").onclick = () => { state.todayState = null; go("home"); };
  submit.onclick = async () => {
    const body = scr.querySelector("#r-body");
    body.innerHTML = `
      <div class="fade-up">
        <p class="label-caps" style="margin:0 0 14px;">${cn()}</p>
        <div style="width:40px;height:40px;border-radius:50%;background:radial-gradient(circle, #a64d2eaa 0%, transparent 70%);animation:breathe 3s ease-in-out infinite;margin:0 0 20px;"></div>
      </div>`;
    const resp = await aiRespond("relapse", "");
    state.sobrietyDays = 0;
    body.innerHTML = `
      <div class="fade-up">
        <p class="label-caps" style="margin:0 0 14px;">${cn()}</p>
        <p style="font-size:19px;line-height:1.75;margin:0 0 32px;font-weight:300;">${resp}</p>
        <button class="btn-primary" id="r-done">back to home</button>
      </div>`;
    body.querySelector("#r-done").onclick = () => { state.todayState = null; go("home"); };
  };
  root.appendChild(scr);
  showFab(true); fab.onclick = openBreathing;
}

// ---- MEETING ----
function renderMeeting() {
  const types = ["AA","NA","SAA","therapy","sponsor","other"];
  let selected = "";
  const scr = el(`<div class="screen"></div>`);
  scr.innerHTML = `
    <div class="soft-header"><button id="m-close">save and come back</button></div>
    <div id="m-body" style="flex:1;padding:8px 28px 60px;overflow-y:auto;">
      <div class="fade-up">
        <p class="label-caps" style="margin:0 0 12px;">log a meeting</p>
        <h2 style="font-size:26px;font-weight:300;margin:0 0 32px;line-height:1.3;">what was the meeting?</h2>
        <div id="m-types" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:32px;"></div>
        <p style="font-size:17px;margin:0 0 12px;line-height:1.5;">what's one thing you're taking with you?</p>
        <textarea class="input-soft" id="m-take" rows="5" placeholder="something that landed, something you heard..." style="margin-bottom:24px;"></textarea>
        <button class="btn-primary" id="m-submit" disabled>log meeting</button>
      </div>
    </div>
  `;
  const typesWrap = scr.querySelector("#m-types");
  const take = scr.querySelector("#m-take");
  const submit = scr.querySelector("#m-submit");
  const refresh = () => { submit.disabled = !(selected && take.value.trim()); };
  types.forEach(t => {
    const b = el(`<button style="padding:12px 20px;border-radius:100px;border:1.5px solid ${C.cream3};background:transparent;color:${C.ink};font-size:14px;">${t}</button>`);
    b.onclick = () => {
      selected = t;
      [...typesWrap.children].forEach((ch,i) => {
        const on = types[i] === selected;
        ch.style.border = `1.5px solid ${on ? C.ember : C.cream3}`;
        ch.style.background = on ? C.ember : "transparent";
        ch.style.color = on ? "white" : C.ink;
      });
      refresh();
    };
    typesWrap.appendChild(b);
  });
  take.addEventListener("input", refresh);
  scr.querySelector("#m-close").onclick = () => go("home");
  submit.onclick = async () => {
    const body = scr.querySelector("#m-body");
    body.innerHTML = `<div class="fade-up"><p class="label-caps" style="margin:0 0 14px;">${cn()}</p><div style="width:40px;height:40px;border-radius:50%;background:radial-gradient(circle, #a64d2eaa 0%, transparent 70%);animation:breathe 3s ease-in-out infinite;margin:0 0 20px;"></div></div>`;
    const resp = await aiRespond("meeting", take.value);
    body.innerHTML = `<div class="fade-up"><p class="label-caps" style="margin:0 0 14px;">${cn()}</p><p style="font-size:19px;line-height:1.7;margin:0 0 32px;font-weight:300;">${resp}</p><button class="btn-primary" id="m-done">back to home</button></div>`;
    body.querySelector("#m-done").onclick = () => go("home");
  };
  root.appendChild(scr);
  showFab(true); fab.onclick = openBreathing;
}

// ---- LOOKING BACK ----
function renderLookingBack() {
  const scr = el(`<div class="screen" style="padding-bottom:60px;"></div>`);
  scr.innerHTML = `
    <div class="soft-header"><button id="lb-close">back home</button></div>
    <div class="fade-up" style="padding:20px 28px;">
      <p class="label-caps" style="margin:0 0 8px;">looking back</p>
      <h2 style="font-size:28px;font-weight:300;margin:0 0 32px;line-height:1.3;">your last seven days</h2>

      <div style="background:${C.cream};border-radius:24px;padding:24px;border:1.5px solid ${C.cream3};margin-bottom:16px;">
        <p class="label-caps" style="margin:0 0 14px;">${cn()}'s reflection</p>
        <p style="font-size:17px;line-height:1.7;margin:0;font-style:italic;font-weight:300;">this was a steady week. you showed up four times to write, three times for meetings, and not once did you go silent on me. that's the work. ${state.coreValue || "what you said matters"} kept showing up in your words. keep going.</p>
      </div>

      <div style="background:${C.cream};border-radius:24px;padding:24px;border:1.5px solid ${C.cream3};margin-bottom:16px;">
        <p class="label-caps" style="margin:0 0 16px;">this week</p>
        ${stat("days of sobriety", state.sobrietyDays)}
        ${stat("journal entries", 4)}
        ${stat("meetings", 3)}
        ${stat("breaths taken with me", 11)}
      </div>

      <div style="background:${C.cream};border-radius:24px;padding:24px;border:1.5px solid ${C.cream3};margin-bottom:16px;">
        <p class="label-caps" style="margin:0 0 16px;">patterns ${cn()} noticed</p>
        ${pattern("your hardest moments clustered late at night — after 11pm", "time of day")}
        ${pattern("the days you wrote were the days you felt most steady", "journaling ↔ steadiness")}
      </div>

      <div style="background:${C.cream};border-radius:24px;padding:24px;border:1.5px solid ${C.cream3};">
        <p class="label-caps" style="margin:0 0 14px;">one thing to sit with</p>
        <p style="font-size:17px;line-height:1.7;margin:0;font-weight:300;">what would this week have looked like if the version of you that you described actually showed up every day?</p>
      </div>
    </div>
  `;
  scr.querySelector("#lb-close").onclick = () => go("home");
  root.appendChild(scr);
  showFab(true); fab.onclick = openBreathing;
}

function stat(label, value) {
  return `<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:14px;"><span style="font-size:14px;color:${C.inkSoft};font-style:italic;">${label}</span><span style="font-size:22px;font-weight:300;">${value}</span></div>`;
}
function pattern(text, tag) {
  return `<div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:12px;"><div style="width:6px;height:6px;border-radius:50%;background:${C.ember};margin-top:7px;flex-shrink:0;"></div><div><p style="font-size:14px;line-height:1.6;margin:0 0 3px;">${text}</p><p style="font-size:11px;letter-spacing:1px;margin:0;color:${C.inkFaint};font-family:var(--sans);">${tag}</p></div></div>`;
}

// ---- SETTINGS ----
function renderSettings() {
  const scr = el(`<div class="screen" style="padding-bottom:60px;"></div>`);
  scr.innerHTML = `
    <div class="soft-header"><button id="se-close">back home</button></div>
    <div class="fade-up" style="padding:20px 28px;">
      <p class="label-caps" style="margin:0 0 12px;">settings</p>
      <h2 style="font-size:28px;font-weight:300;margin:0 0 32px;line-height:1.3;">your space</h2>

      ${section("your companion", `<input class="input-field" id="se-name" style="text-align:center;font-size:20px;letter-spacing:1.5px;text-transform:lowercase;" value="${state.companionName}" />`)}

      ${section("how the mirror reflects you", `
        <p id="se-tonelabel" style="font-size:18px;margin:0 0 16px;font-style:italic;">${toneLabel(state.tone)}</p>
        <input type="range" min="0" max="100" id="se-tone" value="${state.tone}" style="background:linear-gradient(to right, ${C.ember} 0%, ${C.ember} ${state.tone}%, ${C.cream3} ${state.tone}%, ${C.cream3} 100%);" />
        <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:11px;color:${C.inkFaint};font-style:italic;"><span>soft reflection</span><span>sharp reflection</span></div>
      `)}

      ${section("what matters most", `<p style="font-size:20px;margin:0;font-style:italic;text-align:center;">${state.coreValue || "—"}</p>`)}

      ${section("date of sobriety", `<p style="font-size:16px;margin:0;text-align:center;">${state.sobrietyDate}</p>`)}

      <p style="color:${C.inkFaint};font-size:13px;font-style:italic;text-align:center;margin:32px 0 0;line-height:1.7;">everything you share stays between you and ${cn()}.<br>your journals, your conversations, your story — yours.</p>
    </div>
  `;
  scr.querySelector("#se-close").onclick = () => go("home");
  const nameInput = scr.querySelector("#se-name");
  nameInput.addEventListener("input", () => { state.companionName = nameInput.value || "Reco"; });
  const slider = scr.querySelector("#se-tone");
  slider.addEventListener("input", () => {
    state.tone = Number(slider.value);
    scr.querySelector("#se-tonelabel").textContent = toneLabel(state.tone);
    slider.style.background = `linear-gradient(to right, ${C.ember} 0%, ${C.ember} ${state.tone}%, ${C.cream3} ${state.tone}%, ${C.cream3} 100%)`;
  });
  root.appendChild(scr);
  showFab(true); fab.onclick = openBreathing;
}

function section(label, inner) {
  return `<div style="background:${C.cream};border-radius:20px;padding:20px 22px;border:1.5px solid ${C.cream3};margin-bottom:12px;"><p class="label-caps" style="margin:0 0 14px;">${label}</p>${inner}</div>`;
}

// ---- BREATHING OVERLAY ----
function openBreathing() {
  const overlay = el(`<div class="fade-in" style="position:absolute;inset:0;background:var(--ambientDeep);z-index:100;display:flex;flex-direction:column;align-items:center;justify-content:center;"></div>`);
  overlay.innerHTML = `
    <button id="br-close" style="position:absolute;top:20px;right:24px;color:${C.inkSoft};font-size:14px;font-family:var(--sans);letter-spacing:0.5px;">close</button>
    <div id="br-circle" style="width:200px;height:200px;border-radius:50%;background:radial-gradient(circle, #a64d2e33 0%, #a64d2e11 70%, transparent 100%);display:flex;align-items:center;justify-content:center;margin-bottom:40px;transition:transform 1s ease;">
      <div style="width:120px;height:120px;border-radius:50%;background:radial-gradient(circle, ${C.ember} 0%, #a64d2eaa 100%);opacity:0.3;"></div>
    </div>
    <p id="br-phase" style="font-size:28px;font-weight:300;letter-spacing:1px;margin:0;">inhale</p>
    <p id="br-count" style="font-size:48px;font-weight:200;color:${C.inkSoft};margin:8px 0 0;">4</p>
    <p style="position:absolute;bottom:40px;color:${C.inkFaint};font-size:13px;font-style:italic;">breathe with me as long as you need</p>
  `;
  document.getElementById("app-frame").appendChild(overlay);
  const phaseEl = overlay.querySelector("#br-phase");
  const countEl = overlay.querySelector("#br-count");
  const circle = overlay.querySelector("#br-circle");
  let phase = "inhale", secs = 4;
  circle.style.transform = "scale(1.1)";
  const iv = setInterval(() => {
    secs--;
    if (secs <= 0) {
      if (phase === "inhale") { phase = "hold"; secs = 2; circle.style.transform = "scale(1.1)"; }
      else if (phase === "hold") { phase = "exhale"; secs = 6; circle.style.transform = "scale(0.7)"; }
      else { phase = "inhale"; secs = 4; circle.style.transform = "scale(1.1)"; }
      phaseEl.textContent = phase;
    }
    countEl.textContent = secs;
  }, 1000);
  overlay.querySelector("#br-close").onclick = () => { clearInterval(iv); overlay.remove(); };
}

// ---- INIT ----
render();
