import {Request, Response, Router} from "express";
import {RequestWithBody, RequestWithParams, RequestWithParamsAndBody} from "../../types";
import {PostInputModel} from "../../models/Posts/PostInputModel";
import {
    authMiddleware,
    authorisedCheckValidator, CommentContentInputValidation,
    InputPostBlogIDValidation,
    InputPostContentValidation,
    InputPostShortDescriptionValidation,
    InputPostTitleValidation,
    inputValidationMiddleware
} from "../../middlewares/input-validation-middleware";
import {postsService} from "../../domain/posts-service";
import {CommentInputModel} from "../../models/Comment/CommentInputModel";

export const postsRouter = Router()

postsRouter.get('/', async (req: Request, res: Response) => {
    const allPosts = await postsService.getAllPosts()
    res.status(200).send(allPosts)
})

postsRouter.get('/:id', async (req: RequestWithParams<{ id: string }>, res: Response) => {
    const findedPost = await postsService.getPostById(req.params.id)
    if (findedPost) {
        res.status(200).send(findedPost)
    } else {
        res.send(404)
    }
})

postsRouter.post('/',
    authorisedCheckValidator,
    InputPostTitleValidation,
    InputPostShortDescriptionValidation,
    InputPostContentValidation,
    InputPostBlogIDValidation,
    inputValidationMiddleware,
    async (req: RequestWithBody<PostInputModel>, res: Response) => {
        const newPost = await postsService.createNewPost(req.body)
        res.status(201).send(newPost)
    })


postsRouter.post('/:postId/comments',
    authMiddleware,
    CommentContentInputValidation,
    async (req: RequestWithParamsAndBody<{ postId: string }, CommentInputModel>, res: Response) => {
        const newComment = await postsService.createCommentForPost({postId: req.params.postId, content: req.body.content, userId: req.user!.id, userLogin: req.user!.login})
        if (!newComment) {
            res.send(404)
        }
        res.status(201).send(newComment)
    })


postsRouter.put('/:id',
    authorisedCheckValidator,
    InputPostTitleValidation,
    InputPostShortDescriptionValidation,
    InputPostContentValidation,
    InputPostBlogIDValidation,
    inputValidationMiddleware,
    async (req: RequestWithParamsAndBody<{ id: string }, PostInputModel>, res: Response) => {
        const updatePost = await postsService.updatePostById({id: req.params.id, ...req.body})
        if (updatePost) {
            const post = await postsService.getPostById(req.params.id)
            res.status(204).send(post)
        } else {
            res.send(404);
        }
    })

postsRouter.delete('/:id',
    authorisedCheckValidator,
    async (req: RequestWithParams<{ id: string }>, res: Response) => {
        const deletePost = await postsService.deletePostById(req.params.id)
        if (deletePost) {
            res.send(204)
        } else {
            res.send(404)
        }
    })