require('dotenv').config();
const express = require('express');

const app = express();
app.use(express.json());   // pour lire les données envoyées par le front

app.use('/commande', require('./routes/commande'))
app.use('/plat', require('./routes/plat'));
app.use('/table', require('./routes/table'))
app.use('/details', require('./routes/details'))
app.use(require('./routes/interface'))

app.listen(process.env.PORT || 3000, () => {
  console.log('Serveur démarré sur http://localhost:' + (process.env.PORT || 3000));
});