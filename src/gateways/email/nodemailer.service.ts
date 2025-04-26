import nodemailer from 'nodemailer'

const userTokens = new Map<string, string>()

const transporter = nodemailer.createTransport({
   service: 'gmail',
   auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
   },
})

transporter.set('oauth2_provision_cb', (user: any, renew: any, callback: any) => {
   const accessToken = userTokens.get(user)
   if (!accessToken) {
      return callback(new Error('Unknown user'))
   }
   return callback(null, accessToken)
})

const LOGO_URL =
   'https://scontent.cdninstagram.com/v/t51.2885-19/437777467_977527444022295_4262055725712787929_n.jpg?stp=dst-jpg_s160x160_tt6&_nc_cat=104&ccb=1-7&_nc_sid=bf7eb4&_nc_ohc=e9btoqmrVl8Q7kNvgGDwkel&_nc_oc=AdhNBfOLIUzU7zt7aysmSnAcX6txhDaCSlNUF7UjiG2q3E72j3hgOAU3T8o-1HR7pQWO0uqZtXQNKoyYhQyf7P_v&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&oh=00_AYBiRgI3JiC9iyYwm6u3MCtIYuvWOob86c_Gkdwj6ujIWQ&oe=67AC3FD2'

export const sendWelcomeEmail = async (email: string, name: string, password: string) => {
   const mailOptions = {
      from: '"Minas Drones" <no-reply@example.com>',
      to: email,
      subject: 'Bem-vindo ao nosso sistema!',
      text: `Olá! Bem-vindo ao nosso sistema. Sua senha é: ${password}`,
      html: `
         <div style="font-family: Arial, sans-serif; background-color: #f7f7f7; padding: 20px; margin: 0;">
            <div style="max-width: 800px; margin: auto; background-color: white; border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
               <div style="text-align: center; padding: 8px;">
                  <img src="${LOGO_URL}" alt="Minas Drones Logo" style="max-width: 100%; height: auto;" />
               </div>
               <style>
                  @media only screen and (max-width: 600px) {
                     .welcome-header {
                        padding: 10px; 
                     }
                     .welcome-header h2 {
                        font-size: 19px; 
                     }
                     .mobile-hide {
                        display: none;
                     }
                  }
               </style>
               <div class="welcome-header" style="background-color:rgb(46, 119, 75); padding: 20px; color: white; text-align: center;">
                  <h2 style="margin: 0;">Bem-vindo(a) ao nosso sistema</h2>
               </div>
               <div style="padding: 20px;">
                  <p style="color: #333333; font-size: 16px; margin-top: 10px;">
                     Olá, ${name}!,
                  </p>

                  <p style="color: #333333; font-size: 16px; margin-top: 16px;">
                     Estamos felizes em tê-lo(a) conosco!
                  </p>

                  <p style="color: #333333; font-size: 16px; margin-top: 16px;">
                     Para acessar sua conta, utilize a seguinte senha temporária: <strong>${password}</strong>
                  </p>

                  <p style="color: #333333; font-size: 16px; margin-top: 16px;">
                    Recomendamos que você faça login e altere sua senha assim que possível para garantir mais segurança. Se precisar de qualquer ajuda, estamos à disposição.
                  </p>

                  <div style="width: 100%; text-align: center;">
                     <button style="background-color: rgb(46, 119, 75); color: white; border: none; padding: 10px 40px; border-radius: 5px; cursor: pointer; margin-top: 24px; margin-bottom: 24px; transition: background-color 0.3s;" onmouseover="this.style.backgroundColor='darkgreen'" onmouseout="this.style.backgroundColor='rgb(46, 119, 75)'">
                        <a href="http://localhost:3000/login" style="text-decoration: none; color: white; align-items: center; justify-content: center;">Ir para o sistema 🚀</a>
                     </button>
                  </div>
                  <p style="color: #333333; font-size: 16px;">
                     Atenciosamente,<br>
                     Equipe Minas Drones
                  </p>
               </div>
               <div style="background-color: #f7f7f7; padding: 10px; text-align: center; margin-top: 10px;">
                  <p style="color: #333333; font-size: 14px; margin: 0;">
                     &copy; ${new Date().getFullYear()} Minas Drones. Todos os direitos reservados.
                  </p>
               </div>
            </div>
         </div>
      `,
   }

   try {
      console.log('Enviando e-mail de boas-vindas para:', email)
      console.log('Autenticando com:', process.env.EMAIL_USER)
      await transporter.sendMail(mailOptions)
      console.log('E-mail de boas-vindas enviado para:', email)
   } catch (error) {
      console.error('Erro ao enviar e-mail:', error)
   }
}

export const sendRecoveryEmail = async (email: string, name: string, recoveryCode: string) => {
   const mailOptions = {
      from: '"Minas Drones" <no-reply@example.com>',
      to: email,
      subject: 'Recuperação de Senha',
      html: `
         <div style="font-family: Arial, sans-serif; background-color: #f7f7f7; padding: 20px; margin: 0;">
            <div style="max-width: 800px; margin: auto; background-color: white; border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
               <div style="text-align: center; padding: 8px;">
                  <img src="${LOGO_URL}" alt="Minas Drones Logo" style="max-width: 100%; height: auto;" />
               </div>
               <div style="background-color:rgb(46, 119, 75); padding: 20px; color: white; text-align: center;">
                  <h2 style="margin: 0;">Recuperação de Senha</h2>
               </div>
               <div style="padding: 20px;">
                  <p style="color: #333333; font-size: 16px; margin-top: 10px;">Olá, ${name}!</p>
                  <p style="color: #333333; font-size: 16px; margin-top: 16px;">Recebemos um pedido para redefinir sua senha.</p>
                  <p style="color: #333333; font-size: 16px; margin-top: 16px;">Use o código abaixo quando solicitado:</p>
                  <p style="color: #333333; font-size: 16px;">Código de Recuperação: <strong>${recoveryCode}</strong></p>
                  <p style="color: #333333; font-size: 16px; margin-top: 16px; margin-bottom: 24px;">Se você não solicitou essa ação, ignore este e-mail.</p>
                  <p style="color: #333333; font-size: 16px;">Atenciosamente,<br>Equipe Minas Drones</p>
               </div>
               <div style="background-color: #f7f7f7; padding: 10px; text-align: center; margin-top: 10px;">
                  <p style="color: #333333; font-size: 14px; margin: 0;">&copy; ${new Date().getFullYear()} Minas Drones. Todos os direitos reservados.</p>
               </div>
            </div>
         </div>
      `,
   }

   try {
      console.log('Enviando e-mail de recuperação para:', email)
      await transporter.sendMail(mailOptions)
      console.log('E-mail de recuperação enviado para:', email)
   } catch (error) {
      console.error('Erro ao enviar e-mail:', error)
   }
}
