import {Response, Router} from "express";
import {RequestWithParams, RequestWithParamsAndBody} from "../../types";
import {CommentsService} from "../../domain/comments-service";
import {CommentInputModel} from "../../models/Comment/CommentInputModel";
import {authMiddleware, CommentContentInputValidation} from "../../middlewares/input-validation-middleware";


export const commentsRouter = Router()

class CommentsController {
    private commentsService: CommentsService
    constructor() {
        this.commentsService = new CommentsService()
    }
    async getCommentById(req: RequestWithParams<{ id: string }>, res: Response) {
        const findedComment = await this.commentsService.getCommentById(req.params.id)
        if (!findedComment) {
            res.sendStatus(404)
        }
        res.status(200).send(findedComment)
    }
    async updateComment(req: RequestWithParamsAndBody<{ id: string }, CommentInputModel>, res: Response) {
        const findComment = await this.commentsService.getCommentById(req.params.id)
        if (!findComment) {
            res.sendStatus(404)
            return
        }
        if (findComment.commentatorInfo.userId !== req.user!.id) {
            res.sendStatus(403)
            return
        }
        const updateComment = await this.commentsService.updateCommentById({
            id: req.params.id,
            content: req.body.content
        })
        res.sendStatus(204)
    }
    async deleteComment(req: RequestWithParams<{ id: string }>, res: Response) {
        const findComment = await this.commentsService.getCommentById(req.params.id)
        if (!findComment) {
            res.sendStatus(404)
            return
        }
        if (findComment.commentatorInfo.userId !== req.user!.id) {
            res.sendStatus(403)
            return
        }
        const deleteComment = await this.commentsService.deleteCommentById(req.params.id)
        res.sendStatus(204)
    }

}
const commentsControllerInstance = new CommentsController()


commentsRouter.get('/:id', commentsControllerInstance.getCommentById.bind(commentsControllerInstance))

commentsRouter.put('/:id',
    authMiddleware,
    CommentContentInputValidation,
    commentsControllerInstance.updateComment.bind(commentsControllerInstance))

commentsRouter.delete('/:id',
    authMiddleware,
    commentsControllerInstance.deleteComment.bind(commentsControllerInstance))