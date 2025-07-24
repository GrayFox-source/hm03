import {CommentsService} from "../../application/comments-service";
import {RequestWithParams, RequestWithParamsAndBody} from "../../types";
import {Response} from "express";
import {CommentInputModel} from "../../models/Comment/CommentInputModel";
import {LikeInputModel} from "../../models/Comment/LikeInputModel";
import {JwtService} from "../../application/jwtService";
import {inject, injectable} from "inversify";
import {jwtService} from "../../compositon-root";
@injectable()
export class CommentsController {


    constructor(@inject(CommentsService) private commentsService: CommentsService,
                @inject(JwtService) private jwtService: JwtService) {
    }

    async getCommentById(req: RequestWithParams<{ id: string }>, res: Response) {
        const findedComment = await this.commentsService.getCommentById(req.params.id)
        if (!findedComment) {
            res.sendStatus(404)
            return
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
        await this.commentsService.updateCommentById({
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
        await this.commentsService.deleteCommentById(req.params.id)
        res.sendStatus(204)
    }

    async setLikeStatus(req: RequestWithParamsAndBody<{ id: string }, LikeInputModel>, res: Response) {
        const {likeStatus} = req.body
        const authHeader = req.headers.authorization
        if (!authHeader){
            res.send(401)
            return
        }

        const token = authHeader.split(' ')[1]
        const userId = await jwtService.getIdUserByToken(token)
        const result = await this.commentsService.setLikeStatus(req.params.id, likeStatus, userId)
        if (result) {
            res.sendStatus(201)
        }
    }

}