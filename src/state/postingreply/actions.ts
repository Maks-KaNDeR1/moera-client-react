import { ActionWithPayload } from "state/action-base";
import { Action } from "redux";

export const POSTING_REPLY = "POSTING_REPLY";
type PostingReplyAction = ActionWithPayload<typeof POSTING_REPLY, {
    id: string;
}>;
export const postingReply = (id: string): PostingReplyAction => ({
    type: POSTING_REPLY,
    payload: {id}
});

export const POSTING_REPLY_FAILED = "POSTING_REPLY_FAILED";
type PostingReplyFailedAction = Action<typeof POSTING_REPLY_FAILED>;
export const postingReplyFailed = () => ({
    type: POSTING_REPLY_FAILED
});

export type PostingReplyAnyAction =
    PostingReplyAction
    | PostingReplyFailedAction;
