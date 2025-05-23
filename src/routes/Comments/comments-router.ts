import {Router} from "express";
import {RequestWithParams, RequestWithParamsAndBody} from "../../types";
import {commentsService} from "../../domain/comments-service";
import {CommentInputModel} from "../../models/Comment/CommentInputModel";
import {authMiddleware, CommentContentInputValidation} from "../../middlewares/input-validation-middleware";


export const commentsRouter = Router()

commentsRouter.get('/:id', async (req: RequestWithParams<{ id: string }>, res) => {
    const findedComment = await commentsService.getCommentById(req.params.id)
    if (!findedComment) {
        res.sendStatus(404)
    }
    res.status(200).send(findedComment)
})

commentsRouter.put('/:id',
    authMiddleware,
    CommentContentInputValidation,
    async (req: RequestWithParamsAndBody<{ id: string }, CommentInputModel>, res) => {
    const findComment = await commentsService.getCommentById(req.params.id)
        if (!findComment) {
            res.sendStatus(404)
            return
        }
        if (findComment.commentatorInfo.userId !== req.user!.id) {
            res.sendStatus(403)
            return
        }
        const updateComment = await commentsService.updateCommentById({id: req.params.id, content: req.body.content})
        res.sendStatus(204)
})

commentsRouter.delete('/:id',
    authMiddleware,
    async (req: RequestWithParams<{ id: string }>, res) =>  {
        const findComment = await commentsService.getCommentById(req.params.id)
        if (!findComment) {
            res.sendStatus(404)
            return
        }
        if (findComment.commentatorInfo.userId !== req.user!.id) {
            res.sendStatus(403)
            return
        }
        const deleteComment = await commentsService.deleteCommentById(req.params.id)
        res.sendStatus(204)
})