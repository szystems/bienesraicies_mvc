import {body, check, validationResult} from 'express-validator'
import Usuario from "../models/Usuario.js"
import {generarId} from '../helpers/tokens.js'
import { emailRegistro } from '../helpers/emails.js'

const formularioLogin = (req, res) => {
    res.render('auth/login', {
        pagina: 'Iniciar sesion'

    })
}

const formularioRegistro = (req, res) => {

    res.render('auth/registro', {
        pagina: 'Registro',
        csrfToken: req.csrfToken()
    })
}

const registrar = async (req, res) => {
    //validacion
    await check('nombre').notEmpty().withMessage('El campo nombre debe tener un valor.').run(req)
    await check('email').isEmail().withMessage('Eso no parece un email.').run(req)
    await check('password').isLength({ min: 6 }).withMessage('El password debe ser de al menos 6 caracteres.').run(req)
    await check("repetir_password").equals(req.body.password).withMessage("El password debe ser igual al anterior").run(req);


    let resultado = validationResult(req)


    //return res.json(resultado.array())
    //verificar que el resultado este vacio
    if(!resultado.isEmpty()) {
        //errores
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        })
    }

    //extraer los datos
    const { nombre, email, password } = req.body

    //verificar que el usuario no este duplicado
    const existeUsuario = await Usuario.findOne( { where : { email } })

    if(existeUsuario) {
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El usuario ya existe'}],
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        })
    }

    //almacenar un usuario
    const usuario = await Usuario.create({
        nombre,
        email,
        password,
        token: generarId()
    })

    //envia email de confirmacion
    emailRegistro({
        nombre: usuario.nombre,
        email: usuario.email,
        token: usuario.token
    })

    //Mostrar mensaje de confirmacion
    res.render('templates/mensaje', {
        pagina: 'Cuenta Creada Correctamente',
        mensaje: 'Hemos enviado un email de confirmación a tu correo, donde debes confirmar tu cuenta.'
    })
}

//funcion que comprueba una cuenta
const confirmar = async (req,res) => {
    const { token } = req.params;

    //verificar si el token es valido \
    const usuario = await Usuario.findOne({where:{token}})

    if(!usuario) {
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Error al confirmar tu cuenta',
            mensaje: 'Hubo un error al confirmar tu cuenta, intenta de nuevo',
            error: true
        })
    }

    //confirmar la cuenta
    usuario.token = null;
    usuario.confirmado = true;
    await usuario.save();

    res.render('auth/confirmar-cuenta', {
        pagina: 'Cuenta confirmada',
        mensaje: 'La cuenta se confirmó correctamente'
    })


    
}

const formularioOlvidePassword = (req, res) => {
    res.render('auth/olvide-password', {
        pagina: 'Olvide mi password'
    })
}

export {
    formularioLogin,
    formularioRegistro,
    registrar,
    confirmar,
    formularioOlvidePassword
}