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
      const rows = await listRecords("team_standings", { wins: -1, losses: 1, team: 1, _id: 1 });
      sendJson(
        res,
        200,
        rows.map((row) => ({
          id: row.id,
          team: row.team || "",
          wins: Number(row.wins) || 0,
          losses: Number(row.losses) || 0,
        }))
      );
      return;
    }

    const body = await parseJsonBody(req);

    if (req.method === "POST") {
      const team = coerceNonEmptyString(body.team);
      const wins = coerceInteger(body.wins, 0);
      const losses = coerceInteger(body.losses, 0);

      if (!team) {
        sendJson(res, 400, { ok: false, message: "Team name is required." });
        return;
      }

      if (wins < 0 || losses < 0) {
        sendJson(res, 400, { ok: false, message: "Wins and losses must be 0 or higher." });
        return;
      }

      await createRecord("team_standings", {
        team,
        wins,
        losses,
        created_at: new Date(),
        updated_at: new Date(),
      });

      sendJson(res, 201, { ok: true });
      return;
    }

    if (req.method === "PUT") {
      const id = coerceNonEmptyString(body.id);
      const team = coerceNonEmptyString(body.team);
      const wins = coerceInteger(body.wins, 0);
      const losses = coerceInteger(body.losses, 0);

      if (!isValidId(id)) {
        sendJson(res, 400, { ok: false, message: "Invalid record ID." });
        return;
      }

      if (!team) {
        sendJson(res, 400, { ok: false, message: "Team name is required." });
        return;
      }

      if (wins < 0 || losses < 0) {
        sendJson(res, 400, { ok: false, message: "Wins and losses must be 0 or higher." });
        return;
      }

      const result = await updateRecord("team_standings", id, {
        team,
        wins,
        losses,
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

      const result = await deleteRecord("team_standings", id);
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
