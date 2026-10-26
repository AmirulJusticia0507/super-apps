/* Super Apps — dashboard shell
 * Reads ../projects.manifest.json and renders the catalog.
 * No dependencies, no build step. Open index.html directly or serve with `npx serve`.
 */
(function () {
  "use strict";

  const MANIFEST_URL = "projects.manifest.json";
  const state = { data: null, query: "", category: "all", theme: "dark", selectedId: null };

  const $ = (sel) => document.querySelector(sel);
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove("show"), 2200);
  }

  function initTheme() {
    const saved = localStorage.getItem("superapps-theme");
    const theme = saved || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    setTheme(theme);
  }

  function setTheme(theme) {
    state.theme = theme;
    document.documentElement.dataset.theme = theme;
    $("#theme").textContent = theme === "dark" ? "☀️" : "🌙";
    localStorage.setItem("superapps-theme", theme);
  }

  function renderStats() {
    const apps = state.data.apps;
    const byStatus = apps.reduce((acc, a) => ((acc[a.status] = (acc[a.status] || 0) + 1), acc), {});
    const stacks = new Set(apps.flatMap((a) => a.stack || []));
    $("#stats").innerHTML = `
      <div class="stat"><strong>${apps.length}</strong>project</div>
      <div class="stat"><strong>${state.data.categories.length}</strong>kategori</div>
      <div class="stat"><strong>${stacks.size}</strong>teknologi</div>
      <div class="stat"><strong>${byStatus.active || 0}</strong>aktif</div>
      <div class="stat"><strong>${byStatus.archived || 0}</strong>arsip</div>`;
  }

  function renderChips() {
    const chips = [{ id: "all", name: "Semua", color: "var(--accent)" }].concat(state.data.categories);
    $("#chips").innerHTML = chips
      .map(
        (c) => `<button class="chip" data-cat="${esc(c.id)}" aria-pressed="${state.category === c.id}">
          <span class="dot" style="background:${esc(c.color)}"></span>${esc(c.name)}
        </button>`
      )
      .join("");
    $("#chips").querySelectorAll(".chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.category = btn.dataset.cat;
        renderChips();
        renderGrid();
      });
    });
  }

  function matches(app) {
    if (state.category !== "all" && app.category !== state.category) return false;
    const q = state.query.trim().toLowerCase();
    if (!q) return true;
    const hay = [app.name, app.tagline, app.dir, app.id, ...(app.stack || []), ...(app.tags || [])]
      .join(" ")
      .toLowerCase();
    return q.split(/\s+/).every((t) => hay.includes(t));
  }

  function selectedApp() {
    return state.data.apps.find((app) => app.id === state.selectedId) || state.data.apps[0];
  }

  function progressOf(app) {
    return Number.isInteger(app.progress) && app.progress >= 0 && app.progress <= 100 ? app.progress : null;
  }

  function securityOf(app) {
    const security = app.security || {};
    const status = ["clear", "attention", "critical"].includes(security.status) ? security.status : "not-audited";
    return { status, findings: Number.isInteger(security.findings) ? security.findings : null, reviewed: security.reviewed || null };
  }

  function renderSidebar() {
    const app = selectedApp();
    const progress = progressOf(app);
    const security = securityOf(app);
    const labels = { clear: "Tidak ada temuan terbuka", attention: "Perlu perhatian", critical: "Temuan kritis", "not-audited": "Belum diaudit" };
    const securityNote = security.status === "not-audited"
      ? "Belum ada hasil pemindaian kerentanan di manifest."
      : `${security.findings ?? 0} temuan terbuka${security.reviewed ? ` · ditinjau ${esc(security.reviewed)}` : ""}.`;
    $("#project-summary").innerHTML = `
      <div class="sidebar-summary">
        <p class="eyebrow">Project terpilih</p>
        <h2 class="sidebar-name">${esc(app.name)}</h2>
        <p class="sidebar-meta">${esc(app.status)} · ${esc(app.category)}</p>
      </div>
      <div class="sidebar-section">
        <div class="sidebar-label"><span>Progress project</span><strong>${progress === null ? "Belum dinilai" : `${progress}%`}</strong></div>
        <div class="progress-track" role="progressbar" aria-label="Progress ${esc(app.name)}" aria-valuemin="0" aria-valuemax="100"${progress === null ? " aria-valuetext=\"Belum dinilai\"" : ` aria-valuenow="${progress}"`}><div class="progress-value" style="width:${progress ?? 0}%"></div></div>
        <p class="sidebar-note">Skala kemajuan 0–100%.</p>
      </div>
      <div class="sidebar-section">
        <div class="sidebar-label"><span>Kerentanan</span></div>
        <div class="security-status security-${security.status}"><span class="security-dot" aria-hidden="true"></span>${labels[security.status]}</div>
        <p class="sidebar-note">${securityNote}</p>
      </div>`;

    $("#project-list").innerHTML = state.data.apps
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((item) => `<button class="project-select" data-select-project="${esc(item.id)}" aria-current="${item.id === app.id}">${esc(item.name)}</button>`)
      .join("");
    $("#project-list").querySelectorAll("[data-select-project]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.selectedId = btn.dataset.selectProject;
        renderSidebar();
      });
    });
  }

  function card(app, cat) {
    const color = (cat && cat.color) || "var(--accent)";
    const status = app.status || "active";
    const icon = cat ? catIcon(cat) : "📦";
    const repoBtn = app.repo
      ? `<a class="open" href="${esc(app.repo)}" target="_blank" rel="noopener" title="Buka repository">Repo ↗</a>`
      : "";
    return `
      <article class="card" style="--card-color:${esc(color)}">
        <div class="card-head">
          <div class="card-icon">${icon}</div>
          <div style="flex:1;min-width:0">
            <div class="card-name">${esc(app.name)}</div>
            <div class="card-tagline">${esc(app.tagline)}</div>
          </div>
          <span class="badge s-${esc(status)}">${esc(status)}</span>
        </div>
        <div class="tags">${(app.stack || []).slice(0, 5).map((s) => `<span class="tag">${esc(s)}</span>`).join("")}</div>
        <div class="card-foot">
          <span class="path" title="${esc(app.dir)}">../${esc(app.dir)}</span>
          <div style="display:flex;gap:6px">
            ${repoBtn}
            <button class="open" data-copy="${esc(app.dir)}" title="Salin path project">Path</button>
          </div>
        </div>
      </article>`;
  }

  function catIcon(cat) {
    const map = { brain: "🧠", scale: "⚖️", briefcase: "💼", landmark: "🏛️", gamepad: "🎮", wrench: "🛠️", graduation: "🎓", user: "👤" };
    return map[cat.icon] || "📦";
  }

  function renderGrid() {
    const cats = Object.fromEntries(state.data.categories.map((c) => [c.id, c]));
    const visible = state.data.apps.filter(matches);
    $("#empty").hidden = visible.length > 0;

    const groups = new Map();
    for (const app of visible) {
      if (!groups.has(app.category)) groups.set(app.category, []);
      groups.get(app.category).push(app);
    }

    const order = state.data.categories.map((c) => c.id).filter((id) => groups.has(id));
    const html = order
      .map((id) => {
        const cat = cats[id];
        const items = groups.get(id).sort((a, b) => a.name.localeCompare(b.name));
        return `<section>
          <h2 class="group-title">${esc(cat.name)} · ${items.length}</h2>
          <div class="grid">${items.map((a) => card(a, cat)).join("")}</div>
        </section>`;
      })
      .join("");

    $("#content").innerHTML = html;
    $("#foot-count").textContent = `${visible.length} dari ${state.data.apps.length} project ditampilkan`;

    $("#content").querySelectorAll("[data-copy]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const dir = btn.dataset.copy;
        const full = `${state.data.meta.workspace}/${dir}`;
        try {
          await navigator.clipboard.writeText(full);
          toast(`Path disalin: ${dir}`);
        } catch {
          toast(full);
        }
      });
    });
  }

  async function boot() {
    initTheme();
    try {
      const res = await fetch(MANIFEST_URL, { cache: "no-cache" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      state.data = await res.json();
    } catch (err) {
      $("#content").innerHTML = `<div class="empty">Gagal memuat <code>${MANIFEST_URL}</code>: ${esc(err.message)}<br><br>
        Jalankan lewat HTTP server, mis. <code>npx serve .</code> atau <code>python -m http.server</code>.</div>`;
      return;
    }
    state.selectedId = state.data.apps[0]?.id || null;
    renderStats();
    renderChips();
    renderSidebar();
    renderGrid();
    $("#q").addEventListener("input", (e) => {
      state.query = e.target.value;
      renderGrid();
    });
    $("#theme").addEventListener("click", () => setTheme(state.theme === "dark" ? "light" : "dark"));
    document.addEventListener("keydown", (e) => {
      if (e.key === "/" && document.activeElement !== $("#q")) {
        e.preventDefault();
        $("#q").focus();
      }
    });
  }

  boot();
})();
