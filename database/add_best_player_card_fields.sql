USE league_dashboard;

ALTER TABLE best_players
  ADD COLUMN assists INT NOT NULL DEFAULT 0 AFTER points,
  ADD COLUMN rebounds INT NOT NULL DEFAULT 0 AFTER assists,
  ADD COLUMN steals INT NOT NULL DEFAULT 0 AFTER rebounds,
  ADD COLUMN image_path VARCHAR(255) NULL AFTER steals;
