import { trigger } from "state/trigger";
import { CONNECTED_TO_HOME, homeOwnerSet, homeOwnerVerify } from "state/home/actions";
import { EVENT_HOME_NODE_NAME_CHANGED } from "api/events/actions";

export default [
    trigger(CONNECTED_TO_HOME, true, homeOwnerVerify),
    trigger(EVENT_HOME_NODE_NAME_CHANGED, true, signal => homeOwnerSet(signal.payload.name)),
    trigger(EVENT_HOME_NODE_NAME_CHANGED, true, homeOwnerVerify),
];
