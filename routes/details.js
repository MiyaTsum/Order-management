const express = require('express')
const db = require('../config/db')
const router = express.Router()

router.delete('/:id', async (req, res) => {
    const id = Number(req.params.id)
    if (!id || id <= 0 || id != parseInt(id)){
        res.status(400).json({ erreur: 'id invalide (doit être non nul, positif et entier'})
        return
    }

    try{
        const [resultat] = await db.execute(
            'DELETE FROM details_commande WHERE id_detail = ?',
            [id]
        )
        const { info } = resultat

        if (info.includes('Rows matched: 0')){
            res.status(404).json({ erreur: 'plat commandé introuvable'})
            return
        }

        res.status(200).json({ success: 'plat commandé supprimé'})
    } catch(erreur){
        console.log(erreur)
        res.status(500).json({ erreur: 'Erreur de connexion à la base de données'})
    }
})

module.exports = router