import immutable from 'object-path-immutable';

import { DISCONNECT_FROM_HOME } from "state/home/actions";
import {
    SETTINGS_CLIENT_CONFLICT,
    SETTINGS_CLIENT_CONFLICT_CLOSE,
    SETTINGS_CLIENT_VALUES_LOAD,
    SETTINGS_CLIENT_VALUES_LOAD_FAILED,
    SETTINGS_CLIENT_VALUES_LOADED, SETTINGS_GO_TO_SHEET,
    SETTINGS_GO_TO_TAB,
    SETTINGS_NODE_CONFLICT,
    SETTINGS_NODE_CONFLICT_CLOSE,
    SETTINGS_NODE_META_LOAD,
    SETTINGS_NODE_META_LOAD_FAILED,
    SETTINGS_NODE_META_LOADED, SETTINGS_NODE_META_UNSET,
    SETTINGS_NODE_VALUES_LOAD,
    SETTINGS_NODE_VALUES_LOAD_FAILED,
    SETTINGS_NODE_VALUES_LOADED, SETTINGS_NODE_VALUES_UNSET,
    SETTINGS_UPDATE,
    SETTINGS_UPDATE_FAILED,
    SETTINGS_UPDATE_SUCCEEDED
} from "state/settings/actions";
import { ClientSettings } from "api";

const emptySettings = {
    node: {
        loadingValues: false,
        loadedValues: false,
        conflict: false,
        values: new Map(),
        loadingMeta: false,
        loadedMeta: false,
        meta: new Map()
    },
    client: {
        loadingValues: false,
        loadedValues: false,
        conflict: false,
        values: new Map(),
        meta: ClientSettings.buildMetaMap()
    },
    updating: false
};

const initialState = {
    tab: "node",
    sheet: "posting",
    ...emptySettings
};

export default (state = initialState, action) => {
    switch (action.type) {
        case SETTINGS_GO_TO_TAB:
            return immutable(state)
                .set("tab", action.payload.tab)
                .set("node.conflict", false)
                .set("client.conflict", false)
                .value();

        case SETTINGS_GO_TO_SHEET:
            return immutable(state)
                .set("sheet", action.payload.sheet)
                .set("node.conflict", false)
                .set("client.conflict", false)
                .value();

        case DISCONNECT_FROM_HOME:
            return {
                ...state,
                ...emptySettings
            };

        case SETTINGS_NODE_VALUES_LOAD:
            return immutable(state).set("node.loadingValues", true).value();

        case SETTINGS_NODE_VALUES_LOADED: {
            let values = new Map();
            action.payload.settings.forEach(({name, value}) => values.set(name, value));
            return immutable(state)
                .set("node.loadingValues", false)
                .set("node.loadedValues", true)
                .set("node.values", values)
                .value();
        }

        case SETTINGS_NODE_VALUES_LOAD_FAILED:
            return immutable(state).set("node.loadingValues", false).value();

        case SETTINGS_NODE_VALUES_UNSET:
            return immutable(state)
                .set("node.loadingValues", false)
                .set("node.loadedValues", false)
                .set("node.conflict", false)
                .set("node.values", new Map())
                .value();

        case SETTINGS_NODE_CONFLICT:
            return immutable(state).set("node.conflict", true).value();

        case SETTINGS_NODE_CONFLICT_CLOSE:
            return immutable(state).set("node.conflict", false).value();

        case SETTINGS_NODE_META_LOAD:
            return immutable(state).set("node.loadingMeta", true).value();

        case SETTINGS_NODE_META_LOADED: {
            let metadata = new Map();
            action.payload.meta.forEach(meta => metadata.set(meta.name, meta));
            return immutable(state)
                .set("node.loadingMeta", false)
                .set("node.loadedMeta", true)
                .set("node.meta", metadata)
                .value();
        }

        case SETTINGS_NODE_META_LOAD_FAILED:
            return immutable(state).set("node.loadingMeta", false).value();

        case SETTINGS_NODE_META_UNSET:
            return immutable(state)
                .set("node.loadingMeta", false)
                .set("node.loadedMeta", false)
                .set("node.meta", new Map())
                .value();

        case SETTINGS_CLIENT_VALUES_LOAD:
            return immutable(state).set("client.loadingValues", true).value();

        case SETTINGS_CLIENT_VALUES_LOADED: {
            let values = new Map();
            action.payload.settings.forEach(({name, value}) => values.set(name, value));
            return immutable(state)
                .set("client.loadingValues", false)
                .set("client.loadedValues", true)
                .set("client.values", values)
                .value();
        }

        case SETTINGS_CLIENT_VALUES_LOAD_FAILED:
            return immutable(state).set("client.loadingValues", false).value();

        case SETTINGS_CLIENT_CONFLICT:
            return immutable(state).set("client.conflict", true).value();

        case SETTINGS_CLIENT_CONFLICT_CLOSE:
            return immutable(state).set("client.conflict", false).value();

        case SETTINGS_UPDATE:
            return {
                ...state,
                updating: true
            };

        case SETTINGS_UPDATE_SUCCEEDED:
            let nodeValues = new Map(state.node.values);
            let clientValues = new Map(state.client.values);
            action.payload.settings.forEach(({name, value}) => {
                if (name.startsWith(ClientSettings.PREFIX)) {
                    clientValues.set(name, value);
                } else {
                    nodeValues.set(name, value);
                }
            });
            return immutable(state)
                .set("node.conflict", false)
                .set("client.conflict", false)
                .set("node.values", nodeValues)
                .set("client.values", clientValues)
                .set("updating", false)
                .value();

        case SETTINGS_UPDATE_FAILED:
            return {
                ...state,
                updating: false
            };

        default:
            return state;
    }
}
