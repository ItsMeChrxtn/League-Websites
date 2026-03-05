const sections = ["schedule", "standing", "player"];

const state = {
  section: "schedule",
  schedule: [],
  standing: [],
  player: [],
};

const sectionMeta = {
  schedule: {
    title: "Game Schedule Management",
    subtitle: "Create and maintain league game schedules with venue and matchup details.",
    modalTitleCreate: "Add Game Schedule",
    modalTitleEdit: "Edit Game Schedule",
  },
  standing: {
    title: "Team Standing Management",
    subtitle: "Track wins, losses, and ranking data for all teams.",
    modalTitleCreate: "Add Team Standing",
    modalTitleEdit: "Edit Team Standing",
  },
  player: {
    title: "Best Player Management",
    subtitle: "Maintain player profiles and game performance statistics.",
    modalTitleCreate: "Add Best Player",
    modalTitleEdit: "Edit Best Player",
  },
};

function getCurrentSection() {
  const params = new URLSearchParams(window.location.search);
  const section = params.get("section") || "schedule";
  return sections.includes(section) ? section : "schedule";
}

function hasSweetAlert() {
  return typeof window.Swal !== "undefined";
}

function alertSuccess(message) {
  if (hasSweetAlert()) {
    window.Swal.fire({
      icon: "success",
      title: "Saved",
      text: message,
      toast: true,
      position: "top-end",
      timer: 1100,
      showConfirmButton: false,
      background: "#0f172a",
      color: "#e2e8f0",
    });
    return;
  }
  window.alert(message);
}

function alertError(message) {
  if (hasSweetAlert()) {
    window.Swal.fire({
      icon: "error",
      title: "Error",
      text: message,
      background: "#0f172a",
      color: "#e2e8f0",
      confirmButtonColor: "#dc2626",
    });
    return;
  }
  window.alert(message);
}

async function confirmDelete() {
  if (hasSweetAlert()) {
    const result = await window.Swal.fire({
      title: "Delete this record?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      background: "#0f172a",
      color: "#e2e8f0",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#475569",
    });
    return Boolean(result.isConfirmed);
  }
  return window.confirm("Delete this record?");
}

async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = body && body.message ? body.message : `Request failed: ${response.status}`;
    throw new Error(message);
  }

  return body;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getModalElement() {
  return document.getElementById("formModal");
}

function setModalTitle(text) {
  const modalTitle = document.getElementById("modalTitle");
  if (modalTitle) {
    modalTitle.textContent = text;
  }
}

function showFormSection(sectionName) {
  sections.forEach((name) => {
    const formSection = document.getElementById(`form-${name}`);
    if (formSection) {
      formSection.classList.toggle("hidden", name !== sectionName);
    }
  });
}

function openModal(sectionName, mode = "create") {
  showFormSection(sectionName);
  const modal = getModalElement();
  const meta = sectionMeta[sectionName];

  if (mode === "edit") {
    setModalTitle(meta.modalTitleEdit);
  } else {
    setModalTitle(meta.modalTitleCreate);
  }

  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  const modal = getModalElement();
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
}

function updateTopbar(sectionName) {
  const titleElement = document.getElementById("topbarTitle");
  const subtitleElement = document.getElementById("topbarSubtitle");
  const meta = sectionMeta[sectionName];

  if (titleElement) titleElement.textContent = meta.title;
  if (subtitleElement) subtitleElement.textContent = meta.subtitle;
}

function openSection(sectionName) {
  state.section = sectionName;
  const params = new URLSearchParams(window.location.search);
  params.set("section", sectionName);
  window.history.replaceState(null, "", `?${params.toString()}`);

  sections.forEach((name) => {
    const tab = document.getElementById(`tab-${name}`);
    const list = document.getElementById(`list-${name}`);

    if (tab) tab.classList.toggle("active", name === sectionName);
    if (list) list.classList.toggle("hidden", name !== sectionName);
  });

  updateTopbar(sectionName);
}

function resetScheduleForm() {
  const form = document.getElementById("scheduleForm");
  form.reset();
  form.id.value = "";
  refreshScheduleTeamDropdowns();
}

function getStandingTeamNames() {
  const uniqueNames = new Set(
    state.standing
      .map((item) => String(item.team || "").trim())
      .filter((teamName) => teamName !== "")
  );

  return Array.from(uniqueNames).sort((firstName, secondName) => firstName.localeCompare(secondName));
}

function createTeamOptionsHtml(teamNames, selectedTeamName) {
  const selectedValue = String(selectedTeamName || "");

  const placeholderOption = '<option value="" disabled selected>Select team</option>';
  const teamOptions = teamNames
    .map((teamName) => {
      const selectedAttr = selectedValue === teamName ? " selected" : "";
      return `<option value="${escapeHtml(teamName)}"${selectedAttr}>${escapeHtml(teamName)}</option>`;
    })
    .join("");

  if (!teamOptions) {
    return '<option value="" selected>No teams found in Team Standing</option>';
  }

  return selectedValue ? teamOptions : `${placeholderOption}${teamOptions}`;
}

function refreshScheduleTeamDropdowns(selectedAway = "", selectedHome = "") {
  const awaySelect = document.getElementById("away_team");
  const homeSelect = document.getElementById("home_team");
  if (!awaySelect || !homeSelect) return;

  const teamNames = getStandingTeamNames();

  awaySelect.innerHTML = createTeamOptionsHtml(teamNames, selectedAway);
  homeSelect.innerHTML = createTeamOptionsHtml(teamNames, selectedHome);

  const hasTeams = teamNames.length > 0;
  awaySelect.disabled = !hasTeams;
  homeSelect.disabled = !hasTeams;
}

function resetStandingForm() {
  const form = document.getElementById("standingForm");
  form.reset();
  form.id.value = "";
}

function resetPlayerForm() {
  const form = document.getElementById("playerForm");
  form.reset();
  form.id.value = "";
  form.image_path.value = "";
  const preview = document.getElementById("playerImagePreview");
  preview.classList.add("hidden");
  preview.src = "";
}

async function loadSchedule() {
  state.schedule = await request("/api/admin/schedule");
  const rows = document.getElementById("scheduleRows");
  document.getElementById("scheduleCount").textContent = String(state.schedule.length);

  if (!state.schedule.length) {
    rows.innerHTML = '<tr><td colspan="5" class="muted">No game schedule records yet.</td></tr>';
    return;
  }

  rows.innerHTML = state.schedule
    .map(
      (row) => `
      <tr>
        <td>${escapeHtml(row.game_date)}</td>
        <td>${escapeHtml(String(row.game_time || "").slice(0, 5))}</td>
        <td><strong>${escapeHtml(row.away_team)}</strong> vs <strong>${escapeHtml(row.home_team)}</strong></td>
        <td>${escapeHtml(row.venue)}</td>
        <td>
          <div class="actions">
            <button class="btn-muted" data-action="edit" data-id="${row.id}" data-type="schedule">Edit</button>
            <button class="btn-danger" data-action="delete" data-id="${row.id}" data-type="schedule">Delete</button>
          </div>
        </td>
      </tr>
    `
    )
    .join("");
}

async function loadStanding() {
  state.standing = await request("/api/admin/standing");
  const rows = document.getElementById("standingRows");
  document.getElementById("standingCount").textContent = String(state.standing.length);
  refreshScheduleTeamDropdowns();

  if (!state.standing.length) {
    rows.innerHTML = '<tr><td colspan="5" class="muted">No team standing records yet.</td></tr>';
    return;
  }

  rows.innerHTML = state.standing
    .map((row) => {
      const wins = Number(row.wins) || 0;
      const losses = Number(row.losses) || 0;
      const total = wins + losses;
      const pct = total > 0 ? (wins / total).toFixed(3) : "0.000";

      return `
        <tr>
          <td><strong>${escapeHtml(row.team)}</strong></td>
          <td>${wins}</td>
          <td>${losses}</td>
          <td>${pct}</td>
          <td>
            <div class="actions">
              <button class="btn-muted" data-action="edit" data-id="${row.id}" data-type="standing">Edit</button>
              <button class="btn-danger" data-action="delete" data-id="${row.id}" data-type="standing">Delete</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

async function loadPlayer() {
  state.player = await request("/api/admin/player");
  const rows = document.getElementById("playerRows");
  document.getElementById("playerCount").textContent = String(state.player.length);

  if (!state.player.length) {
    rows.innerHTML = '<tr><td colspan="9" class="muted">No best player records yet.</td></tr>';
    return;
  }

  rows.innerHTML = state.player
    .map((row) => {
      const hasImage = typeof row.image_path === "string" && row.image_path.trim() !== "";
      return `
        <tr>
          <td><strong>${escapeHtml(row.player_name)}</strong></td>
          <td>${escapeHtml(row.team)}</td>
          <td>${Number(row.points) || 0}</td>
          <td>${Number(row.assists) || 0}</td>
          <td>${Number(row.rebounds) || 0}</td>
          <td>${Number(row.steals) || 0}</td>
          <td>${hasImage ? '<img class="preview" src="' + escapeHtml(row.image_path) + '" alt="Player photo" />' : '<span class="muted">No image</span>'}</td>
          <td>${escapeHtml(row.game_date || "-")}</td>
          <td>
            <div class="actions">
              <button class="btn-muted" data-action="edit" data-id="${row.id}" data-type="player">Edit</button>
              <button class="btn-danger" data-action="delete" data-id="${row.id}" data-type="player">Delete</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

async function reloadCurrentSection() {
  if (state.section === "schedule") {
    await loadSchedule();
    return;
  }

  if (state.section === "standing") {
    await loadStanding();
    return;
  }

  await loadPlayer();
}

function bindTabs() {
  sections.forEach((section) => {
    const tab = document.getElementById(`tab-${section}`);
    tab.addEventListener("click", (event) => {
      event.preventDefault();
      openSection(section);
      reloadCurrentSection().catch((error) => alertError(error.message));
    });
  });
}

function bindOpenButtons() {
  document.getElementById("addScheduleBtn").addEventListener("click", async () => {
    if (!state.standing.length) {
      await loadStanding();
    }

    if (!getStandingTeamNames().length) {
      await alertError("Add team names first in Team Standing before creating a game schedule.");
      return;
    }

    resetScheduleForm();
    openModal("schedule", "create");
  });

  document.getElementById("addStandingBtn").addEventListener("click", () => {
    resetStandingForm();
    openModal("standing", "create");
  });

  document.getElementById("addPlayerBtn").addEventListener("click", () => {
    resetPlayerForm();
    openModal("player", "create");
  });
}

function bindModalClose() {
  document.getElementById("closeModalBtn").addEventListener("click", closeModal);

  getModalElement().addEventListener("click", (event) => {
    if (event.target.id === "formModal") {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();
    }
  });

  document.getElementById("scheduleCancelEdit").addEventListener("click", () => {
    closeModal();
    resetScheduleForm();
  });

  document.getElementById("standingCancelEdit").addEventListener("click", () => {
    closeModal();
    resetStandingForm();
  });

  document.getElementById("playerCancelEdit").addEventListener("click", () => {
    closeModal();
    resetPlayerForm();
  });
}

function bindScheduleForm() {
  const form = document.getElementById("scheduleForm");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = {
      id: form.id.value,
      game_date: form.game_date.value,
      game_time: form.game_time.value,
      venue: form.venue.value,
      away_team: form.away_team.value,
      home_team: form.home_team.value,
    };

    const isEdit = Boolean(payload.id);
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;

    try {
      await request("/api/admin/schedule", {
        method: isEdit ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });

      closeModal();
      resetScheduleForm();
      alertSuccess(isEdit ? "Schedule updated successfully." : "Schedule created successfully.");
      loadSchedule().catch((error) => alertError(error.message));
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}

function bindStandingForm() {
  const form = document.getElementById("standingForm");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = {
      id: form.id.value,
      team: form.team.value,
      wins: Number(form.wins.value),
      losses: Number(form.losses.value),
    };

    const isEdit = Boolean(payload.id);
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;

    try {
      await request("/api/admin/standing", {
        method: isEdit ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });

      closeModal();
      resetStandingForm();
      alertSuccess(isEdit ? "Standing updated successfully." : "Standing created successfully.");
      loadStanding().catch((error) => alertError(error.message));
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}

function bindPlayerImageInput() {
  const fileInput = document.getElementById("player_image");
  const form = document.getElementById("playerForm");
  const preview = document.getElementById("playerImagePreview");

  fileInput.addEventListener("change", async () => {
    const file = fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;
    if (!file) return;

    if (file.size > 1024 * 1024 * 1.5) {
      fileInput.value = "";
      alertError("Player image must be below 1.5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      form.image_path.value = String(reader.result || "");
      preview.src = form.image_path.value;
      preview.classList.remove("hidden");
    };
    reader.readAsDataURL(file);
  });
}

function bindPlayerForm() {
  const form = document.getElementById("playerForm");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = {
      id: form.id.value,
      player_name: form.player_name.value,
      team: form.team.value,
      points: Number(form.points.value),
      assists: Number(form.assists.value),
      rebounds: Number(form.rebounds.value),
      steals: Number(form.steals.value),
      image_path: form.image_path.value,
      game_date: form.game_date.value,
    };

    const isEdit = Boolean(payload.id);
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;

    try {
      await request("/api/admin/player", {
        method: isEdit ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });

      closeModal();
      resetPlayerForm();
      alertSuccess(isEdit ? "Player updated successfully." : "Player created successfully.");
      loadPlayer().catch((error) => alertError(error.message));
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}

function openEditModal(type, id) {
  if (type === "schedule") {
    const row = state.schedule.find((item) => item.id === id);
    if (!row) return;

    const form = document.getElementById("scheduleForm");
    form.id.value = row.id;
    form.game_date.value = row.game_date || "";
    form.game_time.value = row.game_time || "";
    form.venue.value = row.venue || "";
    refreshScheduleTeamDropdowns(row.away_team || "", row.home_team || "");
    openModal("schedule", "edit");
    return;
  }

  if (type === "standing") {
    const row = state.standing.find((item) => item.id === id);
    if (!row) return;

    const form = document.getElementById("standingForm");
    form.id.value = row.id;
    form.team.value = row.team || "";
    form.wins.value = String(row.wins || 0);
    form.losses.value = String(row.losses || 0);
    openModal("standing", "edit");
    return;
  }

  const row = state.player.find((item) => item.id === id);
  if (!row) return;

  const form = document.getElementById("playerForm");
  const preview = document.getElementById("playerImagePreview");
  form.id.value = row.id;
  form.player_name.value = row.player_name || "";
  form.team.value = row.team || "";
  form.points.value = String(row.points || 0);
  form.assists.value = String(row.assists || 0);
  form.rebounds.value = String(row.rebounds || 0);
  form.steals.value = String(row.steals || 0);
  form.image_path.value = row.image_path || "";
  form.game_date.value = row.game_date || "";

  if (row.image_path) {
    preview.src = row.image_path;
    preview.classList.remove("hidden");
  } else {
    preview.src = "";
    preview.classList.add("hidden");
  }

  openModal("player", "edit");
}

async function deleteRecord(type, id) {
  const allow = await confirmDelete();
  if (!allow) return;

  if (type === "schedule") {
    await request("/api/admin/schedule", { method: "DELETE", body: JSON.stringify({ id }) });
    resetScheduleForm();
    alertSuccess("Schedule deleted successfully.");
    loadSchedule().catch((error) => alertError(error.message));
    return;
  }

  if (type === "standing") {
    await request("/api/admin/standing", { method: "DELETE", body: JSON.stringify({ id }) });
    resetStandingForm();
    alertSuccess("Standing deleted successfully.");
    loadStanding().catch((error) => alertError(error.message));
    return;
  }

  await request("/api/admin/player", { method: "DELETE", body: JSON.stringify({ id }) });
  resetPlayerForm();
  alertSuccess("Player deleted successfully.");
  loadPlayer().catch((error) => alertError(error.message));
}

function bindTableActions() {
  document.body.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const action = button.dataset.action;
    const type = button.dataset.type;
    const id = button.dataset.id;

    try {
      if (action === "edit") {
        openEditModal(type, id);
      }

      if (action === "delete") {
        await deleteRecord(type, id);
      }
    } catch (error) {
      alertError(error.message || "Action failed.");
    }
  });
}

async function init() {
  bindTabs();
  bindOpenButtons();
  bindModalClose();
  bindScheduleForm();
  bindStandingForm();
  bindPlayerImageInput();
  bindPlayerForm();
  bindTableActions();

  openSection(getCurrentSection());
  await Promise.all([loadSchedule(), loadStanding(), loadPlayer()]);
}

init().catch(async (error) => {
  alertError(error.message || "Failed to initialize admin dashboard.");
});
