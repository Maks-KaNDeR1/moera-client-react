import { ActionBase } from "state/action-base";

export const POSTING_REPLY = "POSTING_REPLY";
type PostingReplyAction = ActionBase<typeof POSTING_REPLY, {
    id: string;
}>;
export const postingReply = (id: string): PostingReplyAction => ({
    type: POSTING_REPLY,
    payload: {id}
});

export const POSTING_REPLY_FAILED = "POSTING_REPLY_FAILED";
type PostingReplyFailedAction = ActionBase<typeof POSTING_REPLY_FAILED, never>;
export const postingReplyFailed = () => ({
    type: POSTING_REPLY_FAILED
});

export type PostingReplyAnyAction =
    PostingReplyAction
    | PostingReplyFailedAction;
