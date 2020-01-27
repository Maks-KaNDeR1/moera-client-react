import {
    COMPOSE_CONFLICT,
    COMPOSE_CONFLICT_CLOSE,
    COMPOSE_FEATURES_LOAD,
    COMPOSE_FEATURES_LOAD_FAILED,
    COMPOSE_FEATURES_LOADED,
    COMPOSE_FEATURES_UNSET,
    COMPOSE_POST,
    COMPOSE_POST_FAILED,
    COMPOSE_POST_SUCCEEDED,
    COMPOSE_POSTING_LOAD,
    COMPOSE_POSTING_LOAD_FAILED,
    COMPOSE_POSTING_LOADED
} from "state/compose/actions";
import { GO_TO_PAGE } from "state/navigation/actions";
import { PAGE_COMPOSE } from "state/navigation/pages";

const emptyFeatures = {
    subjectPresent: false,
    sourceFormats: []
};

const initialState = {
    loadingFeatures: false,
    loadedFeatures: false,
    ...emptyFeatures,
    postingId: null,
    posting: null,
    loadingPosting: false,
    conflict: false,
    beingPosted: false
};

export default (state = initialState, action) => {
    switch (action.type) {
        case GO_TO_PAGE:
            if (action.payload.page === PAGE_COMPOSE) {
                return {
                    ...state,
                    postingId: action.payload.details.id,
                    posting: null,
                    conflict: false
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
                ...emptyFeatures,
                ...action.payload.features
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
                ...emptyFeatures
            };

        case COMPOSE_POSTING_LOAD:
            return {
                ...state,
                loadingPosting: true
            };

        case COMPOSE_POSTING_LOADED:
            return {
                ...state,
                posting: action.payload.posting,
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

        default:
            return state;
    }
}