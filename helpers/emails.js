import nodemailer from 'nodemailer'

const emailRegistro = async (datos) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
    });

    const { email, nombre, token } = datos

    //enviar email
    await transport.sendMail({
        from: 'info@BienesRaices.com',
        to: email,
        subject: 'Confirma tu Cuenta en BienesRaices',
        text: 'Confirma tu cuenta en BienesRaices',
        html: `
            <p>Hola ${nombre}, comprueba tu cuenta en bienesraices.com

            <p>Tu cuenta ya esta lista, solo debes confirmarla en el siguiente enclace: 
            <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirmar/${token}"> Confirmar Cuenta</a> </p>

            <p>Si tu no creaste esta cuenta, puedes ignorar el mensaje</p>
        `
    })
}


export {
    emailRegistro
}