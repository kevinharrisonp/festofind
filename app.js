/* ==========================================================================
   FestoFind – app.js  (full, self-contained, no external frameworks)
   Features:
     - Real-time JSON persistence (localStorage & multi-tab sync)
     - Full authentication (Login, Register & Role Switcher)
     - Complete Event & Symposium management
     - Symposium Sub-Events: One-time all-access pass OR pay-per-event
     - Integrated payment service (UPI/QR, Card, Net Banking) & Digital Ticket Receipts
     - Real-time notification center for students & admin broadcast
     - CSV & full DB (.json) export
   ========================================================================== */

/* ==========================================================================
   1. CONSTANTS & SEED DATA
   ========================================================================== */

const CATS = [
  ["Symposium",  "🎤"],
  ["Hackathon",  "💻"],
  ["Workshop",   "🛠️"],
  ["Cultural",   "🎭"],
  ["Conference", "🎙️"],
  ["Sports",     "⚽"],
];

const EM = Object.fromEntries(CATS);

const GR = {
  Symposium: "#6c3ff5,#9b5cff",
  Hackathon: "#0ea5e9,#6366f1",
  Workshop: "#f59e0b,#ef4444",
  Cultural: "#ec4899,#f97316",
  Conference: "#14b8a6,#3b82f6",
  Sports: "#22c55e,#0d9488",
};

const uid = (prefix) => prefix + Math.random().toString(36).slice(2, 8);
const now = () => new Date().toISOString();
const today = () => new Date().toISOString().slice(0, 10);

const seed = () => ({
  users: [
    { id: "u1", name: "Nithish M", college: "New Prince Shri Bhavani College Of Engineering And Technology", email: "2024csenithishm@npsbcet.edu.in", department: "CSE", year: "3rd", password: "mrnithish", role: "student" },
    { id: "u2", name: "Kevin Harrison P", college: "FFIT", email: "2024csekevinharrisonp@npsbcet.edu.in", department: "CSE", year: "3rd", password: "mrkevin", role: "student" },
    { id: "u3", name: "Suresh K", college: "Anna University", email: "suresh@annauniv.edu", department: "IT", year: "2nd", password: "password123", role: "student" },
    { id: "a1", name: "Admin", college: "Administration", email: "admin@festofind.com", department: "Administration", year: "-", password: "admin123", role: "admin" },
  ],

  events: [
    {
      id: "e0",
      title: "AI Innovation Hackathon",
      category: "Hackathon",
      date: "2026-11-14",
      time: "09:00",
      venue: "Main Auditorium",
      description: "Join AI Innovation Hackathon — a 24-hour flagship campus hackathon with talks, hands-on mentorship, and networking with tech innovators.",
      banner: "",
      adminId: "a1",
      status: "published",
      maxParticipants: 120,
      fee: 150,
      pricingModel: "standard",
      createdAt: now(),
    },
    {
      id: "e1",
      title: "National Symposium 2026",
      category: "Symposium",
      date: "2026-11-02",
      time: "10:00",
      venue: "Seminar Hall A",
      description: "National Level Inter-College Technical & Non-Technical Symposium. Compete in exciting domain-specific tracks and showcase your engineering prowess.",
      banner: "",
      adminId: "a1",
      status: "published",
      maxParticipants: 200,
      fee: 200, // One-time all-access combo pass fee
      pricingModel: "one-time", // "one-time" (all access pass) or "per-event"
      subEvents: [
        { id: "se1", title: "Paper & PPT Presentation", type: "Technical", time: "10:30 AM", venue: "Hall A", fee: 80, description: "Present your original research paper in emerging tech domains." },
        { id: "se2", title: "Code Debugging & Algorush", type: "Technical", time: "11:30 AM", venue: "Lab 3", fee: 100, description: "Identify bugs, optimize code, and solve speed algorithmic challenges." },
        { id: "se3", title: "Technical Quiz & Brainstorm", type: "Technical", time: "01:30 PM", venue: "Seminar Room 1", fee: 60, description: "Rapid-fire buzzer quiz covering core CS, AI, and electronics." },
        { id: "se4", title: "Web & UI/UX Design Sprint", type: "Technical", time: "02:30 PM", venue: "Lab 2", fee: 80, description: "Build a stunning responsive web UI based on a surprise live brief." },
        { id: "se5", title: "Gaming Tournament (BGMI & FIFA)", type: "Non-Technical", time: "03:30 PM", venue: "Audi Lounge", fee: 80, description: "Fast-paced e-sports championship with cash pool prizes." }
      ],
      createdAt: now(),
    },
    {
      id: "e2",
      title: "Web Development Workshop",
      category: "Workshop",
      date: "2026-10-22",
      time: "14:00",
      venue: "Lab 3",
      description: "Hands-on Masterclass on Modern Full-Stack Web Development, APIs, and Cloud Deployment.",
      banner: "",
      adminId: "a1",
      status: "published",
      maxParticipants: 40,
      fee: 100,
      pricingModel: "standard",
      createdAt: now(),
    },
    {
      id: "e3",
      title: "Inter-College Cultural Fest",
      category: "Cultural",
      date: "2026-12-05",
      time: "16:00",
      venue: "Open Air Theatre",
      description: "Spectacular music, dance, dramatics, fashion show and battle of the bands.",
      banner: "",
      adminId: "a1",
      status: "published",
      maxParticipants: 500,
      fee: 0,
      pricingModel: "standard",
      createdAt: now(),
    },
    {
      id: "e4",
      title: "Sports Championship",
      category: "Sports",
      date: "2026-11-20",
      time: "08:00",
      venue: "Main Ground",
      description: "Annual inter-college track & field, football, basketball and badminton meet.",
      banner: "",
      adminId: "a1",
      status: "published",
      maxParticipants: 150,
      fee: 50,
      pricingModel: "standard",
      createdAt: now(),
    },
    {
      id: "e5",
      title: "Emerging Technology Conference",
      category: "Conference",
      date: "2026-09-10",
      time: "09:30",
      venue: "Convention Centre",
      description: "Keynotes from industry leaders on Generative AI, Quantum Computing, and Next-Gen Systems.",
      banner: "",
      adminId: "a1",
      status: "published",
      maxParticipants: 300,
      fee: 250,
      pricingModel: "standard",
      createdAt: now(),
    },
  ],

  regs: [
    { id: "r1", eventId: "e1", studentId: "u2", registeredAt: "2026-10-01T10:00:00Z", amountPaid: 200, paymentStatus: "paid", paymentMethod: "UPI", txnId: "TXN_FF_982410", subEvents: ["se1", "se2"] },
    { id: "r2", eventId: "e1", studentId: "u3", registeredAt: "2026-10-02T10:00:00Z", amountPaid: 200, paymentStatus: "paid", paymentMethod: "Card", txnId: "TXN_FF_772194", subEvents: ["se2", "se3"] },
    { id: "r3", eventId: "e5", studentId: "u1", registeredAt: "2026-08-20T10:00:00Z", amountPaid: 250, paymentStatus: "paid", paymentMethod: "UPI", txnId: "TXN_FF_119284", subEvents: [] },
  ],

  anns: [
    { id: "n1", eventId: "e1", adminId: "a1", title: "Venue confirmed", message: "Symposium sessions begin sharp at 10 AM. Carry your ID card.", createdAt: "2026-10-02T12:00:00Z" },
  ],

  notifications: [
    { id: "notif1", userId: "u1", eventId: "e5", title: "Payment Successful & Registered", message: "Your registration for Emerging Technology Conference is confirmed. Amount: ₹250 (TXN_FF_119284).", type: "payment", read: true, createdAt: "2026-08-20T10:00:00Z" },
    { id: "notif2", userId: "u2", eventId: "e1", title: "Payment Verified (All-Access Pass)", message: "You have registered for National Symposium 2026. One-time pass payment of ₹200 confirmed (TXN_FF_982410).", type: "payment", read: false, createdAt: "2026-10-01T10:00:00Z" },
    { id: "notif3", userId: "u2", eventId: "e1", title: "Symposium Announcement", message: "Symposium sessions begin sharp at 10 AM. Carry your ID card.", type: "announcement", read: false, createdAt: "2026-10-02T12:00:00Z" },
    { id: "notif4", userId: "u3", eventId: "e1", title: "Payment Verified (All-Access Pass)", message: "You have registered for National Symposium 2026. Payment of ₹200 confirmed (TXN_FF_772194).", type: "payment", read: false, createdAt: "2026-10-02T10:00:00Z" },
  ]
});


/* ==========================================================================
   2. STATE & PERSISTENCE
   ========================================================================== */

let DB;
try { DB = JSON.parse(localStorage.getItem("ff-db")); } catch (e) {}
DB = DB || seed();

// Schema migration safeguard for localStorage
if (!DB.notifications) DB.notifications = [];
DB.events.forEach((e) => {
  if (e.fee === undefined) e.fee = e.category === "Symposium" ? 200 : (e.category === "Cultural" ? 0 : 150);
  if (!e.pricingModel) e.pricingModel = e.category === "Symposium" ? "one-time" : "standard";
  if (e.category === "Symposium" && (!e.subEvents || !e.subEvents.length)) {
    e.subEvents = [
      { id: "se1", title: "Paper & PPT Presentation", type: "Technical", time: "10:30 AM", venue: "Hall A", fee: 80, description: "Present your original research paper in emerging tech domains." },
      { id: "se2", title: "Code Debugging & Algorush", type: "Technical", time: "11:30 AM", venue: "Lab 3", fee: 100, description: "Identify bugs, optimize code, and solve speed algorithmic challenges." },
      { id: "se3", title: "Technical Quiz & Brainstorm", type: "Technical", time: "01:30 PM", venue: "Seminar Room 1", fee: 60, description: "Rapid-fire buzzer quiz covering core CS, AI, and electronics." },
      { id: "se4", title: "Web & UI/UX Design Sprint", type: "Technical", time: "02:30 PM", venue: "Lab 2", fee: 80, description: "Build a stunning responsive web UI based on a surprise live brief." },
      { id: "se5", title: "Gaming Tournament (BGMI & FIFA)", type: "Non-Technical", time: "03:30 PM", venue: "Audi Lounge", fee: 80, description: "Fast-paced e-sports championship with cash pool prizes." }
    ];
  }
});

let me = null;
try { me = JSON.parse(localStorage.getItem("ff-me") || localStorage.getItem("ff-ses") || "null"); } catch (e) {}

const save = () => {
  try { localStorage.setItem("ff-db", JSON.stringify(DB)); } catch (e) {}
};

const ses = () => {
  try {
    me ? localStorage.setItem("ff-me", JSON.stringify(me))
       : localStorage.removeItem("ff-me");
  } catch (e) {}
};

// UI state
const S = {
  scr: me ? (me.mode ? me.mode : "choose") : "login",
  tab: "home",
  q: "",
  cat: "",
  eid: null,
  mod: null, // { t: "d" | "pay" | "receipt", id, ... }
  atab: "dash",
  mt: "Details",
  pop: 0,
  notifOpen: 0,
  rt: "Upcoming",
  pq: "",
};


/* ==========================================================================
   3. HELPERS
   ========================================================================== */

const $ = (sel) => document.querySelector(sel);

const toast = (msg) => {
  const d = document.createElement("div");
  d.className = "ts";
  d.textContent = msg;
  const box = document.getElementById("t");
  if (box) {
    box.append(d);
    setTimeout(() => d.remove(), 2800);
  }
};

const U = (id) => DB.users.find((u) => u.id == id) || { name: "Unknown", college: "-", department: "-", year: "-", email: "-" };
const E = (id) => DB.events.find((e) => e.id == id);
const cnt = (id) => DB.regs.filter((r) => r.eventId == id).length;
const isReg = (id) => Boolean(me && DB.regs.some((r) => r.eventId == id && r.studentId == me.id));
const mine = () => DB.events.filter((e) => e.adminId == (me ? me.id : ""));

const fd = (d) =>
  new Date(d + "T00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const esc = (s) =>
  String(s || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const logo = `<div class="logo"><i>F</i>FestoFind</div>`;

function go(patch) {
  Object.assign(S, patch);
  render();
}


/* ==========================================================================
   4. SHARED UI COMPONENTS
   ========================================================================== */

function banner(e, height) {
  const g = GR[e.category] || "#6c3ff5,#9b5cff";
  const bg = e.banner
    ? `background-image:url(${e.banner})`
    : `background:linear-gradient(135deg,${g})`;
  const h = height ? `height:${height}px` : "";
  return `<div class="b" style="${bg};${h}" role="img" aria-label="${esc(e.title)} banner">${e.banner ? "" : EM[e.category] || "🎉"}</div>`;
}

function card(e, i) {
  const full = cnt(e.id) >= e.maxParticipants;
  const registered = Boolean(me && me.role == "student" && isReg(e.id));
  const status = registered ? "✔ Registered" : full ? "Full" : "Open";
  const isSymp = e.category === "Symposium";

  let feeLabel = "Free";
  if (e.fee > 0) {
    feeLabel = isSymp && e.pricingModel === "one-time" ? `₹${e.fee} All-Access` : `₹${e.fee}`;
  } else if (isSymp && e.pricingModel === "per-event") {
    feeLabel = "Pay per event";
  }

  return `<article class="card ev" style="animation-delay:${(i || 0) * 50}ms">
    ${banner(e)}
    <div class="c">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span class="tag">${e.category}</span>
        <span class="fee-tag">${feeLabel}</span>
      </div>
      <b>${esc(e.title)}</b>
      <span class="mu">📅 ${fd(e.date)} · ${e.time}</span>
      <span class="mu">📍 ${esc(e.venue)}</span>
      <span class="mu">👥 ${cnt(e.id)}/${e.maxParticipants} · ${status}</span>
      <button class="btn" data-a="view" data-id="${e.id}">View Details</button>
    </div>
  </article>`;
}

function visible() {
  const q = S.q.toLowerCase();
  return DB.events.filter(
    (e) =>
      e.status == "published" &&
      (!S.cat || e.category == S.cat) &&
      (!q || [e.title, e.category, e.venue, e.description].join(" ").toLowerCase().includes(q))
  );
}

function results() {
  const v = visible();
  const filtering = S.cat || S.q;

  return `
    <h2>${filtering ? "Results (" + v.length + ")" : "Featured Events"}</h2>
    ${v.length
      ? `<div class="grid">${v.slice(0, filtering ? 99 : 3).map(card).join("")}</div>`
      : `<div class="card">No events found.</div>`}
    ${filtering
      ? ""
      : `<h2>Upcoming Events</h2>
         <div class="grid">${v.slice(3).map(card).join("")}</div>`}
  `;
}

function annList(anns) {
  if (!anns.length) return '<div class="card">No announcements yet.</div>';
  return anns
    .slice()
    .reverse()
    .map((n) => {
      const eventTitle = (E(n.eventId) || {}).title || "Event";
      const important = /venue|cancel|urgent|change/i.test(n.title) ? "<b>⚠ Important</b>" : "";
      return `<div class="card" style="margin-bottom:10px">
        <span class="tag">${esc(eventTitle)}</span> ${important}
        <h3 style="margin:6px 0">${esc(n.title)}</h3>
        <div>${esc(n.message)}</div>
        <div class="mu">${new Date(n.createdAt).toLocaleString()}</div>
      </div>`;
    })
    .join("");
}

function profile() {
  return `<div class="card">
    <div style="font-size:48px">🎓</div>
    <h2>${esc(me.name)}</h2>
    <p class="mu">${esc(me.college)}${me.role == "student" ? ` · ${me.department} · ${me.year} year` : ""}<br>${esc(me.email)}${me.role == "admin" ? "<br>Role: Admin" : ""}</p>
    <button class="btn d" data-a="out">Logout</button>
  </div>`;
}

function notifBell() {
  if (!me) return "";
  const myNotifs = (DB.notifications || []).filter((n) => n.userId === me.id || n.userId === "all");
  const unread = myNotifs.filter((n) => !n.read).length;
  const badge = unread > 0 ? `<span class="badge">${unread}</span>` : "";
  return `<button class="ic" style="position:relative" data-a="notif" title="Notifications" aria-label="Notifications">🔔${badge}</button>`;
}

function notifPanel() {
  if (!S.notifOpen || !me) return "";
  const list = (DB.notifications || []).filter((n) => n.userId === me.id || n.userId === "all");
  const unreadCount = list.filter((n) => !n.read).length;

  return `<div class="pop notif-pop" style="right:52px;top:54px;width:340px;max-height:420px;overflow-y:auto;padding:14px;z-index:30">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
      <b>🔔 Notifications ${unreadCount ? `(${unreadCount})` : ""}</b>
      ${unreadCount ? `<button class="btn-xs" data-a="notif-read-all">Mark all read</button>` : ""}
    </div>
    ${list.length ? list.map((n) => `
      <div class="notif-item ${n.read ? "" : "unread"}" data-a="notif-click" data-id="${n.id}" data-eid="${n.eventId || ""}">
        <div style="font-size:18px">${n.type === "payment" ? "💳" : (n.type === "announcement" ? "📢" : "🎉")}</div>
        <div style="flex:1">
          <div style="font-weight:600;font-size:13px">${esc(n.title)}</div>
          <div style="font-size:12px;color:var(--mu);margin-top:2px">${esc(n.message)}</div>
          <div style="font-size:11px;color:var(--mu);margin-top:4px">${new Date(n.createdAt).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})} · ${new Date(n.createdAt).toLocaleDateString([], {month:"short", day:"numeric"})}</div>
        </div>
        ${!n.read ? `<span class="dot"></span>` : ""}
      </div>
    `).join("") : '<div class="mu" style="padding:16px;text-align:center">No notifications yet.</div>'}
  </div>`;
}


/* ==========================================================================
   5. MODALS (DETAIL, PAYMENT CHECKOUT, TICKET RECEIPT)
   ========================================================================== */

// Event details modal with Symposium sub-event handling
function detail(e) {
  const registered = isReg(e.id);
  const myReg = registered ? DB.regs.find((r) => r.eventId == e.id && r.studentId == (me ? me.id : "")) : null;
  const full = cnt(e.id) >= e.maxParticipants;
  const isStudent = me && me.role == "student";
  const anns = DB.anns.filter((n) => n.eventId == e.id);
  const isSymp = e.category === "Symposium";

  const subs = e.subEvents || [];
  const pricingModel = e.pricingModel || (isSymp ? "one-time" : "standard");

  let sympHtml = "";
  if (isSymp && subs.length) {
    if (pricingModel === "one-time") {
      sympHtml = `
        <div class="card" style="background:#6c3ff514;border:1px solid #6c3ff540;margin:14px 0 10px;padding:14px">
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px">
            <span style="font-weight:700;color:var(--pr);font-size:15px">🎟️ One-Time All-Access Pass: ₹${e.fee}</span>
            <span class="tag" style="background:var(--pr);color:#fff">All-Access Pass</span>
          </div>
          <p class="mu" style="margin:6px 0 0;font-size:13px">Pay once (₹${e.fee}) and gain full eligibility to participate in <b>ANY or ALL</b> symposium events listed below!</p>
        </div>
        <h4 style="margin:14px 0 6px">Symposium Events (${subs.length} tracks)</h4>
        <div class="sub-list">
          ${subs.map((s) => `
            <div class="sub-card">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <b>${esc(s.title)}</b>
                <span class="tag">${s.type || "Technical"}</span>
              </div>
              <div class="mu" style="font-size:12px;margin:3px 0">⏰ ${s.time} · 📍 ${esc(s.venue)}</div>
              <div class="mu" style="font-size:13px">${esc(s.description || "")}</div>
              <div style="margin-top:6px;font-size:12px;color:var(--ok);font-weight:600">✔ Included in ₹${e.fee} All-Access Pass</div>
            </div>
          `).join("")}
        </div>
      `;
    } else {
      // per-event pricing model
      sympHtml = `
        <div class="card" style="background:#0ea5e914;border:1px solid #0ea5e940;margin:14px 0 10px;padding:14px">
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px">
            <span style="font-weight:700;color:#0284c7;font-size:15px">💳 Pay-Per-Event Track</span>
            <span class="tag" style="background:#0ea5e9;color:#fff">Pay Separately</span>
          </div>
          <p class="mu" style="margin:6px 0 0;font-size:13px">Select which symposium events you'd like to participate in. You pay separately for each selected event.</p>
        </div>
        <h4 style="margin:14px 0 6px">Select Events to Participate</h4>
        <div class="sub-list" id="symp-chk-list">
          ${subs.map((s, idx) => `
            <label class="sub-card" style="cursor:pointer;display:block">
              <div style="display:flex;align-items:flex-start;gap:12px">
                <input type="checkbox" class="sub-chk" data-sid="${s.id}" data-fee="${s.fee}" ${idx === 0 ? "checked" : ""} style="width:18px;height:18px;margin-top:3px">
                <div style="flex:1">
                  <div style="display:flex;justify-content:space-between;align-items:center">
                    <b>${esc(s.title)}</b>
                    <span style="font-weight:700;color:var(--pr);font-size:14px">₹${s.fee}</span>
                  </div>
                  <div class="mu" style="font-size:12px;margin:3px 0">⏰ ${s.time} · 📍 ${esc(s.venue)} · <span class="tag" style="padding:1px 6px;font-size:11px">${s.type || "Technical"}</span></div>
                  <div class="mu" style="font-size:13px">${esc(s.description || "")}</div>
                </div>
              </div>
            </label>
          `).join("")}
        </div>
        <div class="row" style="margin-top:12px;padding:12px;background:var(--bg);border-radius:12px">
          <span style="font-size:14px">Total Selected Events Fee:</span>
          <b id="symp-live-total" style="font-size:18px;color:var(--pr)">₹${subs[0] ? subs[0].fee : 0}</b>
        </div>
      `;
    }
  }

  // Registration button text and action
  let regActionHtml = "";
  if (registered) {
    regActionHtml = `<button class="btn" style="background:var(--ok)" data-a="receipt" data-id="${myReg ? myReg.id : ""}">✔ Registered (View Ticket Pass)</button>`;
  } else if (!me) {
    regActionHtml = `<button class="btn" data-a="gologin">Login to Register</button>`;
  } else if (isStudent) {
    if (full) {
      regActionHtml = `<button class="btn" disabled>Registration Full</button>`;
    } else {
      const btnText = isSymp
        ? (pricingModel === "one-time" ? `Register & Pay ₹${e.fee}` : `Proceed to Payment`)
        : (e.fee > 0 ? `Register & Pay ₹${e.fee}` : `Register for Free`);
      regActionHtml = `<button class="btn" data-a="start-pay" data-id="${e.id}">${btnText}</button>`;
    }
  }

  const annHtml = anns.length
    ? anns.map((n) => `<p><b>${esc(n.title)}</b><br>${esc(n.message)}</p>`).join("")
    : '<p class="mu">No announcements yet.</p>';

  return `<div class="ov" id="modal-ov">
    <div class="md" id="modal-box" role="dialog" aria-modal="true">
      ${banner(e, 140)}
      <h2>${esc(e.title)}</h2>
      <div style="display:flex;gap:8px;align-items:center;margin:6px 0 10px;flex-wrap:wrap">
        <span class="tag">${esc(e.category)}</span>
        <span class="tag" style="background:#22c55e20;color:#16a34a;font-weight:600">
          ${e.fee > 0 ? (isSymp && pricingModel === "one-time" ? `₹${e.fee} All-Access Pass` : (isSymp ? `From ₹${Math.min(...subs.map((s) => s.fee || 0))}` : `₹${e.fee} Entry Fee`)) : "Free Entry"}
        </span>
      </div>
      <p>${esc(e.description)}</p>
      <p class="mu">📅 ${fd(e.date)} · ${e.time}<br>📍 ${esc(e.venue)}<br>👥 ${cnt(e.id)} / ${e.maxParticipants} participants<br>Hosted by ${esc(U(e.adminId).name)}</p>

      ${sympHtml}

      <b style="display:block;margin-top:14px">Announcements</b>
      ${annHtml}

      <div class="row" style="margin-top:16px">
        ${regActionHtml}
        <button class="btn g" data-a="x">Close</button>
      </div>
    </div>
  </div>`;
}

// Payment Checkout Modal with UPI/QR, Card, and Net Banking
function payModal(e) {
  const isSymp = e.category === "Symposium";
  const pricingModel = e.pricingModel || "standard";
  const selectedSubs = S.mod.selectedSubs || [];
  const subs = e.subEvents || [];
  const chosenSubObjects = subs.filter((s) => selectedSubs.includes(s.id));

  let amount = e.fee || 0;
  if (isSymp && pricingModel === "per-event") {
    amount = chosenSubObjects.reduce((sum, s) => sum + (s.fee || 0), 0);
  }

  const method = S.mod.payMethod || "upi";

  return `<div class="ov" id="modal-ov">
    <div class="md" id="modal-box" role="dialog" aria-modal="true" style="max-width:500px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <h3 style="margin:0">💳 Checkout & Payment</h3>
        <button class="ic" data-a="x" style="font-size:18px">✕</button>
      </div>

      <div class="card" style="background:var(--bg);margin-bottom:14px;padding:14px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div>
            <b>${esc(e.title)}</b>
            <div class="mu" style="font-size:12px">${fd(e.date)} · ${e.time} · ${esc(e.venue)}</div>
          </div>
          <span class="tag">${e.category}</span>
        </div>
        ${chosenSubObjects.length ? `
          <div style="margin-top:8px;padding-top:8px;border-top:1px dashed var(--bd);font-size:12px">
            <b>Selected Tracks (${chosenSubObjects.length}):</b>
            <ul style="margin:4px 0 0 16px;padding:0">
              ${chosenSubObjects.map((s) => `<li>${esc(s.title)} ${pricingModel === "per-event" ? `(₹${s.fee})` : ""}</li>`).join("")}
            </ul>
          </div>
        ` : ""}
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;padding-top:8px;border-top:1px solid var(--bd)">
          <span>Total Payable Amount:</span>
          <b style="font-size:22px;color:var(--pr)">${amount > 0 ? `₹${amount}` : "FREE"}</b>
        </div>
      </div>

      ${amount > 0 ? `
        <b>Select Payment Method</b>
        <div class="tabs" style="margin:8px 0 14px">
          <button class="${method === "upi" ? "on" : ""}" data-a="set-pay-method" data-id="upi">📱 UPI / QR</button>
          <button class="${method === "card" ? "on" : ""}" data-a="set-pay-method" data-id="card">💳 Card</button>
          <button class="${method === "nb" ? "on" : ""}" data-a="set-pay-method" data-id="nb">🏦 Net Banking</button>
        </div>

        ${method === "upi" ? `
          <div class="card" style="text-align:center;padding:16px;margin-bottom:14px">
            <div style="font-size:12px;color:var(--mu);margin-bottom:8px">Scan QR Code using Google Pay, PhonePe, Paytm, etc.</div>
            <div style="display:inline-block;padding:10px;background:#fff;border-radius:12px;box-shadow:0 2px 8px #0001">
              <svg width="140" height="140" viewBox="0 0 100 100" style="display:block">
                <rect width="100" height="100" fill="#ffffff" />
                <rect x="10" y="10" width="26" height="26" fill="#1d1b2e" />
                <rect x="14" y="14" width="18" height="18" fill="#ffffff" />
                <rect x="18" y="18" width="10" height="10" fill="#1d1b2e" />
                <rect x="64" y="10" width="26" height="26" fill="#1d1b2e" />
                <rect x="68" y="14" width="18" height="18" fill="#ffffff" />
                <rect x="72" y="18" width="10" height="10" fill="#1d1b2e" />
                <rect x="10" y="64" width="26" height="26" fill="#1d1b2e" />
                <rect x="14" y="68" width="18" height="18" fill="#ffffff" />
                <rect x="18" y="72" width="10" height="10" fill="#1d1b2e" />
                <rect x="42" y="12" width="8" height="18" fill="#6c3ff5" />
                <rect x="42" y="42" width="16" height="16" fill="#6c3ff5" />
                <rect x="64" y="44" width="14" height="8" fill="#1d1b2e" />
                <rect x="44" y="70" width="18" height="10" fill="#1d1b2e" />
                <rect x="70" y="70" width="12" height="12" fill="#6c3ff5" />
              </svg>
            </div>
            <div style="display:flex;align-items:center;justify-content:center;gap:6px;margin-top:10px">
              <span class="mu" style="font-size:13px">UPI ID:</span>
              <code style="background:var(--bg);padding:2px 8px;border-radius:6px;font-size:12px;font-weight:600">festofind.pay@okhdfcbank</code>
              <button class="btn g" style="padding:4px 8px;font-size:11px" data-a="copy-upi">Copy</button>
            </div>
            <div style="display:flex;justify-content:center;gap:6px;margin-top:10px">
              <span class="tag" style="background:#0001;color:inherit">Google Pay</span>
              <span class="tag" style="background:#0001;color:inherit">PhonePe</span>
              <span class="tag" style="background:#0001;color:inherit">Paytm</span>
              <span class="tag" style="background:#0001;color:inherit">Cred</span>
            </div>
          </div>
        ` : ""}

        ${method === "card" ? `
          <div class="card" style="margin-bottom:14px;display:grid;gap:10px">
            <label>Card Number<input placeholder="4532 •••• •••• 8920" maxlength="19" value="4532 8920 1024 8831"></label>
            <div class="grid" style="grid-template-columns:1fr 1fr">
              <label>Expiry Date<input placeholder="MM/YY" maxlength="5" value="12/28"></label>
              <label>CVV<input type="password" placeholder="•••" maxlength="3" value="821"></label>
            </div>
            <label>Cardholder Name<input placeholder="Name as on card" value="${esc(me ? me.name : "")}"></label>
          </div>
        ` : ""}

        ${method === "nb" ? `
          <div class="card" style="margin-bottom:14px">
            <label>Select Bank
              <select>
                <option>HDFC Bank</option>
                <option>State Bank of India (SBI)</option>
                <option>ICICI Bank</option>
                <option>Axis Bank</option>
                <option>Kotak Mahindra Bank</option>
                <option>Canara Bank</option>
              </select>
            </label>
          </div>
        ` : ""}
      ` : `
        <div class="card" style="margin-bottom:14px;padding:14px;background:#16a34a14;border:1px solid #16a34a40">
          <b>🎉 Free Event Registration</b>
          <p class="mu" style="margin:4px 0 0">No payment is required for this event. Click below to confirm your spot.</p>
        </div>
      `}

      <button class="btn" id="pay-btn" data-a="submit-payment" data-id="${e.id}" style="width:100%;padding:12px;font-size:15px">
        ${amount > 0 ? `🔒 Pay ₹${amount} & Confirm Registration` : `Confirm Free Registration`}
      </button>
      <button class="btn g" data-a="x" style="width:100%;margin-top:8px">Cancel</button>
    </div>
  </div>`;
}

// Digital Ticket Pass & Payment Receipt Modal
function receiptModal(r) {
  const e = E(r.eventId) || { title: "Event", venue: "-", date: "-", time: "-", category: "Event" };
  const u = U(r.studentId);
  const isPaid = r.amountPaid > 0;

  return `<div class="ov" id="modal-ov">
    <div class="md" id="modal-box" role="dialog" aria-modal="true" style="max-width:480px;text-align:center">
      <div style="font-size:48px;line-height:1;margin-bottom:8px">🎉</div>
      <h2 style="margin:0 0 4px;color:var(--ok)">Registration Confirmed!</h2>
      <p class="mu" style="margin:0 0 16px">Your digital ticket pass has been generated.</p>

      <div class="card" style="text-align:left;background:var(--bg);border:2px dashed var(--bd);padding:16px;margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--bd);padding-bottom:10px;margin-bottom:10px">
          <b>${logo}</b>
          <span class="tag" style="background:#16a34a20;color:var(--ok);font-weight:700">VERIFIED ENTRY PASS</span>
        </div>
        <h3 style="margin:0 0 4px">${esc(e.title)}</h3>
        <span class="tag" style="margin-bottom:8px">${e.category}</span>
        <div class="mu" style="font-size:13px;line-height:1.6">
          📅 <b>Date:</b> ${fd(e.date)} · ${e.time}<br>
          📍 <b>Venue:</b> ${esc(e.venue)}<br>
          👤 <b>Participant:</b> ${esc(u.name)} (${esc(u.department || "-")}, ${esc(u.year || "-")} yr)<br>
          🏫 <b>College:</b> ${esc(u.college || "-")}
        </div>
        ${r.subEvents && r.subEvents.length ? `
          <div style="margin-top:8px;padding-top:8px;border-top:1px dotted var(--bd);font-size:12px">
            <b>Registered Tracks:</b> ${(e.subEvents || []).filter((s) => r.subEvents.includes(s.id)).map((s) => s.title).join(", ") || "All-Access Pass"}
          </div>
        ` : ""}
        <div style="display:flex;justify-content:space-between;align-items:center;background:var(--card);padding:10px;border-radius:10px;margin-top:12px">
          <div>
            <div class="mu" style="font-size:11px">TRANSACTION ID</div>
            <code style="font-size:12px;font-weight:700">${r.txnId || "FREE_PASS"}</code>
          </div>
          <div style="text-align:right">
            <div class="mu" style="font-size:11px">AMOUNT PAID</div>
            <b style="color:var(--ok);font-size:15px">${isPaid ? `₹${r.amountPaid}` : "FREE"}</b>
          </div>
        </div>
      </div>

      <div class="row">
        <button class="btn" data-a="print-pass" data-id="${r.id}" style="flex:1">📥 Download Ticket Pass</button>
        <button class="btn g" data-a="x">Done</button>
      </div>
    </div>
  </div>`;
}


/* ==========================================================================
   6. STUDENT SCREENS
   ========================================================================== */

function sHead() {
  const menu = [
    ["Profile", "profile"],
    ["My Events", "mine"],
    ["Announcements", "ann"],
    ["Schedule", "sch"],
    ["Settings", "set"],
  ];
  const popup = S.pop
    ? `<div class="pop">${menu.map((x) => `<button data-a="tab" data-id="${x[1]}">${x[0]}</button>`).join("")}<button data-a="out">Logout</button></div>`
    : "";

  return `<header>${logo}
    <div style="display:flex;align-items:center;gap:6px">
      <button class="ic" aria-label="Search" data-a="srch">🔍</button>
      ${notifBell()}
      <button class="ic" aria-label="Profile" data-a="pop">👤</button>
    </div>
    ${popup}
    ${notifPanel()}
  </header>`;
}

function sMy() {
  const myRegs = DB.regs.filter((r) => r.studentId == me.id);
  const registered = myRegs.map((r) => ({ event: E(r.eventId), reg: r })).filter((x) => Boolean(x.event));
  const list = registered.filter((x) => (S.rt == "Upcoming" ? x.event.date >= today() : x.event.date < today()));

  const tabs = ["Upcoming", "Completed"]
    .map((x) => `<button class="${S.rt == x ? "on" : ""}" data-a="rt" data-id="${x}">${x}</button>`)
    .join("");

  const body = list.length
    ? `<div class="grid">${list.map((x) => {
        const e = x.event;
        const r = x.reg;
        return `<article class="card ev">
          ${banner(e)}
          <div class="c">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span class="tag">${e.category}</span>
              <span class="fee-tag">${r.amountPaid > 0 ? `Paid ₹${r.amountPaid}` : "Free"}</span>
            </div>
            <b>${esc(e.title)}</b>
            <span class="mu">📅 ${fd(e.date)} · ${e.time}</span>
            <span class="mu">📍 ${esc(e.venue)}</span>
            <div style="display:flex;gap:6px;margin-top:6px">
              <button class="btn" style="flex:1" data-a="receipt" data-id="${r.id}">🎟️ Ticket & Receipt</button>
              <button class="btn g" data-a="view" data-id="${e.id}">Details</button>
            </div>
          </div>
        </article>`;
      }).join("")}</div>`
    : `<div class="card">${registered.length ? "No events here yet." : "You haven't registered for any events yet."}</div>`;

  return `<h2>My Events</h2><div class="tabs">${tabs}</div>${body}`;
}

function student() {
  let body = "";
  const myEventIds = DB.regs.filter((r) => r.studentId == me.id).map((r) => r.eventId);

  if (S.tab == "home") {
    const cats = CATS.map(
      (c) => `<button class="cat ${S.cat == c[0] ? "on" : ""}" data-a="cat" data-id="${c[0]}"><div style="font-size:28px">${c[1]}</div>${c[0]}</button>`
    ).join("");
    const clear = S.cat
      ? `<p><button class="btn g" data-a="cat" data-id="">✕ Clear filter: ${S.cat}</button></p>`
      : "";

    body = `<h1>Hello, ${esc(me.name)} 👋</h1>
      <p class="mu">Discover and participate in college fests, symposiums, and workshops.</p>
      <input id="q" type="search" placeholder="Search events, workshops, hackathons..." value="${esc(S.q)}" aria-label="Search events">
      <h2>Explore Categories</h2>
      <div class="cats">${cats}</div>
      ${clear}
      <div id="res">${results()}</div>`;

  } else if (S.tab == "mine") {
    body = sMy();

  } else if (S.tab == "ann") {
    body = `<h2>Announcements</h2>` + annList(DB.anns.filter((n) => myEventIds.includes(n.eventId)));

  } else if (S.tab == "sch") {
    const list = myEventIds.map(E).filter(Boolean).sort((a, b) => a.date.localeCompare(b.date));
    body = `<h2>Schedule</h2>` + (list.length
      ? list.map((e) => `<div class="card row" style="margin-bottom:8px"><b>${esc(e.title)}</b><span class="mu">${fd(e.date)} · ${e.time} · ${esc(e.venue)}</span></div>`).join("")
      : `<div class="card">You haven't registered for any events yet.</div>`);

  } else if (S.tab == "set") {
    body = `<h2>Settings</h2>
      <div class="card" style="margin-bottom:12px">
        <h3>Theme & Notifications</h3>
        <p class="mu">Notifications and theme automatically adapt to your system preferences.</p>
      </div>
      <div class="card">
        <h3>Database & Backup</h3>
        <p class="mu">Download the real-time application database as a .json file or reset demo data.</p>
        <div class="row">
          <button class="btn" data-a="export-json">📥 Export Database (.json)</button>
          <button class="btn g" data-a="reset-db">🔄 Reset Demo Data</button>
        </div>
      </div>`;

  } else {
    body = profile();
  }

  return sHead() + `<main class="w pg">${body}</main>`;
}


/* ==========================================================================
   7. ADMIN SCREENS
   ========================================================================== */

function aHead() {
  const tabs = [["dash", "Dashboard"], ["new", "Create Event"], ["man", "Manage Events"], ["prof", "Profile"]];
  return `<header>${logo}
    <div class="tabs" style="margin:0">
      ${tabs.map((x) => `<button class="${S.atab == x[0] ? "on" : ""}" data-a="at" data-id="${x[0]}">${x[1]}</button>`).join("")}
    </div>
    <div style="display:flex;align-items:center;gap:6px">
      ${notifBell()}
    </div>
    ${notifPanel()}
  </header>`;
}

function dash() {
  const events = mine();
  const ids = events.map((e) => e.id);
  const regs = DB.regs.filter((r) => ids.includes(r.eventId));
  const uniqueParticipants = new Set(regs.map((r) => r.studentId)).size;
  const totalRevenue = regs.reduce((sum, r) => sum + (r.amountPaid || 0), 0);

  const stats = [
    ["Total Events", events.length],
    ["Participants", uniqueParticipants],
    ["Registrations", regs.length],
    ["Revenue Collected", `₹${totalRevenue}`],
  ];

  const recentEvents =
    events.slice(-3).reverse()
      .map((e) => `<div class="card row" style="margin-bottom:8px"><b>${esc(e.title)}</b><span class="mu">${fd(e.date)} · ${e.fee > 0 ? `₹${e.fee}` : 'Free'}</span></div>`)
      .join("") || '<div class="card">No events found.</div>';

  const recentRegs =
    regs.slice(-4).reverse()
      .map((r) => `<div class="card" style="margin-bottom:8px">${esc(U(r.studentId).name)} → ${esc((E(r.eventId) || {}).title)} <span class="tag" style="float:right">${r.amountPaid > 0 ? `₹${r.amountPaid}` : 'Free'}</span></div>`)
      .join("") || '<div class="card">No participants have registered yet.</div>';

  const recentAnns = annList(DB.anns.filter((n) => ids.includes(n.eventId)))
    .split("</div></div>").slice(0, 2).join("</div></div>");

  return `
    <div class="row"><h1>Admin Dashboard</h1><button class="btn" data-a="at" data-id="new">+ Create Event</button></div>
    <div class="grid">
      ${stats.map((s) => `<div class="card"><div class="mu">${s[0]}</div><div class="stat">${s[1]}</div></div>`).join("")}
    </div>
    <h2>Recent events</h2>${recentEvents}
    <h2>Recent registrations</h2>${recentRegs}
    <h2>Recent announcements</h2>${recentAnns}`;
}

// Create / edit event form with Symposium configuration
function form(e) {
  e = e || {};
  const isSymp = (e.category || "Symposium") === "Symposium";
  const pricingModel = e.pricingModel || (isSymp ? "one-time" : "standard");
  const subs = e.subEvents || (isSymp ? [
    { id: "se1", title: "Paper & PPT Presentation", type: "Technical", time: "10:30 AM", venue: "Hall A", fee: 80, description: "Present research papers in emerging technology." },
    { id: "se2", title: "Code Debugging Challenge", type: "Technical", time: "11:30 AM", venue: "Lab 3", fee: 100, description: "Speed algorithm and bug-fixing rounds." },
    { id: "se3", title: "Technical Quiz", type: "Technical", time: "01:30 PM", venue: "Seminar Room 1", fee: 60, description: "CS & tech trivia competition." }
  ] : []);

  const categoryOptions = CATS.map((c) => `<option ${e.category == c[0] ? "selected" : ""}>${c[0]}</option>`).join("");

  return `<h1>${e.id ? "Edit Event" : "Create Event"}</h1>
  <form id="ef" class="card" novalidate>
    <label>Event Name<input name="title" value="${esc(e.title || "")}"></label>
    <div class="grid" style="grid-template-columns:1fr 1fr">
      <label>Category<select name="category" id="ef-cat">${categoryOptions}</select></label>
      <label>Entry Fee (₹)<input type="number" min="0" name="fee" value="${e.fee !== undefined ? e.fee : (isSymp ? 200 : 150)}"></label>
    </div>

    <!-- Symposium Pricing Option -->
    <div id="symp-admin-box" style="background:var(--bg);padding:14px;border-radius:12px;margin-bottom:14px;border:1px solid var(--bd);display:${isSymp ? 'block' : 'none'}">
      <b>Symposium Pricing Option:</b>
      <p class="mu" style="margin:2px 0 10px;font-size:13px">Define how participants pay for this symposium.</p>
      <div style="display:grid;gap:8px;margin-bottom:12px">
        <label style="display:flex;align-items:center;gap:8px;font-weight:600;cursor:pointer">
          <input type="radio" name="pricingModel" value="one-time" ${pricingModel === "one-time" ? "checked" : ""} style="width:auto">
          🎟️ One-time payment (Students pay once and can attend ANY event)
        </label>
        <label style="display:flex;align-items:center;gap:8px;font-weight:600;cursor:pointer">
          <input type="radio" name="pricingModel" value="per-event" ${pricingModel === "per-event" ? "checked" : ""} style="width:auto">
          💳 Pay separately (Students pay for each event they choose)
        </label>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <b>Symposium Sub-Events</b>
        <button type="button" class="btn-xs" data-a="add-sub" style="font-weight:600">+ Add Sub-Event</button>
      </div>
      <div id="sub-editor-list" style="display:grid;gap:8px">
        ${subs.map((s, idx) => `
          <div class="card sub-edit-item" style="padding:10px;background:var(--card)">
            <div style="display:flex;gap:8px;align-items:center">
              <input name="sub_title" placeholder="Event Name (e.g. Paper Presentation)" value="${esc(s.title)}" style="flex:2">
              <select name="sub_type" style="flex:1">
                <option ${s.type === "Technical" ? "selected" : ""}>Technical</option>
                <option ${s.type === "Non-Technical" ? "selected" : ""}>Non-Technical</option>
              </select>
              <input name="sub_fee" type="number" min="0" placeholder="Fee ₹" value="${s.fee !== undefined ? s.fee : 50}" style="width:80px">
              <button type="button" class="ic" data-a="del-sub" data-idx="${idx}" style="color:var(--er)">✕</button>
            </div>
            <div style="display:flex;gap:8px;align-items:center;margin-top:6px">
              <input name="sub_time" placeholder="Time (e.g. 10:30 AM)" value="${esc(s.time || "")}" style="flex:1">
              <input name="sub_venue" placeholder="Venue (e.g. Hall A)" value="${esc(s.venue || "")}" style="flex:1">
            </div>
          </div>
        `).join("")}
      </div>
    </div>

    <div class="grid" style="grid-template-columns:1fr 1fr">
      <label>Date<input type="date" name="date" value="${e.date || ""}"></label>
      <label>Time<input type="time" name="time" value="${e.time || ""}"></label>
    </div>
    <label>Venue<input name="venue" value="${esc(e.venue || "")}"></label>
    <label>Description<textarea name="description" rows="3">${esc(e.description || "")}</textarea></label>
    <label>Maximum Participants<input type="number" min="1" name="max" value="${e.maxParticipants || ""}"></label>
    <label>Event Banner (optional)<input type="file" accept="image/*" name="banner"></label>
    <div class="err" id="fe"></div>
    <button class="btn" id="fs">${e.id ? "Save changes" : "Create & Publish"}</button>
  </form>`;
}

function man() {
  const events = mine();
  if (!events.length) return `<h1>Manage Events</h1><div class="card">No events found.</div>`;

  return `<h1>Manage Events</h1>` + events.map((e) => `
    <div class="card" style="margin-bottom:10px">
      <div class="row">
        <div>
          <b>${esc(e.title)}</b> <span class="tag">${e.category}</span> <span class="fee-tag">${e.fee > 0 ? `₹${e.fee}` : 'Free'}</span>
          <div class="mu">${fd(e.date)} · ${e.time} · ${esc(e.venue)} · 👥 ${cnt(e.id)} · ${e.status}</div>
        </div>
        <div>
          <button class="btn g" data-a="view" data-id="${e.id}">View</button>
          <button class="btn g" data-a="edit" data-id="${e.id}">Edit</button>
          <button class="btn" data-a="mg" data-id="${e.id}">Manage</button>
          <button class="btn d" data-a="del" data-id="${e.id}">Delete</button>
        </div>
      </div>
    </div>`).join("");
}

function mgmt() {
  const e = E(S.eid);
  if (!e) return '<div class="card">Event not found.</div>';
  const regs = DB.regs.filter((r) => r.eventId == e.id);
  const totalRevenue = regs.reduce((sum, r) => sum + (r.amountPaid || 0), 0);

  const TABS = ["Details", "Participants", "Announcements", "Statistics"];
  let body = "";

  if (S.mt == "Details") {
    body = `<div class="card">
      ${banner(e, 120)}
      <h2>${esc(e.title)}</h2>
      <p>${esc(e.description)}</p>
      <p class="mu">📅 ${fd(e.date)} · ${e.time} · ${esc(e.venue)}<br>Status: ${e.status} · Max: ${e.maxParticipants} · Entry Fee: ₹${e.fee}<br>Total Revenue: <b>₹${totalRevenue}</b></p>
      <button class="btn" data-a="edit" data-id="${e.id}">Edit</button>
      <button class="btn g" data-a="pub" data-id="${e.id}">${e.status == "published" ? "Unpublish" : "Publish"}</button>
    </div>`;
  }

  if (S.mt == "Participants") {
    const list = regs.filter((r) => U(r.studentId).name.toLowerCase().includes(S.pq.toLowerCase()));
    const rows = list.map((r) => {
      const u = U(r.studentId);
      const subs = e.subEvents || [];
      const trackNames = r.subEvents && r.subEvents.length
        ? subs.filter((s) => r.subEvents.includes(s.id)).map((s) => s.title).join(", ")
        : (e.category === "Symposium" ? "All-Access Pass" : "General");
      return `<tr>
        <td>${esc(u.name)}</td>
        <td>${esc(u.department)} (${esc(u.year)})</td>
        <td>${esc(u.email)}</td>
        <td><span class="tag">${trackNames}</span></td>
        <td><b>${r.amountPaid > 0 ? `₹${r.amountPaid}` : 'Free'}</b></td>
        <td><code style="font-size:11px">${r.txnId || '-'}</code></td>
        <td>${fd(r.registeredAt.slice(0, 10))}</td>
      </tr>`;
    }).join("");

    body = `<div class="row">
        <b>${regs.length} participants (Revenue: ₹${totalRevenue})</b>
        <input id="pq" placeholder="Search participants" value="${esc(S.pq)}" style="max-width:240px">
        <button class="btn g" data-a="csv">Export CSV</button>
      </div>
      ${list.length
        ? `<div class="tw card"><table><tr><th>Name</th><th>Dept</th><th>Email</th><th>Track(s)</th><th>Amount</th><th>Txn ID</th><th>Date</th></tr>${rows}</table></div>`
        : '<div class="card">No participants have registered yet.</div>'}`;
  }

  if (S.mt == "Announcements") {
    body = `<form id="af" class="card">
        <label>Announcement Title<input name="t"></label>
        <label>Message<textarea name="m" rows="3"></textarea></label>
        <div class="err" id="ae"></div>
        <button class="btn">Post & Send Notification</button>
      </form>
      <h3>Posted</h3>
      ${annList(DB.anns.filter((n) => n.eventId == e.id))}`;
  }

  if (S.mt == "Statistics") {
    const groupBy = (key) => {
      const o = {};
      regs.forEach((r) => {
        const v = U(r.studentId)[key];
        o[v] = (o[v] || 0) + 1;
      });
      return o;
    };

    const bars = (o) =>
      Object.entries(o)
        .map(([k, v]) => `<div class="row"><span>${k}</span><span style="flex:1;min-width:80px"><div class="bar" style="width:${(v / (regs.length || 1)) * 100}%"></div></span><b>${v}</b></div>`)
        .join("") || '<span class="mu">No data yet.</span>';

    body = `<div class="grid">
        <div class="card"><div class="mu">Total registrations</div><div class="stat">${regs.length}</div></div>
        <div class="card"><div class="mu">Revenue collected</div><div class="stat">₹${totalRevenue}</div></div>
      </div>
      <div class="grid" style="margin-top:12px">
        <div class="card"><b>By department</b>${bars(groupBy("department"))}</div>
        <div class="card"><b>By year</b>${bars(groupBy("year"))}</div>
      </div>`;
  }

  return `<button class="btn g" data-a="at" data-id="man">← Back</button>
    <h1>${esc(e.title)}</h1>
    <div class="tabs">${TABS.map((x) => `<button class="${S.mt == x ? "on" : ""}" data-a="mt" data-id="${x}">${x}</button>`).join("")}</div>
    ${body}`;
}

function admin() {
  let body;
  if (S.atab == "dash") body = dash();
  else if (S.atab == "new") body = form(S.edit ? E(S.edit) : null);
  else if (S.atab == "man") body = man();
  else if (S.atab == "mg") body = mgmt();
  else body = profile();

  return aHead() + `<main class="w pg">${body}</main>`;
}


/* ==========================================================================
   8. AUTH SCREENS (LOGIN, REGISTER, ROLE CHOOSER)
   ========================================================================== */

function login() {
  const centeredLogo = logo.replace('class="logo"', 'class="logo" style="justify-content:center"');
  return `<div class="ctr">
    <form id="lf" class="card pg" style="width:100%;max-width:400px" novalidate>
      <div style="text-align:center">${centeredLogo}<p class="mu">Discover. Participate. Experience.</p></div>
      <label>Email<input name="e" type="email" autocomplete="username" placeholder="you@college.edu"></label>
      <label>Password<input name="p" type="password" id="pw" autocomplete="current-password" placeholder="••••••••"></label>
      <label style="display:flex;gap:8px;align-items:center"><input type="checkbox" style="width:auto" id="sp" data-a="sp"> Show password</label>
      <div class="row" style="margin-bottom:6px">
        <label style="display:flex;gap:6px;align-items:center;margin:0"><input type="checkbox" style="width:auto" checked name="rm"> Remember me</label>
        <a href="#" data-a="fg">Forgot password?</a>
      </div>
      <div class="err" id="le" role="alert"></div>
      <button class="btn" style="width:100%;margin-top:10px">Login</button>
      <p style="text-align:center;margin:14px 0 0">Don't have an account? <a href="#" data-a="goreg" style="color:var(--pr);font-weight:600">Register Now</a></p>
    </form>
  </div>`;
}

function register() {
  const centeredLogo = logo.replace('class="logo"', 'class="logo" style="justify-content:center"');
  return `<div class="ctr">
    <form id="rf" class="card pg" style="width:100%;max-width:440px" novalidate>
      <div style="text-align:center;margin-bottom:12px">${centeredLogo}<p class="mu">Create your FestoFind account</p></div>
      <label>Full Name<input name="rname" placeholder="e.g. Kevin Harrison P"></label>
      <label>College / Institution<input name="rcollege" placeholder="e.g. New Prince Shri Bhavani…"></label>
      <div class="grid" style="grid-template-columns:1fr 1fr">
        <label>Department<input name="rdept" placeholder="e.g. CSE"></label>
        <label>Year<select name="ryear">
          <option value="">Select year</option>
          <option>1st</option><option>2nd</option><option>3rd</option><option>4th</option>
        </select></label>
      </div>
      <label>Email<input name="remail" type="email" placeholder="you@college.edu"></label>
      <label>Password<input name="rpw" type="password" placeholder="Min 6 characters" autocomplete="new-password"></label>
      <label>Confirm Password<input name="rpw2" type="password" placeholder="Re-enter password" autocomplete="new-password"></label>
      <div class="err" id="re" role="alert"></div>
      <button class="btn" id="rsub" style="width:100%;margin-top:10px">Create Account</button>
      <p style="text-align:center;margin:14px 0 0">Already have an account? <a href="#" data-a="gologin" style="color:var(--pr);font-weight:600">Login</a></p>
    </form>
  </div>`;
}

function choose() {
  const options = [
    ["student", "🎓", "Student", "Discover events, register and manage your event passes."],
    ["admin", "🛠️", "Admin", "Create events, manage tickets and publish announcements."],
  ];

  return `<div class="ctr"><div class="pg" style="max-width:700px;text-align:center">
    <h1>Choose your FestoFind experience</h1>
    <p class="mu">Continue with the experience that matches your role.</p>
    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">
      ${options.map((c) => `<div class="card">
        <div style="font-size:40px">${c[1]}</div>
        <h2>${c[2]}</h2>
        <p class="mu">${c[3]}</p>
        <button class="btn" data-a="enter" data-id="${c[0]}">Enter as ${c[2]}</button>
      </div>`).join("")}
    </div>
    <p><button class="btn g" data-a="out">Logout</button></p>
  </div></div>`;
}


/* ==========================================================================
   9. RENDER & EVENT BINDING
   ========================================================================== */

function render() {
  const app = $("#app");
  let html;

  // pick the screen
  if (!me) html = S.scr === "register" ? register() : login();
  else if (S.scr == "choose") html = choose();
  else if (S.scr == "student" && me.role == "student") html = student();
  else if (S.scr == "admin" && me.role == "admin") html = admin();
  else html = choose();

  // modals on top
  if (S.mod && S.mod.t == "d" && E(S.mod.id)) html += detail(E(S.mod.id));
  if (S.mod && S.mod.t == "pay" && E(S.mod.id)) html += payModal(E(S.mod.id));
  if (S.mod && S.mod.t == "receipt") {
    const regObj = DB.regs.find((r) => r.id == S.mod.regId);
    if (regObj) html += receiptModal(regObj);
  }

  app.innerHTML = html;

  bind();
}

function bind() {
  // Live filter for student search box
  const q = $("#q");
  if (q) q.oninput = (ev) => {
    S.q = ev.target.value;
    $("#res").innerHTML = results();
  };

  // Live filter for participants search
  const pq = $("#pq");
  if (pq) pq.oninput = (ev) => {
    S.pq = ev.target.value;
    const pos = ev.target.selectionStart;
    render();
    const npq = $("#pq");
    if (npq) {
      npq.focus();
      npq.setSelectionRange(pos, pos);
    }
  };

  // Toggle Symposium admin editor on category change
  const efCat = document.getElementById("ef-cat");
  if (efCat) {
    efCat.onchange = (ev) => {
      const sympBox = document.getElementById("symp-admin-box");
      if (sympBox) sympBox.style.display = ev.target.value === "Symposium" ? "block" : "none";
    };
  }

  // Live total calculation for Symposium pay-per-event checkboxes
  const sympChks = document.querySelectorAll(".sub-chk");
  if (sympChks.length) {
    sympChks.forEach((chk) => {
      chk.onchange = () => {
        let sum = 0;
        document.querySelectorAll(".sub-chk:checked").forEach((c) => {
          sum += +c.dataset.fee || 0;
        });
        const liveEl = document.getElementById("symp-live-total");
        if (liveEl) liveEl.textContent = `₹${sum}`;
      };
    });
  }

  // Login form handler
  const lf = $("#lf");
  if (lf) lf.onsubmit = (ev) => {
    ev.preventDefault();
    const email = lf.e.value.trim().toLowerCase();
    const pass = lf.p.value;
    const err = $("#le");
    err.textContent = "";

    if (!email || !pass) return (err.textContent = "Please enter your email and password.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return (err.textContent = "Please enter a valid email address.");

    const btn = lf.querySelector(".btn");
    btn.textContent = "Signing in…";
    btn.disabled = true;

    setTimeout(() => {
      const u = DB.users.find((u) => u.email.toLowerCase() === email && u.password === pass);
      if (!u) {
        err.textContent = "Invalid email or password.";
        btn.textContent = "Login";
        btn.disabled = false;
        return;
      }
      me = { id: u.id, role: u.role, name: u.name, email: u.email, college: u.college, department: u.department, year: u.year };
      ses();
      S.scr = "choose";
      render();
    }, 450);
  };

  // Register form handler
  const rf = $("#rf");
  if (rf) rf.onsubmit = (ev) => {
    ev.preventDefault();
    const err = $("#re");
    err.textContent = "";
    const name    = rf.rname.value.trim();
    const college = rf.rcollege.value.trim();
    const dept    = rf.rdept.value.trim();
    const year    = rf.ryear.value;
    const email   = rf.remail.value.trim().toLowerCase();
    const pw      = rf.rpw.value;
    const pw2     = rf.rpw2.value;
    if (!name||!college||!dept||!year||!email||!pw||!pw2)
      return (err.textContent = "Please fill in all fields.");
    if (!/^\S+@\S+\.\S+$/.test(email))
      return (err.textContent = "Please enter a valid email address.");
    if (pw.length < 6)
      return (err.textContent = "Password must be at least 6 characters.");
    if (pw !== pw2)
      return (err.textContent = "Passwords do not match.");
    if (DB.users.find((u) => u.email.toLowerCase() === email))
      return (err.textContent = "An account with this email already exists.");

    const btn = $("#rsub");
    btn.textContent = "Creating account…"; btn.disabled = true;
    setTimeout(() => {
      const newUser = { id: uid("u"), name, college, email, department: dept, year, password: pw, role: "student" };
      DB.users.push(newUser);
      save();
      me = { id: newUser.id, role: "student", name, email, college, department: dept, year };
      ses();
      S.scr = "choose";
      toast("Account created! Welcome, " + name + " 🎉");
      render();
    }, 500);
  };

  // Announcement form handler with automatic notification dispatch
  const af = $("#af");
  if (af) af.onsubmit = (ev) => {
    ev.preventDefault();
    const title = af.t.value.trim();
    const message = af.m.value.trim();
    if (!title || !message) return ($("#ae").textContent = "Please add a title and a message.");

    DB.anns.push({ id: uid("n"), eventId: S.eid, adminId: me.id, title, message, createdAt: now() });

    // Send notification to all registered students of this event
    const evObj = E(S.eid);
    const regStudents = [...new Set(DB.regs.filter((r) => r.eventId === S.eid).map((r) => r.studentId))];
    regStudents.forEach((sid) => {
      DB.notifications.unshift({
        id: uid("notif"),
        userId: sid,
        eventId: S.eid,
        title: "📢 " + title,
        message: `Update for ${evObj ? evObj.title : 'Event'}: ${message}`,
        type: "announcement",
        read: false,
        createdAt: now()
      });
    });

    save();
    render();
    toast("Announcement posted & notifications sent!");
  };

  // Create / edit event form handler
  const ef = $("#ef");
  if (ef) ef.onsubmit = (ev) => {
    ev.preventDefault();
    const f = ef;
    const v = (k) => f[k].value.trim();
    const err = $("#fe");
    const max = +f.max.value;
    const fee = +f.fee.value || 0;
    const category = f.category.value;

    if (!v("title") || !f.date.value || !f.time.value || !v("venue") || !v("description") || !(max > 0)) {
      return (err.textContent = "Please fill in all required fields, including a valid participant limit.");
    }

    // Collect symposium sub-events if applicable
    const subEvents = [];
    const subTitles = f.querySelectorAll("input[name='sub_title']");
    const subTypes = f.querySelectorAll("select[name='sub_type']");
    const subFees = f.querySelectorAll("input[name='sub_fee']");
    const subTimes = f.querySelectorAll("input[name='sub_time']");
    const subVenues = f.querySelectorAll("input[name='sub_venue']");

    for (let i = 0; i < subTitles.length; i++) {
      const st = subTitles[i].value.trim();
      if (st) {
        subEvents.push({
          id: "se" + (i + 1),
          title: st,
          type: subTypes[i] ? subTypes[i].value : "Technical",
          fee: subFees[i] ? +subFees[i].value : 0,
          time: subTimes[i] ? subTimes[i].value.trim() : "10:00 AM",
          venue: subVenues[i] ? subVenues[i].value.trim() : v("venue")
        });
      }
    }

    const pricingModel = f.pricingModel ? (f.querySelector("input[name='pricingModel']:checked") || {}).value : "standard";

    const done = (bannerData) => {
      const existing = S.edit ? E(S.edit) : null;
      const data = {
        title: v("title"),
        category,
        date: f.date.value,
        time: f.time.value,
        venue: v("venue"),
        description: v("description"),
        maxParticipants: max,
        fee,
        pricingModel: category === "Symposium" ? (pricingModel || "one-time") : "standard",
        subEvents: category === "Symposium" ? subEvents : []
      };
      if (bannerData !== null) data.banner = bannerData;

      if (existing) {
        Object.assign(existing, data);
        toast("Event updated successfully!");
      } else {
        DB.events.push({ id: uid("e"), banner: bannerData || "", adminId: me.id, status: "published", createdAt: now(), ...data });
        toast("Event created successfully!");
      }
      save();
      S.edit = null;
      go({ atab: "man" });
    };

    const file = f.banner.files[0];
    $("#fs").disabled = true;

    if (file) {
      if (file.size > 400000) {
        $("#fs").disabled = false;
        return (err.textContent = "Banner must be under 400 KB.");
      }
      const reader = new FileReader();
      reader.onload = () => done(reader.result);
      reader.readAsDataURL(file);
    } else {
      setTimeout(() => done(null), 300);
    }
  };
}


/* ==========================================================================
   10. GLOBAL CLICK EVENT DELEGATION
   ========================================================================== */

document.addEventListener("click", (ev) => {
  // If clicked directly on the dark overlay background outside the modal box, close modal
  if (ev.target.id === "modal-ov" || ev.target.classList.contains("ov")) {
    return go({ mod: null, notifOpen: 0 });
  }

  const el = ev.target.closest("[data-a]");
  if (!el) {
    // If clicked outside popup or notif panel, close them
    if (S.pop || S.notifOpen) {
      if (!ev.target.closest(".pop") && !ev.target.closest("[data-a='notif']") && !ev.target.closest("[data-a='pop']")) {
        S.pop = 0;
        S.notifOpen = 0;
        render();
      }
    }
    return;
  }

  const a = el.dataset.a;
  const id = el.dataset.id;

  // --- Screen navigation (login ↔ register)
  if (a == "goreg")   { S.scr = "register"; render(); return; }
  if (a == "gologin") { S.scr = "login";    render(); return; }

  // --- Login screen helpers
  if (a == "sp") { const pw = $("#pw"); if (pw) pw.type = el.checked ? "text" : "password"; return; }
  if (a == "fg") { ev.preventDefault(); toast("Password reset link sent (demo)."); return; }

  // --- Role chooser / logout
  if (a == "enter") {
    if (me.role != id) return toast("This account can't access that experience.");
    me.mode = id;
    ses();
    return go({ scr: id, tab: "home", atab: "dash" });
  }
  if (a == "out") {
    me = null;
    ses();
    S.mod = null;
    S.pop = 0;
    S.notifOpen = 0;
    S.scr = "login";
    render();
    return toast("Logged out successfully.");
  }

  // --- Student navigation
  if (a == "pop") { S.notifOpen = 0; return go({ pop: S.pop ? 0 : 1 }); }
  if (a == "notif") { S.pop = 0; return go({ notifOpen: S.notifOpen ? 0 : 1 }); }
  if (a == "notif-read-all") {
    (DB.notifications || []).forEach((n) => {
      if (n.userId === me.id || n.userId === "all") n.read = true;
    });
    save();
    return render();
  }
  if (a == "notif-click") {
    const notif = (DB.notifications || []).find((n) => n.id == id);
    if (notif) notif.read = true;
    save();
    S.notifOpen = 0;
    const eid = el.dataset.eid;
    if (eid && E(eid)) return go({ mod: { t: "d", id: eid } });
    return render();
  }

  if (a == "srch") { go({ tab: "home", pop: 0, notifOpen: 0 }); return setTimeout(() => $("#q") && $("#q").focus()); }
  if (a == "tab") return go({ tab: id, pop: 0, notifOpen: 0 });
  if (a == "cat") return go({ cat: id == S.cat ? "" : id });
  if (a == "rt") return go({ rt: id });

  // --- Modals & Registration / Payment
  if (a == "view") return go({ mod: { t: "d", id }, notifOpen: 0 });
  if (a == "x")    return go({ mod: null, notifOpen: 0 }); // Close any modal

  if (a == "start-pay" || a == "reg") {
    const e = E(id);
    if (!e) return;
    if (cnt(id) >= e.maxParticipants) return toast("Registration is full.");
    if (isReg(id)) return toast("You're already registered for this event.");

    let selectedSubs = [];
    if (e.category === "Symposium") {
      if (e.pricingModel === "per-event") {
        document.querySelectorAll(".sub-chk:checked").forEach((c) => selectedSubs.push(c.dataset.sid));
        if (!selectedSubs.length) return toast("Please select at least one symposium event.");
      } else {
        selectedSubs = (e.subEvents || []).map((s) => s.id);
      }
    }
    return go({ mod: { t: "pay", id, selectedSubs, payMethod: "upi" }, notifOpen: 0 });
  }

  if (a == "set-pay-method") {
    if (S.mod && S.mod.t === "pay") {
      S.mod.payMethod = id;
      render();
    }
    return;
  }

  if (a == "copy-upi") {
    navigator.clipboard && navigator.clipboard.writeText("festofind.pay@okhdfcbank");
    return toast("UPI ID copied to clipboard!");
  }

  if (a == "submit-payment") {
    const e = E(id);
    if (!e) return;
    const btn = document.getElementById("pay-btn");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "🔐 Contacting payment gateway…";
    }

    const selectedSubs = (S.mod && S.mod.selectedSubs) || [];
    const payMethod = (S.mod && S.mod.payMethod) || "upi";

    let amount = e.fee || 0;
    if (e.category === "Symposium" && e.pricingModel === "per-event") {
      const chosenSubs = (e.subEvents || []).filter((s) => selectedSubs.includes(s.id));
      amount = chosenSubs.reduce((sum, s) => sum + (s.fee || 0), 0);
    }

    setTimeout(() => {
      const txnId = amount > 0 ? "TXN_FF_" + Math.random().toString(36).slice(2, 9).toUpperCase() : "FREE_ENTRY";
      const newReg = {
        id: uid("r"),
        eventId: id,
        studentId: me.id,
        registeredAt: now(),
        amountPaid: amount,
        paymentStatus: amount > 0 ? "paid" : "free",
        paymentMethod: amount > 0 ? (payMethod === "card" ? "Card" : (payMethod === "nb" ? "NetBanking" : "UPI")) : "Free",
        txnId,
        subEvents: selectedSubs
      };

      DB.regs.push(newReg);

      // Notification service: push payment receipt notification
      if (!DB.notifications) DB.notifications = [];
      DB.notifications.unshift({
        id: uid("notif"),
        userId: me.id,
        eventId: id,
        title: amount > 0 ? "Payment Verified & Pass Issued 🎉" : "Registration Confirmed 🎉",
        message: `Registered for ${e.title}. ${amount > 0 ? `Paid ₹${amount} via ${newReg.paymentMethod} (Txn: ${txnId})` : "Free event pass."}`,
        type: "payment",
        read: false,
        createdAt: now()
      });

      save();
      toast("🎉 Payment Verified! You are registered.");
      go({ mod: { t: "receipt", regId: newReg.id } });
    }, 600);
    return;
  }

  if (a == "receipt") {
    return go({ mod: { t: "receipt", regId: id } });
  }

  if (a == "print-pass") {
    const reg = DB.regs.find((r) => r.id == id);
    if (!reg) return;
    const evObj = E(reg.eventId);
    const u = U(reg.studentId);
    const passContent = `================================================
FESTOFIND EVENT ENTRY PASS & PAYMENT RECEIPT
================================================
Pass ID: ${reg.id}
Transaction ID: ${reg.txnId || "FREE_ENTRY"}
Amount Paid: ₹${reg.amountPaid} (${reg.paymentMethod})
Status: CONFIRMED & VERIFIED

EVENT DETAILS:
Title: ${evObj ? evObj.title : "Event"}
Category: ${evObj ? evObj.category : "-"}
Date: ${evObj ? evObj.date : "-"} | Time: ${evObj ? evObj.time : "-"}
Venue: ${evObj ? evObj.venue : "-"}

PARTICIPANT DETAILS:
Name: ${u.name}
College: ${u.college}
Department: ${u.department} | Year: ${u.year}
Email: ${u.email}

REGISTERED TRACKS:
${reg.subEvents && reg.subEvents.length ? ((evObj.subEvents || []).filter((s) => reg.subEvents.includes(s.id)).map((s) => "- " + s.title).join("\n")) : "All-Access Pass / General Entry"}
================================================
Please present this pass at the registration desk.
================================================`;

    const blob = new Blob([passContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `festofind-pass-${reg.id}.txt`;
    link.click();
    toast("Ticket pass downloaded!");
    return;
  }

  // --- Admin sub-event creation helpers
  if (a == "add-sub") {
    const list = document.getElementById("sub-editor-list");
    if (list) {
      const idx = list.querySelectorAll(".sub-edit-item").length;
      const item = document.createElement("div");
      item.className = "card sub-edit-item";
      item.style.padding = "10px";
      item.style.background = "var(--card)";
      item.innerHTML = `
        <div style="display:flex;gap:8px;align-items:center">
          <input name="sub_title" placeholder="Event Name (e.g. Bug Hunt)" value="" style="flex:2">
          <select name="sub_type" style="flex:1"><option>Technical</option><option>Non-Technical</option></select>
          <input name="sub_fee" type="number" min="0" placeholder="Fee ₹" value="50" style="width:80px">
          <button type="button" class="ic" data-a="del-sub" data-idx="${idx}" style="color:var(--er)">✕</button>
        </div>
        <div style="display:flex;gap:8px;align-items:center;margin-top:6px">
          <input name="sub_time" placeholder="Time (e.g. 11:00 AM)" value="" style="flex:1">
          <input name="sub_venue" placeholder="Venue (e.g. Lab 2)" value="" style="flex:1">
        </div>`;
      list.appendChild(item);
    }
    return;
  }
  if (a == "del-sub") {
    const item = el.closest(".sub-edit-item");
    if (item) item.remove();
    return;
  }

  // --- Admin navigation
  if (a == "at") return go({ atab: id, edit: null, mod: null, notifOpen: 0 });
  if (a == "mg") return go({ atab: "mg", eid: id, mt: "Details", pq: "", mod: null, notifOpen: 0 });
  if (a == "mt") return go({ mt: id });
  if (a == "edit") return go({ atab: "new", edit: id, mod: null, notifOpen: 0 });

  // --- Admin event actions
  if (a == "pub") {
    const e = E(id);
    e.status = e.status == "published" ? "draft" : "published";
    save();
    render();
    return toast("Event updated successfully!");
  }
  if (a == "del") {
    if (confirm("Delete this event and its registrations?")) {
      DB.events = DB.events.filter((e) => e.id != id);
      DB.regs = DB.regs.filter((r) => r.eventId != id);
      DB.anns = DB.anns.filter((n) => n.eventId != id);
      save();
      render();
      toast("Event deleted.");
    }
    return;
  }

  // --- Export participants as CSV
  if (a == "csv") {
    const evObj = E(S.eid);
    const rows = [["Name", "Department", "Year", "Email", "Tracks", "Amount Paid", "Txn ID", "Date"]].concat(
      DB.regs.filter((r) => r.eventId == S.eid).map((r) => {
        const u = U(r.studentId);
        const tracks = r.subEvents && r.subEvents.length
          ? ((evObj && evObj.subEvents) || []).filter((s) => r.subEvents.includes(s.id)).map((s) => s.title).join(" | ")
          : (evObj && evObj.category === "Symposium" ? "All-Access Pass" : "General");
        return [u.name, u.department, u.year, u.email, tracks, r.amountPaid || 0, r.txnId || "-", r.registeredAt];
      })
    );
    const link = document.createElement("a");
    link.href = "data:text/csv," + encodeURIComponent(rows.map((r) => r.join(",")).join("\n"));
    link.download = `participants-${S.eid}.csv`;
    link.click();
    return;
  }

  // --- Export full DB as .json
  if (a == "export-json") {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(DB, null, 2));
    const dl = document.createElement("a");
    dl.setAttribute("href", dataStr);
    dl.setAttribute("download", "festofind-db.json");
    dl.click();
    return toast("Database exported as festofind-db.json");
  }

  // --- Reset database to initial seed
  if (a == "reset-db") {
    if (confirm("Reset database to initial demo data? This will clear newly added events/registrations.")) {
      DB = seed();
      save();
      toast("Database reset to initial demo data.");
      return render();
    }
  }
});

// Close modal & notifications on Escape key
document.addEventListener("keydown", (ev) => {
  if (ev.key === "Escape") {
    if (S.mod || S.notifOpen || S.pop) {
      go({ mod: null, notifOpen: 0, pop: 0 });
    }
  }
});

// Real-time synchronization across multiple browser tabs
window.addEventListener("storage", (e) => {
  if (e.key === "ff-db" && e.newValue) {
    try {
      DB = JSON.parse(e.newValue);
      render();
    } catch (_) {}
  }
  if (e.key === "ff-me") {
    try {
      me = e.newValue ? JSON.parse(e.newValue) : null;
      render();
    } catch (_) {}
  }
});


/* ==========================================================================
   START
   ========================================================================== */
render();