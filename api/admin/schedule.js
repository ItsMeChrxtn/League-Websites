const { listRecords, createRecord, updateRecord, deleteRecord, isValidId } = require("../_lib/storage");
const { sendJson, parseJsonBody, coerceNonEmptyString } = require("../_lib/http");

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    if (req.method === "GET") {
      const rows = await listRecords("game_schedules", { game_date: 1, game_time: 1, _id: 1 });
      sendJson(
        res,
        200,
        rows.map((row) => ({
          id: row.id,
          game_date: row.game_date || "",
          game_time: row.game_time || "",
          venue: row.venue || "",
          home_team: row.home_team || "",
          away_team: row.away_team || "",
        }))
      );
      return;
    }

    const body = await parseJsonBody(req);

    if (req.method === "POST") {
      const gameDate = coerceNonEmptyString(body.game_date);
      const gameTime = coerceNonEmptyString(body.game_time);
      const venue = coerceNonEmptyString(body.venue);
      const homeTeam = coerceNonEmptyString(body.home_team);
      const awayTeam = coerceNonEmptyString(body.away_team);

      if (!gameDate || !gameTime || !venue || !homeTeam || !awayTeam) {
        sendJson(res, 400, { ok: false, message: "All Game Schedule fields are required." });
        return;
      }

      await createRecord("game_schedules", {
        game_date: gameDate,
        game_time: gameTime,
        venue,
        home_team: homeTeam,
        away_team: awayTeam,
        created_at: new Date(),
        updated_at: new Date(),
      });

      sendJson(res, 201, { ok: true });
      return;
    }

    if (req.method === "PUT") {
      const id = coerceNonEmptyString(body.id);
      if (!isValidId(id)) {
        sendJson(res, 400, { ok: false, message: "Invalid record ID." });
        return;
      }

      const gameDate = coerceNonEmptyString(body.game_date);
      const gameTime = coerceNonEmptyString(body.game_time);
      const venue = coerceNonEmptyString(body.venue);
      const homeTeam = coerceNonEmptyString(body.home_team);
      const awayTeam = coerceNonEmptyString(body.away_team);

      if (!gameDate || !gameTime || !venue || !homeTeam || !awayTeam) {
        sendJson(res, 400, { ok: false, message: "All Game Schedule fields are required." });
        return;
      }

      const result = await updateRecord("game_schedules", id, {
        game_date: gameDate,
        game_time: gameTime,
        venue,
        home_team: homeTeam,
        away_team: awayTeam,
        updated_at: new Date(),
      });

      if (!result.ok) {
        sendJson(res, 404, { ok: false, message: "Record not found." });
        return;
      }

      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method === "DELETE") {
      const id = coerceNonEmptyString(body.id);
      if (!isValidId(id)) {
        sendJson(res, 400, { ok: false, message: "Invalid record ID." });
        return;
      }

      const result = await deleteRecord("game_schedules", id);
      if (!result.ok) {
        sendJson(res, 404, { ok: false, message: "Record not found." });
        return;
      }

      sendJson(res, 200, { ok: true });
      return;
    }

    sendJson(res, 405, { ok: false, message: "Method not allowed." });
  } catch (error) {
    sendJson(res, 500, { ok: false, message: error.message || "Request failed." });
  }
};
