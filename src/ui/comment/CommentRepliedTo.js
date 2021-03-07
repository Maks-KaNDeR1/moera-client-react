import React from 'react';
import { connect } from 'react-redux';

import { getDetailedPostingId } from "state/detailedposting/selectors";
import RepliedTo from "ui/comment/RepliedTo";

const CommentRepliedTo = ({comment, postingId}) => (
    comment.repliedTo ?
        <RepliedTo postingId={postingId} commentId={comment.repliedTo.id} ownerName={comment.repliedTo.name}
                   ownerFullName={comment.repliedTo.fullName} headingHtml={comment.repliedTo.headingHtml}
                   unset={false}/>
    :
        null
);

export default connect(
    state => ({
        postingId: getDetailedPostingId(state)
    })
)(CommentRepliedTo);
