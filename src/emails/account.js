const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'art.syvak@gmail.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the task manager app, ${name}. Let me know how you get along with the app.`,
    })
}

const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'art.syvak@gmail.com',
        subject: 'Oooop..',
        text: `${name}, before you moved out, let me know why are you leaving?`,
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}
