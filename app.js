const CATS = [
  ["Symposium", "🎤"],
  ["Hackathon", "💻"],
  ["Workshop", "🛠️"],
  ["Cultural", "🎭"],
  ["Conference", "🎙️"],
  ["Sports", "⚽"],
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

const seed = () => ({
  users: [
    { id: "u1", name: "Nithish M", college: "New Prince Shri Bhavani College Of Engineering And Technology", email: "2024csenithishm@npsbcet.edu.in", department: "CSE", year: "3rd", password: "mrnithish", role: "student" },
    { id: "a1", name: "Admin", college: "Admin", email: "admin@festofind.com", department: "Administration", year: "-", password: "admin123", role: "admin" },
    { id: "u2", name: "Kevin Harrison P", college: "FFIT", email: "2024csekevinharrisonp@npsbcet.edu.in", department: "CSE", year: "3rd", password: "mrkevin", role: "student" },
  ],

  events: [
    ["AI Innovation Hackathon", "Hackathon", "2026-11-14", "09:00", "Main Auditorium", 120],
    ["National Symposium 2026", "Symposium", "2026-11-02", "10:00", "Seminar Hall A", 200],
    ["Web Development Workshop", "Workshop", "2026-10-22", "14:00", "Lab 3", 40],
    ["Inter-College Cultural Fest", "Cultural", "2026-12-05", "16:00", "Open Air Theatre", 500],
    ["Sports Championship", "Sports", "2026-11-20", "08:00", "Main Ground", 150],
    ["Emerging Technology Conference", "Conference", "2026-09-10", "09:30", "Convention Centre", 300],
  ].map((e, i) => ({
    id: "e" + i,
    title: e[0],
    category: e[1],
    date: e[2],
    time: e[3],
    venue: e[4],
    description: "Join " + e[0] + " — a flagship campus event with talks, hands-on sessions and networking with students from across colleges.",
    banner: "",
    adminId: "a1",
    status: "published",
    maxParticipants: e[5],
    createdAt: now(),
  })),

  regs: [
    { id: "r1", eventId: "e1", studentId: "u2", registeredAt: "2026-10-01T10:00:00Z" },
    { id: "r2", eventId: "e1", studentId: "u3", registeredAt: "2026-10-02T10:00:00Z" },
    { id: "r3", eventId: "e5", studentId: "u1", registeredAt: "2026-08-20T10:00:00Z" },
  ],

  anns: [
    { id: "n1", eventId: "e1", adminId: "a1", title: "Venue confirmed", message: "Symposium sessions begin sharp at 10 AM. Carry your ID card.", createdAt: "2026-10-02T12:00:00Z" },
  ],
});


/* ==========================================================================
   2. STATE & PERSISTENCE
   ========================================================================== */

// DB: load from localStorage or fall back to seed
let DB;
try { DB = JSON.parse(localStorage.getItem("ff-db")); } catch (e) {}
DB = DB || seed();

// me: currently logged-in user (null if logged out)
let me = null;
try { me = JSON.parse(localStorage.getItem("ff-me") || localStorage.getItem("ff-ses") || "null"); } catch (e) {}

const save = () => {
  try { localStorage.setItem("ff-db", JSON.stringify(DB)); } catch (e) {}
};

// persist (or clear) the session
const ses = () => {
  try {
    me ? localStorage.setItem("ff-me", JSON.stringify(me))
       : localStorage.removeItem("ff-me");
  } catch (e) {}
};

// UI state
const S = {
  scr: me ? (me.mode ? me.mode : "choose") : "login", // screen: login | choose | student | admin
  tab: "home",     // student tab
  q: "",           // search query
  cat: "",         // category filter
  eid: null,       // event being managed (admin)
  mod: null,       // modal: {t:"d"|"c", id}  d=details, c=confirm
  atab: "dash",    // admin tab
  mt: "Details",   // admin manage-event sub-tab
  pop: 0,          // profile popup open?
  rt: "Upcoming",  // "My Events" sub-tab
  pq: "",          // participants search
  // S.edit is set when editing an event
};


/* ==========================================================================
   3. HELPERS
   ========================================================================== */

const $ = (sel) => document.querySelector(sel);

// show a toast message (relies on global element with id="t")
const toast = (msg) => {
  const d = document.createElement("div");
  d.className = "ts";
  d.textContent = msg;
  t.append(d);
  setTimeout(() => d.remove(), 2600);
};

const U = (id) => DB.users.find((u) => u.id == id) || { name: "Unknown" };   // user by id
const E = (id) => DB.events.find((e) => e.id == id);                          // event by id
const cnt = (id) => DB.regs.filter((r) => r.eventId == id).length;            // registrations for event
const isReg = (id) => DB.regs.some((r) => r.eventId == id && r.studentId == me.id);
const today = () => "2026-10-05";                                             // fixed "today" for the demo
const mine = () => DB.events.filter((e) => e.adminId == me.id);               // events owned by this admin

const fd = (d) =>
  new Date(d + "T00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

// escape user text before inserting in HTML
const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const logo = `<div class="logo"><i>F</i>FestoFind</div>`;

// update state, then re-render
function go(patch) {
  Object.assign(S, patch);
  render();
}


/* ==========================================================================
   4. SHARED UI PIECES
   ========================================================================== */

// Event banner: uploaded image, or gradient + category emoji
function banner(e, height) {
  const g = GR[e.category] || GR.Symposium;
  const bg = e.banner
    ? `background-image:url(${e.banner})`
    : `background:linear-gradient(135deg,${g})`;
  const h = height ? `height:${height}px` : "";
  return `<div class="b" style="${bg};${h}" role="img" aria-label="${esc(e.title)} banner">${e.banner ? "" : EM[e.category] || "🎉"}</div>`;
}

// Event card (used in grids)
function card(e, i) {
  const full = cnt(e.id) >= e.maxParticipants;
  const registered = me.role == "student" && isReg(e.id);
  const status = registered ? "✔ Registered" : full ? "Full" : "Open";

  return `<article class="card ev" style="animation-delay:${i * 50}ms">
    ${banner(e)}
    <div class="c">
      <span class="tag">${e.category}</span>
      <b>${esc(e.title)}</b>
      <span class="mu">📅 ${fd(e.date)} · ${e.time}</span>
      <span class="mu">📍 ${esc(e.venue)}</span>
      <span class="mu">👥 ${cnt(e.id)}/${e.maxParticipants} · ${status}</span>
      <button class="btn" data-a="view" data-id="${e.id}">View Details</button>
    </div>
  </article>`;
}

// Published events matching the current category + search filters
function visible() {
  const q = S.q.toLowerCase();
  return DB.events.filter(
    (e) =>
      e.status == "published" &&
      (!S.cat || e.category == S.cat) &&
      (!q || [e.title, e.category, e.venue, e.description].join(" ").toLowerCase().includes(q))
  );
}

// "Featured" + "Upcoming" sections (or filtered results)
function results() {
  const v = visible();
  const upcoming = v.filter((e) => e.date >= today());
  const filtering = S.cat || S.q;

  return `
    <h2>${filtering ? "Results (" + v.length + ")" : "Featured Events"}</h2>
    ${v.length
      ? `<div class="grid">${v.slice(0, filtering ? 99 : 3).map(card).join("")}</div>`
      : `<div class="card">No events found.</div>`}
    ${filtering
      ? ""
      : `<h2>Upcoming Events</h2>
         <div class="grid">${upcoming.map(card).join("") || '<div class="card">No events found.</div>'}</div>`}`;
}

// List of announcement cards, newest first
function annList(list) {
  if (!list.length) return `<div class="card">No announcements yet.</div>`;

  return list
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
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

// Profile card (shared by student + admin)
function profile() {
  return `<div class="card">
    <div style="font-size:48px">🎓</div>
    <h2>${esc(me.name)}</h2>
    <p class="mu">${esc(me.college)}${me.role == "student" ? ` · ${me.department} · ${me.year} year` : ""}<br>${esc(me.email)}${me.role == "admin" ? "<br>Role: Admin" : ""}</p>
    <button class="btn d" data-a="out">Logout</button>
  </div>`;
}

// Event details modal
function detail(e) {
  const registered = isReg(e.id);
  const full = cnt(e.id) >= e.maxParticipants;
  const isStudent = me.role == "student";
  const anns = DB.anns.filter((n) => n.eventId == e.id);

  const regBtn = isStudent
    ? `<button class="btn" data-a="reg" data-id="${e.id}" ${registered || full ? "disabled" : ""}>${registered ? "Registered" : full ? "Registration is full." : "Register Now"}</button>`
    : "<span></span>";

  const annHtml = anns.length
    ? anns.map((n) => `<p><b>${esc(n.title)}</b><br>${esc(n.message)}</p>`).join("")
    : '<p class="mu">No announcements yet.</p>';

  return `<div class="ov" data-a="x">
    <div class="md" role="dialog" aria-modal="true" onclick="event.stopPropagation()">
      ${banner(e, 140)}
      <h2>${esc(e.title)}</h2>
      <span class="tag">${e.category}</span>
      <p>${esc(e.description)}</p>
      <p class="mu">📅 ${fd(e.date)} · ${e.time}<br>📍 ${esc(e.venue)}<br>👥 ${cnt(e.id)} / ${e.maxParticipants} participants<br>Hosted by ${esc(U(e.adminId).name)}</p>
      <b>Schedule</b>
      <ul class="mu">
        <li>${e.time} Registration & welcome</li>
        <li>Main sessions</li>
        <li>Wrap-up & networking</li>
      </ul>
      <b>Announcements</b>${annHtml}
      <div class="row">${regBtn}<button class="btn g" data-a="x">Close</button></div>
    </div>
  </div>`;
}

// Registration confirmation modal
function confirmM(e) {
  return `<div class="ov"><div class="md">
    <h3>Confirm registration</h3>
    <p>Register for <b>${esc(e.title)}</b> on ${fd(e.date)}?</p>
    <div class="row">
      <button class="btn g" data-a="x">Cancel</button>
      <button class="btn" data-a="ok" data-id="${e.id}">Confirm Registration</button>
    </div>
  </div></div>`;
}


/* ==========================================================================
   5. STUDENT SCREENS
   ========================================================================== */

// Top bar with search + profile popup menu
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
    <div>
      <button class="ic" aria-label="Search" data-a="srch">🔍</button>
      <button class="ic" aria-label="Profile" data-a="pop">👤</button>
    </div>
    ${popup}
  </header>`;
}

// "My Events" tab (Upcoming / Completed)
function sMy() {
  const registered = DB.regs.filter((r) => r.studentId == me.id).map((r) => E(r.eventId)).filter(Boolean);
  const list = registered.filter((e) => (S.rt == "Upcoming" ? e.date >= today() : e.date < today()));

  const tabs = ["Upcoming", "Completed"]
    .map((x) => `<button class="${S.rt == x ? "on" : ""}" data-a="rt" data-id="${x}">${x}</button>`)
    .join("");

  const body = list.length
    ? `<div class="grid">${list.map(card).join("")}</div>`
    : `<div class="card">${registered.length ? "No events here yet." : "You haven't registered for any events yet."}</div>`;

  return `<h2>My Events</h2><div class="tabs">${tabs}</div>${body}`;
}

// Whole student screen, switches on S.tab
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
      <p class="mu">Discover what's happening around your campus.</p>
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
    body = `<h2>Settings</h2><div class="card">Notifications and theme follow your device settings.</div>`;

  } else {
    body = profile();
  }

  return sHead() + `<main class="w pg">${body}</main>`;
}


/* ==========================================================================
   6. ADMIN SCREENS
   ========================================================================== */

// Top nav tabs
function aHead() {
  const tabs = [["dash", "Dashboard"], ["new", "Create Event"], ["man", "Manage Events"], ["prof", "Profile"]];
  return `<header>${logo}
    <div class="tabs" style="margin:0">
      ${tabs.map((x) => `<button class="${S.atab == x[0] ? "on" : ""}" data-a="at" data-id="${x[0]}">${x[1]}</button>`).join("")}
    </div>
  </header>`;
}

// Dashboard: stats + recent items
function dash() {
  const events = mine();
  const ids = events.map((e) => e.id);
  const regs = DB.regs.filter((r) => ids.includes(r.eventId));
  const uniqueParticipants = new Set(regs.map((r) => r.studentId)).size;

  const stats = [
    ["Total Events", events.length],
    ["Total Participants", uniqueParticipants],
    ["Upcoming Events", events.filter((e) => e.date >= today()).length],
    ["Total Registrations", regs.length],
  ];

  const recentEvents =
    events.slice(-3).reverse()
      .map((e) => `<div class="card row" style="margin-bottom:8px"><b>${esc(e.title)}</b><span class="mu">${fd(e.date)}</span></div>`)
      .join("") || '<div class="card">No events found.</div>';

  const recentRegs =
    regs.slice(-4).reverse()
      .map((r) => `<div class="card" style="margin-bottom:8px">${esc(U(r.studentId).name)} → ${esc((E(r.eventId) || {}).title)}</div>`)
      .join("") || '<div class="card">No participants have registered yet.</div>';

  // show only the first 2 announcement cards
  const recentAnns = annList(DB.anns.filter((n) => ids.includes(n.eventId)))
    .split("</div></div>").slice(0, 2).join("</div></div>");

  return `
    <div class="row"><h1>Admin Dashboard</h1><button class="btn" data-a="at" data-id="new">+ Create Event</button></div>
    <div class="grid">
      ${stats.map((s) => `<div class="card"><div class="mu">${s[0]}</div><div class="stat" data-n="${s[1]}">0</div></div>`).join("")}
    </div>
    <h2>Recent events</h2>${recentEvents}
    <h2>Recent registrations</h2>${recentRegs}
    <h2>Recent announcements</h2>${recentAnns}`;
}

// Create / edit event form
function form(e) {
  e = e || {};
  const categoryOptions = CATS.map((c) => `<option ${e.category == c[0] ? "selected" : ""}>${c[0]}</option>`).join("");

  return `<h1>${e.id ? "Edit Event" : "Create Event"}</h1>
  <form id="ef" class="card" novalidate>
    <label>Event Name<input name="title" value="${esc(e.title || "")}"></label>
    <label>Category<select name="category">${categoryOptions}</select></label>
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

// "Manage Events" list
function man() {
  const events = mine();
  if (!events.length) return `<h1>Manage Events</h1><div class="card">No events found.</div>`;

  return `<h1>Manage Events</h1>` + events.map((e) => `
    <div class="card" style="margin-bottom:10px">
      <div class="row">
        <div>
          <b>${esc(e.title)}</b> <span class="tag">${e.category}</span>
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

// Single-event management page (Details / Participants / Announcements / Statistics)
function mgmt() {
  const e = E(S.eid);
  if (!e) return `<div class="card">Event not found.</div>`;

  const regs = DB.regs.filter((r) => r.eventId == e.id);
  const TABS = ["Details", "Participants", "Announcements", "Statistics"];
  let body = "";

  if (S.mt == "Details") {
    body = `<div class="card">
      ${banner(e, 120)}
      <h2>${esc(e.title)}</h2>
      <p>${esc(e.description)}</p>
      <p class="mu">${fd(e.date)} · ${e.time} · ${esc(e.venue)}<br>Status: ${e.status} · Max ${e.maxParticipants}</p>
      <button class="btn" data-a="edit" data-id="${e.id}">Edit</button>
      <button class="btn g" data-a="pub" data-id="${e.id}">${e.status == "published" ? "Unpublish" : "Publish"}</button>
    </div>`;
  }

  if (S.mt == "Participants") {
    const list = regs.filter((r) => U(r.studentId).name.toLowerCase().includes(S.pq.toLowerCase()));
    const rows = list.map((r) => {
      const u = U(r.studentId);
      return `<tr><td>${esc(u.name)}<td>${u.department}<td>${u.year}<td>${u.email}<td>${fd(r.registeredAt.slice(0, 10))}</tr>`;
    }).join("");

    body = `<div class="row">
        <b>${regs.length} participants</b>
        <input id="pq" placeholder="Search participants" value="${esc(S.pq)}" style="max-width:240px">
        <button class="btn g" data-a="csv">Export CSV</button>
      </div>
      ${list.length
        ? `<div class="tw card"><table><tr><th>Name<th>Dept<th>Year<th>Email<th>Registered</tr>${rows}</table></div>`
        : '<div class="card">No participants have registered yet.</div>'}`;
  }

  if (S.mt == "Announcements") {
    body = `<form id="af" class="card">
        <label>Announcement Title<input name="t"></label>
        <label>Message<textarea name="m" rows="3"></textarea></label>
        <div class="err" id="ae"></div>
        <button class="btn">Post Announcement</button>
      </form>
      <h3>Posted</h3>
      ${annList(DB.anns.filter((n) => n.eventId == e.id))}`;
  }

  if (S.mt == "Statistics") {
    // count registrations grouped by a student field (department, year)
    const groupBy = (key) => {
      const o = {};
      regs.forEach((r) => {
        const v = U(r.studentId)[key];
        o[v] = (o[v] || 0) + 1;
      });
      return o;
    };

    // horizontal bar rows
    const bars = (o) =>
      Object.entries(o)
        .map(([k, v]) => `<div class="row"><span>${k}</span><span style="flex:1;min-width:80px"><div class="bar" style="width:${(v / regs.length) * 100}%"></div></span><b>${v}</b></div>`)
        .join("") || '<span class="mu">No data yet.</span>';

    // registrations per day
    const trend = {};
    regs.forEach((r) => {
      const d = r.registeredAt.slice(0, 10);
      trend[d] = (trend[d] || 0) + 1;
    });

    body = `<div class="grid">
        <div class="card"><div class="mu">Total registrations</div><div class="stat">${regs.length}</div></div>
        <div class="card"><div class="mu">Participation</div><div class="stat">${Math.round((regs.length / e.maxParticipants) * 100)}%</div><div class="mu">${regs.length} of ${e.maxParticipants} seats</div></div>
      </div>
      <div class="grid" style="margin-top:12px">
        <div class="card"><b>By department</b>${bars(groupBy("department"))}</div>
        <div class="card"><b>By year</b>${bars(groupBy("year"))}</div>
        <div class="card"><b>Registration trend</b>${bars(trend)}</div>
      </div>`;
  }

  return `<button class="btn g" data-a="at" data-id="man">← Back</button>
    <h1>${esc(e.title)}</h1>
    <div class="tabs">${TABS.map((x) => `<button class="${S.mt == x ? "on" : ""}" data-a="mt" data-id="${x}">${x}</button>`).join("")}</div>
    ${body}`;
}

// Whole admin screen, switches on S.atab
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
   7. AUTH SCREENS
   ========================================================================== */

function login() {
  const centeredLogo = logo.replace('class="logo"', 'class="logo" style="justify-content:center"');

  return `<div class="ctr">
    <form id="lf" class="card pg" style="width:100%;max-width:380px" novalidate>
      <div style="text-align:center">${centeredLogo}<p class="mu">Discover. Participate. Experience.</p></div>
      <label>Email<input name="e" type="email" autocomplete="username"></label>
      <label>Password<input name="p" type="password" id="pw" autocomplete="current-password"></label>
      <label style="display:flex;gap:8px;align-items:center"><input type="checkbox" style="width:auto" id="sp" data-a="sp"> Show password</label>
      <div class="row">
        <label style="display:flex;gap:6px;align-items:center;margin:0"><input type="checkbox" style="width:auto" checked name="rm"> Remember me</label>
        <a href="#" data-a="fg">Forgot password?</a>
      </div>
      <div class="err" id="le" role="alert"></div>
      <button class="btn" style="width:100%;margin-top:10px">Login</button>
      <p class="mu">Demo: student@festofind.com / student123<br>admin@festofind.com / admin123</p>
    </form>
  </div>`;
}

// Role chooser shown after login
function choose() {
  const options = [
    ["student", "🎓", "Student", "Discover events, register and manage your event activities."],
    ["admin", "🛠️", "Admin", "Create events, manage participants and keep everyone updated."],
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
   8. RENDER & EVENT BINDING
   ========================================================================== */

function render() {
  const app = $("#app");
  let html;

  // pick the screen
  if (!me) html = login();
  else if (S.scr == "choose") html = choose();
  else if (S.scr == "student" && me.role == "student") html = student();
  else if (S.scr == "admin" && me.role == "admin") html = admin();
  else html = choose();

  // modals on top
  if (S.mod && S.mod.t == "d" && E(S.mod.id)) html += detail(E(S.mod.id));
  if (S.mod && S.mod.t == "c") html += confirmM(E(S.mod.id));

  app.innerHTML = html;

  // animate stat counters from 0 -> value
  document.querySelectorAll("[data-n]").forEach((el) => {
    const target = +el.dataset.n;
    const start = performance.now();
    (function frame(ts) {
      const p = Math.min(1, (ts - start) / 600);
      el.textContent = Math.round(target * p);
      p < 1 && requestAnimationFrame(frame);
    })(start);
  });

  bind();
}

// Attach handlers to elements that exist after each render (forms + inputs)
function bind() {

  // --- student search box: live-filter without full re-render
  const q = $("#q");
  if (q) q.oninput = (ev) => {
    S.q = ev.target.value;
    $("#res").innerHTML = results();
  };

  // --- participants search: re-render but keep cursor position
  const pq = $("#pq");
  if (pq) pq.oninput = (ev) => {
    S.pq = ev.target.value;
    const pos = ev.target.selectionStart;
    render();
    $("#pq").focus();
    $("#pq").setSelectionRange(pos, pos);
  };

  // --- login form
  const lf = $("#lf");
  if (lf) lf.onsubmit = (ev) => {
    ev.preventDefault();
    const email = lf.e.value.trim();
    const pass = lf.p.value;
    const err = $("#le");

    if (!email || !pass) return (err.textContent = "Please enter your email and password.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return (err.textContent = "Please enter a valid email address.");

    const btn = lf.querySelector(".btn");
    btn.textContent = "Signing in…";
    btn.disabled = true;

    setTimeout(() => {
      // only the two demo accounts (u1, a1) can log in
      const u = DB.users.find((u) => u.email == email && u.password == pass && (u.id == "u1" || u.id == "a1"));
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
    }, 500);
  };

  // --- post announcement form
  const af = $("#af");
  if (af) af.onsubmit = (ev) => {
    ev.preventDefault();
    const title = af.t.value.trim();
    const message = af.m.value.trim();
    if (!title || !message) return ($("#ae").textContent = "Please add a title and a message.");

    DB.anns.push({ id: uid("n"), eventId: S.eid, adminId: me.id, title, message, createdAt: now() });
    save();
    render();
    toast("Announcement posted!");
  };

  // --- create / edit event form
  const ef = $("#ef");
  if (ef) ef.onsubmit = (ev) => {
    ev.preventDefault();
    const f = ef;
    const v = (k) => f[k].value.trim();
    const err = $("#fe");
    const max = +f.max.value;

    if (!v("title") || !f.date.value || !f.time.value || !v("venue") || !v("description") || !(max > 0)) {
      return (err.textContent = "Please fill in all required fields, including a valid participant limit.");
    }

    // finish: create or update, save, go to Manage list
    const done = (bannerData) => {
      const existing = S.edit ? E(S.edit) : null;
      const data = {
        title: v("title"),
        category: f.category.value,
        date: f.date.value,
        time: f.time.value,
        venue: v("venue"),
        description: v("description"),
        maxParticipants: max,
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
      setTimeout(() => done(null), 400);
    }
  };
}


/* --------------------------------------------------------------------------
   Global click handler (event delegation) – every [data-a] element routes here
   data-a  = action name,  data-id = payload
   -------------------------------------------------------------------------- */
document.addEventListener("click", (ev) => {
  const el = ev.target.closest("[data-a]");
  if (!el) return;
  const a = el.dataset.a;
  const id = el.dataset.id;

  // clicks inside a modal body shouldn't trigger the overlay's "close"
  if (a == "x" && ev.target.closest(".md") && ev.target.dataset.a != "x") return;

  // --- login screen
  if (a == "sp") { $("#pw").type = el.checked ? "text" : "password"; return; }
  if (a == "fg") { ev.preventDefault(); toast("Password reset link sent (demo)."); return; }

  // --- role chooser / logout
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
    S.scr = "login";
    render();
    return toast("Logged out successfully.");
  }

  // --- student navigation
  if (a == "pop") return go({ pop: S.pop ? 0 : 1 });
  if (a == "srch") { go({ tab: "home", pop: 0 }); return setTimeout(() => $("#q") && $("#q").focus()); }
  if (a == "tab") return go({ tab: id, pop: 0 });
  if (a == "cat") return go({ cat: id == S.cat ? "" : id });
  if (a == "rt") return go({ rt: id });

  // --- modals & registration
  if (a == "view") return go({ mod: { t: "d", id } });
  if (a == "x") return go({ mod: null });
  if (a == "reg") return go({ mod: { t: "c", id } });
  if (a == "ok") {
    const e = E(id);
    if (isReg(id)) return toast("You're already registered."), go({ mod: null });
    if (cnt(id) >= e.maxParticipants) return toast("Registration is full."), go({ mod: null });

    el.disabled = true;
    el.textContent = "Registering…";
    return setTimeout(() => {
      DB.regs.push({ id: uid("r"), eventId: id, studentId: me.id, registeredAt: now() });
      save();
      go({ mod: { t: "d", id } });
      toast("Registration successful!");
    }, 400);
  }

  // --- admin navigation
  if (a == "at") return go({ atab: id, edit: null, mod: null });
  if (a == "mg") return go({ atab: "mg", eid: id, mt: "Details", pq: "", mod: null });
  if (a == "mt") return go({ mt: id });
  if (a == "edit") return go({ atab: "new", edit: id, mod: null });

  // --- admin event actions
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

  // --- export participants as CSV
  if (a == "csv") {
    const rows = [["Name", "Department", "Year", "Email"]].concat(
      DB.regs.filter((r) => r.eventId == S.eid).map((r) => {
        const u = U(r.studentId);
        return [u.name, u.department, u.year, u.email];
      })
    );
    const link = document.createElement("a");
    link.href = "data:text/csv," + encodeURIComponent(rows.map((r) => r.join(",")).join("\n"));
    link.download = "participants.csv";
    link.click();
  }
});


/* ==========================================================================
   START
   ========================================================================== */
render();