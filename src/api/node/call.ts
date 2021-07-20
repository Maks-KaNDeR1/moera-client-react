import { apply, call, put, select } from 'typed-redux-saga/macro';
import { CallEffect, PutEffect, SelectEffect } from 'redux-saga/effects';
import { ValidateFunction } from 'ajv';

import { formatSchemaErrors, HomeNotConnectedError, NameResolvingError, NodeApi, NodeApiError, NodeError } from "api";
import { retryFetch } from "api/fetch-timeout";
import {
    Body,
    BodyFormat,
    CommentCreated,
    CommentInfo,
    CommentsSliceInfo,
    DraftInfo,
    EncodedCommentCreated,
    EncodedCommentInfo,
    EncodedCommentsSliceInfo,
    EncodedDraftInfo,
    EncodedFeedSliceInfo,
    EncodedPostingInfo,
    EncodedStoryInfo,
    FeedSliceInfo,
    PostingInfo,
    SourceFormat,
    StoryInfo
} from "api/node/api-types";
import { BodyError } from "api/error";
import { isSchemaValid } from "api/schema";
import { errorAuthInvalid } from "state/error/actions";
import { nodeUrlToLocation, normalizeUrl, urlWithParameters } from "util/url";
import { getNodeRootLocation, getToken } from "state/node/selectors";
import { getCurrentCarte } from "state/cartes/selectors";
import { getHomeRootLocation, isConnectedToHome } from "state/home/selectors";
import { getNodeUri } from "state/naming/sagas";
import { Browser } from "ui/browser";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "HEAD" | "OPTIONS";

type ErrorFilter = boolean | string[] | ((code: string) => boolean);

type CallException = (e: string | Error, details?: string | null) => NodeError;

export type CallApiParams<T> = {
    location: string;
    nodeName?: string | null;
    method?: HttpMethod;
    auth?: boolean | string;
    body?: any;
    schema: ValidateFunction<T>;
    errorFilter?: ErrorFilter;
};

export type CallApiResult<T> = Generator<CallEffect | PutEffect<any> | SelectEffect, T>;

export function* callApi<T>({
    location,
    nodeName = "",
    method = "GET" as const,
    auth = false,
    body = null,
    schema,
    errorFilter = false
}: CallApiParams<T>):  CallApiResult<T> {
    const {rootLocation, rootApi, errorTitle} = yield* call(selectApi, nodeName);
    if (!rootLocation) {
        throw new NameResolvingError(nodeName);
    }
    const exception: CallException =
        (e, details) => new NodeError(method, rootApi, location, errorTitle, e, details);
    const headers = {
        "Accept": "application/json",
        "Content-Type": body instanceof File ? body.type : "application/json"
    };
    yield* call(authorize, headers, rootLocation, auth);
    let response;
    try {
        response = yield* call(retryFetch, apiUrl(rootApi, location, method), {
            method,
            headers,
            body: encodeBody(body)
        });
    } catch (e) {
        throw exception(e);
    }
    let data: any;
    try {
        data = yield* apply(response, "json", []);
    } catch (e) {
        if (!response.ok) {
            throw exception("Server returned error status");
        } else {
            throw exception("Server returned empty result");
        }
    }
    if (!response.ok) {
        if (!isSchemaValid(NodeApi.Result, data)) {
            throw exception("Server returned error status");
        }
        if (data.errorCode === "authentication.invalid") {
            yield* put(errorAuthInvalid());
            throw new NodeApiError(data.errorCode, data.message);
        }
        if (isErrorCodeAllowed(data.errorCode, errorFilter)) {
            throw new NodeApiError(data.errorCode, data.message);
        } else {
            throw exception("Server returned error status: " + data.message);
        }
    }
    if (!isSchemaValid(schema, data)) {
        throw exception("Server returned incorrect response", formatSchemaErrors(schema.errors));
    }
    return data;
}

export function* selectApi(nodeName: string | null | undefined) {
    let root;
    let errorTitle = "";
    switch (nodeName) {
        case null:
        case undefined:
        case "":
            root = yield* select(state => ({
                location: getNodeRootLocation(state),
                api: state.node.root.api
            }));
            errorTitle = "Node access error";
            break;

        case ":":
            root = yield* select(state => ({
                connected: isConnectedToHome(state),
                location: getHomeRootLocation(state),
                api: state.home.root.api
            }));
            if (!root.connected) {
                throw new HomeNotConnectedError();
            }
            errorTitle = "Home access error";
            break;

        default:
            if (nodeName.match(/^https?:/i)) {
                const location = normalizeUrl(nodeName);
                root = {
                    location,
                    api: location + "/moera/api"
                };
                errorTitle = "Home access error";
            } else {
                const nodeUri = yield* call(getNodeUri, nodeName);
                root = nodeUri != null ?
                    {
                        location: nodeUrlToLocation(nodeUri),
                        api: nodeUri + "/api"
                    }
                :
                    {
                        location: "",
                        api: ""
                    }
                errorTitle = "Node access error";
            }
    }

    return {rootLocation: root.location, rootApi: root.api, errorTitle};
}

function* authorize(headers: Record<string, string>, rootLocation: string | null, auth: boolean | string) {
    if (auth === false) {
        return;
    }
    const token = auth === true ? yield* select(state => getToken(state, rootLocation)) : auth;
    if (token != null) {
        headers["Authorization"] = `Bearer token:${token}`;
    } else {
        const carte = yield* select(getCurrentCarte);
        if (carte != null) {
            headers["Authorization"] = `Bearer carte:${carte}`;
        }
    }
}

function apiUrl(rootApi: string, location: string, method: HttpMethod): string {
    if (["POST", "PUT", "DELETE"].includes(method)) {
        return urlWithParameters(rootApi + location, {"cid": Browser.clientId});
    } else {
        return rootApi + location;
    }
}

function encodeBody(body: null): null;
function encodeBody(body: File): File;
function encodeBody(body: any): string;
function encodeBody(body: any): string | null | File {
    if (body == null) {
        return null;
    }
    if (body instanceof File) {
        return body;
    }
    return JSON.stringify(body);
}

function isErrorCodeAllowed(errorCode: string, filter: ErrorFilter): boolean {
    if (typeof filter === "boolean") {
        return filter;
    }
    if (Array.isArray(filter)) {
        return filter.map(c => c.toLowerCase()).includes(errorCode.toLowerCase());
    }
    if (typeof filter === "function") {
        return filter(errorCode);
    }
    return false;
}

function decodeBody(encoded: string, format: BodyFormat | SourceFormat | null): Body {
    if (format != null && format.toLowerCase() === "application") {
        return {text: ""};
    }
    let body = JSON.parse(encoded);
    if (!isSchemaValid(NodeApi.Body, body)) {
        throw new BodyError(formatSchemaErrors(NodeApi.Body.errors));
    }
    return body;
}

type Entities = PostingInfo | CommentInfo | StoryInfo | CommentCreated | DraftInfo | FeedSliceInfo | CommentsSliceInfo;
type EncodedEntities = EncodedPostingInfo | EncodedCommentInfo | EncodedStoryInfo | EncodedCommentCreated
    | EncodedDraftInfo | EncodedFeedSliceInfo | EncodedCommentsSliceInfo;

export function decodeBodies(data: EncodedPostingInfo): PostingInfo;
export function decodeBodies(data: EncodedCommentInfo): CommentInfo;
export function decodeBodies(data: EncodedStoryInfo): StoryInfo;
export function decodeBodies(data: EncodedCommentCreated): CommentCreated;
export function decodeBodies(data: EncodedDraftInfo): DraftInfo;
export function decodeBodies(data: EncodedDraftInfo[]): DraftInfo[];
export function decodeBodies(data: EncodedFeedSliceInfo): FeedSliceInfo;
export function decodeBodies(data: EncodedCommentsSliceInfo): CommentsSliceInfo;
export function decodeBodies(data: EncodedEntities): Entities;
export function decodeBodies(data: EncodedEntities | EncodedEntities[]): Entities | Entities[] {
    if (Array.isArray(data)) {
        return data.map(p => decodeBodies(p));
    }

    const decoded: any = {...data};
    if ("stories" in data && data.stories != null) {
        decoded.stories = data.stories.map(p => decodeBodies(p));
    }
    if ("comments" in data && data.comments != null) {
        decoded.comments = data.comments.map(p => decodeBodies(p));
    }
    if ("comment" in data && data.comment != null) {
        decoded.comment = decodeBodies(data.comment);
    }
    if ("posting" in data && data.posting != null) {
        decoded.posting = decodeBodies(data.posting);
    }
    if ("body" in data && data.body != null) {
        decoded.body = decodeBody(data.body, data.bodyFormat ?? null);
    }
    if ("bodyPreview" in data && data.bodyPreview != null) {
        decoded.bodyPreview = decodeBody(data.bodyPreview, data.bodyFormat ?? null);
    }
    if ("bodySrc" in data && data.bodySrc != null) {
        decoded.bodySrc = decodeBody(data.bodySrc, data.bodySrcFormat ?? null);
    }
    return decoded;
}