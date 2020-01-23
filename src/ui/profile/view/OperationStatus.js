import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import cx from 'classnames';

import "./OperationStatus.css";
import { Popover } from "ui/control";

const OperationStatus = ({status, statusUpdated, errorCode, errorMessage}) => {
    let text;
    let success = false;
    let failure = false;
    switch (status) {
        case "waiting":
            text = "Operation is waiting";
            break;
        case "added":
            text = "Operation has been added";
            break;
        case "started":
            text = "Operation has been started";
            break;
        case "succeeded":
            text = "Operation succeeded";
            success = true;
            break;
        case "failed":
            text = "Operation failed";
            failure = true;
            break;
        case "unknown":
            text = "Operation status is unknown";
            break;
        default:
            return null;
    }
    const dateTime = statusUpdated ? " at " + moment.unix(statusUpdated).format("DD-MM-YYYY HH:mm:ss") : "";
    return (
        <span className={cx(
            "naming-operation-status", {
                "success": success,
                "failure": failure
            }
            )}>
            {!failure && <>{text}</>}
            {failure &&
                <Popover text={text} textClassName="failure-reason">
                    Failure reason: {errorMessage ? errorMessage : errorCode}
                </Popover>
            }
            {dateTime}
        </span>
    );
};

export default connect(
    state => ({
        status: state.nodeName.operationStatus,
        statusUpdated: state.nodeName.operationStatusUpdated,
        errorCode: state.nodeName.operationErrorCode,
        errorMessage: state.nodeName.operationErrorMessage,
    })
)(OperationStatus);
