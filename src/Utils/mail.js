import Mailgen from "mailgen";

import nodemailer from "nodemailer"

const sendEmail = async (options)=>{
    const mailGenerator = new Mailgen({
        theme:"default",
        product:{
            name:"SCMS",
            link :"https://scms-frontend-mt99.vercel.app/",
        }
    })


    const mailgenTextual = mailGenerator.generatePlaintext(options.mailgenContent)
    const mailgenHtml = mailGenerator.generate(options.mailgenContent)



   const transporter= nodemailer.createTransport({
        host : process.env.BREVO_SMTP_HOST,
        port : process.env.BREVO_SMTP_PORT,
        secure: false,
        auth:{
            user:process.env.BREVO_SMTP_USER,
            pass: process.env.BREVO_SMTP_PASS,
        }

    })
    const mail={
            from:process.env.EMAIL_FROM,
            to:options.email,
            subject :options.subject,
            text:mailgenTextual,
            html:mailgenHtml,
        }
        try {
            await transporter.sendMail(mail)
        } catch (error) {
            console.error("email service failed silently this might happen because of credentials of brevo Check!! .env")
            console.error(error)
        }




}



const emailVerificationMailgenContent = (username, verificationurl) => {
    return {
        body: {
            name: username,
            intro: "Welcome to our SCMS Platform",
            action: {
                instructions: "To verify your email Please click on the given button",
                button: {
                    color: '#54ad7bff', // Optional action button color
                    text: 'Confirm your account',
                    link: verificationurl
                },
            },
            outro: "Need Help or have Questions ? Just reply to email , We are ready to help"

        },
    }

}
const forgotPasswordMailgenContent = (username, passwordReseturl) => {
    return {
        body: {
            name: username,
            intro: "We got your request to reset your password",
            action: {
                instructions: "To reset your password Please click on the given button",
                button: {
                    color: '#603496ff', // Optional action button color
                    text: 'reset password',
                    link: passwordReseturl
                },
            },
            outro: "Need Help or have Questions? Just reply to email , We are ready to help"

        },
    }

}


export{
    emailVerificationMailgenContent,
    forgotPasswordMailgenContent,
    sendEmail
}