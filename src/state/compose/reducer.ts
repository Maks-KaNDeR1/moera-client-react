import * as immutable from 'object-path-immutable';

import { DraftInfo, PostingInfo } from "api/node/api-types";
import {
    COMPOSE_CONFLICT,
    COMPOSE_CONFLICT_CLOSE,
    COMPOSE_DRAFT_LIST_ITEM_DELETED,
    COMPOSE_DRAFT_LIST_ITEM_SET,
    COMPOSE_DRAFT_LIST_LOAD,
    COMPOSE_DRAFT_LIST_LOAD_FAILED,
    COMPOSE_DRAFT_LIST_LOADED,
    COMPOSE_DRAFT_LOAD,
    COMPOSE_DRAFT_LOAD_FAILED,
    COMPOSE_DRAFT_LOADED,
    COMPOSE_DRAFT_SAVE,
    COMPOSE_DRAFT_SAVE_FAILED,
    COMPOSE_DRAFT_SAVED,
    COMPOSE_DRAFT_SELECT,
    COMPOSE_DRAFT_UNSET,
    COMPOSE_FEATURES_LOAD,
    COMPOSE_FEATURES_LOAD_FAILED,
    COMPOSE_FEATURES_LOADED,
    COMPOSE_FEATURES_UNSET,
    COMPOSE_POST,
    COMPOSE_POST_FAILED,
    COMPOSE_POST_SUCCEEDED,
    COMPOSE_POSTING_LOAD,
    COMPOSE_POSTING_LOAD_FAILED,
    COMPOSE_POSTING_LOADED,
    COMPOSE_PREVIEW,
    COMPOSE_PREVIEW_CLOSE,
    COMPOSE_SHARED_TEXT_SET
} from "state/compose/actions";
import { GO_TO_PAGE } from "state/navigation/actions";
import { PAGE_COMPOSE } from "state/navigation/pages";
import { ComposeState, DraftPostingInfo, ExtDraftInfo } from "state/compose/state";
import { ClientAction } from "state/action";
import { htmlEntities, replaceEmojis, safeHtml } from "util/html";

const emptyPosting = {
    postingId: null,
    posting: null,
    loadingPosting: false,
    conflict: false,
    beingPosted: false,
    draftId: null,
    draft: null,
    loadingDraft: false,
    savingDraft: false,
    savedDraft: false,
    sharedText: null,
    sharedTextType: null
};

const initialState = {
    loadingFeatures: false,
    loadedFeatures: false,
    features: null,
    ...emptyPosting,
    draftList: [],
    loadingDraftList: false,
    loadedDraftList: false,
    showPreview: false
};

function subjectHtml(subject: string | null | undefined): string | null {
    return subject != null ? replaceEmojis(htmlEntities(subject)) : null;
}

function buildDraftInfo(draftInfo: DraftInfo): ExtDraftInfo {
    const {bodySrc, body} = draftInfo;

    return immutable.wrap(draftInfo)
        .set("subject", bodySrc?.subject != null ? bodySrc.subject.substring(0, 64) : null)
        .set("text", bodySrc?.text != null ? bodySrc.text.substring(0, 256) : null)
        .set("subjectHtml", subjectHtml(body.subject))
        .update("body.text", text => safeHtml(text))
        .value() as ExtDraftInfo;
}

function sortDraftList(draftList: ExtDraftInfo[]): ExtDraftInfo[] {
    return draftList.sort((d1, d2) =>
        (d2.editedAt ?? d2.createdAt) - (d1.editedAt ?? d2.createdAt));
}

function appendToDraftList(draftList: ExtDraftInfo[], draftInfo: DraftInfo): ExtDraftInfo[] {
    const extDraftInfo = buildDraftInfo(draftInfo);
    const list = draftList.slice();
    const i = list.findIndex(d => d.id === extDraftInfo.id);
    if (i >= 0) {
        list[i] = extDraftInfo;
    } else {
        list.push(extDraftInfo);
    }
    return sortDraftList(list);
}

function draftToDraftPosting(draft: DraftInfo): DraftPostingInfo {
    return immutable.wrap(draft)
        .set("id", draft.receiverPostingId ?? undefined)
        .set("subjectHtml", subjectHtml(draft.body.subject))
        .update("body.text", text => safeHtml(text))
        .del("draftType")
        .del("receiverName")
        .del("receiverPostingId")
        .value() as any as DraftPostingInfo;
}

function postingToDraftPosting(posting: PostingInfo): DraftPostingInfo {
    return immutable.wrap(posting)
        .set("subjectHtml", subjectHtml(posting.body.subject))
        .update("body.text", text => safeHtml(text))
        .value() as DraftPostingInfo;
}

export default (state: ComposeState = initialState, action: ClientAction): ComposeState => {
    switch (action.type) {
        case GO_TO_PAGE:
            if (action.payload.page === PAGE_COMPOSE) {
                return {
                    ...state,
                    ...emptyPosting,
                    postingId: action.payload.details.id,
                    draftId: action.payload.details.draftId
                }
            }
            return state;

        case COMPOSE_FEATURES_LOAD:
            return {
                ...state,
                loadingFeatures: true
            };

        case COMPOSE_FEATURES_LOADED:
            return {
                ...state,
                loadingFeatures: false,
                loadedFeatures: true,
                features: action.payload.features
            };

        case COMPOSE_FEATURES_LOAD_FAILED:
            return {
                ...state,
                loadingFeatures: false
            };

        case COMPOSE_FEATURES_UNSET:
            return {
                ...state,
                loadingFeatures: false,
                loadedFeatures: false,
                features: null
            };

        case COMPOSE_POSTING_LOAD:
            return {
                ...state,
                loadingPosting: true
            };

        case COMPOSE_POSTING_LOADED:
            return {
                ...state,
                posting: postingToDraftPosting(action.payload.posting),
                loadingPosting: false
            };

        case COMPOSE_POSTING_LOAD_FAILED:
            return {
                ...state,
                loadingPosting: false
            };

        case COMPOSE_CONFLICT:
            return {
                ...state,
                conflict: true
            };

        case COMPOSE_CONFLICT_CLOSE:
            return {
                ...state,
                conflict: false
            };

        case COMPOSE_POST:
            return {
                ...state,
                beingPosted: true
            };

        case COMPOSE_POST_SUCCEEDED:
        case COMPOSE_POST_FAILED:
            return {
                ...state,
                beingPosted: false
            };

        case COMPOSE_DRAFT_LOAD:
            return {
                ...state,
                loadingDraft: true
            };

        case COMPOSE_DRAFT_LOADED:
            return {
                ...state,
                draftId: action.payload.draft.id,
                draft: buildDraftInfo(action.payload.draft),
                posting: draftToDraftPosting(action.payload.draft),
                loadingDraft: false,
                loadingPosting: false
            };

        case COMPOSE_DRAFT_LOAD_FAILED:
            return {
                ...state,
                loadingDraft: false
            };

        case COMPOSE_DRAFT_SAVE:
            return {
                ...state,
                savingDraft: true,
                savedDraft: false
            };

        case COMPOSE_DRAFT_SAVED:
            if (action.payload.postingId === state.postingId) {
                return {
                    ...state,
                    draftId: action.payload.draft.id,
                    draft: buildDraftInfo(action.payload.draft),
                    savingDraft: false,
                    savedDraft: true
                };
            } else {
                return state;
            }

        case COMPOSE_DRAFT_SAVE_FAILED:
            return {
                ...state,
                savingDraft: false,
                savedDraft: false
            };

        case COMPOSE_DRAFT_LIST_LOAD:
            return {
                ...state,
                loadingDraftList: true
            };

        case COMPOSE_DRAFT_LIST_LOADED:
            return {
                ...state,
                draftList: sortDraftList(action.payload.draftList.map(buildDraftInfo)),
                loadingDraftList: false,
                loadedDraftList: true
            };

        case COMPOSE_DRAFT_LIST_LOAD_FAILED:
            return {
                ...state,
                loadingDraftList: false
            };

        case COMPOSE_DRAFT_SELECT:
            return {
                ...state,
                ...emptyPosting,
                draftId: action.payload.id
            };

        case COMPOSE_DRAFT_LIST_ITEM_SET:
            if (state.loadedDraftList) {
                return {
                    ...state,
                    draftList: appendToDraftList(state.draftList, action.payload.draft)
                };
            } else {
                return state;
            }

        case COMPOSE_DRAFT_LIST_ITEM_DELETED: {
            if (!state.loadedDraftList && (state.postingId != null || state.draftId !== action.payload.id)) {
                return state;
            }
            let result;
            if (state.postingId == null && state.draftId === action.payload.id) {
                result = {
                    ...state,
                    ...emptyPosting
                }
            } else {
                result = {
                    ...state
                }
            }
            if (state.loadedDraftList) {
                result.draftList = state.draftList.filter(d => d.id !== action.payload.id);
            }
            return result;
        }

        case COMPOSE_DRAFT_UNSET:
            return {
                ...state,
                posting: null,
                draftId: null,
                draft: null,
                loadingDraft: false,
                savingDraft: false,
                savedDraft: false
            };

        case COMPOSE_PREVIEW:
            return {
                ...state,
                showPreview: true
            };

        case COMPOSE_PREVIEW_CLOSE:
            return {
                ...state,
                showPreview: false
            };

        case COMPOSE_SHARED_TEXT_SET:
            return {
                ...state,
                sharedText: action.payload.text,
                sharedTextType: action.payload.type
            };

        default:
            return state;
    }
}
