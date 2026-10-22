const express = require('express')
const fs = require('fs')
const router = express.Router()

router.get('/', (_, res) => {
  fs.readFile('./src/index.html', (err, file) => {
    if (err){
      res.status(500).json({ 'erreur': err})
      return
    }
    res.type('text/html')
    res.status(200).send(file)
  })
})
router.get('/style.css', (_, res) => {
  fs.readFile('./src/style.css', (err, file) => {
    if (err){
      res.status(500).json({ 'erreur': err})
      return
    }
    res.type('text/css')
    res.status(200).send(file)
  })
})
router.get('/JS/script.js', (_, res) => {
  fs.readFile('./src/JS/script.js', (err, file) => {
    if (err){
      res.status(500).json({ 'erreur': err})
      return
    }
    res.type('application/javascript')
    res.status(200).send(file)
  })
})
router.get('/JS/features.js', (_, res) => {
  fs.readFile('./src/JS/features.js', (err, file) => {
    if (err){
      res.status(500).json({ 'erreur': err })
      return
    }
    res.type('application/javascript')
    res.status(200).send(file)
  })
})
router.get('/JS/component.js', (_, res) => {
  fs.readFile('./src/JS/component.js', (err, file) => {
    if (err){
      res.status(500).json({ 'erreur': err })
      return
    }
    res.type('application/javascript')
    res.status(200).send(file)
  })
})

module.exports = router