import { call, put, select } from 'redux-saga/effects';

import { errorThrown } from "state/error/actions";
import { Node } from "api";
import {
    composeFeaturesLoaded,
    composeFeaturesLoadFailed,
    composePostFailed,
    composePostingLoaded,
    composePostingLoadFailed,
    composePostSucceeded
} from "state/compose/actions";
import { getComposePostingId } from "state/compose/selectors";

export function* composeFeaturesLoadSaga() {
    try {
        const data = yield call(Node.getPostingFeatures);
        yield put(composeFeaturesLoaded(data));
    } catch (e) {
        yield put(composeFeaturesLoadFailed());
        yield put(errorThrown(e));
    }
}

export function* composePostingLoadSaga() {
    try {
        const id = yield select(getComposePostingId);
        const data = yield call(Node.getPosting, id, true);
        yield put(composePostingLoaded(data));
    } catch (e) {
        yield put(composePostingLoadFailed());
        yield put(errorThrown(e));
    }
}

export function* composePostSaga(action) {
    try {
        let data;
        if (action.payload.id == null) {
            data = yield call(Node.postPosting, action.payload.postingText);
        } else {
            data = yield call(Node.putPosting, action.payload.id, action.payload.postingText);
        }
        yield put(composePostSucceeded(data));
    } catch (e) {
        yield put(composePostFailed());
        yield put(errorThrown(e));
    }
}
