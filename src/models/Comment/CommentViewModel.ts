import {CommentatorInfo} from "./CommentatorInfo";
import {LikesInfoViewModel} from "./LikesInfoViewModel";

export type CommentViewModel = {
    id:	string
    content: string,
    commentatorInfo: CommentatorInfo,
    createdAt: string,
    likesInfo: LikesInfoViewModel
}