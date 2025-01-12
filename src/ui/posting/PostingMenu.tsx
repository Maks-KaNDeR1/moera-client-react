import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { PostingInfo } from "api/node/api-types";
import { ClientState } from "state/state";
import { goToCompose } from "state/navigation/actions";
import { confirmBox } from "state/confirmbox/actions";
import {
    postingCommentAddedBlock,
    postingCommentAddedUnblock,
    postingCommentsSubscribe,
    postingCommentsUnsubscribe,
    postingCopyLink,
    postingDelete
} from "state/postings/actions";
import { postingReply } from "state/postingreply/actions";
import { storyPinningUpdate } from "state/stories/actions";
import { openChangeDateDialog } from "state/changedatedialog/actions";
import { openSourceDialog } from "state/sourcedialog/actions";
import { shareDialogPrepare } from "state/sharedialog/actions";
import { entryCopyText } from "state/entrycopytextdialog/actions";
import { getHomeOwnerName } from "state/home/selectors";
import { getNodeRootLocation, getOwnerName, isPermitted } from "state/node/selectors";
import { getPostingCommentAddedInstantBlockId, getPostingCommentsSubscriptionId } from "state/postings/selectors";
import { MinimalStoryInfo } from "ui/types";
import { DropdownMenu } from "ui/control";
import "ui/entry/EntryMenu.css";

interface OwnProps {
    posting: PostingInfo;
    story: MinimalStoryInfo;
}

type Props = OwnProps & ConnectedProps<typeof connector>;

function PostingMenu({
     posting, story, rootLocation, nodeOwnerName, homeOwnerName, commentsSubscriptionId, commentAddedInstantBlockId,
     postingEditable, postingDeletable, storyEditable, goToCompose, confirmBox, storyPinningUpdate,
     openChangeDateDialog, postingCopyLink, postingReply, postingCommentsSubscribe, postingCommentsUnsubscribe,
     postingCommentAddedBlock, postingCommentAddedUnblock, openSourceDialog, shareDialogPrepare, entryCopyText
}: Props) {
    const {t} = useTranslation();

    const onCopyLink = () => postingCopyLink(posting.id);

    const onCopyText = () => entryCopyText(posting.body, "ask", posting.receiverName ?? "", posting.media ?? null);

    const onShare = () => {
        const originalDeleted = posting.receiverDeletedAt != null;
        const nodeName = originalDeleted ? (nodeOwnerName ?? "") : (posting.receiverName ?? posting.ownerName);
        const postingId = originalDeleted ? posting.id : (posting.receiverPostingId ?? posting.id);
        const href = `/post/${postingId}`;

        shareDialogPrepare(nodeName, href);
    };

    const onReply = () => postingReply(posting.id);

    const onEdit = () => goToCompose(posting.id);

    const ownPosting = (posting.receiverName ?? posting.ownerName) === homeOwnerName;
    const followingComments = ownPosting ? commentAddedInstantBlockId == null : commentsSubscriptionId != null;

    const onFollowComments = () => {
        if (ownPosting) {
            postingCommentAddedUnblock(posting.id);
        } else {
            postingCommentsSubscribe(posting.id);
        }
    }

    const onUnfollowComments = () => {
        if (ownPosting) {
            postingCommentAddedBlock(posting.id);
        } else {
            postingCommentsUnsubscribe(posting.id);
        }
    }

    const onDelete = () => {
        confirmBox(`Do you really want to delete the post "${posting.heading}"?`, "Delete", "Cancel",
            postingDelete(posting.id), null, "danger");
    };

    const onPin = () => storyPinningUpdate(story.id, !story.pinned);

    const onChangeDate = () => openChangeDateDialog(story.id, story.publishedAt);

    const onViewSource = () => {
        if (posting.receiverName == null) {
            openSourceDialog("", posting.id);
        } else {
            if (posting.receiverPostingId != null) {
                openSourceDialog(posting.receiverName, posting.receiverPostingId);
            }
        }
    };

    const postingHref = `${rootLocation}/moera/post/${posting.id}`;
    return (
        <DropdownMenu items={[
            {
                title: t("copy-link"),
                href: postingHref,
                onClick: onCopyLink,
                show: true
            },
            {
                title: t("copy-text"),
                href: postingHref,
                onClick: onCopyText,
                show: true
            },
            {
                title: t("share-ellipsis"),
                href: postingHref,
                onClick: onShare,
                show: true
            },
            {
                title: t("reply-ellipsis"),
                href: `${rootLocation}/moera/compose`,
                onClick: onReply,
                show: true
            },
            {
                title: t("follow-comments"),
                href: postingHref,
                onClick: onFollowComments,
                show: !followingComments
            },
            {
                title: t("unfollow-comments"),
                href: postingHref,
                onClick: onUnfollowComments,
                show: followingComments
            },
            {
                divider: true
            },
            {
                title: t("edit-ellipsis"),
                href: `${rootLocation}/moera/compose?id=${posting.id}`,
                onClick: onEdit,
                show: postingEditable
            },
            {
                title: story != null && !story.pinned ? t("pin") : t("unpin"),
                href: postingHref,
                onClick: onPin,
                show: story != null && storyEditable
            },
            {
                title: t("change-date-time-ellipsis"),
                href: postingHref,
                onClick: onChangeDate,
                show: posting.receiverName == null && storyEditable
            },
            {
                divider: true
            },
            {
                title: t("view-source"),
                href: postingHref,
                onClick: onViewSource,
                show: true
            },
            {
                title: t("delete"),
                href: postingHref,
                onClick: onDelete,
                show: postingDeletable
            }
        ]}/>
    );
}

const connector = connect(
    (state: ClientState, ownProps: OwnProps) => ({
        rootLocation: getNodeRootLocation(state),
        nodeOwnerName: getOwnerName(state),
        homeOwnerName: getHomeOwnerName(state),
        commentsSubscriptionId: getPostingCommentsSubscriptionId(state, ownProps.posting.id),
        commentAddedInstantBlockId: getPostingCommentAddedInstantBlockId(state, ownProps.posting.id),
        postingEditable: isPermitted("edit", ownProps.posting, "owner", state),
        postingDeletable: isPermitted("delete", ownProps.posting, "private", state),
        storyEditable: isPermitted("edit", ownProps.story, "admin", state)
    }),
    {
        goToCompose, confirmBox, storyPinningUpdate, openChangeDateDialog, postingCopyLink, postingReply,
        postingCommentsSubscribe, postingCommentsUnsubscribe, postingCommentAddedBlock, postingCommentAddedUnblock,
        openSourceDialog, shareDialogPrepare, entryCopyText
    }
);

export default connector(PostingMenu);
