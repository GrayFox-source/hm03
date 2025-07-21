import {LikeStatus} from "../Comment/LikeInputModel";
import {LikeDetailsViewModel} from "./LikeDetailsViewModel";

export type ExtendedLikesInfoModel = {
    likesCount: number,
    dislikesCount: number,
    myStatus: LikeStatus,
    newestLikes: LikeDetailsViewModel[]
}