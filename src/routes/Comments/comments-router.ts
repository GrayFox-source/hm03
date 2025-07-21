import {Router} from "express";
import {
    authMiddleware,
    CommentContentInputValidation,
    handleLikeStatus
} from "../../middlewares/input-validation-middleware";
import {CommentsController} from "./comments-controller";
import {container} from "../../compositon-root";


export const commentsRouter = Router()

const commentsControllerInstance = container.get(CommentsController)


commentsRouter.get('/:id', commentsControllerInstance.getCommentById.bind(commentsControllerInstance))

commentsRouter.put('/:id',
    authMiddleware,
    CommentContentInputValidation,
    commentsControllerInstance.updateComment.bind(commentsControllerInstance))

commentsRouter.delete('/:id',
    authMiddleware,
    commentsControllerInstance.deleteComment.bind(commentsControllerInstance))

commentsRouter.put('/:id/like-status',
    authMiddleware,
    CommentContentInputValidation,
    handleLikeStatus,
    commentsControllerInstance.setLikeStatus.bind(commentsControllerInstance))