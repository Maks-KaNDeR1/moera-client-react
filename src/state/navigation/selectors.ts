import {
    PAGE_COMPOSE,
    PAGE_DETAILED_POSTING,
    PAGE_NEWS,
    PAGE_PEOPLE,
    PAGE_PROFILE,
    PAGE_SETTINGS,
    PAGE_TIMELINE
} from "state/navigation/pages";
import { isAtNode } from "state/node/selectors";
import { ClientState } from "state/state";

export function isStandaloneMode(state: ClientState): boolean {
    return state.navigation.standalone;
}

export function isAtTimelinePage(state: ClientState): boolean {
    return isAtNode(state) && state.navigation.page === PAGE_TIMELINE;
}

export function isAtProfilePage(state: ClientState): boolean {
    return isAtNode(state) && state.navigation.page === PAGE_PROFILE;
}

export function isAtDetailedPostingPage(state: ClientState): boolean {
    return isAtNode(state) && state.navigation.page === PAGE_DETAILED_POSTING;
}

export function isAtComposePage(state: ClientState): boolean {
    return isAtNode(state) && state.navigation.page === PAGE_COMPOSE;
}

export function isAtSettingsPage(state: ClientState): boolean {
    return isAtNode(state) && state.navigation.page === PAGE_SETTINGS;
}

export function isAtNewsPage(state: ClientState): boolean {
    return isAtNode(state) && state.navigation.page === PAGE_NEWS;
}

export function isAtPeoplePage(state: ClientState): boolean {
    return isAtNode(state) && state.navigation.page === PAGE_PEOPLE;
}

export function isBottomMenuVisible(state: ClientState): boolean {
    return state.navigation.bottomMenuVisible;
}
