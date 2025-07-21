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
import {BlogsService} from "../../application/blogs-service";
import {PostViewModel} from "../../models/Posts/PostViewModel";
import {BlogPostInputModel} from "../../models/BlogPostInputModel";
import {IGetWithPagination} from "../../infrastucture/interfaces/get-with-pagination.interface";
import {PaginatorPosts} from "../../models/Posts/Paginator-Posts";


export const blogsRouter = Router()

class BlogsController {
    private blogsService: BlogsService
    constructor() {
        this.blogsService = new BlogsService()
    }
    async getAllBlogs(req: Request, res: Response) {
        const blogs = await this.blogsService.getAllBlogs(req.query)
        res.status(200).send(blogs)
    }
    async getPostsForBlog(req: RequestWithParamsAndQuery<{ blogId: string }, IGetWithPagination>, res: ResponseTyped<PaginatorPosts>) {
        const blogId = req.params.blogId
        const inputData = req.query

        const blog = await this.blogsService.getBlogByID(blogId)

        if (!blog) {
            res.status(404).send()
            return
        }

        const postsForBlogPage = await this.blogsService.getPostsByBlogId(blogId, inputData)
        res.status(200).send(postsForBlogPage)
    }
    async getBlogById(req: RequestWithParams<{ id: string }>, res: Response) {
        const findedBlog = await this.blogsService.getBlogByID(req.params.id)
        if (findedBlog) {
            res.status(200).send(findedBlog)
        } else {
            res.send(404)
        }
    }
    async createBlod(req: RequestWithBody<BlogInputModel>, res: Response) {
        const newBlog = await this.blogsService.createBlog(req.body)
        res.status(201).send(newBlog)
    }
    async createPostForBlog(req: RequestWithParamsAndBody<{ blogId: string }, BlogPostInputModel>, res: ResponseTyped<PostViewModel>) {
        const blogId = req.params.blogId;
        const inputData = req.body;

        const createdPost = await this.blogsService.createPostForBlog(blogId, inputData);
        console.log(createdPost)

        if (!createdPost) {
            res.sendStatus(404);
            return;
        }

        res.status(201).send(createdPost);
    }
    async updateBlogById(req: RequestWithParamsAndBody<{ id: string }, BlogInputModel>, res: ResponseTyped<BlogViewModel | null>) {
        const updateBlog = await this.blogsService.updateBlogByID({id: req.params.id, ...req.body})
        if (updateBlog) {
            const blog = await this.blogsService.getBlogByID(req.params.id)
            res.status(204).send(blog)
        } else {
            res.sendStatus(404)
        }
    }
    async deleteBlogById(req: RequestWithParams<{ id: string }>, res: Response) {
        const searchBlog = await this.blogsService.deleteBlogByID(req.params.id)
        if (searchBlog) {
            res.send(204)
        } else {
            res.send(404)
        }
    }
}
const blogsControllerInstance = new BlogsController()


blogsRouter.get('/', blogsControllerInstance.getAllBlogs.bind(blogsControllerInstance))

blogsRouter.get('/:blogId/posts', blogsControllerInstance.getPostsForBlog.bind(blogsControllerInstance))

blogsRouter.get('/:id', blogsControllerInstance.getBlogById.bind(blogsControllerInstance))

blogsRouter.post('/',
    validation.authorisedCheckValidator,
    validation.inputNameBlogValidation,
    validation.inputDescriptionValidation,
    validation.InputURLValidation,
    inputValidationMiddleware,
    blogsControllerInstance.createBlod.bind(blogsControllerInstance))

blogsRouter.post(
    '/:blogId/posts',
    validation.authorisedCheckValidator,
    validation.InputPostTitleValidation,
    validation.InputPostShortDescriptionValidation,
    validation.InputPostContentValidation,
    inputValidationMiddleware,
    blogsControllerInstance.createPostForBlog.bind(blogsControllerInstance));
blogsRouter.put('/:id',
    validation.authorisedCheckValidator,
    validation.inputNameBlogValidation,
    validation.inputDescriptionValidation,
    validation.InputURLValidation,
    inputValidationMiddleware,
    blogsControllerInstance.updateBlogById.bind(blogsControllerInstance))

blogsRouter.delete('/:id',
    validation.authorisedCheckValidator,
    blogsControllerInstance.deleteBlogById.bind(blogsControllerInstance))