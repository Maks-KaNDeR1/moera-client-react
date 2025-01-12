import { PrincipalValue, ReactionInfo } from "api/node/api-types";
import { ClientState } from "state/state";
import { VerificationStatus } from "state/state-types";
import { isPermitted } from "state/node/selectors";
import { getPosting } from "state/postings/selectors";
import { getComment, getCommentsReceiverName } from "state/detailedposting/selectors";
import { ReactionsDialogTabsState } from "state/reactionsdialog/state";

export function getReactionsDialogNodeName(state: ClientState): string | null {
    return state.reactionsDialog.nodeName;
}

export function getReactionsDialogPostingId(state: ClientState): string | null {
    return state.reactionsDialog.postingId;
}

export function getReactionsDialogReceiverPostingId(state: ClientState): string | null {
    const posting = getPosting(state, state.reactionsDialog.postingId);
    return posting != null ? (posting.receiverPostingId ?? posting.id) : null;
}

export function isReactionsDialogShown(state: ClientState): boolean {
    return state.reactionsDialog.show;
}

function getReactions(state: ClientState): ReactionsDialogTabsState | null {
    return state.reactionsDialog.reactions[state.reactionsDialog.activeTab ?? 0] ?? null;
}

export function isReactionsDialogReactionsToBeLoaded(state: ClientState): boolean {
    return !isReactionsDialogReactionsAllLoaded(state) && getReactionsDialogItems(state).length === 0;
}

export function isReactionsDialogReactionsLoading(state: ClientState): boolean {
    const reactions = getReactions(state);
    return reactions != null && reactions.loading;
}

export function getReactionsDialogItems(state: ClientState): ReactionInfo[] {
    const reactions = getReactions(state);
    return reactions != null ? reactions.items : [];
}

export function getReactionsDialogRemainingCount(state: ClientState): number {
    const reactions = getReactions(state);
    return reactions != null ? reactions.total - reactions.items.length : 0;
}

export function isReactionsDialogReactionsAllLoaded(state: ClientState): boolean {
    const reactions = getReactions(state);
    return reactions != null && reactions.after <= Number.MIN_SAFE_INTEGER;
}

export function isReactionsDialogTotalsToBeLoaded(state: ClientState): boolean {
    return !state.reactionsDialog.totals.loaded && !state.reactionsDialog.totals.loading;
}

export function getReactionVerificationStatus(state: ClientState, ownerName: string): VerificationStatus | null {
    return state.reactionsDialog.verificationStatus[ownerName] ?? "none";
}

export function isReactionsDialogPermitted(operation: string, defaultValue: PrincipalValue,
                                           state: ClientState): boolean {
    if (state.reactionsDialog.commentId != null) {
        const comment = getComment(state, state.reactionsDialog.commentId);
        return isPermitted(operation, comment, defaultValue, state, {
            objectSourceName: getCommentsReceiverName(state)
        });
    } else {
        const posting = getPosting(state, state.reactionsDialog.postingId);
        return isPermitted(operation, posting, defaultValue, state, {
            objectSourceName: posting?.receiverName
        });
    }
}
