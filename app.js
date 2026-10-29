/* Super Apps — dashboard shell
 * Reads ../projects.manifest.json and renders the catalog.
 * No dependencies, no build step. Open index.html directly or serve with `npx serve`.
 */
(function () {
  "use strict";

  const MANIFEST_URL = "projects.manifest.json";
  const state = { data: null, query: "", category: "all", theme: "dark", selectedId: null, view: "catalog" };

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
        state.view = "catalog";
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
    return { status, findings: Number.isInteger(security.findings) ? security.findings : null, reviewed: security.reviewed || null, summary: typeof security.summary === "string" ? security.summary : "" };
  }

  function securityLabel(status) {
    return { clear: "Tidak ada temuan terbuka", attention: "Perlu perhatian", critical: "Temuan kritis", "not-audited": "Belum diaudit" }[status];
  }

  function renderSidebar() {
    const app = selectedApp();
    const progress = progressOf(app);
    const security = securityOf(app);
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
        <div class="security-status security-${security.status}"><span class="security-dot" aria-hidden="true"></span>${securityLabel(security.status)}</div>
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
        state.view = "audit";
        renderSidebar();
        renderGrid();
      });
    });
  }

  function renderAudit() {
    const app = selectedApp();
    const security = securityOf(app);
    const candidateFiles = ["package.json", "lockfile", "requirements.txt", "composer.json", "go.mod", "pom.xml", "Dockerfile", "README.md"];
    $("#empty").hidden = true;
    $("#content").innerHTML = `
      <section class="audit-page" aria-labelledby="audit-title">
        <div class="audit-top">
          <div>
            <p class="eyebrow">Audit keamanan project</p>
            <h2 class="audit-title" id="audit-title">${esc(app.name)}</h2>
            <p class="audit-sub">${esc(app.tagline)} · ${esc(app.category)} · ${esc(app.status)}</p>
          </div>
          <button class="audit-btn" data-back-catalog>Kembali ke katalog</button>
        </div>
        <div class="audit-grid">
          <div class="audit-panel">
            <h3>Audit dengan model AI</h3>
            <p>Gunakan model slug dari GriphubRouter. API key dibaca dari environment server (node infra/serve.mjs) dan tidak pernah dikirim ke browser.</p>
            <label class="audit-field">Model AI GriphubRouter
              <input id="audit-model" type="text" list="audit-model-options" placeholder="Masukkan model slug" autocomplete="off" aria-label="Model AI GriphubRouter" value="gpt-5.6-terra" />
              <datalist id="audit-model-options">
                <option value="gpt-5.6-terra"></option>
                <option value="gpt-5.1-terra"></option>
                <option value="gpt-5-terra"></option>
                <option value="claude-opus-4-7-terra"></option>
                <option value="claude-sonnet-4-5-terra"></option>
                <option value="gemini-3-pro-terra"></option>
              </datalist>
            </label>
            <div class="audit-actions">
              <button class="audit-btn primary" id="run-audit" data-project-id="${esc(app.id)}">Jalankan Audit</button>
              <button class="audit-btn" data-copy-audit data-project-id="${esc(app.id)}">Salin perintah</button>
              <button class="audit-btn" data-dry-run data-project-id="${esc(app.id)}">Salin pemeriksaan</button>
            </div>
            <p id="audit-status-msg" class="audit-note" hidden></p>
          </div>
          <div class="audit-panel">
            <h3>Status audit</h3>
            <div class="security-status security-${security.status}" style="margin-top:12px"><span class="security-dot" aria-hidden="true"></span>${securityLabel(security.status)}</div>
            <p>${security.status === "not-audited" ? "Belum ada laporan audit di manifest." : `${security.findings ?? 0} temuan terbuka${security.reviewed ? ` · ditinjau ${esc(security.reviewed)}` : ""}.${security.summary ? `<br><br>${esc(security.summary)}` : ""}`}</p>
            <div id="audit-result" class="audit-result" hidden></div>
            <div class="audit-editor" id="audit-editor" hidden>
              <label class="audit-field">Status
                <select id="sec-status">
                  <option value="clear">Tidak ada temuan terbuka</option>
                  <option value="attention">Perlu perhatian</option>
                  <option value="critical">Temuan kritis</option>
                </select>
              </label>
              <label class="audit-field">Jumlah temuan terbuka
                <input id="sec-findings" type="number" min="0" step="1" />
              </label>
              <label class="audit-field">Tanggal review (YYYY-MM-DD)
                <input id="sec-reviewed" type="text" placeholder="YYYY-MM-DD" />
              </label>
              <label class="audit-field">Ringkasan (edit hasil verifikasi)
                <textarea id="sec-summary" rows="5"></textarea>
              </label>
              <div class="audit-actions">
                <button class="audit-btn primary" id="save-security" data-project-id="${esc(app.id)}">Simpan ke manifest</button>
                <button class="audit-btn" id="copy-json">Salin JSON</button>
              </div>
            </div>
          </div>
        </div>
        <div class="audit-panel" style="margin-top:16px">
          <h3>Ruang lingkup audit</h3>
          <p>Skrip memeriksa berkas yang tersedia dari daftar berikut; gunakan pemeriksaan dahulu sebelum data dikirim ke layanan AI.</p>
          <ul class="audit-files">${candidateFiles.map((file) => `<li>${esc(file)}</li>`).join("")}</ul>
        </div>
      </section>`;
    $("#foot-count").textContent = `Audit ${app.name}`;
    $("[data-back-catalog]").addEventListener("click", () => {
      state.view = "catalog";
      renderGrid();
    });
    $("[data-dry-run]").addEventListener("click", () => {
      navigator.clipboard.writeText(`node scripts/audit-security-ai.mjs ${app.id} --dry-run`).then(() => toast("Perintah pemeriksaan disalin."), () => toast(`node scripts/audit-security-ai.mjs ${app.id} --dry-run`));
    });
    $("[data-copy-audit]").addEventListener("click", () => {
      const model = $("#audit-model").value.trim();
      if (!model) return toast("Masukkan model slug terlebih dahulu.");
      const command = `$env:GRIPHUBROUTER_MODEL = "${model.replaceAll('"', '\\"')}"\nnode scripts/audit-security-ai.mjs ${app.id} --json`;
      navigator.clipboard.writeText(command).then(() => toast("Perintah audit disalin."), () => toast(command));
    });
    const statusMsg = $("#audit-status-msg");
    function showMsg(text, kind) {
      statusMsg.hidden = false;
      statusMsg.textContent = text;
      statusMsg.className = `audit-note ${kind || ""}`;
    }
    $("#run-audit").addEventListener("click", async () => {
      const model = $("#audit-model").value.trim();
      if (!model) return toast("Masukkan model slug terlebih dahulu.");
      const btn = $("#run-audit");
      btn.disabled = true;
      showMsg("Menjalankan audit…", "loading");
      try {
        const res = await fetch("/api/audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: app.id, model }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          showMsg(data.error || "Audit gagal.", "error");
          btn.disabled = false;
          return;
        }
        const resultEl = $("#audit-result");
        const editor = $("#audit-editor");
        resultEl.hidden = false;
        editor.hidden = false;
        resultEl.innerHTML = `<div class="security-status security-${data.status}"><span class="security-dot" aria-hidden="true"></span>${securityLabel(data.status)}</div>
          <p>${data.findingsCount} temuan · ${esc(data.files ? data.files.join(", ") : "")}</p>
          <details><summary>Hasil mentah (raw JSON)</summary><pre class="audit-raw">${esc(data.raw || "")}</pre></details>`;
        $("#sec-status").value = data.status;
        $("#sec-findings").value = data.findingsCount;
        $("#sec-reviewed").value = "${new Date().toISOString().slice(0, 10)}";
        $("#sec-summary").value = data.summary || "";
        showMsg("Audit selesai. Edit ringkasan lalu Simpan ke manifest.", "ok");
      } catch (e) {
        showMsg(`Gagal menghubungi server: ${e.message}`, "error");
      } finally {
        btn.disabled = false;
      }
    });
    $("#copy-json").addEventListener("click", () => {
      const sel = $("#sec-status").value;
      const payload = {
        id: app.id,
        status: sel,
        findings: Number($("#sec-findings").value) || 0,
        reviewed: $("#sec-reviewed").value,
        summary: $("#sec-summary").value,
      };
      const text = JSON.stringify(payload, null, 2);
      navigator.clipboard.writeText(text).then(() => toast("JSON disalin."), () => toast(text));
    });
    $("#save-security").addEventListener("click", async () => {
      const payload = {
        id: app.id,
        status: $("#sec-status").value,
        findings: Number($("#sec-findings").value) || 0,
        reviewed: $("#sec-reviewed").value,
        summary: $("#sec-summary").value,
      };
      if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.reviewed)) return toast("Tanggal review harus YYYY-MM-DD.");
      const btn = $("#save-security");
      btn.disabled = true;
      showMsg("Menyimpan ke manifest…", "loading");
      try {
        const res = await fetch("/api/security", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          showMsg(data.error || "Gagal menyimpan.", "error");
          btn.disabled = false;
          return;
        }
        showMsg("Tersimpan ke manifest.", "ok");
        security.status = data.security.status;
        security.findings = data.security.findings;
        security.reviewed = data.security.reviewed;
        security.summary = data.security.summary;
      } catch (e) {
        showMsg(`Gagal menghubungi server: ${e.message}`, "error");
      } finally {
        btn.disabled = false;
      }
    });
  }

  function card(app, cat) {
    const color = (cat && cat.color) || "var(--accent)";
    const status = app.status || "active";
    const icon = cat ? catIcon(cat) : "📦";
    const repoBtn = app.repo
      ? `<a class="open" href="${esc(app.repo)}" target="_blank" rel="noopener" title="Buka repository">Repo ↗</a>`
      : "";
    const liveBtn = app.url
      ? `<a class="open" href="${esc(app.url)}" target="_blank" rel="noopener" title="Buka aplikasi live">Live ↗</a>`
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
            ${liveBtn}
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
    if (state.view === "audit") return renderAudit();
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
      state.view = "catalog";
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
