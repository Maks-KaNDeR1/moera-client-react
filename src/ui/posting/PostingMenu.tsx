import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { DropdownMenu } from "ui/control";
import { goToCompose } from "state/navigation/actions";
import { confirmBox } from "state/confirmbox/actions";
import {
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
import { getNodeRootLocation, ProtectedObject } from "state/node/selectors";
import { ClientState } from "state/state";
import { PostingInfo } from "api/node/api-types";
import { MinimalStoryInfo } from "ui/types";
import "ui/entry/EntryMenu.css";

type Props = {
    posting: PostingInfo;
    story: MinimalStoryInfo;
    isPermitted: (operation: string, object: ProtectedObject) => boolean | null;
} & ConnectedProps<typeof connector>;

class PostingMenu extends React.PureComponent<Props> {

    onCopyLink = () => {
        const {posting, postingCopyLink} = this.props;

        postingCopyLink(posting.id);
    };

    onCopyText = () => {
        const {posting, entryCopyText} = this.props;

        entryCopyText(posting.body, "ask", posting.receiverName ?? "", posting.media ?? null);
    };

    onShare = () => {
        const {posting, shareDialogPrepare} = this.props;

        const nodeName = posting.receiverName ?? posting.ownerName;
        const postingId = posting.receiverPostingId ?? posting.id;
        const href = `/post/${postingId}`;

        shareDialogPrepare(nodeName, href);
    };

    onReply = () => {
        const {posting, postingReply} = this.props;

        postingReply(posting.id);
    };

    onEdit = () => {
        const {posting, goToCompose} = this.props;

        goToCompose(posting.id);
    };

    onFollowComments = () => {
        const {posting, postingCommentsSubscribe} = this.props;

        postingCommentsSubscribe(posting.id);
    };

    onUnfollowComments = () => {
        const {posting, postingCommentsUnsubscribe} = this.props;

        postingCommentsUnsubscribe(posting.id);
    };

    onDelete = () => {
        const {posting, confirmBox} = this.props;

        confirmBox(`Do you really want to delete the post "${posting.heading}"?`, "Delete", "Cancel",
            postingDelete(posting.id), null, "danger");
    };

    onPin = () => {
        const {story, storyPinningUpdate} = this.props;

        storyPinningUpdate(story.id, !story.pinned);
    };

    onChangeDate = () => {
        const {story, openChangeDateDialog} = this.props;

        openChangeDateDialog(story.id, story.publishedAt);
    };

    onViewSource = () => {
        const {posting, openSourceDialog} = this.props;

        if (posting.receiverName == null) {
            openSourceDialog("", posting.id);
        } else {
            if (posting.receiverPostingId != null) {
                openSourceDialog(posting.receiverName, posting.receiverPostingId);
            }
        }
    };

    render() {
        const {posting, story, isPermitted, rootLocation, homeOwnerName} = this.props;

        const postingHref = `${rootLocation}/moera/post/${posting.id}`;
        return (
            <DropdownMenu items={[
                {
                    title: "Copy link",
                    href: postingHref,
                    onClick: this.onCopyLink,
                    show: true
                },
                {
                    title: "Copy text",
                    href: postingHref,
                    onClick: this.onCopyText,
                    show: true
                },
                {
                    title: "Share...",
                    href: postingHref,
                    onClick: this.onShare,
                    show: true
                },
                {
                    title: "Reply...",
                    href: `${rootLocation}/moera/compose`,
                    onClick: this.onReply,
                    show: true
                },
                {
                    title: "Follow comments",
                    href: postingHref,
                    onClick: this.onFollowComments,
                    show: posting.ownerName !== homeOwnerName && posting.subscriptions?.comments == null
                },
                {
                    title: "Unfollow comments",
                    href: postingHref,
                    onClick: this.onUnfollowComments,
                    show: posting.ownerName !== homeOwnerName && posting.subscriptions?.comments != null
                },
                {
                    divider: true
                },
                {
                    title: "Edit...",
                    href: `${rootLocation}/moera/compose?id=${posting.id}`,
                    onClick: this.onEdit,
                    show: isPermitted("edit", posting) ?? false
                },
                {
                    title: story != null && !story.pinned ? "Pin" : "Unpin",
                    href: postingHref,
                    onClick: this.onPin,
                    show: story != null && (isPermitted("edit", story) ?? false)
                },
                {
                    title: "Change date/time...",
                    href: postingHref,
                    onClick: this.onChangeDate,
                    show: posting.receiverName == null && (isPermitted("edit", story) ?? false)
                },
                {
                    divider: true
                },
                {
                    title: "View source",
                    href: postingHref,
                    onClick: this.onViewSource,
                    show: true
                },
                {
                    title: "Delete",
                    href: postingHref,
                    onClick: this.onDelete,
                    show: isPermitted("delete", posting) ?? false
                }
            ]}/>
        );
    }

}

const connector = connect(
    (state: ClientState) => ({
        rootLocation: getNodeRootLocation(state),
        homeOwnerName: getHomeOwnerName(state)
    }),
    {
        goToCompose, confirmBox, storyPinningUpdate, openChangeDateDialog, postingCopyLink, postingReply,
        postingCommentsSubscribe, postingCommentsUnsubscribe, openSourceDialog, shareDialogPrepare, entryCopyText
    }
);

export default connector(PostingMenu);
