USE league_dashboard;

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
