const { listRecords, createRecord, updateRecord, deleteRecord, isValidId } = require("../_lib/storage");
const { sendJson, parseJsonBody, coerceNonEmptyString, coerceInteger } = require("../_lib/http");

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    if (req.method === "GET") {
      const rows = await listRecords("best_players", { points: -1, player_name: 1, _id: 1 });
      sendJson(
        res,
        200,
        rows.map((row) => ({
          id: row.id,
          player_name: row.player_name || "",
          team: row.team || "",
          points: Number(row.points) || 0,
          assists: Number(row.assists) || 0,
          rebounds: Number(row.rebounds) || 0,
          steals: Number(row.steals) || 0,
          image_path: row.image_path || "",
          game_date: row.game_date || "",
        }))
      );
      return;
    }

    const body = await parseJsonBody(req);

    const playerName = coerceNonEmptyString(body.player_name);
    const team = coerceNonEmptyString(body.team);
    const points = coerceInteger(body.points, 0);
    const assists = coerceInteger(body.assists, 0);
    const rebounds = coerceInteger(body.rebounds, 0);
    const steals = coerceInteger(body.steals, 0);
    const gameDate = coerceNonEmptyString(body.game_date);
    const imagePath = coerceNonEmptyString(body.image_path);

    if (req.method === "POST") {
      if (!playerName || !team) {
        sendJson(res, 400, { ok: false, message: "Player name and team are required." });
        return;
      }

      if (points < 0 || assists < 0 || rebounds < 0 || steals < 0) {
        sendJson(res, 400, { ok: false, message: "PTS, AST, REB, and STL must be 0 or higher." });
        return;
      }

      await createRecord("best_players", {
        player_name: playerName,
        team,
        points,
        assists,
        rebounds,
        steals,
        image_path: imagePath || null,
        game_date: gameDate || null,
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

      if (!playerName || !team) {
        sendJson(res, 400, { ok: false, message: "Player name and team are required." });
        return;
      }

      if (points < 0 || assists < 0 || rebounds < 0 || steals < 0) {
        sendJson(res, 400, { ok: false, message: "PTS, AST, REB, and STL must be 0 or higher." });
        return;
      }

      const result = await updateRecord("best_players", id, {
        player_name: playerName,
        team,
        points,
        assists,
        rebounds,
        steals,
        image_path: imagePath || null,
        game_date: gameDate || null,
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

      const result = await deleteRecord("best_players", id);
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
