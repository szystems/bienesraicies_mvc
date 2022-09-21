//importamos express
import express from 'express'
//importamos usuariosRoutes.js
import usuariosRoutes from './routes/usuarioRoutes.js';

//crear la app
const app = express();

//routing
app.use('/auth', usuariosRoutes);

//habilitar Pub
app.set('view engine', 'pug');
app.set('views', './views');

//carpeta publica
app.use( express.static('public'));

//Definir un puerto y arrancar el proyecto
const port = 3000;

app.listen(port, () => {
    console.log(`El servidor esta funcionando en el puerto ${port}`);
})