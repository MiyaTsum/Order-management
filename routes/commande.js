const express = require('express');
const db = require('../config/db');
const router = express.Router();


// get commande
router.get('/', async (req, res) => {
  try {
    const [lignes] = await db.execute(
      `SELECT c.id_commande, t.num_table, c.date_commande, c.statut,
              COALESCE(SUM(p.prix * d.quantite), 0) AS total
       FROM commande c
       JOIN tble t ON t.id_table = c.id_table
       LEFT JOIN details_commande d ON d.id_commande = c.id_commande
       LEFT JOIN plat p ON p.id_plat = d.id_plat
       GROUP BY c.id_commande, t.num_table, c.date_commande, c.statut
       ORDER BY c.date_commande DESC`
    );
    res.json(lignes);
  } catch (erreur) {
    res.status(500).json({ err: erreur.message})
  }
});

// facture d'une commande

router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ erreur: 'id invalide' });

    const [entetes] = await db.execute(
      `SELECT c.id_commande, t.num_table, c.date_commande, c.statut
       FROM commande c
       JOIN tble t ON t.id_table = c.id_table
       WHERE c.id_commande = ?`,
      [id]
    );
    if (entetes.length === 0) {
      return res.status(404).json({ erreur: 'Commande introuvable' });
    }

    const [lignes] = await db.execute(
      `SELECT d.id_detail, p.id_plat, p.nom_plat, p.prix, d.quantite,
              p.prix * d.quantite AS sous_total
       FROM details_commande d
       JOIN plat p ON p.id_plat = d.id_plat
       WHERE d.id_commande = ?`,
      [id]
    );

    const total = lignes.reduce((somme, l) => somme + l.sous_total, 0);
    res.json({ ...entetes[0], lignes, total });
  } catch (erreur) {
    res.status(500).json({ err: erreur.message})
  }
});


// post commande

router.post('/', async (req, res) => {
  const corps = req.body || {};
  const idTable = corps.id_table;
  if (!idTable) {
    return res.status(400).json({ erreur: 'id_table obligatoire' });
  }

  const plats = (corps.plats) ? corps.plats : [];
  if (!Array.isArray(plats)) {
    return res.status(400).json({ erreur: 'plats doit être une liste' });
  }
  const lignes = [];
  for (const p of plats) {
    const idPlat = p?.id_plat;
    const quantite = p?.quantite;
    if (!idPlat || !quantite) {
      return res.status(400).json({ erreur: 'chaque plat doit avoir id_plat et quantite' });
    }
    lignes.push([idPlat, quantite]);
  }

  const connexion = await db.getConnection();
  try {
    await connexion.beginTransaction();

    const [resultat] = await connexion.execute(
      'INSERT INTO commande (id_table) VALUES (?)',
      [idTable]
    );
    const idCommande = resultat.insertId

    for (const com of lignes) {
      await connexion.execute(
        'INSERT INTO details_commande (id_commande, id_plat, quantite) VALUES (?, ?, ?)',
        [idCommande, ...com]
      );
    }

    await connexion.commit();
    res.status(201).json({ id_commande: idCommande });
  } catch (erreur) {
    await connexion.rollback();
    res.status(500).json({ err: erreur.message});
  } finally {
    connexion.release();
  }
});

module.exports = router