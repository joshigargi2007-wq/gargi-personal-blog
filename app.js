/* Blog engine – you don't need to edit this file. */
const $ = (s, r = document) => r.querySelector(s);
const app = $("#app");
const esc = value => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;")
  .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const safeUrl = (value, image = false) => {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  try {
    const url = new URL(raw, location.href);
    const allowed = image ? ["http:", "https:"] : ["http:", "https:", "mailto:"];
    return allowed.includes(url.protocol) ? raw : "";
  } catch { return ""; }
};
const copyText = async value => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {}
  try {
    const field = document.createElement("textarea");
    field.value = value;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    const copied = document.execCommand("copy");
    field.remove();
    return copied;
  } catch { return false; }
};
const store = { get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } },
                set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} } };
const posts = (Array.isArray(POSTS) ? POSTS : [])
  .filter(p => p && typeof p.slug === "string" && p.slug.trim() && typeof p.title === "string" && p.title.trim())
  .map(p => ({
    ...p,
    week: Number.isFinite(Number(p.week)) ? Number(p.week) : 0,
    emoji: typeof p.emoji === "string" ? p.emoji : "✿",
    summary: typeof p.summary === "string" ? p.summary : "",
    content: typeof p.content === "string" ? p.content : "",
    date: typeof p.date === "string" ? p.date : "",
    tags: Array.isArray(p.tags) ? p.tags.filter(t => typeof t === "string") : [],
    quiz: Array.isArray(p.quiz) ? p.quiz.filter(q =>
      q && typeof q.q === "string" && Array.isArray(q.options) &&
      q.options.length >= 2 && q.options.every(option => typeof option === "string") &&
      Number.isInteger(Number(q.answer)) && Number(q.answer) >= 0 && Number(q.answer) < q.options.length
    ).map(q => ({ ...q, answer: Number(q.answer) })) : []
  }))
  .sort((a, b) => b.week - a.week);
const words = p => String(p.content ?? "").trim().split(/\s+/).filter(Boolean).length;
const mins = p => Math.max(1, Math.ceil(words(p) / 200));
const fmt = d => {
  const date = new Date(`${d}T00:00:00`);
  return Number.isNaN(date.getTime()) ? "Date unavailable" :
    date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
};

/* ---------- tiny markdown renderer ---------- */
function md(src) {
  const blocks = [];
  src = src.replace(/:::stepcards\n([\s\S]*?)\n:::/g, (match, body) => {
    const cards = body.split("\n").map(line => line.trim()).filter(Boolean).map(line => {
      const parts = line.split("|");
      if (parts.length < 3) return "";
      return `<article class="step-card"><span class="step-number">${esc(parts[0])}</span><strong>${esc(parts[1])}</strong><p>${esc(parts.slice(2).join("|"))}</p></article>`;
    }).join("");
    blocks.push(`<div class="step-flow" aria-label="Vibe coding steps">${cards}</div>`);
    return `\n@@B${blocks.length - 1}@@\n`;
  });
  src = src.replace(/:::promptbuilder\s*\n[\s\S]*?\n:::/g, () => {
    blocks.push(`<section class="prompt-builder">
      <div class="prompt-builder-top"><span class="prompt-kicker">YOUR FIRST PROMPT</span><span class="prompt-sticker">✿</span></div>
      <h3>Make it yours before you copy</h3>
      <p class="prompt-helper">Add your name, then copy this ready-to-use request for your AI coding assistant.</p>
      <label class="prompt-name-label" for="prompt-name">Your name</label>
      <input class="prompt-name" id="prompt-name" type="text" maxlength="50" placeholder="Type your name" value="">
      <div class="prompt-feature-grid">
        <div class="prompt-feature prompt-pink"><span>01</span><strong>A friendly heading</strong><small>“Hello, I'm [your name]”</small></div>
        <div class="prompt-feature prompt-orange"><span>02</span><strong>A short introduction</strong><small>A few lines about you</small></div>
        <div class="prompt-feature prompt-yellow"><span>03</span><strong>A working button</strong><small>Changes its message when clicked</small></div>
        <div class="prompt-feature prompt-mint"><span>04</span><strong>Soft colours</strong><small>Lavender and cream</small></div>
      </div>
      <div class="prompt-preview-wrap"><div class="prompt-preview-label">YOUR COPY-READY PROMPT</div><pre class="prompt-preview" aria-live="polite"></pre></div>
      <div class="prompt-builder-bottom"><span>Beginner-friendly · Keep it simple</span><button class="prompt-copy" type="button">Copy my prompt</button></div>
    </section>`);
    return `\n@@B${blocks.length - 1}@@\n`;
  });
  src = src.replace(/:::safeprompt\s*\n[\s\S]*?\n:::/g, () => {
    blocks.push(`<section class="safe-prompt-card">
      <div class="safe-prompt-heading"><span class="safe-prompt-label">LEVEL 5 · SAVE POINT</span><span class="safe-prompt-doodle" aria-hidden="true">✎</span></div>
      <h3>Ask before making changes</h3>
      <p class="safe-prompt-intro">Copy this message before you ask your coding assistant to update your project.</p>
      <div class="safe-prompt-points">
        <span><b>01</b> Explain the files first</span>
        <span><b>02</b> Keep working features</span>
        <span><b>03</b> Tell me how to test it</span>
      </div>
      <div class="safe-prompt-paper"><span class="safe-prompt-paper-tag">COPY-READY REQUEST</span><pre class="safe-prompt-text"></pre></div>
      <div class="safe-prompt-footer"><span>Keep your working version safe.</span><button class="safe-prompt-copy" type="button">Copy this request</button></div>
    </section>`);
    return `\n@@B${blocks.length - 1}@@\n`;
  });
  src = src.replace(/(```|~~~)(\w*)\n([\s\S]*?)\1/g, (m, f, lang, code) => {
    blocks.push(`<div class="code"><span class="lang">${lang || "code"}</span><button class="copy">Copy</button><pre><code>${esc(code.replace(/\n$/, ""))}</code></pre></div>`);
    return `\n@@B${blocks.length - 1}@@\n`;
  });
  const inl = s => esc(s)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
      const src = safeUrl(url, true);
      return src ? `<img alt="${alt}" src="${esc(src)}" loading="lazy">` : alt;
    })
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label, url) => {
      const href = safeUrl(url);
      return href ? `<a href="${esc(href)}" target="_blank" rel="noopener noreferrer">${label}</a>` : label;
    })
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
  const L = src.split("\n"); let out = "", i = 0, m;
  const start = l => /^(#{1,4}\s|>|[-*]\s|\d+\.\s|---+$|@@B)/.test(l);
  while (i < L.length) {
    const l = L[i];
    if (!l.trim()) { i++; continue }
    if (m = l.match(/^@@B(\d+)@@$/)) { out += blocks[m[1]]; i++; continue }
    if (m = l.match(/^(#{1,4})\s+(.*)/)) { out += `<h${Math.min(m[1].length, 4)}>${inl(m[2])}</h${Math.min(m[1].length, 4)}>`; i++; continue }
    if (/^---+$/.test(l)) { out += "<hr>"; i++; continue }
    if (l.startsWith(">")) { let t = []; while (i < L.length && L[i].startsWith(">")) t.push(L[i++].replace(/^>\s?/, "")); out += `<blockquote><p>${inl(t.join(" "))}</p></blockquote>`; continue }
    if (/^[-*]\s/.test(l)) { let t = ""; while (i < L.length && /^[-*]\s/.test(L[i])) t += `<li>${inl(L[i++].replace(/^[-*]\s/, ""))}</li>`; out += `<ul>${t}</ul>`; continue }
    if (/^\d+\.\s/.test(l)) { let t = ""; while (i < L.length && /^\d+\.\s/.test(L[i])) t += `<li>${inl(L[i++].replace(/^\d+\.\s/, ""))}</li>`; out += `<ol>${t}</ol>`; continue }
    let t = []; while (i < L.length && L[i].trim() && !start(L[i])) t.push(L[i++]);
    out += `<p>${inl(t.join(" "))}</p>`;
  }
  return out;
}

/* ---------- confetti ---------- */
const cv = $("#confetti"), cx = cv.getContext("2d"); let parts = [];
function size() { cv.width = innerWidth; cv.height = innerHeight }
addEventListener("resize", size); size();
function confetti(x = innerWidth / 2, y = innerHeight / 3) {
  if (matchMedia("(prefers-reduced-motion:reduce)").matches) return;
  const colors = ["#ff5d8f", "#ffd23f", "#2ee6a6", "#3a4bff"];
  for (let n = 0; n < 70 && parts.length < 350; n++) parts.push({ x, y, vx: (Math.random() - .5) * 14, vy: Math.random() * -12 - 2, r: Math.random() * 6 + 3, c: colors[n % 4], life: 90 });
  if (!confetti.running) { confetti.running = true; tick(); }
}
function tick() {
  cx.clearRect(0, 0, cv.width, cv.height);
  parts = parts.filter(p => p.life-- > 0);
  parts.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += .4; cx.fillStyle = p.c; cx.fillRect(p.x, p.y, p.r, p.r * 1.6) });
  if (parts.length) requestAnimationFrame(tick);
  else { cx.clearRect(0, 0, cv.width, cv.height); confetti.running = false; }
}

/* ---------- rotating happy notes ---------- */
const happyQuotes = [
  "There is something good in every ordinary day.",
  "Let today surprise you in a lovely way.",
  "Small joys count. Collect as many as you can.",
  "You deserve a day that feels light.",
  "A little laughter can change the whole afternoon.",
  "Make room for the things that make you smile.",
  "Good things often begin with a curious mind.",
  "You are allowed to enjoy the little things.",
  "May your coffee be warm and your day be kind.",
  "The world is full of lovely things to notice.",
  "A fresh start can happen on an ordinary Tuesday.",
  "Keep a little space for happy accidents.",
  "Some days are made better by flowers and good music.",
  "There is no such thing as too much sunshine.",
  "Give yourself credit for how far you have come.",
  "A kind word can stay with someone all day.",
  "Find one thing today that makes you grin.",
  "Let the good moments take up a little more space.",
  "You can make an ordinary day feel special.",
  "Be proud of the small things you finished today.",
  "A happy heart notices the small details.",
  "There is always time for one more reason to smile.",
  "Keep doing things that make you feel like yourself.",
  "May something lovely find its way to you today.",
  "The best memories often start with simple plans.",
  "Take the long way if the view makes you happy.",
  "A little hope goes a long way.",
  "Today is a good day to be gentle with yourself.",
  "Let yourself be excited about the little things.",
  "You bring something good to the places you go."
];
/* ---------- views ---------- */
function home() {
  const tags = [...new Set(posts.flatMap(p => p.tags))];
  const totalMin = posts.reduce((sum, p) => sum + mins(p), 0);
  const latestWeek = posts.length ? Math.max(...posts.map(p => Number(p.week) || 0)) : 0;
  const previousQuote = store.get("gargi-last-quote", -1);
  let quoteIndex = Math.floor(Math.random() * happyQuotes.length);
  if (happyQuotes.length > 1 && quoteIndex === previousQuote) quoteIndex = (quoteIndex + 1 + Math.floor(Math.random() * (happyQuotes.length - 1))) % happyQuotes.length;
  store.set("gargi-last-quote", quoteIndex);
  app.innerHTML = `
    <section class="hero">
      <div class="hero-copy">
        <span class="eyebrow"><span class="live-dot"></span> A little corner of the internet</span>
        <h1>${esc(SITE.name)}'s <span class="hl">learning log</span></h1>
        <div class="typed" id="typed"></div>
        <div class="stats">
          <div class="stat"><b>${posts.length}</b><span>posts written</span></div>
          <div class="stat"><b>${latestWeek}</b><span>weeks learning</span></div>
          <div class="stat"><b>${totalMin}</b><span>minutes to explore</span></div>
        </div>
      </div>
      <div class="hero-doodle" aria-hidden="true"><span class="doodle-star">✳</span><span class="doodle-spark">✦</span><div class="doodle-note quote-note">${esc(happyQuotes[quoteIndex])}</div><span class="doodle-smile">☺</span></div>
    </section>
    <div class="home-layout">
      <section class="home-main">
        <div class="section-heading"><div><span class="eyebrow">THE NOTEBOOK</span><h2>The latest notes <span>↘</span></h2></div><span class="result-count" id="result-count"></span></div>
        <div class="controls">
          <label class="search-wrap"><span aria-hidden="true">⌕</span><input id="search" type="search" placeholder="Find something interesting..." aria-label="Search posts"><kbd>/</kbd></label>
          <button class="chip on" data-tag="">Everything</button>
          ${tags.map(t => `<button class="chip" data-tag="${esc(t)}">${esc(t)}</button>`).join("")}
        </div>
        <div class="grid" id="grid"></div>
      </section>
      <aside class="side-panel">
        <section class="side-card pick-card">
          <span class="side-kicker">CAN'T PICK?</span><div class="pick-icon">🎲</div>
          <h3>Surprise me</h3><p>Let the notebook choose your next read.</p>
          <button class="surprise-btn" id="surprise">Pick a random post <span>↗</span></button>
        </section>
        <section class="side-card note-card">
          <span class="side-kicker">A SMALL REMINDER</span><div class="note-mark">“</div>
          <p class="note-text">A reminder to stay curious and keep asking questions.</p>
          <span class="note-sign">A little reminder</span>
        </section>
        <section class="side-card sticker-card">
          <span class="side-kicker">PICK A STICKER</span><p>Tap one for a small note.</p>
          <div class="sticker-tray">
            <button type="button" class="sticker" data-note="You are allowed to be a work in progress." aria-label="Sparkle sticker">✦</button>
            <button type="button" class="sticker" data-note="Take the scenic route today." aria-label="Flower sticker">✿</button>
            <button type="button" class="sticker" data-note="One small step still counts." aria-label="Heart sticker">♡</button>
            <button type="button" class="sticker" data-note="Save a little time for daydreaming." aria-label="Star sticker">★</button>
          </div><p class="sticker-message" id="sticker-message" aria-live="polite">Pick a sticker.</p>
        </section>
        <section class="side-card archive-card">
          <span class="side-kicker">THE ARCHIVE</span><div class="archive-number">${posts.length.toString().padStart(2,"0")}</div>
          <p>Notes I’ve collected along the way.</p>
          <a href="#/guestbook">Leave a note in the guestbook <span>→</span></a>
        </section>
      </aside>
    </div>`;
  let tag = "", q = "";
  const draw = () => {
    const f = posts.filter(p => (!tag || p.tags.includes(tag)) && (p.title + p.summary + p.tags.join(" ") + p.content).toLowerCase().includes(q));
    $("#result-count").textContent = `${f.length} ${f.length === 1 ? "story" : "stories"}`;
    $("#grid").innerHTML = f.length ? f.map((p, n) => `
      <a class="card card-${n % 4}" href="#/post/${encodeURIComponent(p.slug)}" style="--card-index:${n}">
        <span class="card-topline"><span class="wk">WEEK ${p.week}</span><span class="card-arrow">↗</span></span>
        <span class="emoji">${esc(p.emoji)}</span>
        <h2>${esc(p.title)}</h2><p>${esc(p.summary)}</p>
        <div class="card-bottom"><div class="tags">${p.tags.map(t => `<span class="tag">${esc(t)}</span>`).join("")}</div><span class="read-link">Read story <b>→</b></span></div>
      </a>`).join("") : `<div class="empty">No posts match that search yet. Try another word.</div>`;
  };
  $("#search").oninput = e => { q = e.target.value.toLowerCase(); draw() };
  document.querySelectorAll(".chip").forEach(b => b.onclick = () => { tag = b.dataset.tag; document.querySelectorAll(".chip").forEach(x => x.classList.toggle("on", x === b)); draw() });
  $("#surprise").onclick = () => {
    if (!posts.length) return;
    const pool = posts.filter(p => !tag || p.tags.includes(tag));
    const choices = pool.length ? pool : posts;
    const chosen = choices[Math.floor(Math.random() * choices.length)];
    location.hash = `#/post/${encodeURIComponent(chosen.slug)}`;
  };
  document.querySelectorAll(".sticker").forEach(btn => btn.onclick = () => {
    $("#sticker-message").textContent = btn.dataset.note;
    btn.classList.add("sticker-pop");
    setTimeout(() => btn.classList.remove("sticker-pop"), 350);
    const r = btn.getBoundingClientRect(); confetti(r.left + r.width/2, r.top);
  });
  draw(); typer();
}

let typeTimer;
function typer() {
  clearTimeout(typeTimer); const el = $("#typed"); if (!el) return;
  let i = 0, j = 0, del = false;
  (function step() {
    if (!$("#typed")) return;
    const lines = Array.isArray(SITE.tagline) && SITE.tagline.length ? SITE.tagline : ["Learning in public, one post at a time."];
    const s = String(lines[i % lines.length] ?? "");
    el.textContent = s.slice(0, j);
    if (!del && j === s.length) { del = true; typeTimer = setTimeout(step, 1600); return }
    if (del && j === 0) { del = false; i++ }
    j += del ? -1 : 1; typeTimer = setTimeout(step, del ? 25 : 55);
  })();
}

function post(slug) {
  const idx = posts.findIndex(p => p.slug === slug), p = posts[idx];
  if (!p) { app.innerHTML = `<div class="empty">That post doesn't exist. <a href="#/">Go back to all posts</a>.</div>`; return }
  const older = posts[idx + 1], newer = posts[idx - 1];
  const emojis = ["👏", "🔥", "🧠", "💡"], key = "react:" + p.slug;
  app.innerHTML = `
    <article class="post">
      <a class="back" href="#/">Back to all posts</a>
      <header class="post-head">
        <div class="emoji">${esc(p.emoji)}</div>
        <h1>${esc(p.title)}</h1>
        <div class="meta"><span>Week ${p.week}</span><span>${fmt(p.date)}</span><span>${mins(p)} min read</span></div>
        <div class="tags">${p.tags.map(t => `<span class="tag" style="background:var(--yellow);color:#1b1b3a">${esc(t)}</span>`).join("")}</div>
      </header>
      <div class="content">${md(p.content)}</div>
      ${p.quiz.length ? `<section class="box" id="quiz"><h3>Test what you learned</h3>
        ${p.quiz.map((z, n) => `<div class="q"><p>${n + 1}. ${esc(z.q)}</p>${z.options.map((o, k) => `<button type="button" class="opt" data-q="${n}" data-k="${k}">${esc(o)}</button>`).join("")}</div>`).join("")}
        <div class="score" id="score"></div></section>` : ""}
      <section class="box"><h3>Did this help?</h3><div class="react" id="react"></div></section>
      <section class="box"><h3>Share this post</h3><button class="chip" id="share">Copy link</button></section>
      <nav class="pn">${older ? `<a href="#/post/${encodeURIComponent(older.slug)}">Previous: ${esc(older.title)}</a>` : ""}${newer ? `<a href="#/post/${encodeURIComponent(newer.slug)}">Next: ${esc(newer.title)}</a>` : ""}</nav>
    </article>`;
  // reactions
  const savedMine = store.get(key, []), savedCounts = store.get(key + ":n", {});
  const mine = Array.isArray(savedMine) ? savedMine.filter(e => emojis.includes(e)) : [];
  const counts = savedCounts && typeof savedCounts === "object" && !Array.isArray(savedCounts) ? savedCounts : {};
  emojis.forEach(e => { counts[e] = Math.max(0, Number(counts[e]) || 0) });
  const drawR = () => $("#react").innerHTML = emojis.map(e => `<button type="button" data-e="${e}" class="${mine.includes(e) ? "me" : ""}" aria-pressed="${mine.includes(e)}" aria-label="${e} reaction, ${counts[e] || 0} votes">${e} ${counts[e] || 0}</button>`).join("");
  drawR();
  $("#react").onclick = ev => { const b = ev.target.closest("button"); if (!b) return; const e = b.dataset.e;
    if (mine.includes(e)) { mine.splice(mine.indexOf(e), 1); counts[e] = Math.max(0, counts[e] - 1) } else { mine.push(e); counts[e] = (counts[e] || 0) + 1; const r = b.getBoundingClientRect(); confetti(r.left + r.width / 2, r.top) }
    store.set(key, mine); store.set(key + ":n", counts); drawR() };
  // quiz
  let right = 0, done = 0;
  document.querySelectorAll(".opt").forEach(b => b.onclick = () => {
    if (!Array.isArray(p.quiz)) return;
    const z = p.quiz[Number(b.dataset.q)];
    if (!z || b.disabled) return;
    const correctAnswer = Number(z.answer);
    const ok = Number(b.dataset.k) === correctAnswer;
    document.querySelectorAll(`.opt[data-q="${b.dataset.q}"]`).forEach((o, k) => { o.disabled = true; if (k === correctAnswer) o.classList.add("good") });
    if (!ok) b.classList.add("bad"); else right++;
    done++;
    if (done === p.quiz.length) { $("#score").textContent = `You got ${right} of ${done}. ${right === done ? "Perfect score! 🎉" : "Re-read the post and try again!"}`; if (right === done) confetti() }
  });
  // share + copy
  $("#share").onclick = async e => {
    const copied = await copyText(location.href);
    e.currentTarget.textContent = copied ? "Link copied!" : "Copy failed";
  };
  document.querySelectorAll(".copy").forEach(b => b.onclick = async () => {
    const code = b.parentElement.querySelector("code");
    const copied = await copyText(code?.textContent ?? "");
    b.textContent = copied ? "Copied!" : "Copy failed";
    setTimeout(() => b.textContent = "Copy", 1500);
  });
  const safePromptCard = $(".safe-prompt-card");
  if (safePromptCard) {
    const safePrompt = `Before changing anything, explain which files you plan
to edit. Keep the working features as they are.
After the change, tell me how to test it.`;
    $(".safe-prompt-text", safePromptCard).textContent = safePrompt;
    $(".safe-prompt-copy", safePromptCard).onclick = async e => {
      const copied = await copyText(safePrompt);
      e.currentTarget.textContent = copied ? "Copied!" : "Copy failed";
      setTimeout(() => { e.currentTarget.textContent = "Copy this request"; }, 1600);
    };
  }
  const promptBuilder = $(".prompt-builder");
  if (promptBuilder) {
    const nameField = $(".prompt-name", promptBuilder);
    const preview = $(".prompt-preview", promptBuilder);
    const makePrompt = () => {
      const name = nameField.value.trim() || "[your name]";
      return `Help me make a simple personal webpage.

It should have:
- A heading that says "Hello, I'm ${name}"
- A short introduction below it
- A button that changes the message when clicked
- A soft lavender and cream colour theme

I am a beginner. Explain which files you create
and what each one does. Keep the code simple.
Do not add features I did not ask for.`;
    };
    const updatePrompt = () => { preview.textContent = makePrompt(); };
    nameField.addEventListener("input", updatePrompt);
    updatePrompt();
    $(".prompt-copy", promptBuilder).onclick = async e => {
      const copied = await copyText(makePrompt());
      e.currentTarget.textContent = copied ? "Copied!" : "Copy failed";
      setTimeout(() => { e.currentTarget.textContent = "Copy my prompt"; }, 1600);
    };
  }
  document.title = p.title + " | " + SITE.name;
}

function about() {
  app.innerHTML = `<section class="about scrapbook-about">
    <span class="eyebrow">A LITTLE INTRODUCTION</span>
    <div class="about-paper"><span class="about-flower">✿</span><span class="tape"></span>
      <p class="about-hello">hello, I'm</p><h1>${esc(SITE.name)} <span>♡</span></h1>
      <p class="about-bio">${esc(SITE.bio)}</p>
      <div class="about-divider">✦ &nbsp; ✦ &nbsp; ✦</div>
      <ul>${SITE.about.map(a => `<li>${esc(a)}</li>`).join("")}</ul>
      <p class="about-signoff">Thanks for stopping by. Stay curious! <span>— ${esc(SITE.name)}</span></p>
    </div>
    <div class="about-bottom"><span>MADE OF NOTES, CURIOSITY & LITTLE MOMENTS</span><a href="#/guestbook">Come say hello →</a></div>
  </section>`;
}

function guestbook() {
  const storedEntries = store.get("gargi-guestbook", []);
  const entries = Array.isArray(storedEntries) ? storedEntries.filter(e => e && typeof e.name === "string" && typeof e.message === "string") : [];
  app.innerHTML = `<section class="guestbook-page">
    <span class="eyebrow">THE VISITORS' PAGE</span><h1>Leave a little note <span>♡</span></h1>
    <p class="guestbook-intro">A tiny guestbook for kind words, recommendations, and hellos. I'd love to know you stopped by.</p>
    <form id="guest-form" class="guest-form">
      <label for="guest-name">Your name</label><input id="guest-name" name="name" maxlength="35" required placeholder="What should I call you?">
      <label for="guest-message">Your note</label><textarea id="guest-message" name="message" maxlength="280" required placeholder="Say hello, share a book recommendation, or leave a kind thought..."></textarea>
      <button class="guest-submit" type="submit">Pin my note <span>✦</span></button>
      <p class="guestbook-small">Notes are saved in this browser on this device.</p>
    </form>
    <div class="guest-notes"><div class="guest-notes-head"><h2>Little notes left here</h2><span>${entries.length} ${entries.length === 1 ? "note" : "notes"}</span></div>
      <div id="guest-list">${entries.length ? entries.slice().reverse().map(e => `<article class="guest-note"><span class="guest-note-pin">✦</span><p>${esc(e.message)}</p><footer>${esc(e.name)} <time>${esc(e.date)}</time></footer></article>`).join("") : `<div class="guest-empty">The page is still blank. Leave the first little note?</div>`}</div>
    </div>
  </section>`;
  $("#guest-form").addEventListener("submit", e => {
    e.preventDefault();
    const name = $("#guest-name").value.trim(), message = $("#guest-message").value.trim();
    if (!name || !message) return;
    const stored = store.get("gargi-guestbook", []);
    const saved = Array.isArray(stored) ? stored : [];
    saved.push({ name, message, date: new Date().toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) });
    store.set("gargi-guestbook", saved.slice(-50));
    confetti();
    guestbook();
  });
}

/* ---------- router ---------- */
function route() {
  const h = location.hash.replace(/^#\/?/, ""), [a, ...rest] = h.split("/");
  let slug = rest.join("/");
  try { slug = decodeURIComponent(slug); } catch { slug = ""; }
  scrollTo(0, 0);
  document.title = SITE.name + "'s Little Notebook";
  document.querySelectorAll("nav a").forEach(n => n.classList.toggle("on", n.dataset.nav === (["about", "guestbook"].includes(a) ? a : "home")));
  if (a === "post") post(slug);
  else if (a === "about") about();
  else if (a === "guestbook") guestbook();
  else home();
  scroll();
}
function scroll() {
  const h = document.documentElement;
  const value = Math.max(0, Math.min(100, h.scrollTop / ((h.scrollHeight - h.clientHeight) || 1) * 100));
  $("#progress").style.width = value + "%";
  $("#progress").setAttribute("aria-valuenow", String(Math.round(value)));
}
addEventListener("scroll", scroll); addEventListener("hashchange", route);
addEventListener("keydown", e => {
  if (e.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName) && !e.ctrlKey && !e.metaKey && !e.altKey) {
    const search = $("#search");
    if (search) { e.preventDefault(); search.focus(); }
  }
  if (e.key === "Escape" && document.activeElement === $("#search")) { $("#search").value = ""; $("#search").dispatchEvent(new Event("input")); $("#search").blur(); }
});

/* ---------- theme, header, pencil buddy ---------- */
const root = document.documentElement;
const setTheme = t => {
  const theme = t === "dark" ? "dark" : "light";
  root.dataset.theme = theme;
  $("#theme").textContent = theme === "dark" ? "☀️" : "🌙";
  $("#theme").setAttribute("aria-pressed", String(theme === "dark"));
  store.set("theme", theme);
};
const savedTheme = store.get("theme", null);
setTheme(savedTheme === "dark" || savedTheme === "light" ? savedTheme :
  (matchMedia("(prefers-color-scheme:dark)").matches ? "dark" : "light"));
$("#theme").onclick = () => setTheme(root.dataset.theme === "dark" ? "light" : "dark");
$("#logo").innerHTML = `<span>${esc(SITE.logoEmoji)}</span> ${esc(SITE.name)}`;
const firstPostDate = POSTS.length ? Math.min(...POSTS.map(p => new Date(p.date).getTime()).filter(Number.isFinite)) : NaN;
const firstPostYear = Number.isFinite(firstPostDate) ? new Date(firstPostDate).getFullYear() : new Date().getFullYear();
$("#foot").textContent = `Made with love, notes & curiosity by ${SITE.name} · ${firstPostYear}`;
if (matchMedia("(pointer:fine)").matches && !matchMedia("(prefers-reduced-motion:reduce)").matches) {
  const bd = $("#buddy"); let tx = 0, ty = 0, bx = 0, by = 0;
  addEventListener("mousemove", e => { tx = e.clientX + 14; ty = e.clientY + 14; bd.style.opacity = 1 });
  (function f() { bx += (tx - bx) * .15; by += (ty - by) * .15; bd.style.transform = `translate(${bx}px,${by}px) rotate(${(tx - bx) * .6}deg)`; requestAnimationFrame(f) })();
}
route();
