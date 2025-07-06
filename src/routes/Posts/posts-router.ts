import {Request, Response, Router} from "express";
import {RequestWithBody, RequestWithParams, RequestWithParamsAndBody} from "../../types";
import {PostInputModel} from "../../models/Posts/PostInputModel";
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
import {PostsService} from "../../domain/posts-service";
import {CommentInputModel} from "../../models/Comment/CommentInputModel";

export const postsRouter = Router()

class PostsController {
    private postsService: PostsService
    constructor() {
        this.postsService = new PostsService()
    }
    async getAllPosts(req: Request, res: Response) {
        const allPosts = await this.postsService.getAllPosts()
        res.status(200).send(allPosts)
    }
    async getPostById(req: RequestWithParams<{ id: string }>, res: Response) {
        const findedPost = await this.postsService.getPostById(req.params.id)
        if (findedPost) {
            res.status(200).send(findedPost)
        } else {
            res.send(404)
        }
    }
    async createPost(req: RequestWithBody<PostInputModel>, res: Response) {
        const newPost = await this.postsService.createNewPost(req.body)
        res.status(201).send(newPost)
    }
    async createCommentForPost(req: RequestWithParamsAndBody<{ postId: string }, CommentInputModel>, res: Response) {
        const newComment = await this.postsService.createCommentForPost({
            postId: req.params.postId,
            content: req.body.content,
            userId: req.user!.id,
            userLogin: req.user!.login
        })
        if (!newComment) {
            res.send(404)
        }
        res.status(201).send(newComment)
    }
    async updatePostById(req: RequestWithParamsAndBody<{ id: string }, PostInputModel>, res: Response) {
        const updatePost = await this.postsService.updatePostById({id: req.params.id, ...req.body})
        if (updatePost) {
            const post = await this.postsService.getPostById(req.params.id)
            res.status(204).send(post)
        } else {
            res.send(404);
        }
    }
    async deletePostById(req: RequestWithParams<{ id: string }>, res: Response) {
        const deletePost = await this.postsService.deletePostById(req.params.id)
        if (deletePost) {
            res.send(204)
        } else {
            res.send(404)
        }
    }

}
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

postsRouter.delete('/:id',
    authorisedCheckValidator,
    postControllerInstance.deletePostById.bind(postControllerInstance))