const express = require('express');
const db = require('../config/db');
const router = express.Router();

// Lire tous les plats
router.get('/', async (req, res) => {
  try {
    const [lignes] = await db.execute('SELECT * FROM plat');
    res.json(lignes);
  } catch (erreur) {
    res.status(500).json({ erreur: 'Erreur de connexion au serveur' });
  }
});

module.exports = router;