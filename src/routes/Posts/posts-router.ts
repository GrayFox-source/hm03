import {Router} from "express";
import {
    authMiddleware,
    authorisedCheckValidator,
    CommentContentInputValidation,
    InputPostBlogIDValidation,
    InputPostContentValidation,
    InputPostShortDescriptionValidation,
    InputPostTitleValidation,
    inputValidationMiddleware
} from "../../middlewares/input-validation-middleware";
import {PostsController} from "./posts-controller";

export const postsRouter = Router()

const postControllerInstance = new PostsController()

postsRouter.get('/', postControllerInstance.getAllPosts.bind(postControllerInstance))

postsRouter.get('/:id', postControllerInstance.getPostById.bind(postControllerInstance))

postsRouter.post('/',
    authorisedCheckValidator,
    InputPostTitleValidation,
    InputPostShortDescriptionValidation,
    InputPostContentValidation,
    InputPostBlogIDValidation,
    inputValidationMiddleware,
    postControllerInstance.createPost.bind(postControllerInstance))


postsRouter.post('/:postId/comments',
    authMiddleware,
    CommentContentInputValidation,
    postControllerInstance.createCommentForPost.bind(postControllerInstance))


postsRouter.put('/:id',
    authorisedCheckValidator,
    InputPostTitleValidation,
    InputPostShortDescriptionValidation,
    InputPostContentValidation,
    InputPostBlogIDValidation,
    inputValidationMiddleware,
    postControllerInstance.updatePostById.bind(postControllerInstance))

postsRouter.put('/:postId/like-status',
    postControllerInstance.setLikeStatus.bind(postControllerInstance))

postsRouter.delete('/:id',
    authorisedCheckValidator,
    postControllerInstance.deletePostById.bind(postControllerInstance))

postsRouter.get('/:postId/comments',
    postControllerInstance.getCommentsForPost.bind(postControllerInstance))