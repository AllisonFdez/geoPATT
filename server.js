const express = require('express');
const path = require('path');
var cors = require('cors');
var favicon = require('serve-favicon');

const app = express()
app.use(cors())

// Referenciar la carpeta con los archivos estaticos: JS, CSS, Images, Data.
app.use(express.static('public'))

const port = process.env.PORT || 3000;

// Referenciar pagina html principal - Landing.
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/index.html'));
});
// Referenciar logo favicon - Pestaña del navegador.
app.use(favicon(path.join(__dirname,'/public','/Images','/favicon.ico')));

app.listen(port, () => {
    console.log(`Escuchando peticiones en el puerto ${port}.`);
})

