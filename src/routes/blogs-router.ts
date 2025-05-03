import {Request, Response, Router} from "express";
import {blogsRepository} from "../repositories/blogs-repository";
import {RequestWithBody, RequestWithParams, RequestWithParamsAndBody, ResponseTyped} from "../types";
import {BlogInputModel} from "../models/BlogInputModel";
import * as validation from "../middlewares/input-validation-middleware";
import {inputValidationMiddleware} from "../middlewares/input-validation-middleware";
import {BlogViewModel} from "../models/BlogViewModel";




export const blogsRouter = Router()

blogsRouter.get('/',async (req: Request, res: Response) => {
    const blogs = await blogsRepository.getAllBlogs()
    res.status(200).send(blogs)
})

blogsRouter.get('/:id', async (req: RequestWithParams<{ id: string }>, res) => {
    const findedBlog = await blogsRepository.getBlogByID(req.params.id)
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
        const newBlog = await blogsRepository.createBlog(req.body)
        res.status(201).send(newBlog)
    })

blogsRouter.put('/:id',
    validation.authorisedCheckValidator,
    validation.inputNameBlogValidation,
    validation.inputDescriptionValidation,
    validation.InputURLValidation,
    inputValidationMiddleware,
    async (req: RequestWithParamsAndBody<{ id: string }, BlogInputModel>, res: ResponseTyped<BlogViewModel | null>) => {
        const updateBlog = await blogsRepository.updateBlogByID({id: req.params.id, ...req.body})
        if (updateBlog) {
            const blog = await blogsRepository.getBlogByID(req.params.id)
            res.status(204).send(blog)
        } else {
            res.sendStatus(404)
        }
    })

blogsRouter.delete('/:id',
    validation.authorisedCheckValidator,
    async (req: RequestWithParams<{ id: string }>, res) => {
        const searchBlog = await blogsRepository.deleteBlogByID(req.params.id)
        if (searchBlog) {
            res.send(204)
        } else {
            res.send(404)
        }
    })