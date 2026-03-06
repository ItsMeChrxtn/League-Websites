let schedule = [];
let standings = [];
let bestPlayers = [];
let teamLogos = {};

const eventSlides = [
  {
    title: "Opening Night Showdown",
    date: "Mar 05, 2026",
    venue: "Downtown Arena",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1400&q=80",
  },
  {
    title: "All-Star Skills Challenge",
    date: "Mar 12, 2026",
    venue: "Metro Sports Hub",
    image: "https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=1400&q=80",
  },
  {
    title: "Weekend Rivalry Match",
    date: "Mar 19, 2026",
    venue: "Riverside Court",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1400&q=80",
  },
];

let eventIndex = 0;
let sliderIntervalId;
let sliderVisibilityListenerAdded = false;
let dataLoadError = "";
const configuredApiBase = String(window.LEAGUE_API_BASE_URL || localStorage.getItem("LEAGUE_API_BASE_URL") || "")
  .trim()
  .replace(/\/+$/, "");
const API_BASE_URL = configuredApiBase;
const LIVE_REFRESH_INTERVAL_MS = 15000;
let liveRefreshIntervalId;
let isRefreshingLeagueData = false;
let lastDataSignature = "";

const staticLeagueData = {
  schedule: [
    { date: "2026-03-08", time: "18:30", venue: "Downtown Arena", home: "Falcons", away: "Titans" },
    { date: "2026-03-09", time: "19:00", venue: "Metro Sports Hub", home: "Sharks", away: "Wolves" },
    { date: "2026-03-10", time: "20:00", venue: "Riverside Court", home: "Hawks", away: "Kings" },
  ],
  standings: [
    { team: "Falcons", wins: 7, losses: 2 },
    { team: "Titans", wins: 6, losses: 3 },
    { team: "Wolves", wins: 5, losses: 4 },
    { team: "Sharks", wins: 4, losses: 5 },
  ],
  bestPlayers: [
    {
      player: "J. Ramirez",
      team: "Falcons",
      points: 31,
      assists: 8,
      rebounds: 9,
      steals: 2,
      image_path: "assets/players/sample-player-1.png",
      game_date: "2026-03-01",
    },
    {
      player: "M. Santos",
      team: "Titans",
      points: 28,
      assists: 6,
      rebounds: 10,
      steals: 1,
      image_path: "assets/players/sample-player-2.png",
      game_date: "2026-03-02",
    },
    {
      player: "K. Dela Cruz",
      team: "Wolves",
      points: 25,
      assists: 9,
      rebounds: 7,
      steals: 3,
      image_path: "assets/players/sample-player-3.png",
      game_date: "2026-03-03",
    },
  ],
  teamLogos: [
    { team: "Falcons", logo_path: "assets/logos/eldelubyo.png" },
    { team: "Titans", logo_path: "assets/logos/homecourt.jpg" },
    { team: "Sharks", logo_path: "assets/logos/micara.png" },
    { team: "Wolves", logo_path: "assets/logos/MTRVL.jpg" },
    { team: "Hawks", logo_path: "assets/logos/segway.jpg" },
    { team: "Kings", logo_path: "assets/logos/Stampede.jpg" },
    { team: "Stampede", logo_path: "assets/logos/Stampede.jpg" },
    { team: "Westdale", logo_path: "assets/logos/westdale.jpg" },
  ],
};

function loadStaticLeagueData() {
  schedule = Array.isArray(staticLeagueData.schedule) ? staticLeagueData.schedule : [];
  standings = Array.isArray(staticLeagueData.standings) ? staticLeagueData.standings : [];
  bestPlayers = Array.isArray(staticLeagueData.bestPlayers) ? staticLeagueData.bestPlayers : [];
  teamLogos = Array.isArray(staticLeagueData.teamLogos)
    ? staticLeagueData.teamLogos.reduce((map, row) => {
        if (!row || !row.team || !row.logo_path) return map;
        map[row.team] = row.logo_path;
        return map;
      }, {})
    : {};
}

async function loadLeagueData(){
  if (!API_BASE_URL) {
    loadStaticLeagueData();
    dataLoadError = "";
    return;
  }

  try {
    const [teamsResponse, scheduleResponse, playersResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/teams`),
      fetch(`${API_BASE_URL}/schedule`),
      fetch(`${API_BASE_URL}/players`),
    ]);

    if (!teamsResponse.ok || !scheduleResponse.ok || !playersResponse.ok) {
      throw new Error("Live API request failed");
    }

    const [teamsData, scheduleData, playersData] = await Promise.all([
      teamsResponse.json(),
      scheduleResponse.json(),
      playersResponse.json(),
    ]);

    const teams = Array.isArray(teamsData) ? teamsData : [];
    const games = Array.isArray(scheduleData) ? scheduleData : [];
    const players = Array.isArray(playersData) ? playersData : [];

    standings = teams.map((team) => ({
      team: String(team.name || "Unknown Team"),
      wins: Number(team.wins) || 0,
      losses: Number(team.losses) || 0,
      points: Number(team.points) || 0,
    }));

    teamLogos = teams.reduce((map, team) => {
      if (!team || !team.name || !team.logo) return map;
      map[team.name] = team.logo;
      return map;
    }, {});

    schedule = games.map((game) => ({
      date: String(game.date || ""),
      time: String(game.time || ""),
      venue: String(game.venue || "Metroville Basketball Court"),
      away: String(game.team1 || "Away Team"),
      home: String(game.team2 || "Home Team"),
      status: String(game.status || "Upcoming"),
    }));

    bestPlayers = players.map((player) => ({
      player: String(player.playerName || "Best Player"),
      team: String(player.team || "Unknown Team"),
      points: Number(player.points) || 0,
      assists: Number(player.assists) || 0,
      rebounds: Number(player.rebounds) || 0,
      steals: 0,
      image_path: String(player.playerImage || "assets/logos/logo.png"),
      game_date: String(player.gameDate || ""),
    }));

    dataLoadError = "";
  } catch (error) {
    console.error("Live API fetch failed:", error);
    if (!standings.length && !schedule.length && !bestPlayers.length) {
      dataLoadError = "Live data is temporarily unavailable. Please wait a moment...";
    }
  }
}

function buildLeagueDataSignature() {
  const standingsSignature = standings
    .map((team) => `${team.team}|${team.wins}|${team.losses}|${team.points}`)
    .sort()
    .join("~");

  const scheduleSignature = schedule
    .map((game) => `${game.away}|${game.home}|${game.date}|${game.time}|${game.venue}|${game.status}`)
    .sort()
    .join("~");

  const playersSignature = bestPlayers
    .map((player) => `${player.player}|${player.team}|${player.points}|${player.rebounds}|${player.assists}|${player.game_date}`)
    .sort()
    .join("~");

  const logosSignature = Object.keys(teamLogos)
    .sort()
    .map((teamName) => `${teamName}|${String(teamLogos[teamName] || "").slice(0, 64)}`)
    .join("~");

  return `${standingsSignature}::${scheduleSignature}::${playersSignature}::${logosSignature}`;
}

function renderLeagueSections() {
  renderDate();
  renderHighlights();
  renderTeamLogos();
  renderSchedule();
  renderStandings();
  renderPlayers();
}

async function refreshLeagueDataAndRender({ forceRender = false } = {}) {
  if (isRefreshingLeagueData) return;

  isRefreshingLeagueData = true;
  try {
    await loadLeagueData();

    const nextSignature = buildLeagueDataSignature();
    if (forceRender || nextSignature !== lastDataSignature) {
      renderLeagueSections();
      lastDataSignature = nextSignature;
    }
  } finally {
    isRefreshingLeagueData = false;
  }
}

function startLiveRefresh() {
  if (!API_BASE_URL) return;
  if (liveRefreshIntervalId) clearInterval(liveRefreshIntervalId);

  liveRefreshIntervalId = window.setInterval(() => {
    if (document.hidden) return;
    refreshLeagueDataAndRender();
  }, LIVE_REFRESH_INTERVAL_MS);

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      refreshLeagueDataAndRender();
    }
  });
}

function formatScheduleDate(dateValue){
  if (!dateValue) return "-";
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return String(dateValue);
  return parsed.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function formatScheduleTime(timeValue){
  if (!timeValue) return "-";

  const parts = String(timeValue).split(":");
  const hour = Number(parts[0]);
  const minute = Number(parts[1]);

  if (Number.isNaN(hour) || Number.isNaN(minute)) return String(timeValue);

  const date = new Date();
  date.setHours(hour, minute, 0, 0);

  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function renderDate(){
  const dateElement = document.getElementById("todayDate");
  const heroDateElement = document.getElementById("scheduleHeroDate");
  if (!dateElement) return;

  const prettyDate =
    new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"});

  dateElement.textContent = prettyDate;
  if (heroDateElement) heroDateElement.textContent = `Today • ${prettyDate}`;
}

function renderHighlights(){
  const totalGames = document.getElementById("totalGames");
  const topTeam = document.getElementById("topTeam");
  const topScorer = document.getElementById("topScorer");

  if (!totalGames || !topTeam || !topScorer) return;

  totalGames.textContent = String(schedule.length);
  topTeam.textContent = standings.length ? [...standings].sort((a,b)=>b.wins-a.wins)[0].team : "-";
  topScorer.textContent = bestPlayers.length ? [...bestPlayers].sort((a,b)=>b.points-a.points)[0].player : "-";
}

function renderSchedule(){
  const container=document.getElementById("scheduleContainer");
  const heroGames = document.getElementById("scheduleHeroGames");
  if (!container) return;

  const safeText = (value) => String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

  if (dataLoadError) {
    container.innerHTML = `<p class="text-slate-300 text-sm">${safeText(dataLoadError)}</p>`;
    if (heroGames) heroGames.textContent = "Games • 0";
    return;
  }

  if (!schedule.length) {
    container.innerHTML = `<p class="text-slate-300 text-sm">No game schedule records found.</p>`;
    if (heroGames) heroGames.textContent = "Games • 0";
    return;
  }

  if (heroGames) heroGames.textContent = `Games • ${schedule.length}`;

  const sortGames = [...schedule].sort((firstGame, secondGame) => {
    const firstDate = String(firstGame && firstGame.date ? firstGame.date : "9999-12-31");
    const secondDate = String(secondGame && secondGame.date ? secondGame.date : "9999-12-31");
    if (firstDate !== secondDate) return firstDate.localeCompare(secondDate);

    const firstTime = String(firstGame && firstGame.time ? firstGame.time : "99:99");
    const secondTime = String(secondGame && secondGame.time ? secondGame.time : "99:99");
    return firstTime.localeCompare(secondTime);
  });

  const groupedByDate = sortGames.reduce((groupMap, game) => {
    const dateKey = String(game && game.date ? game.date : "TBD Date");
    if (!groupMap[dateKey]) groupMap[dateKey] = [];
    groupMap[dateKey].push(game);
    return groupMap;
  }, {});

  const dateKeys = Object.keys(groupedByDate).sort((firstDate, secondDate) => {
    if (firstDate === "TBD Date") return 1;
    if (secondDate === "TBD Date") return -1;
    return firstDate.localeCompare(secondDate);
  });

  container.className = "space-y-8";
  container.innerHTML = dateKeys.map((dateKey) => {
    const gamesForDay = groupedByDate[dateKey] || [];
    const dayDate = dateKey !== "TBD Date" ? new Date(dateKey) : null;
    const dayLabel = dayDate && !Number.isNaN(dayDate.getTime())
      ? dayDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "2-digit", year: "numeric" })
      : "TBD Date";

    const cardsHtml = gamesForDay.map((g, gameIndex) => {
      const overallIndex = sortGames.findIndex((row) => row === g) + 1;
    const awayTeam = safeText(g.away || "Away Team");
    const homeTeam = safeText(g.home || "Home Team");
    const awayRecord = safeText(getTeamRecord(g.away));
    const homeRecord = safeText(getTeamRecord(g.home));
    const scheduleDate = g.date ? new Date(String(g.date)) : null;
    const scheduleDateDisplay = scheduleDate && !Number.isNaN(scheduleDate.getTime())
      ? scheduleDate.toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" })
      : "TBD Date";
    const scheduleTimeDisplay = safeText(formatScheduleTime(g.time));

    return `
      <article class="group relative overflow-hidden rounded-3xl border border-slate-700/70 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-6 shadow-[0_16px_40px_rgba(2,6,23,0.48)] transition-all duration-300 ease-out hover:-translate-y-[5px] hover:border-blue-300/40 hover:shadow-[0_24px_55px_rgba(37,99,235,0.35)]">
        <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(37,99,235,0.2),transparent_40%)]"></div>
        <div class="pointer-events-none absolute -left-24 top-24 h-44 w-44 rounded-full bg-blue-500/10 blur-3xl"></div>

        <button
          class="download-game-btn absolute right-4 top-4 z-20"
          type="button"
          aria-label="Download game card"
          title="Download game card"
          data-date="${encodeURIComponent(String(g.date || ""))}"
          data-time="${encodeURIComponent(String(g.time || ""))}"
          data-venue="${encodeURIComponent(String(g.venue || ""))}"
          data-away="${encodeURIComponent(String(g.away || ""))}"
          data-home="${encodeURIComponent(String(g.home || ""))}"
          data-game-number="${encodeURIComponent(String(overallIndex))}"
          data-away-record="${encodeURIComponent(String(getTeamRecord(g.away) || ""))}"
          data-home-record="${encodeURIComponent(String(getTeamRecord(g.home) || ""))}"
          data-away-logo="${encodeURIComponent(String(getTeamLogo(g.away) || ""))}"
          data-home-logo="${encodeURIComponent(String(getTeamLogo(g.home) || ""))}"
        >⤓</button>

        <div class="relative z-10">
          <div class="mb-5 rounded-2xl border border-slate-600/40 bg-slate-800/45 px-4 py-3 text-center">
            <p class="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-300">Game ${overallIndex} | ${safeText(scheduleDateDisplay)} | ${scheduleTimeDisplay}</p>
          </div>

          <div class="rounded-2xl border border-slate-700/60 bg-slate-900/55 p-4">
            <div class="grid grid-cols-[1fr_auto_1fr] items-start gap-4">
              <section class="flex flex-col items-center text-center">
                <span class="mb-3 inline-flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-slate-300/35 bg-white/95 shadow-[0_10px_18px_rgba(2,6,23,0.45)]">
                  <img src="${getTeamLogo(g.away)}" alt="${awayTeam} logo" loading="lazy" class="h-full w-full object-cover" onerror="handleTeamLogoError(this)" />
                </span>
                <p class="text-sm font-extrabold uppercase leading-tight tracking-[0.05em] text-slate-100">${awayTeam}</p>
                <p class="mt-2 inline-flex rounded-full border border-slate-500/40 bg-slate-800/75 px-3 py-1 text-[10px] font-semibold tracking-[0.1em] text-slate-200">${awayRecord}</p>
              </section>

              <div class="pt-8 text-center">
                <span class="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-300/45 bg-blue-500/15 text-base font-black tracking-[0.14em] text-blue-100">VS</span>
              </div>

              <section class="flex flex-col items-center text-center">
                <span class="mb-3 inline-flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-slate-300/35 bg-white/95 shadow-[0_10px_18px_rgba(2,6,23,0.45)]">
                  <img src="${getTeamLogo(g.home)}" alt="${homeTeam} logo" loading="lazy" class="h-full w-full object-cover" onerror="handleTeamLogoError(this)" />
                </span>
                <p class="text-sm font-extrabold uppercase leading-tight tracking-[0.05em] text-slate-100">${homeTeam}</p>
                <p class="mt-2 inline-flex rounded-full border border-slate-500/40 bg-slate-800/75 px-3 py-1 text-[10px] font-semibold tracking-[0.1em] text-slate-200">${homeRecord}</p>
              </section>
            </div>
          </div>

          <div class="mt-5 rounded-2xl border border-slate-400/30 bg-slate-800/55 px-4 py-3">
            <p class="inline-flex items-center gap-2 text-sm font-semibold text-slate-100">
              <svg class="h-4 w-4 text-blue-200" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M12 21C15.5 17.1 19 14 19 9.5C19 5.9 15.9 3 12 3C8.1 3 5 5.9 5 9.5C5 14 8.5 17.1 12 21Z" stroke="currentColor" stroke-width="1.6"/>
                <circle cx="12" cy="9.5" r="2.5" fill="currentColor"/>
              </svg>
              <span>Metroville Basketball Court</span>
            </p>
          </div>
        </div>
      </article>
    `;
    }).join("");

    return `
      <section class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h4 class="text-sm font-bold uppercase tracking-[0.16em] text-blue-200">${safeText(dayLabel)} • ${gamesForDay.length} game(s)</h4>
          <button
            type="button"
            class="download-day-btn inline-flex items-center rounded-xl border border-blue-300/45 bg-blue-500/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-blue-100 transition hover:border-blue-200 hover:bg-blue-500/30"
            data-day-key="${encodeURIComponent(String(dateKey))}"
          >Download Day Poster</button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 xl:gap-8">${cardsHtml}</div>
      </section>
    `;
  }).join("");

  container.querySelectorAll(".download-game-btn").forEach((buttonElement) => {
    buttonElement.addEventListener("click", () => downloadScheduleGameCard(buttonElement));
  });

  container.querySelectorAll(".download-day-btn").forEach((buttonElement) => {
    buttonElement.addEventListener("click", () => {
      const dayKey = decodeURIComponent(String(buttonElement.dataset.dayKey || ""));
      const gamesForDay = groupedByDate[dayKey] || [];
      downloadScheduleDayPoster(dayKey, gamesForDay, buttonElement);
    });
  });
}

function getTeamRecord(teamName){
  const teamStanding = standings.find((team) => team.team === teamName);
  if (!teamStanding) return "(0-0)";
  return `(${teamStanding.wins}-${teamStanding.losses})`;
}

function getTeamLogo(teamName){
  return teamLogos[teamName] || "assets/logos/eldelubyo.png";
}

function handleTeamLogoError(imgElement){
  const fallbackExt = ["png", "jpg", "jpeg", "svg"];
  const currentSrc = imgElement.getAttribute("src") || "";
  const matched = currentSrc.match(/\.(png|jpg|jpeg|svg)$/i);

  if (!matched) return;

  const currentExt = matched[1].toLowerCase();
  const currentExtIndex = fallbackExt.indexOf(currentExt);
  const nextExt = fallbackExt[currentExtIndex + 1];

  if (!nextExt) {
    imgElement.onerror = null;
    imgElement.src = "assets/logos/eldelbuyo.png";
    return;
  }

  imgElement.src = currentSrc.replace(/\.(png|jpg|jpeg|svg)$/i, `.${nextExt}`);
}

function renderStandings(){
  const body=document.getElementById("standingsBody");
  if (!body) return;

  if (dataLoadError) {
    body.innerHTML = `<tr><td colspan="5">${dataLoadError}</td></tr>`;
    return;
  }

  if (!standings.length) {
    body.innerHTML = `<tr><td colspan="5">No team standing records found.</td></tr>`;
    return;
  }

  const rankedStandings = [...standings].sort((firstTeam, secondTeam) => {
    const firstWins = Number(firstTeam.wins) || 0;
    const firstLosses = Number(firstTeam.losses) || 0;
    const secondWins = Number(secondTeam.wins) || 0;
    const secondLosses = Number(secondTeam.losses) || 0;

    const firstGames = firstWins + firstLosses;
    const secondGames = secondWins + secondLosses;

    const firstWinPct = firstGames > 0 ? firstWins / firstGames : 0;
    const secondWinPct = secondGames > 0 ? secondWins / secondGames : 0;

    if (secondWinPct !== firstWinPct) return secondWinPct - firstWinPct;
    if (secondWins !== firstWins) return secondWins - firstWins;
    if (firstLosses !== secondLosses) return firstLosses - secondLosses;

    return String(firstTeam.team).localeCompare(String(secondTeam.team));
  });

  body.innerHTML=rankedStandings.map((row,i)=>{
    const wins = Number(row.wins) || 0;
    const losses = Number(row.losses) || 0;
    const gp = wins + losses;
    const wp = gp > 0 ? (wins / gp).toFixed(3) : "0.000";
    const teamLogo = getTeamLogo(String(row.team));

    return`
      <tr>
        <td>${i+1}</td>
        <td>
          <span class="standings-team-cell">
            <img class="standings-team-logo" src="${teamLogo}" alt="${row.team} logo" loading="lazy" onerror="handleTeamLogoError(this)" />
            <span>${row.team}</span>
          </span>
        </td>
        <td>${wins}</td>
        <td>${losses}</td>
        <td>${wp}</td>
      </tr>
    `;
  }).join("");
}

function renderPlayers(){
  const container=document.getElementById("bestPlayerContainer");
  if (!container) return;

  if (dataLoadError) {
    container.innerHTML = `<p class="player-team">${dataLoadError}</p>`;
    return;
  }

  if (!bestPlayers.length) {
    container.innerHTML = `<p class="player-team">No best player records found.</p>`;
    return;
  }

  const getPlayerImage = (player) => {
    if (player && player.image_path) return player.image_path;
    return "assets/logos/logo.png";
  };

  const safeNumber = (value) => {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) && numberValue >= 0 ? numberValue : 0;
  };

  container.innerHTML=bestPlayers.map((p, index)=>{
    return `
    <div class="player-card best-player-card template-dark-arena" data-player-name="${p.player}">
      <div class="player-card-image-wrap">
        <img class="player-team-watermark" src="${getTeamLogo(p.team)}" alt="${p.team} logo watermark" loading="lazy" onerror="handleTeamLogoError(this)" />
        <img class="player-card-image" src="${getPlayerImage(p)}" alt="${p.player} photo" loading="lazy" onerror="this.onerror=null;this.src='assets/logos/logo.png';" />
        <span class="player-card-badge">Best Player</span>
        <span class="player-rank-badge">#${index + 1}</span>
      </div>
      <div class="player-card-head">
        <p class="player-name">${p.player}</p>
        <p class="player-team">${p.team}</p>
      </div>
      <div class="player-stats-grid">
        <div class="player-stat-item"><span>PTS</span><strong>${safeNumber(p.points)}</strong></div>
        <div class="player-stat-item"><span>AST</span><strong>${safeNumber(p.assists)}</strong></div>
        <div class="player-stat-item"><span>REB</span><strong>${safeNumber(p.rebounds)}</strong></div>
        <div class="player-stat-item"><span>STL</span><strong>${safeNumber(p.steals)}</strong></div>
      </div>
      <p class="player-card-meta">Metroville League • Elite Performance</p>
      <label class="card-template-wrap" for="poster-template-${index}">
        <span>Poster Style</span>
        <select class="card-template-select" id="poster-template-${index}">
          <option value="dark-arena">Dark Arena</option>
          <option value="gold-mvp">Gold MVP</option>
          <option value="playoff-edition">Playoff Edition</option>
        </select>
      </label>
      <button
        class="download-card-btn"
        type="button"
        data-player-name="${encodeURIComponent(String(p.player || "best-player"))}"
        data-team="${encodeURIComponent(String(p.team || ""))}"
        data-image="${encodeURIComponent(String(getPlayerImage(p)))}"
        data-pts="${safeNumber(p.points)}"
        data-ast="${safeNumber(p.assists)}"
        data-reb="${safeNumber(p.rebounds)}"
        data-stl="${safeNumber(p.steals)}"
        data-template="dark-arena"
      >Download Card</button>
    </div>
  `;
  }).join("");

  container.querySelectorAll(".card-template-select").forEach((selectElement) => {
    selectElement.addEventListener("change", () => {
      const playerCard = selectElement.closest(".best-player-card");
      if (!playerCard) return;

      playerCard.classList.remove("template-dark-arena", "template-gold-mvp", "template-playoff-edition");
      playerCard.classList.add(`template-${selectElement.value}`);

      const buttonElement = playerCard.querySelector(".download-card-btn");
      if (buttonElement) {
        buttonElement.dataset.template = selectElement.value;
      }
    });
  });

  container.querySelectorAll(".download-card-btn").forEach((buttonElement) => {
    buttonElement.addEventListener("click", () => {
      const playerCard = buttonElement.closest(".best-player-card");
      const templateSelect = playerCard ? playerCard.querySelector(".card-template-select") : null;
      const selectedTemplate = templateSelect ? templateSelect.value : (buttonElement.dataset.template || "dark-arena");
      downloadPlayerCard(buttonElement, selectedTemplate);
    });
  });
}

async function downloadPlayerCard(buttonElement, selectedTemplate = "dark-arena"){
  const decode = (value) => decodeURIComponent(String(value || ""));

  const playerName = decode(buttonElement.dataset.playerName || "best-player");
  const teamName = decode(buttonElement.dataset.team || "");
  const imagePath = decode(buttonElement.dataset.image || "assets/logos/logo.png");
  const pts = Number(buttonElement.dataset.pts || 0) || 0;
  const ast = Number(buttonElement.dataset.ast || 0) || 0;
  const reb = Number(buttonElement.dataset.reb || 0) || 0;
  const stl = Number(buttonElement.dataset.stl || 0) || 0;

  const originalLabel = buttonElement.textContent;
  buttonElement.disabled = true;
  buttonElement.textContent = "Preparing...";

  try {
    const theme = getPosterTheme(teamName, selectedTemplate);
    const teamLogoPath = getTeamLogo(teamName);
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1440;
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Canvas context unavailable");
    }

    const backgroundGradient = context.createLinearGradient(0, 0, 1080, 1440);
    backgroundGradient.addColorStop(0, theme.bgStart);
    backgroundGradient.addColorStop(0.6, theme.bgMid);
    backgroundGradient.addColorStop(1, theme.bgEnd);
    context.fillStyle = backgroundGradient;
    context.fillRect(0, 0, 1080, 1440);

    context.fillStyle = "rgba(255,255,255,0.07)";
    context.beginPath();
    drawRoundedRect(context, 58, 68, 964, 1302, 40);
    context.fill();

    context.fillStyle = "#ffffff";
    context.strokeStyle = "rgba(255,255,255,0.6)";
    context.lineWidth = 3;
    context.beginPath();
    drawRoundedRect(context, 90, 94, 900, 1246, 32);
    context.fill();
    context.stroke();

    const topStrip = context.createLinearGradient(90, 94, 990, 94);
    topStrip.addColorStop(0, theme.stripStart);
    topStrip.addColorStop(0.5, theme.stripMid);
    topStrip.addColorStop(1, theme.stripEnd);
    context.fillStyle = topStrip;
    context.beginPath();
    drawRoundedRect(context, 90, 94, 900, 108, 22);
    context.fill();

    context.fillStyle = "#f8fafc";
    context.font = "800 28px Inter, Arial";
    context.fillText("METROVILLE BASKETBALL LEAGUE", 168, 163);

    context.fillStyle = "#0b1220";
    context.beginPath();
    drawRoundedRect(context, 132, 224, 816, 520, 24);
    context.fill();

    const teamLogo = await loadImageForCanvas(teamLogoPath);
    if (teamLogo) {
      context.save();
      context.globalAlpha = 0.12;
      drawImageContain(context, teamLogo, 280, 250, 520, 470);
      context.restore();
    }

    const playerImage = await loadImageForCanvas(imagePath);
    if (playerImage) {
      context.save();
      context.beginPath();
      drawRoundedRect(context, 132, 224, 816, 520, 24);
      context.clip();

      context.globalAlpha = 0.24;
      drawImageCover(context, playerImage, 132, 224, 816, 520);

      context.globalAlpha = 1;
      drawImageContain(context, playerImage, 170, 244, 740, 468);
      context.restore();

      context.strokeStyle = "rgba(255,255,255,0.38)";
      context.lineWidth = 2;
      context.beginPath();
      drawRoundedRect(context, 170, 244, 740, 468, 20);
      context.stroke();
    } else {
      context.fillStyle = "#e2e8f0";
      context.beginPath();
      drawRoundedRect(context, 170, 244, 740, 468, 20);
      context.fill();
    }

    const imageShade = context.createLinearGradient(0, 560, 0, 760);
    imageShade.addColorStop(0, "rgba(15,23,42,0)");
    imageShade.addColorStop(1, "rgba(15,23,42,0.72)");
    context.fillStyle = imageShade;
    context.beginPath();
    drawRoundedRect(context, 132, 224, 816, 520, 24);
    context.fill();

    context.fillStyle = theme.badgeBg;
    context.beginPath();
    drawRoundedRect(context, 156, 250, 260, 54, 999);
    context.fill();
    context.strokeStyle = theme.badgeBorder;
    context.lineWidth = 2;
    context.beginPath();
    drawRoundedRect(context, 156, 250, 260, 54, 999);
    context.stroke();
    context.fillStyle = theme.badgeText;
    context.font = "700 26px Inter, Arial";
    context.fillText("BEST PLAYER", 184, 286);

    context.fillStyle = "rgba(133,77,14,0.85)";
    context.beginPath();
    context.arc(902, 276, 30, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#fef3c7";
    context.font = "800 24px Inter, Arial";
    context.textAlign = "center";
    context.fillText("#1", 902, 285);
    context.textAlign = "left";

    context.fillStyle = theme.primary;
    context.font = "800 32px Inter, Arial";
    context.fillText("BEST PLAYER OF THE GAME", 150, 826);

    context.fillStyle = "#0f172a";
    const fittedName = fitText(context, playerName || "Best Player", 760, 76, 50, "900", "Inter, Arial");
    context.font = `${fittedName.fontWeight} ${fittedName.fontSize}px ${fittedName.fontFamily}`;
    context.fillText(fittedName.text, 150, 918);

    context.fillStyle = "#475569";
    const fittedTeam = fitText(context, teamName || "Team", 760, 38, 28, "700", "Inter, Arial");
    context.font = `${fittedTeam.fontWeight} ${fittedTeam.fontSize}px ${fittedTeam.fontFamily}`;
    context.fillText(fittedTeam.text, 150, 964);

    context.fillStyle = theme.primary;
    context.font = "700 24px Inter, Arial";
    const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    context.fillText(`Game Night Highlight • ${today}`, 150, 1000);

    const statCards = [
      { label: "PTS", value: pts },
      { label: "AST", value: ast },
      { label: "REB", value: reb },
      { label: "STL", value: stl },
    ];

    statCards.forEach((stat, index) => {
      const cardX = 150 + (index * 195);
      const statGradient = context.createLinearGradient(cardX, 1030, cardX, 1250);
      statGradient.addColorStop(0, theme.statTop);
      statGradient.addColorStop(1, theme.statBottom);
      context.fillStyle = statGradient;
      context.strokeStyle = theme.statBorder;
      context.lineWidth = 2;
      context.beginPath();
      drawRoundedRect(context, cardX, 1030, 180, 190, 20);
      context.fill();
      context.stroke();

      context.fillStyle = "#475569";
      context.font = "800 24px Inter, Arial";
      context.fillText(stat.label, cardX + 62, 1090);

      context.fillStyle = "#0f172a";
      const statText = String(stat.value);
      const fittedStat = fitText(context, statText, 130, 62, 42, "900", "Inter, Arial");
      context.font = `${fittedStat.fontWeight} ${fittedStat.fontSize}px ${fittedStat.fontFamily}`;
      context.fillText(fittedStat.text, cardX + 90 - (context.measureText(fittedStat.text).width / 2), 1176);
    });

    context.fillStyle = "#0f172a";
    context.globalAlpha = 0.06;
    context.font = "900 120px Inter, Arial";
    context.fillText("MVP", 742, 1320);
    context.globalAlpha = 1;

    const footerGradient = context.createLinearGradient(150, 1250, 930, 1340);
    footerGradient.addColorStop(0, theme.footerStart);
    footerGradient.addColorStop(1, theme.footerEnd);
    context.fillStyle = footerGradient;
    context.beginPath();
    drawRoundedRect(context, 150, 1254, 780, 78, 16);
    context.fill();
    context.strokeStyle = "#cbd5e1";
    context.lineWidth = 2;
    context.beginPath();
    drawRoundedRect(context, 150, 1254, 780, 78, 16);
    context.stroke();

    context.fillStyle = "#1e293b";
    context.font = "800 24px Inter, Arial";
    context.fillText("Metroville Basketball League 2026", 178, 1302);

    context.fillStyle = "#334155";
    context.font = "700 20px Inter, Arial";
    context.fillText("Official Performance Card", 660, 1302);

    const fileName = String(playerName || "best-player")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const downloadLink = document.createElement("a");
    downloadLink.href = canvas.toDataURL("image/png");
    downloadLink.download = `${fileName || "best-player"}-card.png`;
    downloadLink.click();
  } catch (error) {
    console.error("Failed to download player card", error);
    alert("Unable to download card right now.");
  } finally {
    buttonElement.disabled = false;
    buttonElement.textContent = originalLabel;
  }
}

async function downloadScheduleGameCard(buttonElement){
  const decode = (value) => decodeURIComponent(String(value || ""));

  const gameDateRaw = decode(buttonElement.dataset.date || "");
  const gameTimeRaw = decode(buttonElement.dataset.time || "");
  const venue = decode(buttonElement.dataset.venue || "TBD Venue") || "TBD Venue";
  const awayTeam = decode(buttonElement.dataset.away || "Away Team") || "Away Team";
  const homeTeam = decode(buttonElement.dataset.home || "Home Team") || "Home Team";
  const gameNumber = decode(buttonElement.dataset.gameNumber || "1") || "1";
  const awayRecord = decode(buttonElement.dataset.awayRecord || "(0-0)") || "(0-0)";
  const homeRecord = decode(buttonElement.dataset.homeRecord || "(0-0)") || "(0-0)";
  const awayLogoPath = decode(buttonElement.dataset.awayLogo || getTeamLogo(awayTeam));
  const homeLogoPath = decode(buttonElement.dataset.homeLogo || getTeamLogo(homeTeam));

  const matchDate = formatScheduleDate(gameDateRaw);
  const matchTime = formatScheduleTime(gameTimeRaw);
  const matchLabel = `${matchDate} • ${matchTime}`;
  const generatedLabel = new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
  const awayTheme = getTeamTheme(awayTeam);
  const homeTheme = getTeamTheme(homeTeam);

  const originalLabel = buttonElement.textContent;
  buttonElement.disabled = true;
  buttonElement.textContent = "…";
  buttonElement.classList.add("is-loading");

  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1920;
    canvas.height = 1080;
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Canvas context unavailable");
    }

    const wrapTextLines = (textValue, maxWidth, maxLines) => {
      const safeText = String(textValue || "").trim();
      if (!safeText) return ["-"];

      const words = safeText.split(/\s+/);
      const lines = [];
      let currentLine = "";

      const pushLine = (lineText) => {
        if (!lineText) return;
        lines.push(lineText);
      };

      words.forEach((word) => {
        const candidate = currentLine ? `${currentLine} ${word}` : word;
        if (context.measureText(candidate).width <= maxWidth) {
          currentLine = candidate;
          return;
        }

        if (!currentLine) {
          let slicedWord = word;
          while (context.measureText(`${slicedWord}…`).width > maxWidth && slicedWord.length > 1) {
            slicedWord = slicedWord.slice(0, -1);
          }
          pushLine(`${slicedWord}…`);
          currentLine = "";
          return;
        }

        pushLine(currentLine);
        currentLine = word;
      });

      pushLine(currentLine);

      if (lines.length <= maxLines) return lines;

      const trimmed = lines.slice(0, maxLines);
      let lastLine = trimmed[maxLines - 1];
      while (context.measureText(`${lastLine}…`).width > maxWidth && lastLine.length > 1) {
        lastLine = lastLine.slice(0, -1);
      }
      trimmed[maxLines - 1] = `${lastLine}…`;
      return trimmed;
    };
    const backgroundGradient = context.createLinearGradient(0, 0, 1920, 1080);
    backgroundGradient.addColorStop(0, "#030712");
    backgroundGradient.addColorStop(0.5, "#0b1220");
    backgroundGradient.addColorStop(1, "#0f172a");
    context.fillStyle = backgroundGradient;
    context.fillRect(0, 0, 1920, 1080);

    context.fillStyle = "rgba(59, 130, 246, 0.16)";
    context.beginPath();
    context.arc(1740, 120, 210, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "rgba(37, 99, 235, 0.1)";
    context.beginPath();
    context.arc(220, 930, 230, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = "rgba(15, 23, 42, 0.75)";
    context.beginPath();
    drawRoundedRect(context, 140, 80, 1640, 920, 34);
    context.fill();
    context.strokeStyle = "rgba(148, 163, 184, 0.22)";
    context.lineWidth = 2;
    context.beginPath();
    drawRoundedRect(context, 140, 80, 1640, 920, 34);
    context.stroke();

    context.textAlign = "center";

    const gameInfo = `Game ${gameNumber} | ${matchDate} | ${matchTime}`;
    context.fillStyle = "rgba(15, 23, 42, 0.85)";
    context.beginPath();
    drawRoundedRect(context, 290, 150, 1340, 84, 20);
    context.fill();
    context.strokeStyle = "rgba(148, 163, 184, 0.25)";
    context.lineWidth = 1.2;
    context.beginPath();
    drawRoundedRect(context, 290, 150, 1340, 84, 20);
    context.stroke();
    const fittedInfo = fitText(context, gameInfo, 1260, 33, 19, "800", "Inter, Arial");
    context.fillStyle = "#e2e8f0";
    context.font = `${fittedInfo.fontWeight} ${fittedInfo.fontSize}px ${fittedInfo.fontFamily}`;
    context.fillText(fittedInfo.text, 960, 203);

    context.fillStyle = "rgba(2, 6, 23, 0.62)";
    context.beginPath();
    drawRoundedRect(context, 260, 280, 1400, 540, 24);
    context.fill();
    context.strokeStyle = "rgba(148, 163, 184, 0.2)";
    context.lineWidth = 1.2;
    context.beginPath();
    drawRoundedRect(context, 260, 280, 1400, 540, 24);
    context.stroke();

    const awayPanelX = 320;
    const homePanelX = 1040;
    const panelY = 330;
    const panelWidth = 560;
    const panelHeight = 430;

    context.fillStyle = "rgba(15, 23, 42, 0.6)";
    context.beginPath();
    drawRoundedRect(context, awayPanelX, panelY, panelWidth, panelHeight, 18);
    context.fill();
    context.strokeStyle = "rgba(148, 163, 184, 0.24)";
    context.lineWidth = 1.1;
    context.beginPath();
    drawRoundedRect(context, awayPanelX, panelY, panelWidth, panelHeight, 18);
    context.stroke();

    context.fillStyle = "rgba(15, 23, 42, 0.6)";
    context.beginPath();
    drawRoundedRect(context, homePanelX, panelY, panelWidth, panelHeight, 18);
    context.fill();
    context.strokeStyle = "rgba(148, 163, 184, 0.24)";
    context.lineWidth = 1.1;
    context.beginPath();
    drawRoundedRect(context, homePanelX, panelY, panelWidth, panelHeight, 18);
    context.stroke();

    context.fillStyle = "rgba(37, 99, 235, 0.2)";
    context.beginPath();
    drawRoundedRect(context, 900, 488, 120, 120, 18);
    context.fill();
    context.strokeStyle = "rgba(147, 197, 253, 0.42)";
    context.lineWidth = 1.4;
    context.beginPath();
    drawRoundedRect(context, 900, 488, 120, 120, 18);
    context.stroke();
    context.fillStyle = "#dbeafe";
    context.font = "900 50px Inter, Arial";
    context.fillText("VS", 960, 564);

    const awayLogo = await loadImageForCanvas(awayLogoPath);
    const homeLogo = await loadImageForCanvas(homeLogoPath);

    const awayCenterX = awayPanelX + (panelWidth / 2);
    const homeCenterX = homePanelX + (panelWidth / 2);
    const logoCenterY = 470;
    const logoRadius = 116;

    context.fillStyle = "#020617";
    context.beginPath();
    context.arc(awayCenterX, logoCenterY, logoRadius + 8, 0, Math.PI * 2);
    context.fill();
    context.beginPath();
    context.arc(homeCenterX, logoCenterY, logoRadius + 8, 0, Math.PI * 2);
    context.fill();

    if (awayLogo) {
      context.save();
      context.beginPath();
      context.arc(awayCenterX, logoCenterY, logoRadius, 0, Math.PI * 2);
      context.closePath();
      context.clip();
      drawImageCover(context, awayLogo, awayCenterX - logoRadius, logoCenterY - logoRadius, logoRadius * 2, logoRadius * 2);
      context.restore();
    }

    if (homeLogo) {
      context.save();
      context.beginPath();
      context.arc(homeCenterX, logoCenterY, logoRadius, 0, Math.PI * 2);
      context.closePath();
      context.clip();
      drawImageCover(context, homeLogo, homeCenterX - logoRadius, logoCenterY - logoRadius, logoRadius * 2, logoRadius * 2);
      context.restore();
    }

    context.strokeStyle = "rgba(226,232,240,0.45)";
    context.lineWidth = 2.6;
    context.beginPath();
    context.arc(awayCenterX, logoCenterY, logoRadius, 0, Math.PI * 2);
    context.stroke();
    context.beginPath();
    context.arc(homeCenterX, logoCenterY, logoRadius, 0, Math.PI * 2);
    context.stroke();

    const drawTeamLabelBlock = (teamName, teamRecord, centerX, startY, maxWidth, accentColor) => {
      context.fillStyle = "#f8fafc";
      context.textAlign = "center";
      context.font = "900 38px Inter, Arial";

      const nameLines = wrapTextLines(String(teamName || "TEAM"), maxWidth, 2);
      const lineHeight = 36;

      nameLines.forEach((lineText, index) => {
        const fittedLine = fitText(context, lineText.toUpperCase(), maxWidth, 36, 21, "900", "Inter, Arial");
        context.font = `${fittedLine.fontWeight} ${fittedLine.fontSize}px ${fittedLine.fontFamily}`;
        context.fillStyle = "#f8fafc";
        context.fillText(fittedLine.text, centerX, startY + (index * lineHeight));
      });

      const recordY = startY + (nameLines.length * lineHeight) + 16;
      const recordBoxWidth = Math.min(maxWidth - 100, 210);
      context.fillStyle = "rgba(15, 23, 42, 0.72)";
      context.beginPath();
      drawRoundedRect(context, centerX - (recordBoxWidth / 2), recordY - 22, recordBoxWidth, 34, 999);
      context.fill();
      context.strokeStyle = `${accentColor}80`;
      context.lineWidth = 1.2;
      context.beginPath();
      drawRoundedRect(context, centerX - (recordBoxWidth / 2), recordY - 22, recordBoxWidth, 34, 999);
      context.stroke();

      context.fillStyle = accentColor;
      context.font = "800 20px Inter, Arial";
      const fittedRecord = fitText(context, String(teamRecord || "(0-0)"), maxWidth - 40, 20, 16, "800", "Inter, Arial");
      context.font = `${fittedRecord.fontWeight} ${fittedRecord.fontSize}px ${fittedRecord.fontFamily}`;
      context.fillText(fittedRecord.text, centerX, recordY);
    };

    drawTeamLabelBlock(awayTeam, awayRecord, awayCenterX, 640, 430, "#93c5fd");
    drawTeamLabelBlock(homeTeam, homeRecord, homeCenterX, 640, 430, "#fca5a5");

    const venueBar = context.createLinearGradient(360, 885, 1560, 885);
    venueBar.addColorStop(0, "rgba(15, 23, 42, 0.9)");
    venueBar.addColorStop(1, "rgba(30, 41, 59, 0.9)");
    context.fillStyle = venueBar;
    context.beginPath();
    drawRoundedRect(context, 360, 850, 1200, 88, 18);
    context.fill();
    context.strokeStyle = "rgba(148, 163, 184, 0.28)";
    context.lineWidth = 1.2;
    context.beginPath();
    drawRoundedRect(context, 360, 850, 1200, 88, 18);
    context.stroke();

    context.fillStyle = "#bfdbfe";
    context.beginPath();
    context.arc(430, 894, 13, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#0f172a";
    context.beginPath();
    context.arc(430, 894, 5, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = "#f8fafc";
    context.textAlign = "left";
    context.font = "700 30px Inter, Arial";
    const fittedVenue = fitText(context, "Metroville Basketball Court", 1040, 30, 18, "700", "Inter, Arial");
    context.font = `${fittedVenue.fontWeight} ${fittedVenue.fontSize}px ${fittedVenue.fontFamily}`;
    context.fillText(fittedVenue.text, 462, 906);

    context.textAlign = "left";

    const fileName = `${awayTeam}-vs-${homeTeam}-${gameDateRaw || "game"}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const downloadLink = document.createElement("a");
    downloadLink.href = canvas.toDataURL("image/png");
    downloadLink.download = `${fileName || "game-schedule"}-share-card.png`;
    downloadLink.click();
  } catch (error) {
    console.error("Failed to download schedule card", error);
    alert("Unable to download game card right now.");
  } finally {
    buttonElement.disabled = false;
    buttonElement.textContent = originalLabel;
    buttonElement.classList.remove("is-loading");
  }
}

async function downloadScheduleDayPoster(dayKey, gamesForDay, buttonElement) {
  if (!Array.isArray(gamesForDay) || !gamesForDay.length) return;

  const originalLabel = buttonElement ? buttonElement.textContent : "";
  if (buttonElement) {
    buttonElement.disabled = true;
    buttonElement.textContent = "Preparing...";
  }

  try {
    const dayDate = dayKey !== "TBD Date" ? new Date(dayKey) : null;
    const dayLabel = dayDate && !Number.isNaN(dayDate.getTime())
      ? dayDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "2-digit", year: "numeric" })
      : "TBD Date";

    const rowHeight = 198;
    const canvasWidth = 1200;
    const canvasHeight = Math.max(1120, 390 + (gamesForDay.length * rowHeight) + 150);
    const canvas = document.createElement("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Canvas context unavailable");
    }

    const backgroundGradient = context.createLinearGradient(0, 0, canvasWidth, canvasHeight);
    backgroundGradient.addColorStop(0, "#050b16");
    backgroundGradient.addColorStop(0.42, "#101f3b");
    backgroundGradient.addColorStop(1, "#0b1220");
    context.fillStyle = backgroundGradient;
    context.fillRect(0, 0, canvasWidth, canvasHeight);

    context.fillStyle = "rgba(251, 146, 60, 0.26)";
    context.beginPath();
    context.arc(1100, 70, 180, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = "rgba(37, 99, 235, 0.18)";
    context.beginPath();
    context.arc(120, 170, 140, 0, Math.PI * 2);
    context.fill();

    context.strokeStyle = "rgba(251, 191, 36, 0.18)";
    context.lineWidth = 3;
    context.beginPath();
    context.arc(canvasWidth / 2, canvasHeight / 2, 300, 0, Math.PI * 2);
    context.stroke();

    context.beginPath();
    context.moveTo(canvasWidth / 2, 250);
    context.lineTo(canvasWidth / 2, canvasHeight - 120);
    context.stroke();

    context.fillStyle = "rgba(15, 23, 42, 0.84)";
    context.beginPath();
    drawRoundedRect(context, 52, 36, 1096, 166, 28);
    context.fill();
    context.strokeStyle = "rgba(148, 163, 184, 0.3)";
    context.lineWidth = 1.5;
    context.beginPath();
    drawRoundedRect(context, 52, 36, 1096, 166, 28);
    context.stroke();

    context.fillStyle = "#f8fafc";
    context.font = "900 48px Inter, Arial";
    context.fillText("METROVILLE LEAGUE", 84, 101);
    context.fillStyle = "#fcd34d";
    context.font = "800 40px Inter, Arial";
    context.fillText("GAME DAY POSTER", 84, 150);
    context.fillStyle = "#bfdbfe";
    context.font = "700 26px Inter, Arial";
    context.fillText(dayLabel, 740, 116);
    context.fillStyle = "#cbd5e1";
    context.font = "700 18px Inter, Arial";
    context.fillText(`${gamesForDay.length} matchups`, 740, 146);

    context.fillStyle = "rgba(15, 23, 42, 0.72)";
    context.beginPath();
    drawRoundedRect(context, 52, 228, 1096, canvasHeight - 316, 28);
    context.fill();
    context.strokeStyle = "rgba(148, 163, 184, 0.26)";
    context.lineWidth = 1.4;
    context.beginPath();
    drawRoundedRect(context, 52, 228, 1096, canvasHeight - 316, 28);
    context.stroke();

    for (let index = 0; index < gamesForDay.length; index += 1) {
      const game = gamesForDay[index];
      const top = 256 + (index * rowHeight);

      context.fillStyle = index % 2 === 0 ? "rgba(30, 41, 59, 0.8)" : "rgba(15, 23, 42, 0.8)";
      context.beginPath();
      drawRoundedRect(context, 82, top, 1036, rowHeight - 18, 22);
      context.fill();

      context.strokeStyle = index % 2 === 0 ? "rgba(125, 211, 252, 0.25)" : "rgba(251, 191, 36, 0.24)";
      context.lineWidth = 1.2;
      context.beginPath();
      drawRoundedRect(context, 82, top, 1036, rowHeight - 18, 22);
      context.stroke();

      const awayTeam = String(game.away || "Away Team");
      const homeTeam = String(game.home || "Home Team");
      const matchTime = formatScheduleTime(game.time || "");
      const venue = String(game.venue || "Metroville Basketball Court");
      const matchStatus = String(game.status || "Upcoming");

      const awayLogo = await loadImageForCanvas(getTeamLogo(awayTeam));
      const homeLogo = await loadImageForCanvas(getTeamLogo(homeTeam));

      const awayLogoX = 132;
      const homeLogoX = 912;
      const logoY = top + 40;
      const logoSize = 102;
      const logoRadius = logoSize / 2;

      context.fillStyle = "#f8fafc";
      context.beginPath();
      context.arc(awayLogoX + logoRadius, logoY + logoRadius, logoRadius + 5, 0, Math.PI * 2);
      context.fill();
      context.beginPath();
      context.arc(homeLogoX + logoRadius, logoY + logoRadius, logoRadius + 5, 0, Math.PI * 2);
      context.fill();

      if (awayLogo) {
        context.save();
        context.beginPath();
        context.arc(awayLogoX + logoRadius, logoY + logoRadius, logoRadius, 0, Math.PI * 2);
        context.closePath();
        context.clip();
        drawImageCover(context, awayLogo, awayLogoX, logoY, logoSize, logoSize);
        context.restore();
      }

      if (homeLogo) {
        context.save();
        context.beginPath();
        context.arc(homeLogoX + logoRadius, logoY + logoRadius, logoRadius, 0, Math.PI * 2);
        context.closePath();
        context.clip();
        drawImageCover(context, homeLogo, homeLogoX, logoY, logoSize, logoSize);
        context.restore();
      }

      context.strokeStyle = "rgba(226,232,240,0.55)";
      context.lineWidth = 2;
      context.beginPath();
      context.arc(awayLogoX + logoRadius, logoY + logoRadius, logoRadius, 0, Math.PI * 2);
      context.stroke();
      context.beginPath();
      context.arc(homeLogoX + logoRadius, logoY + logoRadius, logoRadius, 0, Math.PI * 2);
      context.stroke();

      context.fillStyle = "#f8fafc";
      context.font = "900 30px Inter, Arial";
      context.fillText(awayTeam, 260, top + 84);
      context.fillText(homeTeam, 1044, top + 84);

      context.fillStyle = "rgba(37, 99, 235, 0.32)";
      context.beginPath();
      drawRoundedRect(context, 560, top + 44, 88, 66, 16);
      context.fill();
      context.strokeStyle = "rgba(147, 197, 253, 0.52)";
      context.lineWidth = 1.2;
      context.beginPath();
      drawRoundedRect(context, 560, top + 44, 88, 66, 16);
      context.stroke();
      context.fillStyle = "#dbeafe";
      context.font = "900 34px Inter, Arial";
      context.fillText("VS", 585, top + 90);

      context.fillStyle = "#cbd5e1";
      context.font = "700 20px Inter, Arial";
      context.fillText(`${matchTime} | ${venue}`, 260, top + 124);

      context.fillStyle = "rgba(251, 191, 36, 0.25)";
      context.beginPath();
      drawRoundedRect(context, 916, top + 126, 180, 34, 999);
      context.fill();
      context.strokeStyle = "rgba(253, 224, 71, 0.5)";
      context.beginPath();
      drawRoundedRect(context, 916, top + 126, 180, 34, 999);
      context.stroke();
      context.fillStyle = "#fde68a";
      context.font = "800 16px Inter, Arial";
      context.fillText(matchStatus.toUpperCase(), 938, top + 149);
    }

    context.fillStyle = "rgba(148, 163, 184, 0.86)";
    context.font = "600 18px Inter, Arial";
    context.fillText(`Generated ${new Date().toLocaleString("en-US")}`, 60, canvasHeight - 46);
    context.fillStyle = "#93c5fd";
    context.font = "700 18px Inter, Arial";
    context.fillText("Metroville Basketball League 2026", 820, canvasHeight - 46);

    const fileDatePart = String(dayKey || "schedule-day")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const downloadLink = document.createElement("a");
    downloadLink.href = canvas.toDataURL("image/png");
    downloadLink.download = `schedule-${fileDatePart || "day"}-poster.png`;
    downloadLink.click();
  } catch (error) {
    console.error("Failed to download day schedule poster", error);
    alert("Unable to download day schedule poster right now.");
  } finally {
    if (buttonElement) {
      buttonElement.disabled = false;
      buttonElement.textContent = originalLabel;
    }
  }
}

function getTeamTheme(teamName){
  const normalized = String(teamName || "").toLowerCase();

  if (normalized.includes("falcons")) {
    return {
      bgStart: "#0b1220",
      bgMid: "#1d4ed8",
      bgEnd: "#0f172a",
      primary: "#2563eb",
      statTop: "#eff6ff",
      statBottom: "#dbeafe",
      statBorder: "#93c5fd",
    };
  }

  if (normalized.includes("titans") || normalized.includes("kings")) {
    return {
      bgStart: "#1f2937",
      bgMid: "#b45309",
      bgEnd: "#111827",
      primary: "#d97706",
      statTop: "#fff7ed",
      statBottom: "#ffedd5",
      statBorder: "#fdba74",
    };
  }

  if (normalized.includes("sharks") || normalized.includes("wolves")) {
    return {
      bgStart: "#0f172a",
      bgMid: "#0f766e",
      bgEnd: "#111827",
      primary: "#0f766e",
      statTop: "#ecfeff",
      statBottom: "#ccfbf1",
      statBorder: "#5eead4",
    };
  }

  return {
    bgStart: "#0f172a",
    bgMid: "#1d4ed8",
    bgEnd: "#1e293b",
    primary: "#2563eb",
    statTop: "#eff6ff",
    statBottom: "#dbeafe",
    statBorder: "#93c5fd",
  };
}

function getPosterTheme(teamName, templateName){
  const baseTheme = getTeamTheme(teamName);
  const normalizedTemplate = String(templateName || "dark-arena").toLowerCase();

  if (normalizedTemplate === "gold-mvp") {
    return {
      ...baseTheme,
      bgStart: "#1a1203",
      bgMid: "#7c2d12",
      bgEnd: "#111827",
      primary: "#f59e0b",
      statTop: "#fff7ed",
      statBottom: "#ffedd5",
      statBorder: "#fdba74",
      stripStart: "#78350f",
      stripMid: "#f59e0b",
      stripEnd: "#78350f",
      badgeBg: "rgba(180, 83, 9, 0.78)",
      badgeBorder: "rgba(254, 240, 138, 0.84)",
      badgeText: "#fefce8",
      impactStart: "#78350f",
      impactEnd: "#f59e0b",
      footerStart: "#fff7ed",
      footerEnd: "#ffedd5",
    };
  }

  if (normalizedTemplate === "playoff-edition") {
    return {
      ...baseTheme,
      bgStart: "#111827",
      bgMid: "#7f1d1d",
      bgEnd: "#1f2937",
      primary: "#ef4444",
      statTop: "#fef2f2",
      statBottom: "#fee2e2",
      statBorder: "#fca5a5",
      stripStart: "#111827",
      stripMid: "#ef4444",
      stripEnd: "#111827",
      badgeBg: "rgba(127, 29, 29, 0.82)",
      badgeBorder: "rgba(254, 202, 202, 0.84)",
      badgeText: "#fef2f2",
      impactStart: "#7f1d1d",
      impactEnd: "#ef4444",
      footerStart: "#fee2e2",
      footerEnd: "#fecaca",
    };
  }

  return {
    ...baseTheme,
    stripStart: "#0f172a",
    stripMid: baseTheme.primary,
    stripEnd: "#0f172a",
    badgeBg: "rgba(30, 64, 175, 0.68)",
    badgeBorder: "rgba(191, 219, 254, 0.7)",
    badgeText: "#f8fafc",
    impactStart: "#0f172a",
    impactEnd: baseTheme.primary,
    footerStart: "#f8fafc",
    footerEnd: "#e2e8f0",
  };
}

function truncateText(context, text, maxWidth){
  const safeText = String(text || "");
  if (context.measureText(safeText).width <= maxWidth) return safeText;

  let output = safeText;
  while (output.length > 0 && context.measureText(output + "...").width > maxWidth) {
    output = output.slice(0, -1);
  }

  return `${output}...`;
}

function fitText(context, text, maxWidth, maxFontSize, minFontSize, fontWeight, fontFamily){
  let fontSize = maxFontSize;
  while (fontSize > minFontSize) {
    context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    if (context.measureText(String(text || "")).width <= maxWidth) {
      return {
        text: String(text || ""),
        fontSize,
        fontWeight,
        fontFamily,
      };
    }

    fontSize -= 1;
  }

  context.font = `${fontWeight} ${minFontSize}px ${fontFamily}`;
  return {
    text: truncateText(context, text, maxWidth),
    fontSize: minFontSize,
    fontWeight,
    fontFamily,
  };
}

function loadImageForCanvas(source){
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = source;
  });
}

function drawRoundedRect(context, x, y, width, height, radius){
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.moveTo(x + safeRadius, y);
  context.lineTo(x + width - safeRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  context.lineTo(x + width, y + height - safeRadius);
  context.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  context.lineTo(x + safeRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  context.lineTo(x, y + safeRadius);
  context.quadraticCurveTo(x, y, x + safeRadius, y);
}

function drawImageContain(context, image, x, y, width, height){
  const imageRatio = image.width / image.height;
  const boxRatio = width / height;

  let drawWidth = width;
  let drawHeight = height;

  if (imageRatio > boxRatio) {
    drawHeight = width / imageRatio;
  } else {
    drawWidth = height * imageRatio;
  }

  const offsetX = x + (width - drawWidth) / 2;
  const offsetY = y + (height - drawHeight) / 2;
  context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
}

function drawImageCover(context, image, x, y, width, height){
  const imageRatio = image.width / image.height;
  const boxRatio = width / height;

  let sourceWidth = image.width;
  let sourceHeight = image.height;
  let sourceX = 0;
  let sourceY = 0;

  if (imageRatio > boxRatio) {
    sourceWidth = image.height * boxRatio;
    sourceX = (image.width - sourceWidth) / 2;
  } else {
    sourceHeight = image.width / boxRatio;
    sourceY = (image.height - sourceHeight) / 2;
  }

  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
}

function renderEventSlider(){
  if (!eventSlides.length) return;

  const track = document.getElementById("eventSlidesTrack");
  const dots = document.getElementById("eventDots");
  const prevButton = document.getElementById("prevEvent");
  const nextButton = document.getElementById("nextEvent");
  const slider = document.getElementById("eventSlider");
  const viewport = slider ? slider.querySelector(".event-viewport") : null;

  if (!track || !dots || !prevButton || !nextButton || !slider || !viewport) return;

  if (sliderIntervalId) {
    clearInterval(sliderIntervalId);
    sliderIntervalId = null;
  }

  track.innerHTML = eventSlides.map((slide) => `
    <article class="event-slide">
      <img src="${slide.image}" alt="${slide.title}" loading="lazy" />
      <div class="event-caption">
        <span class="event-badge">Game Event</span>
        <h4>${slide.title}</h4>
        <p>${slide.date} • ${slide.venue}</p>
      </div>
    </article>
  `).join("");

  dots.innerHTML = eventSlides
    .map((_, index) => `<button aria-label="Go to slide ${index + 1}" data-slide="${index}"></button>`)
    .join("");

  const updateSlider = () => {
    track.style.transform = `translateX(-${eventIndex * 100}%)`;

    [...dots.querySelectorAll("button")].forEach((dot, index) => {
      dot.classList.toggle("active", index === eventIndex);
    });
  };

  const goToSlide = (index) => {
    eventIndex = (index + eventSlides.length) % eventSlides.length;
    updateSlider();
  };

  const startAutoSlide = () => {
    if (sliderIntervalId) clearInterval(sliderIntervalId);
    sliderIntervalId = setInterval(() => goToSlide(eventIndex + 1), 4500);
  };

  const stopAutoSlide = () => {
    if (!sliderIntervalId) return;
    clearInterval(sliderIntervalId);
    sliderIntervalId = null;
  };

  prevButton.addEventListener("click", () => {
    goToSlide(eventIndex - 1);
    startAutoSlide();
  });

  nextButton.addEventListener("click", () => {
    goToSlide(eventIndex + 1);
    startAutoSlide();
  });

  dots.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const index = Number(target.dataset.slide);
    if (Number.isNaN(index)) return;

    goToSlide(index);
    startAutoSlide();
  });

  slider.addEventListener("mouseenter", stopAutoSlide);
  slider.addEventListener("mouseleave", startAutoSlide);

  slider.setAttribute("tabindex", "0");
  slider.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      goToSlide(eventIndex - 1);
      startAutoSlide();
    }

    if (event.key === "ArrowRight") {
      goToSlide(eventIndex + 1);
      startAutoSlide();
    }
  });

  let touchStartX = 0;
  viewport.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0].clientX;
  }, { passive: true });

  viewport.addEventListener("touchend", (event) => {
    const touchEndX = event.changedTouches[0].clientX;
    const swipeDistance = touchEndX - touchStartX;

    if (Math.abs(swipeDistance) < 35) return;

    if (swipeDistance > 0) {
      goToSlide(eventIndex - 1);
    } else {
      goToSlide(eventIndex + 1);
    }

    startAutoSlide();
  }, { passive: true });

  if (!sliderVisibilityListenerAdded) {
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stopAutoSlide();
      } else {
        startAutoSlide();
      }
    });

    sliderVisibilityListenerAdded = true;
  }

  updateSlider();
  startAutoSlide();
}

function renderTeamLogos(){
  const teamLogosGrid = document.getElementById("teamLogosGrid");
  if (!teamLogosGrid) return;

  if (!Object.keys(teamLogos).length) {
    teamLogosGrid.innerHTML = `<p class="player-team">No team logos found in database.</p>`;
    return;
  }

  const teams = Object.keys(teamLogos);
  teamLogosGrid.innerHTML = teams.map((teamName) => `
    <div class="team-logo-card">
      <span class="team-logo">
        <img src="${getTeamLogo(teamName)}" alt="${teamName} logo" loading="lazy" onerror="handleTeamLogoError(this)" />
      </span>
      <p>${teamName}</p>
    </div>
  `).join("");
}

function setActiveNav(){
  const page = document.body.dataset.page;
  if (!page) return;

  const activeLink = document.querySelector(`[data-link="${page}"]`);
  if (activeLink) activeLink.classList.add("active");
}

document.addEventListener("DOMContentLoaded", async ()=>{
  renderEventSlider();
  setActiveNav();

  await refreshLeagueDataAndRender({ forceRender: true });
  startLiveRefresh();
});