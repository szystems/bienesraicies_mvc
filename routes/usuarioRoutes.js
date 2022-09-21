//importamos express
import express from "express";

//importamos formularioLogin
import { formularioLogin, formularioRegistro ,formularioOlvidePassword} from "../controllers/usuarioController.js";

//definimos router
const router = express.Router();

router.get('/login', formularioLogin);
router.get('/registro', formularioRegistro);
router.get('/olvide-password', formularioOlvidePassword)

//exportamos router
export default router