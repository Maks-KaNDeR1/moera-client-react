import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { TFunction, useTranslation } from 'react-i18next';

import { PostingInfo } from "api/node/api-types";
import { ClientState } from "state/state";
import { getDetailedPosting, isDetailedPostingBeingDeleted } from "state/detailedposting/selectors";
import { getPostingFeedReference } from "state/postings/selectors";
import { Loading } from "ui/control";
import { MinimalStoryInfo } from "ui/types";
import { Page } from "ui/page/Page";
import DetailedPostingPageHeader from "ui/detailedposting/DetailedPostingPageHeader";
import DetailedPosting from "ui/detailedposting/DetailedPosting";
import { getFeedTitle } from "ui/feed/feeds";
import "./DetailedPostingPage.css";

function getStory(posting: PostingInfo, feedName: string): MinimalStoryInfo | null {
    const feedReference = getPostingFeedReference(posting, feedName);
    if (feedReference == null) {
        return null;
    }
    return {
        id: feedReference.storyId,
        ...feedReference
    }
}

function getFeedAndStory(posting: PostingInfo | null, t: TFunction): {
    story: MinimalStoryInfo | null, href: string, feedTitle: string
} {
    if (posting == null) {
        return {story: null, href: "", feedTitle: ""};
    }

    let story = getStory(posting, "timeline");
    let href = "/timeline";
    let feedTitle = getFeedTitle("timeline", t);
    if (story == null) {
        story = getStory(posting, "news");
        href = "/news";
        feedTitle = getFeedTitle("news", t);
    }
    return {story, href, feedTitle};
}

type Props = ConnectedProps<typeof connector>;

function DetailedPostingPage({loading, deleting, posting}: Props) {
    const {t} = useTranslation();

    const {story = null, href, feedTitle} = getFeedAndStory(posting, t);
    const postingReady = posting != null && posting.parentMediaId == null;
    return (
        <>
            <DetailedPostingPageHeader story={story} href={href} feedTitle={feedTitle}/>
            <Page>
                {(postingReady && story) && <DetailedPosting posting={posting} story={story} deleting={deleting}/>}
                {!postingReady && loading &&
                    <div className="posting">
                        <Loading active={loading}/>
                    </div>
                }
                {!postingReady && !loading &&
                    <div className="posting-not-found">
                        <FontAwesomeIcon className="icon" icon="frown" size="3x"/>
                        <div className="message">{t("posting-not-found")}</div>
                    </div>
                }
            </Page>
        </>
    );
}

const connector = connect(
    (state: ClientState) => ({
        loading: state.detailedPosting.loading,
        deleting: isDetailedPostingBeingDeleted(state),
        posting: getDetailedPosting(state)
    })
);

export default connector(DetailedPostingPage);
