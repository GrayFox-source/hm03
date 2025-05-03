import {Router, Request, Response} from "express";
import {PostsRepository} from "../repositories/posts-repository";
import {RequestWithBody, RequestWithParams, RequestWithParamsAndBody} from "../types";
import {PostViewModel} from "../models/PostViewModel";
import {PostInputModel} from "../models/PostInputModel";
import {
    authorisedCheckValidator, InputPostBlogIDValidation, InputPostContentValidation,
    InputPostShortDescriptionValidation,
    InputPostTitleValidation, inputValidationMiddleware
} from "../middlewares/input-validation-middleware";

export const postsRouter = Router()

postsRouter.get('/', async (req: Request, res: Response) => {
    const allPosts = await PostsRepository.getAllPosts()
    res.status(200).send(allPosts)
})

postsRouter.get('/:id', async (req: RequestWithParams<{ id: string }>, res: Response) => {
    const findedPost = await PostsRepository.getPostById(req.params.id)
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
    async (req: RequestWithBody<PostViewModel>, res: Response) => {
        const newPost = await PostsRepository.createNewPost(req.body)
        res.status(201).send(newPost)
    })

postsRouter.put('/:id',
    authorisedCheckValidator,
    InputPostTitleValidation,
    InputPostShortDescriptionValidation,
    InputPostContentValidation,
    InputPostBlogIDValidation,
    inputValidationMiddleware,
    async (req: RequestWithParamsAndBody<{ id: string }, PostInputModel>, res: Response) => {
        const updatePost = await PostsRepository.updatePostById({id: req.params.id, ...req.body})
        if (updatePost) {
            const post = await PostsRepository.getPostById(req.params.id)
            res.status(204).send(post)
        } else {
            res.send(404);
        }
    })

postsRouter.delete('/:id',
    authorisedCheckValidator,
    async (req: RequestWithParams<{ id: string }>, res: Response) => {
        const deletePost = await PostsRepository.deletePostById(req.params.id)
        if (deletePost) {
            res.send(204)
        } else {
            res.send(404)
        }
    })