CREATE DATABASE IF NOT EXISTS league_dashboard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE league_dashboard;

CREATE TABLE IF NOT EXISTS game_schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  game_date DATE NOT NULL,
  game_time TIME NOT NULL,
  venue VARCHAR(120) NOT NULL,
  home_team VARCHAR(80) NOT NULL,
  away_team VARCHAR(80) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS team_standings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  team VARCHAR(80) NOT NULL UNIQUE,
  wins INT NOT NULL DEFAULT 0,
  losses INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS best_players (
  id INT AUTO_INCREMENT PRIMARY KEY,
  player_name VARCHAR(100) NOT NULL,
  team VARCHAR(80) NOT NULL,
  points INT NOT NULL,
  assists INT NOT NULL DEFAULT 0,
  rebounds INT NOT NULL DEFAULT 0,
  steals INT NOT NULL DEFAULT 0,
  image_path VARCHAR(255) NULL,
  game_date DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS team_logos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  team VARCHAR(80) NOT NULL UNIQUE,
  logo_path VARCHAR(255) NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO team_logos (team, logo_path) VALUES
  ('Falcons', 'assets/logos/eldelubyo.png'),
  ('Titans', 'assets/logos/homecourt.jpg'),
  ('Sharks', 'assets/logos/micara.png'),
  ('Wolves', 'assets/logos/MTRVL.jpg'),
  ('Hawks', 'assets/logos/segway.jpg'),
  ('Kings', 'assets/logos/Stampede.jpg'),
  ('Stampede', 'assets/logos/Stampede.jpg'),
  ('Westdale', 'assets/logos/westdale.jpg')
ON DUPLICATE KEY UPDATE logo_path = VALUES(logo_path);
