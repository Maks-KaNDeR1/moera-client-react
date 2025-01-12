import { call, put, select } from 'typed-redux-saga';
import i18n from 'i18next';

import { errorThrown } from "state/error/actions";
import { Node, NodeApiError } from "api";
import {
    COMPOSE_DRAFT_DELETE,
    COMPOSE_DRAFT_LIST_ITEM_DELETE,
    COMPOSE_DRAFT_LIST_ITEM_RELOAD,
    COMPOSE_DRAFT_LIST_LOAD,
    COMPOSE_DRAFT_LOAD,
    COMPOSE_DRAFT_SAVE,
    COMPOSE_POST,
    COMPOSE_POSTING_LOAD,
    COMPOSE_SHARED_TEXT_LOAD,
    COMPOSE_UPDATE_DRAFT_DELETE,
    ComposeDraftListItemDeleteAction,
    composeDraftListItemDeleted,
    ComposeDraftListItemReloadAction,
    composeDraftListItemSet,
    ComposeDraftListLoadAction,
    composeDraftListLoaded,
    composeDraftListLoadFailed,
    composeDraftLoaded,
    composeDraftLoadFailed,
    ComposeDraftSaveAction,
    composeDraftSaved,
    composeDraftSaveFailed,
    composeDraftUnset,
    ComposePostAction,
    composePostFailed,
    ComposePostingLoadAction,
    composePostingLoaded,
    composePostingLoadFailed,
    composePostSucceeded,
    composeSharedTextSet,
    ComposeUpdateDraftDeleteAction
} from "state/compose/actions";
import { getComposeDraftId, getComposePostingId, isComposePostingEditing } from "state/compose/selectors";
import { executor } from "state/executor";
import { WithContext } from "state/action-types";
import { flashBox } from "state/flashbox/actions";
import { mutuallyIntroduced } from "state/init-selectors";

export default [
    executor(COMPOSE_POSTING_LOAD, "", composePostingLoadSaga, mutuallyIntroduced),
    executor(COMPOSE_POST, null, composePostSaga),
    executor(COMPOSE_DRAFT_LOAD, "", composeDraftLoadSaga, mutuallyIntroduced),
    executor(COMPOSE_DRAFT_SAVE, "", composeDraftSaveSaga),
    executor(COMPOSE_DRAFT_DELETE, "", composeDraftDeleteSaga),
    executor(COMPOSE_DRAFT_LIST_LOAD, "", composeDraftListLoadSaga, mutuallyIntroduced),
    executor(COMPOSE_DRAFT_LIST_ITEM_RELOAD, payload => payload.id, composeDraftListItemReloadSaga),
    executor(COMPOSE_DRAFT_LIST_ITEM_DELETE, payload => payload.id, composeDraftListItemDeleteSaga),
    executor(COMPOSE_UPDATE_DRAFT_DELETE, "", composeUpdateDraftDeleteSaga),
    executor(COMPOSE_SHARED_TEXT_LOAD, "", composeSharedTextLoadSaga)
];

function* composePostingLoadSaga(action: WithContext<ComposePostingLoadAction>) {
    const id = yield* select(getComposePostingId);
    if (action.context.ownerName == null || id == null) {
        yield* put(composePostingLoadFailed());
        return;
    }

    try {
        const draft = yield* call(Node.getDraftPostingUpdate, ":", action.context.ownerName, id);
        if (draft != null) {
            yield* put(composeDraftLoaded(draft));
        }
        const posting = yield* call(Node.getPosting, "", id, true);
        yield* put(composePostingLoaded(posting));
    } catch (e) {
        yield* put(composePostingLoadFailed());
        yield* put(errorThrown(e));
    }
}

function* composePostSaga(action: ComposePostAction) {
    const {id, postingText, prevState} = action.payload;

    try {
        let posting;
        if (id == null) {
            posting = yield* call(Node.postPosting, "", postingText);
        } else {
            posting = yield* call(Node.putPosting, "", id, postingText);
        }
        yield* put(composePostSucceeded(posting));

        if (id != null) {
            const hideComments = postingText.commentOperations?.view === "private";
            if (hideComments !== prevState.hideComments) {
                yield* call(Node.putComments, "", id, {
                    seniorOperations: {
                        view: postingText.commentOperations?.view
                    }
                });
            }
        }
    } catch (e) {
        yield* put(composePostFailed());
        yield* put(errorThrown(e));
    }
}

function* composeDraftLoadSaga() {
    const id = yield* select(getComposeDraftId);
    if (id == null) {
        yield* put(composeDraftLoadFailed());
        return;
    }

    try {
        const data = yield* call(Node.getDraft, ":", id);
        yield* put(composeDraftLoaded(data));
        yield* put(composeDraftListItemSet(id, data));
    } catch (e) {
        yield* put(composeDraftLoadFailed());
        if (e instanceof NodeApiError) {
            yield* put(flashBox(i18n.t("draft-not-found")));
        } else {
            yield* put(errorThrown(e));
        }
    }
}

function* composeDraftSaveSaga(action: ComposeDraftSaveAction) {
    const {draftId, draftText} = action.payload;

    try {
        let data;
        if (draftId == null) {
            data = yield* call(Node.postDraft, ":", draftText);
        } else {
            data = yield* call(Node.putDraft, ":", draftId, draftText);
        }
        if (draftText.receiverPostingId == null) {
            yield* put(composeDraftListItemSet(data.id, data));
        }
        yield* put(composeDraftSaved(draftText.receiverPostingId ?? null, data));
    } catch (e) {
        yield* put(composeDraftSaveFailed());
        yield* put(errorThrown(e));
    }
}

function* composeDraftDeleteSaga() {
    const {draftId, editing} = yield* select(state => ({
        draftId: getComposeDraftId(state),
        editing: isComposePostingEditing(state)
    }));
    if (draftId == null) {
        return;
    }
    if (!editing) {
        yield* call(Node.deleteDraft, ":", draftId);
        yield* put(composeDraftListItemDeleted(draftId, true));
    } else {
        yield* call(Node.deleteDraft, ":", draftId);
    }

}

function* composeDraftListLoadSaga(action: WithContext<ComposeDraftListLoadAction>) {
    if (action.context.ownerName == null) {
        yield* put(composeDraftListLoadFailed());
        return;
    }

    try {
        const data = yield* call(Node.getDraftsNewPosting, ":", action.context.ownerName);
        yield* put(composeDraftListLoaded(data));
    } catch (e) {
        yield* put(composeDraftListLoadFailed());
        yield* put(errorThrown(e));
    }
}

function* composeDraftListItemReloadSaga(action: ComposeDraftListItemReloadAction) {
    try {
        const data = yield* call(Node.getDraft, ":", action.payload.id);
        yield* put(composeDraftListItemSet(data.id, data));
    } catch (e) {
        yield* put(errorThrown(e));
    }
}

function* composeDraftListItemDeleteSaga(action: ComposeDraftListItemDeleteAction) {
    const {id, resetForm} = action.payload;

    try {
        yield* call(Node.deleteDraft, ":", id);
        yield* put(composeDraftListItemDeleted(id, resetForm));
    } catch (e) {
        if (e instanceof NodeApiError) {
            yield* put(composeDraftListItemDeleted(id, resetForm));
        } else {
            yield* put(errorThrown(e));
        }
    }
}

function* composeUpdateDraftDeleteSaga(action: ComposeUpdateDraftDeleteAction) {
    const id = yield* select(getComposeDraftId);
    if (id == null) {
        return;
    }

    try {
        yield* call(Node.deleteDraft, ":", id);
        yield* put(composeDraftUnset(action.payload.resetForm));
    } catch (e) {
        yield* put(errorThrown(e));
    }
}

function* composeSharedTextLoadSaga() {
    if (!window.Android) {
        return;
    }
    const text = window.Android.getSharedText();
    const type = window.Android.getSharedTextType();
    if (text != null) {
        yield* put(composeSharedTextSet(text, type));
    }
}
