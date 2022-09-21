//importamos express
import express from "express";

//importamos formularioLogin
import { formularioLogin, formularioLRegistro } from "../controllers/usuarioController.js";

//definimos router
const router = express.Router();

router.get('/login', formularioLogin);
router.get('/registro', formularioLRegistro);

//exportamos router
export default router