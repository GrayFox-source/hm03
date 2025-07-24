// import {Router} from "express";
// import {authMiddleware} from "../../middlewares/input-validation-middleware";
// import {feedbackService} from "../../application/feedbacks/feedback-service";
//
//
// export const feedbacksRouter = Router()
//
//
// feedbacksRouter.post('/',
//     authMiddleware,
//     async (req, res) =>  {
//         const newCom = feedbackService.sendFeedback(req.body.comment, req.user!.id)
//             res.status(201).send(newCom)
// })