// import {Request, Response, Router} from "express";
// import nodemailer from "nodemailer"
// import {mailerAdapter} from "../../adapter/Mailer-adapter";
//
// export const emailRouter = Router()
//
// emailRouter.post('/send', async (req: Request, res: Response) => {
//
//     await mailerAdapter.sendMail(req.body.email, req.body.subject, req.body.message)
//
//     res.send({
//         "email": req.body.email,
//         "message": req.body.message,
//         "subject": req.body.subject
//     })
// })