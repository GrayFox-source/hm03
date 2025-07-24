import {PostsService} from "../../application/posts-service";
import {Request, Response} from "express";
import {RequestWithBody, RequestWithParams, RequestWithParamsAndBody} from "../../types";
import {PostInputModel} from "../../models/Posts/PostInputModel";
import {CommentInputModel} from "../../models/Comment/CommentInputModel";
import {jwtService} from "../../compositon-root";
import {UsersService} from "../../application/users-service";
import {UsersRepository} from "../../infrastucture/users-repository";
import {LikeInputModel} from "../../models/Comment/LikeInputModel";

export class PostsController {
    private postsService: PostsService
    private usersRerository: UsersRepository
    private usersService: UsersService

    constructor() {
        this.postsService = new PostsService()
        this.usersRerository = new UsersRepository()
        this.usersService = new UsersService(this.usersRerository)
    }

    async getAllPosts(req: Request, res: Response) {
        const allPosts = await this.postsService.getAllPosts(req.query)
        res.status(200).send(allPosts)
    }

    async getCommentsForPost(req: Request, res: Response) {
        const allPosts = await this.postsService.getCommentsForPost(req.query, req.params.postId)
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
        if (!req.headers.authorization) {
            res.sendStatus(401)
            return
        }
        const token = req.headers.authorization.split(' ')[1]
        const userId = await jwtService.getIdUserByToken(token)
        if (!userId) {
            res.send(404)
            return
            }
        const user = await this.usersService.findUserById((userId).toString())
        const newComment = await this.postsService.createCommentForPost({
            postId: req.params.postId,
            content: req.body.content,
            userId: userId,
            userLogin: user!.login
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
            return
        } else {
            res.send(404);
        }
    }

    async deletePostById(req: RequestWithParams<{ id: string }>, res: Response) {
        const deletePost = await this.postsService.deletePostById(req.params.id)
        if (deletePost) {
            res.send(204)
            return
        } else {
            res.send(404)
        }
    }

    async setLikeStatus(req: RequestWithParamsAndBody<{ postId: string }, LikeInputModel>, res: Response) {
        const {likeStatus} = req.body
        const postId = req.params.postId
        const authHeader = req.headers.authorization
        if (!authHeader){
            res.send(401)
            return
        }

        const token = authHeader.split(' ')[1]
        const userId = await jwtService.getIdUserByToken(token)
        const result = await this.postsService.setLikeStatus(postId, likeStatus, userId)
        if (result) {
            res.sendStatus(201)
        }
    }

}