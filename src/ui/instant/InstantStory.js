import React from 'react';
import { connect } from 'react-redux';

import cx from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { formatDistanceToNow, fromUnixTime } from 'date-fns';

import InstantIcon from "ui/instant/InstantIcon";
import Jump from "ui/navigation/Jump";
import { storyReadingUpdate } from "state/stories/actions";
import { getInstantTarget } from "ui/instant/instant-types";
import InstantHtml from "ui/instant/InstantHtml";
import "./InstantStory.css";

function InstantStory({story, lastNew, hide, storyReadingUpdate}) {
    const onJump = (href, performJump) => {
        hide();
        performJump();
        if (!story.read) {
            storyReadingUpdate(":instant", story.id, true);
        }
    }

    const onEnvelope = () => storyReadingUpdate(":instant", story.id, !story.read);

    const {nodeName, href} = getInstantTarget(story);

    return (
        <div className={cx("instant", {"unread": !story.read, "last-new": lastNew})}>
            <div className="cursor">
                <Jump nodeName={nodeName} href={href} trackingId={story.read ? null : story.trackingId}
                      onNear={onJump} onFar={onJump}>
                    <InstantHtml html={story.summary}/>
                    <div className="footer">
                        <InstantIcon story={story}/>
                        <span className="date">{formatDistanceToNow(fromUnixTime(story.publishedAt))}</span>
                    </div>
                </Jump>
                <div className="sidebar">
                    <span className="envelope" title={story.read ? "Mark as Unread" : "Mark as Read"}
                          onClick={onEnvelope}>
                        <FontAwesomeIcon icon={["far", story.read ? "envelope-open" : "envelope"]}/>
                    </span>
                </div>
            </div>
        </div>
    );
}

export default connect(
    state => ({
        pulse: state.pulse.pulse // To force re-rendering only
    }),
    { storyReadingUpdate }
)(InstantStory);
