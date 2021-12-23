import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { format, formatDistanceToNow, formatISO, fromUnixTime } from 'date-fns';

import { ClientState } from "state/state";
import { CommentInfo } from "api/node/api-types";

type Props = {
    comment: CommentInfo;
} & ConnectedProps<typeof connector>;

function CommentUpdated({comment}: Props) {
    if (comment.totalRevisions <= 1) {
        return null;
    }

    const date = fromUnixTime(comment.editedAt ?? comment.createdAt);
    return (
        <time className="date" dateTime={formatISO(date)}>
            {" "}(updated <abbr title={format(date, "dd-MM-yyyy HH:mm")}>{formatDistanceToNow(date)}</abbr>)
        </time>
    );
}

const connector = connect(
    (state: ClientState) => ({
        pulse: state.pulse.pulse // To force re-rendering only
    })
);

export default connector(CommentUpdated);
