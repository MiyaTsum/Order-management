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
    console.log(erreur)
    res.status(500).json({ err: 'Erreur de connexion au serveur'})
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

    const total = lignes.reduce((somme, l) => somme + Number(l.sous_total), 0);
    res.json({ ...entetes[0], lignes, total });
  } catch (erreur) {
    console.log(erreur)
    res.status(500).json({ err: 'Erreur de connexion au serveur'})
  }
});


// post commande
router.post('/', async (req, res) => {
  const corps = req.body || {};
  const numTable = corps?.num_table;
  if (!numTable || !isFinite(numTable) || numTable <= 0 || numTable != parseInt(numTable)) {
    return res.status(400).json({ erreur: 'num_table doit être non nul, fini, positif et entier' });
  }

  const plats = corps?.plats;
  if (!Array.isArray(plats) || !plats.length) {
    return res.status(400).json({ erreur: 'plats doit être une liste et non vide' });
  }

  const lignes = [];
  for (const p of plats) {
    const idPlat = p?.id_plat;

    if (!idPlat || !isFinite(idPlat) || idPlat <= 0 || idPlat != parseInt(idPlat)){
      return res.status(400).json({ erreur: 'id_plat doit être non nul, fini, positif et entier' });
    }

    const quantite = p?.quantite;
    if (!quantite || !isFinite(quantite) || quantite <= 0 || quantite != parseInt(quantite)) {
      return res.status(400).json({ erreur: 'quantite doit être non nul, fini, positif et entier' });
    }

    lignes.push([idPlat, quantite]);
  }

  const connexion = await db.getConnection();
  try {
    await connexion.beginTransaction();

    const [resultTable] = await connexion.execute(
      'SELECT * FROM tble WHERE num_table = ?',
      [numTable]
    )

    if (resultTable.length === 0){
      res.status(404).json({ erreur: 'num_table non existant'})
      return
    }

    const [{ id_table: idTable }] = resultTable
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
    console.log(erreur)
    await connexion.rollback();
    res.status(500).json({ err: 'Erreur de connexion au serveur'});
  } finally {
    connexion.release();
  }
});

router.delete('/:id', async (req, res) => {
  try{
    const id = Number(req.params.id);
    if (!id){
      res.status(400).json({ erreur: 'id invalide' })
      return
    }
  
    const [resultat] = await db.execute(
      `DELETE FROM commande
      WHERE id_commande = ?`,
      [ id ]
    )
  
    if (!resultat.affectedRows){
      res.status(404).json({ erreur: 'commande introuvable ' })
      return
    }
  
    res.status(200).json({ success: 'Commande supprimée' })
  } catch(erreur){
    console.log(erreur)
    res.status(500).json({ erreur: 'Erreur de connexion au serveur'})
  }
})

router.patch('/:id', async (req, res) => {
  const id = Number(req.params.id)
  if (!id || id <= 0 || id != parseInt(id)){
    res.status(400).json({ erreur: 'id invalide (doit être non nul, positif et entier)'})
    return
  }

  const { status } = req.body
  if (!status || !['en cours', 'servie', 'payée'].includes(status)){
    res.status(400).json({ erreur: 'Le facteur de mise à jour (status) doit être donnée et parmis les cas suivant: en cours, servie ou payée'})
    return
  }

  try{
    const [resultat] = await db.execute(
      'UPDATE commande SET statut = ? WHERE id_commande = ?',
      [ status, id ]
    )

    if (resultat.affectedRows === 0){
      res.status(404).json({ erreur: 'Aucune commande correspondante'})
      return
    }

    res.status(200).json({ success: 'Commande mise à jour' })
  } catch(erreur){
    console.log(erreur)
    res.status(500).json({ erreur: 'Erreur de connexion à la base de données'})
  }
})

module.exports = router