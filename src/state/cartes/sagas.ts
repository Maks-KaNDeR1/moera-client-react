import { call, put } from 'typed-redux-saga/macro';

import { NodeApiError } from "api";
import { errorThrown } from "state/error/actions";
import { CARTES_LOAD, cartesSet, CLOCK_OFFSET_WARN } from "state/cartes/actions";
import { Browser } from "ui/browser";
import { executor } from "state/executor";
import { messageBox } from "state/messagebox/actions";
import { now } from "util/misc";
import { getCartes } from "api/node/cartes";

export default [
    executor(CARTES_LOAD, "", cartesLoadSaga),
    executor(CLOCK_OFFSET_WARN, "", clockOffsetWarnSaga)
];

function* cartesLoadSaga() {
    try {
        const {cartesIp, cartes, createdAt} = yield* call(getCartes, ":");
        Browser.storeCartesData(cartesIp, cartes);
        yield* put(cartesSet(cartesIp, cartes, createdAt - now()));
    } catch (e) {
        if (e instanceof NodeApiError) {
            yield* put(cartesSet(null, [], 0));
        } else {
            yield* put(errorThrown(e));
        }
    }
}

function* clockOffsetWarnSaga() {
    yield* put(messageBox(
        "<b>Warning:</b> Clock in your computer significantly differ from the real time. This may affect"
        + " cryptographic algorithms and cause problems for Moera client. It is recommended to turn clock"
        + " synchronization on in your operation system."));
}
