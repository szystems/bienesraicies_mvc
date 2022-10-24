//importamos express
import express from 'express'
import csrf from 'csurf'
import cookieParser from 'cookie-parser';
//importamos usuariosRoutes.js
import usuariosRoutes from './routes/usuarioRoutes.js';
//importamos la conexion a la base de datos
import db from './config/db.js';

//crear la app
const app = express();

//Habilitar lectura de datos de formulario
app.use(express.urlencoded({extended: true}))

// habilitar cookie-parser
app.use(cookieParser())

//habilitar csrf
app.use( csrf({cookie: true}))

//conexion a base de datos
try{
    await db.authenticate();
    db.sync()
    console.log('Conexion correcta a la base de datos')
} catch (error) {
    console.log(error)
}

//routing
app.use('/auth', usuariosRoutes);

//habilitar Pub
app.set('view engine', 'pug');
app.set('views', './views');

//carpeta publica
app.use( express.static('public'));

//Definir un puerto y arrancar el proyecto
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`El servidor esta funcionando en el puerto ${port}`);
})