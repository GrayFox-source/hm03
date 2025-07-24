import {Request, Response} from "express";

export type RequestWithBody<B> = Request<{}, {}, B>
export type RequestWithQuery<Q> = Request<{},{}, {}, Q>
export type RequestWithParams<P> = Request<P>
export type RequestWithParamsAndBody<P, B> = Request<P, {}, B>
export type RequestWithParamsAndQuery<P, Q> = Request<P, {}, {}, Q>
export type RequestWithBodyAndQuery<B, Q> = Request<{}, {}, B, Q>

export type ResponseTyped<B> = Response<B>