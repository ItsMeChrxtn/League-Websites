const { listRecords } = require("./_lib/storage");
const { sendJson } = require("./_lib/http");

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "GET") {
    sendJson(res, 405, { ok: false, message: "Method not allowed." });
    return;
  }

  try {
    const [scheduleDocs, standingsDocs, bestPlayerDocs, teamLogoDocs] = await Promise.all([
      listRecords("game_schedules", { game_date: 1, game_time: 1, _id: 1 }),
      listRecords("team_standings", { updated_at: -1, _id: -1 }),
      listRecords("best_players", { updated_at: -1, _id: -1 }),
      listRecords("team_logos", { updated_at: -1, _id: -1 }),
    ]);

    const schedule = scheduleDocs.map((row) => ({
      date: row.game_date || "",
      time: row.game_time || "",
      venue: row.venue || "",
      home: row.home_team || "",
      away: row.away_team || "",
    }));

    const standings = standingsDocs.map((row) => ({
      team: row.team || "",
      wins: Number(row.wins) || 0,
      losses: Number(row.losses) || 0,
    }));

    const bestPlayers = bestPlayerDocs.map((row) => ({
      player: row.player_name || "",
      team: row.team || "",
      points: Number(row.points) || 0,
      assists: Number(row.assists) || 0,
      rebounds: Number(row.rebounds) || 0,
      steals: Number(row.steals) || 0,
      image_path: row.image_path || null,
      game_date: row.game_date || null,
    }));

    const teamLogos = teamLogoDocs.map((row) => ({
      team: row.team || "",
      logo_path: row.logo_path || "",
    }));

    sendJson(res, 200, {
      ok: true,
      schedule,
      standings,
      bestPlayers,
      teamLogos,
    });
  } catch (error) {
    sendJson(res, 500, {
      ok: false,
      message: "Failed to load league data from database.",
      error: error.message,
    });
  }
};
