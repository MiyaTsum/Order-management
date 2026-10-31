const express = require('express')
const db = require('../config/db')
const router = express.Router()

router.delete('/:id', async (req, res) => {
    const id = Number(req.params.id)
    if (!id || !isFinite(id) || id <= 0 || id != parseInt(id)){
        res.status(400).json({ erreur: 'id invalide (doit être un nombre non nul, fini, positif et entier'})
        return
    }

    const connexion = await db.getConnection()
    try{
        await connexion.beginTransaction()
        await connexion.commit()

        const [resultat] = await connexion.execute(
            'DELETE FROM details_commande WHERE id_detail = ?',
            [id]
        )
        if (resultat.affectedRows == 0){
            res.status(404).json({ erreur: 'plat commandé introuvable'})
            return
        }

        const { id_commande } = req.body
        if (!id_commande || !isFinite(id_commande) || id_commande <= 0 || id_commande != parseInt(id_commande)){
            await connexion.rollback()
            res.status(400).json({ erreur: 'opération interrompue (cause: id_commande invalide; id_commande doit être un nombre non nul, fini, positiif et entier)'})
            return
        }

        const [details_commande] = await connexion.execute(
            `SELECT id_detail FROM details_commande
            WHERE id_commande = ?`,
            [ id_commande ]
        )

        if (details_commande.length === 0){
            const [resultat_delCom] = await connexion.execute(
                'DELETE FROM commande WHERE id_commande = ?',
                [ id_commande ]
            )

            if (resultat_delCom.affectedRows === 0){
                await connexion.rollback()
                res.status(404).json({ erreur: 'opération intérrompue (cause: commande introuvable)'})
                return
            }

            res.status(200).json({ success: 'opération effectuée: details et commande supprimée'})
            return
        }

        res.status(200).json({ success: 'plat commandé supprimé'})
    } catch(erreur){
        console.log(erreur)
        res.status(500).json({ erreur: 'Erreur de connexion à la base de données'})
    } finally{
        connexion.release()
    }
})

router.patch('/:id', async (req, res) => {
    const id = Number(req.params.id)
    if (!id || !isFinite(id) || id <= 0 || id != parseInt(id)){
        res.status(400).json({ erreur: 'id doit être un nombre non nul, fini, positif et entier'})
        return
    }

    const {quantite} = req.body
    if (!quantite || !isFinite(id) || id <= 0 || id != parseInt(id)){
        res.status(400).json({ erreur: 'quantite doit être un nombre non nul, fini, positif et entier'})
        return
    }

    try{
        const [resultat] = await db.execute(
            'UPDATE details_commande SET quantite = ? WHERE id_detail = ?',
            [quantite, id]
        )

        if (resultat.affectedRows === 0){
            res.end(404).json({ erreur: 'detail_commande introuvable' })
            return
        }

        res.status(200).json({ success: 'detail_commande mis à jour'})
    } catch(erreur){
        console.log(erreur)
        res.status(500).json({ erreur: 'Erreur de communication avec la base de données' })
    }
})

module.exports = router