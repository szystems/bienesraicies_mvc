

const formularioLogin = (req, res) => {
    res.render('auth/login', {
        pagina: 'Iniciar sesion'

    })
}

const formularioRegistro = (req, res) => {
    res.render('auth/registro', {
        pagina: 'Registro'
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
    formularioOlvidePassword
}