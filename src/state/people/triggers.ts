import { conj, inv, trigger } from "state/trigger";
import { CONNECTED_TO_HOME, DISCONNECTED_FROM_HOME } from "state/home/actions";
import { GO_TO_PAGE, newLocation } from "state/navigation/actions";
import { isAtPeoplePage } from "state/navigation/selectors";
import {
    isAtFriendOfsTab,
    isAtFriendsTab,
    isAtSubscribersTab,
    isAtSubscriptionsTab,
    isFriendOfsToBeLoaded,
    isFriendOfsTotalVisible,
    isFriendOfsVisible,
    isFriendsToBeLoaded,
    isFriendsTotalVisible,
    isFriendsVisible,
    isPeopleGeneralToBeLoaded,
    isSubscribersToBeLoaded,
    isSubscribersTotalVisible,
    isSubscribersVisible,
    isSubscriptionsToBeLoaded,
    isSubscriptionsTotalVisible,
    isSubscriptionsVisible
} from "state/people/selectors";
import {
    friendOfsLoad,
    friendsLoad,
    PEOPLE_GENERAL_LOADED,
    PEOPLE_GO_TO_TAB,
    peopleGeneralLoad,
    peopleGeneralUnset, peopleGoToDefaultTab,
    peopleGoToTab,
    peopleUnset,
    subscribersLoad,
    subscriptionsLoad
} from "state/people/actions";
import { FEED_SUBSCRIBED, FEED_UNSUBSCRIBED } from "state/feeds/actions";
import {
    EVENT_NODE_SUBSCRIBER_ADDED,
    EVENT_NODE_SUBSCRIBER_DELETED,
    EVENT_NODE_SUBSCRIPTION_ADDED,
    EVENT_NODE_SUBSCRIPTION_DELETED
} from "api/events/actions";

export default [
    trigger(GO_TO_PAGE, conj(isAtPeoplePage, isPeopleGeneralToBeLoaded), peopleGeneralLoad),
    trigger(PEOPLE_GO_TO_TAB, true, newLocation),
    trigger(PEOPLE_GO_TO_TAB, conj(isAtSubscribersTab, isSubscribersToBeLoaded), subscribersLoad),
    trigger(PEOPLE_GO_TO_TAB, conj(isAtSubscriptionsTab, isSubscriptionsToBeLoaded), subscriptionsLoad),
    trigger(PEOPLE_GO_TO_TAB, conj(isAtFriendsTab, isFriendsToBeLoaded), friendsLoad),
    trigger(PEOPLE_GO_TO_TAB, conj(isAtFriendOfsTab, isFriendOfsToBeLoaded), friendOfsLoad),
    trigger(PEOPLE_GENERAL_LOADED, isAtPeoplePage, peopleGoToDefaultTab),
    trigger([CONNECTED_TO_HOME, DISCONNECTED_FROM_HOME], isAtPeoplePage, peopleGeneralLoad),
    trigger([CONNECTED_TO_HOME, DISCONNECTED_FROM_HOME], true, peopleUnset),
    trigger(
        [CONNECTED_TO_HOME, DISCONNECTED_FROM_HOME],
        conj(isAtPeoplePage, isAtSubscribersTab),
        subscribersLoad
    ),
    trigger(
        [CONNECTED_TO_HOME, DISCONNECTED_FROM_HOME],
        conj(isAtPeoplePage, isAtSubscriptionsTab),
        subscriptionsLoad
    ),
    trigger(
        [CONNECTED_TO_HOME, DISCONNECTED_FROM_HOME],
        conj(isAtPeoplePage, isAtFriendsTab),
        friendsLoad
    ),
    trigger(
        [CONNECTED_TO_HOME, DISCONNECTED_FROM_HOME],
        conj(isAtPeoplePage, isAtFriendOfsTab),
        friendOfsLoad
    ),
    trigger(
        [FEED_SUBSCRIBED, FEED_UNSUBSCRIBED, EVENT_NODE_SUBSCRIBER_ADDED, EVENT_NODE_SUBSCRIBER_DELETED,
         EVENT_NODE_SUBSCRIPTION_ADDED, EVENT_NODE_SUBSCRIPTION_DELETED],
        isAtPeoplePage,
        peopleGeneralLoad
    ),
    trigger(
        [FEED_SUBSCRIBED, FEED_UNSUBSCRIBED, EVENT_NODE_SUBSCRIBER_ADDED, EVENT_NODE_SUBSCRIBER_DELETED,
         EVENT_NODE_SUBSCRIPTION_ADDED, EVENT_NODE_SUBSCRIPTION_DELETED],
        inv(isAtPeoplePage),
        peopleGeneralUnset
    )
];
