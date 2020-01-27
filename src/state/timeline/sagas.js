import { call, put, select } from 'redux-saga/effects';

import { Node } from "api";
import {
    timelineFutureSliceLoadFailed,
    timelineFutureSliceSet,
    timelineGeneralLoadFailed,
    timelineGeneralSet,
    timelinePastSliceLoadFailed,
    timelinePastSliceSet
} from "state/timeline/actions";
import { errorThrown } from "state/error/actions";
import { namingNameUsed } from "state/naming/actions";

export function* timelineGeneralLoadSaga() {
    try {
        const data = yield call(Node.getTimelineGeneral);
        yield put(timelineGeneralSet(data));
    } catch (e) {
        yield put(timelineGeneralLoadFailed());
        yield put(errorThrown(e));
    }
}

export function* timelinePastSliceLoadSaga() {
    try {
        const before = yield select(state => state.timeline.after);
        const data = yield call(Node.getTimelineSlice, null, before, 20);
        yield put(timelinePastSliceSet(data.postings, data.before, data.after));
        yield call(cacheNames, data.postings);
    } catch (e) {
        yield put(timelinePastSliceLoadFailed());
        yield put(errorThrown(e));
    }
}

export function* timelineFutureSliceLoadSaga() {
    try {
        const after = yield select(state => state.timeline.before);
        const data = yield call(Node.getTimelineSlice, after, null, 20);
        yield put(timelineFutureSliceSet(data.postings, data.before, data.after));
        yield call(cacheNames, data.postings);
    } catch (e) {
        yield put(timelineFutureSliceLoadFailed());
        yield put(errorThrown(e));
    }
}

function* cacheNames(postings) {
    if (!postings) {
        return;
    }
    const usedNames = new Set();
    postings.forEach(p => {
        usedNames.add(p.ownerName);
        usedNames.add(p.receiverName);
    });
    for (let name of usedNames) {
        yield put(namingNameUsed(name));
    }
}