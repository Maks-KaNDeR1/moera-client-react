import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { PostingInfo } from "api/node/api-types";
import { ClientState } from "state/state";
import { getOwnerName } from "state/owner/selectors";
import { shareDialogPrepare } from "state/sharedialog/actions";
import { ut } from "util/url";

type Props = {
    posting: PostingInfo;
} & ConnectedProps<typeof connector>;

function PostingShareButton({posting, ownerName, shareDialogPrepare}: Props) {
    const nodeName = posting.receiverName ?? ownerName ?? "";
    const postingId = posting.receiverPostingId ?? posting.id;
    const href = ut`/post/${postingId}`;
    return (
        <button className="posting-button" onClick={() => shareDialogPrepare(nodeName, href)}>
            <FontAwesomeIcon icon="share-alt"/>
            <span className="caption">Share</span>
        </button>
    );
}

const connector = connect(
    (state: ClientState) => ({
        ownerName: getOwnerName(state)
    }),
    { shareDialogPrepare }
);

export default connector(PostingShareButton);
