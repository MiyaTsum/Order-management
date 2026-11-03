require('dotenv').config();
const express = require('express');
const path = require('path')

const app = express();
app.use(express.json());   // pour lire les données envoyées par le front

app.use(express.static(path.join(__dirname, 'src')))

app.use('/commande', require('./routes/commande'))
app.use('/plat', require('./routes/plat'));
app.use('/table', require('./routes/table'))
app.use('/details', require('./routes/details'))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'))
})

app.listen(process.env.PORT || 3000, () => {
  console.log('Serveur démarré sur http://localhost:' + (process.env.PORT || 3000));
});