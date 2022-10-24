import {body, check, validationResult} from 'express-validator'
import bcrypt from 'bcrypt'
import Usuario from "../models/Usuario.js"
import {generarId} from '../helpers/tokens.js'
import { emailRegistro, emailOlvidePassword } from '../helpers/emails.js'

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
        pagina: 'Olvide mi password',
        csrfToken: req.csrfToken(),
    })
}

const resetPassword = async (req, res) => {
    //validacion
    await check('email').isEmail().withMessage('Eso no parece un email.').run(req)

    let resultado = validationResult(req)
    //verificar que el resultado este vacio
    if(!resultado.isEmpty()) {
        //errores
        return res.render('auth/olvide-password', {
            pagina: 'Recupera tu acceso a Bienes Raices',
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        })
    }
    //buscar usuario
    const {email} = req.body
    const usuario = await Usuario.findOne({where:{email}})
    //si no existe usuario
    if(!usuario) {
        return res.render('auth/olvide-password', {
            pagina: 'Recupera tu acceso a Bienes Raices',
            csrfToken: req.csrfToken(),
            errores: [{msg: 'El Email no pertenece a ningún usuario'}]
        })
    }
    //Generar un token y enviar el email\
    usuario.token = generarId();
    await usuario.save();
    //enviar un email
    emailOlvidePassword({
        email,
        nombre: usuario.nombre,
        token: usuario.token
    })
    //renderizar un mensaje
    //Mostrar mensaje de confirmacion
    res.render('templates/mensaje', {
        pagina: 'restablece tu Password',
        mensaje: 'Hemos enviado un email con las instrucciones.'
    })
}

const comprobarToken = async (req,res) => {
    //recibimos el 
    const {token} = req.params;
    // buscamos el usuario por el token
    const usuario = await Usuario.findOne({where:{token}})
    // verificar si existe usuario
    // si no existe
    if(!usuario) {
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Restablece tu Password',
            mensaje: 'Hubo un error al validar tu informacion, intenta de nuevo',
            error: true
        })
    }
    //si existe mostramos formulario de validacion
    res.render('auth/reset-password', {
        pagina: 'Reestablece tu Password',
        csrfToken: req.csrfToken(),
    })
}

const nuevoPassword = async (req,res) => {
    // validar el password
    await check('password').isLength({ min: 6 }).withMessage('El password debe ser de al menos 6 caracteres.').run(req)
    let resultado = validationResult(req)
    //verificar que el resultado este vacio
    if(!resultado.isEmpty()) {
        //errores
        return res.render('auth/reset-password', {
            pagina: 'Reestablece tu Password',
            csrfToken: req.csrfToken(),
            errores: resultado.array()
        })
    }
    const {token} = req.params
    const {password} = req.body;
    //Identificar quien hace el cambio
    const usuario = await Usuario.findOne({where: {token}})
    //Hashear el nuevo password
    const salt = await bcrypt.genSalt(10)
    usuario.password = await bcrypt.hash(password, salt);
    usuario.token = null;

    await usuario.save();
    
    res.render('auth/confirmar-cuenta', {
        pagina: 'Password Reestablecido',
        mensaje: 'El Password se guardo correctamente'
    })
}


export {
    formularioLogin,
    formularioRegistro,
    registrar,
    confirmar,
    formularioOlvidePassword,
    resetPassword,
    comprobarToken,
    nuevoPassword
}