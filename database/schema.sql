CREATE DATABASE IF NOT EXISTS resto;
USE resto;

CREATE TABLE IF NOT EXISTS tble (
  id_table INT AUTO_INCREMENT PRIMARY KEY,
  num_table INT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS plat (
  id_plat INT AUTO_INCREMENT PRIMARY KEY,
  nom_plat VARCHAR(100) NOT NULL,
  prix DECIMAL(10,2) NOT NULL,
  categorie VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS commande (
  id_commande INT AUTO_INCREMENT PRIMARY KEY,
  id_table INT NOT NULL,
  date_commande DATETIME DEFAULT CURRENT_TIMESTAMP,
  statut VARCHAR(30) DEFAULT 'en cours',
  FOREIGN KEY (id_table) REFERENCES tble(id_table)
);

CREATE TABLE IF NOT EXISTS details_commande (
  id_detail INT AUTO_INCREMENT PRIMARY KEY,
  id_commande INT NOT NULL,
  id_plat INT NOT NULL,
  quantite INT NOT NULL,
  FOREIGN KEY (id_commande) REFERENCES commande(id_commande) ON DELETE CASCADE,
  FOREIGN KEY (id_plat) REFERENCES plat(id_plat)
);
