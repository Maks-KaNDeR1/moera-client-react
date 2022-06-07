import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { format, formatDistanceToNow, fromUnixTime } from 'date-fns';

import { PostingInfo, PrincipalValue } from "api/node/api-types";
import { ClientState } from "state/state";
import { postingOperationsUpdate } from "state/postings/actions";
import { getSetting } from "state/settings/selectors";
import { Principal, PrincipalSelect } from "ui/control";
import "./PostingVisibility.css";

type Props = {
    posting: PostingInfo;
    editable: boolean;
} & ConnectedProps<typeof connector>;

const PostingVisibility = ({posting, editable, timeRelative, postingOperationsUpdate}: Props) => {
    const onChange = (value: PrincipalValue) => postingOperationsUpdate(posting.id, "", {view: value});

    const value = posting.receiverOperations?.view ?? posting.operations?.view;
    let deletionDate = "";
    if (posting.receiverDeletedAt != null) {
        const date = fromUnixTime(posting.receiverDeletedAt);
        deletionDate = timeRelative ? formatDistanceToNow(date) : format(date, "dd-MM-yyyy HH:mm")
    }

    return (
        <span className="visibility">
            &middot;
            {editable ?
                <PrincipalSelect value={value} values={["public", "signed", "private"]} onChange={onChange}/>
            :
                (posting.receiverDeletedAt == null ?
                    <Principal value={value}/>
                :
                    <span className="principal text-danger opacity-75" title={`Original deleted ${deletionDate}`}>
                        <FontAwesomeIcon icon="trash-can"/>
                    </span>
                )
            }
        </span>
    );
}

const connector = connect(
    (state: ClientState) => ({
        timeRelative: getSetting(state, "posting.time.relative") as boolean
    }),
    { postingOperationsUpdate }
);

export default connector(PostingVisibility);
