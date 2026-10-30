const express = require('express')
const db = require('../config/db')
const router = express.Router()

router.get('/', async (_, res) => {
    try{
        const [resultat] = await db.execute('SELECT * FROM tble')

        if (!resultat.length){
            res.status(404).json({ erreur: 'aucun resultat'})
            return
        }

        res.status(200).json(resultat)
    } catch(erreur){
        res.status(500).json({ erreur: erreur.message })
    }
})

module.exports = router