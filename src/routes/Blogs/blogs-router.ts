import {Request, Response, Router} from "express";
import {
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody,
    RequestWithParamsAndQuery,
    ResponseTyped
} from "../../types";
import {BlogInputModel} from "../../models/Blogs/BlogInputModel";
import * as validation from "../../middlewares/input-validation-middleware";
import {inputValidationMiddleware} from "../../middlewares/input-validation-middleware";
import {BlogViewModel} from "../../models/Blogs/BlogViewModel";
import {blogsService} from "../../domain/blogs-service";
import {PostViewModel} from "../../models/Posts/PostViewModel";
import {BlogPostInputModel} from "../../models/BlogPostInputModel";
import {IGetWithPagination} from "../../repositories/interfaces/get-with-pagination.interface";
import {PaginatorPosts} from "../../models/Posts/Paginator-Posts";


export const blogsRouter = Router()

blogsRouter.get('/',async (req: Request, res: Response) => {
    const blogs = await blogsService.getAllBlogs(req.query)
    res.status(200).send(blogs)
})

blogsRouter.get('/:blogId/posts',async (req: RequestWithParamsAndQuery<{ blogId: string }, IGetWithPagination>, res: ResponseTyped<PaginatorPosts>) => {
    const blogId = req.params.blogId
    const inputData = req.query

    const blog = await blogsService.getBlogByID(blogId)

    if (!blog) {
        res.status(404).send()
        return
    }

    const postsForBlogPage = await blogsService.getPostsByBlogId(blogId, inputData)
    res.status(200).send(postsForBlogPage)
})

blogsRouter.get('/:id', async (req: RequestWithParams<{ id: string }>, res) => {
    const findedBlog = await blogsService.getBlogByID(req.params.id)
    if (findedBlog) {
        res.status(200).send(findedBlog)
    } else {
        res.send(404)
    }
})

blogsRouter.post('/',
    validation.authorisedCheckValidator,
    validation.inputNameBlogValidation,
    validation.inputDescriptionValidation,
    validation.InputURLValidation,
    inputValidationMiddleware,
    async (req: RequestWithBody<BlogInputModel>, res) => {
        const newBlog = await blogsService.createBlog(req.body)
        res.status(201).send(newBlog)
    })

blogsRouter.post(
    '/:blogId/posts',
    validation.authorisedCheckValidator,
    validation.InputPostTitleValidation,
    validation.InputPostShortDescriptionValidation,
    validation.InputPostContentValidation,
    inputValidationMiddleware,
    async (
        req: RequestWithParamsAndBody<{ blogId: string }, BlogPostInputModel>,
        res: ResponseTyped<PostViewModel>
    ) => {
        const blogId = req.params.blogId;
        const inputData = req.body;

        const createdPost = await blogsService.createPostForBlog(blogId, inputData);
        console.log(createdPost)

        if (!createdPost) {
            res.sendStatus(404);
            return;
        }

        res.status(201).send(createdPost);
    }
);
blogsRouter.put('/:id',
    validation.authorisedCheckValidator,
    validation.inputNameBlogValidation,
    validation.inputDescriptionValidation,
    validation.InputURLValidation,
    inputValidationMiddleware,
    async (req: RequestWithParamsAndBody<{ id: string }, BlogInputModel>, res: ResponseTyped<BlogViewModel | null>) => {
        const updateBlog = await blogsService.updateBlogByID({id: req.params.id, ...req.body})
        if (updateBlog) {
            const blog = await blogsService.getBlogByID(req.params.id)
            res.status(204).send(blog)
        } else {
            res.sendStatus(404)
        }
    })

blogsRouter.delete('/:id',
    validation.authorisedCheckValidator,
    async (req: RequestWithParams<{ id: string }>, res) => {
        const searchBlog = await blogsService.deleteBlogByID(req.params.id)
        if (searchBlog) {
            res.send(204)
        } else {
            res.send(404)
        }
    })