import { Sequelize } from "sequelize";
import dotenv from 'dotenv'
dotenv.config({path: '.env'})

const db = new Sequelize(process.env.BD_NOMBRE, process.env.BD_USER, process.env.BD_PASS ?? '', {
    host: process.env.DB_HOST,
    port: 3306,
    dialect: 'mysql',
    define: {
        timestamps: true
    },
    pool: {  //configura el comportamiento para conexiones nuevas o existentes, mantener las conexiones que esten vivas
        max: 5, //maximo de conexiones a mantener
        min: 0,
        acquire: 30000, //tiempo de conexion tratando de mantener una conexion antes de mostrar un error (30000=30 seg.)
        idle: 10000 //tiempo que debe transcurrir para comenzar una conexion para liberar estpacio
    }
});

export default db;