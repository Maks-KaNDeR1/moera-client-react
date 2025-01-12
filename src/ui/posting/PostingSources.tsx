import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cx from 'classnames';
import { TFunction, useTranslation } from 'react-i18next';

import { PostingInfo } from "api/node/api-types";
import Jump from "ui/navigation/Jump";
import NodeName from "ui/nodename/NodeName";
import { getFeedTitle } from "ui/feed/feeds";
import "./PostingSources.css";

interface Props {
    posting: PostingInfo;
}

const PostingSources = ({posting}: Props) => {
    const {t} = useTranslation();

    return (
        <div className="posting-sources">
            <div className="title">{t("where-from")}</div>
            {sourcesList(posting, t).map((line, index) =>
                <div className="source" key={index}>
                <span className={cx("icon", {"original": line.original})}>
                    <FontAwesomeIcon icon={line.original ? "star" : "share-square"}/>
                </span>
                    <Jump nodeName={line.nodeName} href={`/post/${line.postingId}`}>
                        <NodeName name={line.nodeName} fullName={line.fullName} linked={false} popup={false}/>
                        {" "}{t("in")} {line.feedTitle}
                    </Jump>
                </div>
            )}
        </div>
    );
}

interface SourcesLine {
    nodeName: string | null;
    fullName: string | null;
    feedTitle: string;
    postingId: string | null;
    original: boolean;
}

function sourcesList(posting: PostingInfo, t: TFunction): SourcesLine[] {
    if (posting.sources == null) {
        return [];
    }

    const list: SourcesLine[] = posting.sources
        .filter(sr => sr.nodeName !== posting.receiverName || sr.postingId !== posting.receiverPostingId)
        .sort((sr1, sr2) => sr1.createdAt - sr2.createdAt)
        .map(sr => ({
            nodeName: sr.nodeName,
            fullName: sr.fullName ?? null,
            feedTitle: getFeedTitle(sr.feedName, t),
            postingId: sr.postingId,
            original: false
        }));

    const receiverFeedName = posting.sources
        .find(sr => sr.nodeName === posting.receiverName && sr.postingId === posting.receiverPostingId)
        ?.feedName;
    if (receiverFeedName != null) {
        list.unshift({
            nodeName: posting.receiverName ?? null,
            fullName: posting.receiverFullName ?? null,
            feedTitle: getFeedTitle(receiverFeedName, t),
            postingId: posting.receiverPostingId ?? null,
            original: true
        });
    }

    return list;
}

export default PostingSources;
