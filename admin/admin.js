const getDefaultApiBase = () => {
  const configuredValue = String(window.LEAGUE_API_BASE_URL || "").trim().replace(/\/+$/, "");
  if (configuredValue) return configuredValue;

  const storedValue = String(localStorage.getItem("LEAGUE_API_BASE_URL") || "").trim().replace(/\/+$/, "");
  if (storedValue) return storedValue;

  const isLocalHost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  return isLocalHost ? "http://localhost:5000/api" : "";
};

const state = {
  apiBase: getDefaultApiBase(),
  token: localStorage.getItem("LEAGUE_ADMIN_TOKEN") || "",
  adminName: localStorage.getItem("LEAGUE_ADMIN_NAME") || "",
  currentView: "standing",
  teams: [],
  schedule: [],
  players: [],
};

const el = {
  authShell: document.getElementById("authShell"),
  dashboard: document.getElementById("dashboard"),
  authMessage: document.getElementById("authMessage"),
  globalMessage: document.getElementById("globalMessage"),
  adminMeta: document.getElementById("adminMeta"),
  viewTitle: document.getElementById("viewTitle"),
  apiBaseInput: document.getElementById("apiBaseInput"),
  usernameInput: document.getElementById("usernameInput"),
  passwordInput: document.getElementById("passwordInput"),
  sideNav: document.getElementById("sideNav"),
  standingView: document.getElementById("standingView"),
  scheduleView: document.getElementById("scheduleView"),
  playersView: document.getElementById("playersView"),
  teamsBody: document.getElementById("teamsBody"),
  scheduleBody: document.getElementById("scheduleBody"),
  playersBody: document.getElementById("playersBody"),
  loginForm: document.getElementById("loginForm"),
  logoutBtn: document.getElementById("logoutBtn"),
  refreshBtn: document.getElementById("refreshBtn"),
  teamForm: document.getElementById("teamForm"),
  scheduleForm: document.getElementById("scheduleForm"),
  playerForm: document.getElementById("playerForm"),
  teamLogoFile: document.getElementById("teamLogoFile"),
};

const byId = (id) => document.getElementById(id);

const setMessage = (target, text, isError = false) => {
  target.textContent = text || "";
  target.style.color = isError ? "#ff9cb3" : "#ffd166";
};

const normalizeApiBase = (rawValue) => String(rawValue || "").trim().replace(/\/+$/, "");

async function apiFetch(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  const response = await fetch(`${state.apiBase}${path}`, {
    ...options,
    headers,
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch (error) {
    payload = null;
  }

  if (!response.ok) {
    const message = payload && payload.message ? payload.message : `Request failed (${response.status})`;

    if (response.status === 401 || response.status === 403) {
      logout("Session expired. Please login again.");
    }

    throw new Error(message);
  }

  return payload;
}

function renderTeams() {
  if (!state.teams.length) {
    el.teamsBody.innerHTML = '<tr><td colspan="5">No team records found.</td></tr>';
    return;
  }

  el.teamsBody.innerHTML = state.teams.map((team) => `
    <tr>
      <td>${team.name || "-"}</td>
      <td>${Number(team.wins) || 0}</td>
      <td>${Number(team.losses) || 0}</td>
      <td>${Number(team.points) || 0}</td>
      <td>
        <div class="row-actions">
          <button type="button" data-edit="team" data-id="${team._id}">Edit</button>
          <button type="button" class="danger" data-delete="team" data-id="${team._id}">Delete</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function renderSchedule() {
  if (!state.schedule.length) {
    el.scheduleBody.innerHTML = '<tr><td colspan="6">No schedule records found.</td></tr>';
    return;
  }

  el.scheduleBody.innerHTML = state.schedule.map((game) => `
    <tr>
      <td>${game.team1 || "-"} vs ${game.team2 || "-"}</td>
      <td>${game.date || "-"}</td>
      <td>${game.time || "-"}</td>
      <td>${game.venue || "-"}</td>
      <td>${game.status || "Upcoming"}</td>
      <td>
        <div class="row-actions">
          <button type="button" data-edit="schedule" data-id="${game._id}">Edit</button>
          <button type="button" class="danger" data-delete="schedule" data-id="${game._id}">Delete</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function renderPlayers() {
  if (!state.players.length) {
    el.playersBody.innerHTML = '<tr><td colspan="7">No best player records found.</td></tr>';
    return;
  }

  el.playersBody.innerHTML = state.players.map((player) => `
    <tr>
      <td>${player.playerName || "-"}</td>
      <td>${player.team || "-"}</td>
      <td>${Number(player.points) || 0}</td>
      <td>${Number(player.rebounds) || 0}</td>
      <td>${Number(player.assists) || 0}</td>
      <td>${player.gameDate || "-"}</td>
      <td>
        <div class="row-actions">
          <button type="button" data-edit="player" data-id="${player._id}">Edit</button>
          <button type="button" class="danger" data-delete="player" data-id="${player._id}">Delete</button>
        </div>
      </td>
    </tr>
  `).join("");
}

const escapeHtml = (value) => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/\"/g, "&quot;")
  .replace(/'/g, "&#39;");

function renderTeamSelectOptions() {
  const teamNames = Array.from(
    new Set(
      state.teams
        .map((team) => String(team && team.name ? team.name : "").trim())
        .filter(Boolean)
    )
  ).sort((first, second) => first.localeCompare(second));

  const optionsHtml = ['<option value="">Select team</option>']
    .concat(teamNames.map((teamName) => `<option value="${escapeHtml(teamName)}">${escapeHtml(teamName)}</option>`))
    .join("");

  const scheduleTeam1 = byId("scheduleTeam1");
  const scheduleTeam2 = byId("scheduleTeam2");
  const playerTeam = byId("playerTeam");

  const currentScheduleTeam1 = scheduleTeam1.value;
  const currentScheduleTeam2 = scheduleTeam2.value;
  const currentPlayerTeam = playerTeam.value;

  scheduleTeam1.innerHTML = optionsHtml;
  scheduleTeam2.innerHTML = optionsHtml;
  playerTeam.innerHTML = optionsHtml;

  if (teamNames.includes(currentScheduleTeam1)) {
    scheduleTeam1.value = currentScheduleTeam1;
  }
  if (teamNames.includes(currentScheduleTeam2)) {
    scheduleTeam2.value = currentScheduleTeam2;
  }
  if (teamNames.includes(currentPlayerTeam)) {
    playerTeam.value = currentPlayerTeam;
  }
}

function readImageFileAsDataUrl(fileObject) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = () => resolve(String(fileReader.result || ""));
    fileReader.onerror = () => reject(new Error("Unable to read selected image file."));
    fileReader.readAsDataURL(fileObject);
  });
}

function compressImageDataUrl(sourceDataUrl, mimeType = "image/webp", quality = 0.82, maxSize = 512) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const width = image.width;
      const height = image.height;

      const ratio = Math.min(1, maxSize / Math.max(width, height));
      const targetWidth = Math.max(1, Math.round(width * ratio));
      const targetHeight = Math.max(1, Math.round(height * ratio));

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error("Unable to prepare image upload."));
        return;
      }

      context.drawImage(image, 0, 0, targetWidth, targetHeight);
      resolve(canvas.toDataURL(mimeType, quality));
    };

    image.onerror = () => reject(new Error("Unable to process selected image."));
    image.src = sourceDataUrl;
  });
}

async function onTeamLogoFileChange(event) {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;

  const selectedFile = target.files && target.files[0] ? target.files[0] : null;
  if (!selectedFile) return;

  if (!String(selectedFile.type || "").startsWith("image/")) {
    setMessage(el.globalMessage, "Please select an image file for team logo.", true);
    target.value = "";
    return;
  }

  const maxBytes = 2 * 1024 * 1024;
  if (selectedFile.size > maxBytes) {
    setMessage(el.globalMessage, "Logo file is too large. Use an image below 2MB.", true);
    target.value = "";
    return;
  }

  try {
    const rawDataUrl = await readImageFileAsDataUrl(selectedFile);
    const compressedDataUrl = await compressImageDataUrl(rawDataUrl);
    byId("teamLogo").value = compressedDataUrl;
    setMessage(el.globalMessage, `Logo file selected: ${selectedFile.name} (optimized for upload)`);
  } catch (error) {
    setMessage(el.globalMessage, error.message, true);
  }
}

async function loadAllData() {
  const [teams, schedule, players] = await Promise.all([
    apiFetch("/teams"),
    apiFetch("/schedule"),
    apiFetch("/players"),
  ]);

  state.teams = Array.isArray(teams) ? teams : [];
  state.schedule = Array.isArray(schedule) ? schedule : [];
  state.players = Array.isArray(players) ? players : [];

  renderTeams();
  renderSchedule();
  renderPlayers();
  renderTeamSelectOptions();
}

function resetTeamForm() {
  byId("teamId").value = "";
  byId("teamName").value = "";
  byId("teamLogo").value = "";
  byId("teamWins").value = 0;
  byId("teamLosses").value = 0;
  byId("teamPoints").value = 0;
  byId("teamLogoFile").value = "";
}

function resetScheduleForm() {
  byId("scheduleId").value = "";
  byId("scheduleTeam1").value = "";
  byId("scheduleTeam2").value = "";
  byId("scheduleDate").value = "";
  byId("scheduleTime").value = "";
  byId("scheduleVenue").value = "";
  byId("scheduleStatus").value = "Upcoming";
}

function resetPlayerForm() {
  byId("playerId").value = "";
  byId("playerName").value = "";
  byId("playerTeam").value = "";
  byId("playerPoints").value = 0;
  byId("playerRebounds").value = 0;
  byId("playerAssists").value = 0;
  byId("playerGameDate").value = "";
  byId("playerImage").value = "";
}

function switchView(viewName) {
  state.currentView = viewName;

  const titleMap = {
    standing: "Team Standing",
    schedule: "Game Schedule",
    players: "Best Player",
  };

  el.viewTitle.textContent = titleMap[viewName] || "Dashboard";
  el.standingView.classList.toggle("hidden", viewName !== "standing");
  el.scheduleView.classList.toggle("hidden", viewName !== "schedule");
  el.playersView.classList.toggle("hidden", viewName !== "players");

  el.sideNav.querySelectorAll("button").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === viewName);
  });
}

function populateTeamForm(item) {
  byId("teamId").value = item._id || "";
  byId("teamName").value = item.name || "";
  byId("teamLogo").value = item.logo || "";
  byId("teamWins").value = Number(item.wins) || 0;
  byId("teamLosses").value = Number(item.losses) || 0;
  byId("teamPoints").value = Number(item.points) || 0;
  byId("teamLogoFile").value = "";
}

function populateScheduleForm(item) {
  byId("scheduleId").value = item._id || "";
  byId("scheduleTeam1").value = item.team1 || "";
  byId("scheduleTeam2").value = item.team2 || "";
  byId("scheduleDate").value = item.date || "";
  byId("scheduleTime").value = item.time || "";
  byId("scheduleVenue").value = item.venue || "";
  byId("scheduleStatus").value = item.status || "Upcoming";
}

function populatePlayerForm(item) {
  byId("playerId").value = item._id || "";
  byId("playerName").value = item.playerName || "";
  byId("playerTeam").value = item.team || "";
  byId("playerPoints").value = Number(item.points) || 0;
  byId("playerRebounds").value = Number(item.rebounds) || 0;
  byId("playerAssists").value = Number(item.assists) || 0;
  byId("playerGameDate").value = item.gameDate || "";
  byId("playerImage").value = item.playerImage || "";
}

async function submitTeamForm(event) {
  event.preventDefault();
  try {
    const teamId = byId("teamId").value;
    const payload = {
      name: byId("teamName").value.trim(),
      logo: byId("teamLogo").value.trim(),
      wins: Number(byId("teamWins").value) || 0,
      losses: Number(byId("teamLosses").value) || 0,
      points: Number(byId("teamPoints").value) || 0,
    };

    if (teamId) {
      await apiFetch(`/teams/${teamId}`, { method: "PUT", body: JSON.stringify(payload) });
    } else {
      await apiFetch("/teams", { method: "POST", body: JSON.stringify(payload) });
    }

    resetTeamForm();
    await loadAllData();
    setMessage(el.globalMessage, "Team saved successfully.");
  } catch (error) {
    setMessage(el.globalMessage, error.message, true);
  }
}

async function submitScheduleForm(event) {
  event.preventDefault();
  try {
    const scheduleId = byId("scheduleId").value;
    const payload = {
      team1: byId("scheduleTeam1").value.trim(),
      team2: byId("scheduleTeam2").value.trim(),
      date: byId("scheduleDate").value,
      time: byId("scheduleTime").value,
      venue: byId("scheduleVenue").value.trim(),
      status: byId("scheduleStatus").value.trim() || "Upcoming",
    };

    if (scheduleId) {
      await apiFetch(`/schedule/${scheduleId}`, { method: "PUT", body: JSON.stringify(payload) });
    } else {
      await apiFetch("/schedule", { method: "POST", body: JSON.stringify(payload) });
    }

    resetScheduleForm();
    await loadAllData();
    setMessage(el.globalMessage, "Schedule saved successfully.");
  } catch (error) {
    setMessage(el.globalMessage, error.message, true);
  }
}

async function submitPlayerForm(event) {
  event.preventDefault();
  try {
    const playerId = byId("playerId").value;
    const payload = {
      playerName: byId("playerName").value.trim(),
      team: byId("playerTeam").value.trim(),
      points: Number(byId("playerPoints").value) || 0,
      rebounds: Number(byId("playerRebounds").value) || 0,
      assists: Number(byId("playerAssists").value) || 0,
      gameDate: byId("playerGameDate").value,
      playerImage: byId("playerImage").value.trim(),
    };

    if (playerId) {
      await apiFetch(`/players/${playerId}`, { method: "PUT", body: JSON.stringify(payload) });
    } else {
      await apiFetch("/players", { method: "POST", body: JSON.stringify(payload) });
    }

    resetPlayerForm();
    await loadAllData();
    setMessage(el.globalMessage, "Player saved successfully.");
  } catch (error) {
    setMessage(el.globalMessage, error.message, true);
  }
}

async function handleDelete(type, itemId) {
  const ok = window.confirm("Delete this record?");
  if (!ok) return;

  try {
    const pathByType = {
      team: `/teams/${itemId}`,
      schedule: `/schedule/${itemId}`,
      player: `/players/${itemId}`,
    };

    await apiFetch(pathByType[type], { method: "DELETE" });
    await loadAllData();
    setMessage(el.globalMessage, "Record deleted.");
  } catch (error) {
    setMessage(el.globalMessage, error.message, true);
  }
}

function handleRowAction(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const editType = target.getAttribute("data-edit");
  const deleteType = target.getAttribute("data-delete");
  const itemId = target.getAttribute("data-id");

  if (!itemId) return;

  if (editType === "team") {
    const item = state.teams.find((row) => row._id === itemId);
    if (item) {
      switchView("standing");
      populateTeamForm(item);
    }
    return;
  }

  if (editType === "schedule") {
    const item = state.schedule.find((row) => row._id === itemId);
    if (item) {
      switchView("schedule");
      populateScheduleForm(item);
    }
    return;
  }

  if (editType === "player") {
    const item = state.players.find((row) => row._id === itemId);
    if (item) {
      switchView("players");
      populatePlayerForm(item);
    }
    return;
  }

  if (deleteType) {
    handleDelete(deleteType, itemId);
  }
}

async function onLoginSubmit(event) {
  event.preventDefault();

  const apiBaseInput = normalizeApiBase(el.apiBaseInput.value);
  const username = el.usernameInput.value.trim();
  const password = el.passwordInput.value;

  if (!apiBaseInput || !username || !password) {
    setMessage(el.authMessage, "Please complete all fields.", true);
    return;
  }

  state.apiBase = apiBaseInput;

  try {
    const response = await fetch(`${state.apiBase}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.message || "Login failed");
    }

    state.token = payload.token;
    state.adminName = payload.admin && payload.admin.username ? payload.admin.username : username;

    localStorage.setItem("LEAGUE_API_BASE_URL", state.apiBase);
    localStorage.setItem("LEAGUE_ADMIN_TOKEN", state.token);
    localStorage.setItem("LEAGUE_ADMIN_NAME", state.adminName);

    await bootDashboard();
  } catch (error) {
    setMessage(el.authMessage, error.message, true);
  }
}

function logout(messageText = "Logged out.") {
  const safeMessage = typeof messageText === "string" ? messageText : "Logged out.";
  localStorage.removeItem("LEAGUE_ADMIN_TOKEN");
  localStorage.removeItem("LEAGUE_ADMIN_NAME");
  state.token = "";
  state.adminName = "";
  el.dashboard.classList.add("hidden");
  el.authShell.classList.remove("hidden");
  setMessage(el.authMessage, safeMessage, safeMessage.toLowerCase().includes("expired"));
}

async function bootDashboard() {
  try {
    if (state.token) {
      try {
        const verifyPayload = await apiFetch("/auth/verify");
        if (verifyPayload && verifyPayload.admin && verifyPayload.admin.username) {
          state.adminName = verifyPayload.admin.username;
          localStorage.setItem("LEAGUE_ADMIN_NAME", state.adminName);
        }
      } catch (verifyError) {
        if (!String(verifyError.message || "").includes("404")) {
          throw verifyError;
        }
      }
    }

    el.authShell.classList.add("hidden");
    el.dashboard.classList.remove("hidden");
    el.adminMeta.textContent = `Signed in as ${state.adminName}`;
    setMessage(el.authMessage, "");
    setMessage(el.globalMessage, "Loading data...");

    await loadAllData();
    switchView(state.currentView);
    setMessage(el.globalMessage, "Data loaded.");
  } catch (error) {
    if (!state.token) {
      setMessage(el.authMessage, "Please login to continue.", true);
      return;
    }

    setMessage(el.globalMessage, error.message, true);
  }
}

function attachEvents() {
  el.apiBaseInput.value = state.apiBase;

  el.loginForm.addEventListener("submit", onLoginSubmit);
  el.logoutBtn.addEventListener("click", () => logout());
  el.refreshBtn.addEventListener("click", async () => {
    try {
      await loadAllData();
      setMessage(el.globalMessage, "Data refreshed.");
    } catch (error) {
      setMessage(el.globalMessage, error.message, true);
    }
  });

  el.sideNav.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const view = target.getAttribute("data-view");
    if (!view) return;
    switchView(view);
  });

  document.body.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const resetType = target.getAttribute("data-reset");
    if (resetType === "team") resetTeamForm();
    if (resetType === "schedule") resetScheduleForm();
    if (resetType === "player") resetPlayerForm();

    handleRowAction(event);
  });

  el.teamForm.addEventListener("submit", submitTeamForm);
  el.scheduleForm.addEventListener("submit", submitScheduleForm);
  el.playerForm.addEventListener("submit", submitPlayerForm);
  el.teamLogoFile.addEventListener("change", onTeamLogoFileChange);
}

attachEvents();

if (!state.apiBase) {
  setMessage(
    el.authMessage,
    "Set your Render API URL first (example: https://your-service.onrender.com/api).",
    true
  );
}

if (state.token) {
  bootDashboard();
}
