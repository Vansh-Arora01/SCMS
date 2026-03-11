
import Mailgen from "mailgen";
import SibApiV3Sdk from "sib-api-v3-sdk";

// Brevo API configuration
const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;

const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

const sendEmail = async (options) => {
    const mailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "SCMS",
            link: "https://scms-frontend-mt99.vercel.app/",
        }
    });

    const mailgenTextual = mailGenerator.generatePlaintext(options.mailgenContent);
    const mailgenHtml = mailGenerator.generate(options.mailgenContent);

    const email = {
        sender: {
            name: "SCMS Support",
            email: process.env.EMAIL_FROM
        },
        to: [
            {
                email: options.email
            }
        ],
        subject: options.subject,
        htmlContent: mailgenHtml,
        textContent: mailgenTextual
    };

    try {
        await tranEmailApi.sendTransacEmail(email);
        console.log("Email sent successfully to:", options.email);
    } catch (error) {
        console.error("Brevo email sending failed. Check BREVO_API_KEY in .env");
        console.error(error);
    }
};

const emailVerificationMailgenContent = (username, verificationurl) => {
    return {
        body: {
            name: username,
            intro: "Welcome to our SCMS Platform",
            action: {
                instructions: "To verify your email please click the button below:",
                button: {
                    color: "#54ad7bff",
                    text: "Confirm your account",
                    link: verificationurl
                },
            },
            outro: "Need help or have questions? Just reply to this email, we are ready to help."
        },
    };
};

const forgotPasswordMailgenContent = (username, passwordReseturl) => {
    return {
        body: {
            name: username,
            intro: "We received a request to reset your password.",
            action: {
                instructions: "To reset your password please click the button below:",
                button: {
                    color: "#603496ff",
                    text: "Reset Password",
                    link: passwordReseturl
                },
            },
            outro: "Need help or have questions? Just reply to this email, we are ready to help."
        },
    };
};

export {
    emailVerificationMailgenContent,
    forgotPasswordMailgenContent,
    sendEmail
};