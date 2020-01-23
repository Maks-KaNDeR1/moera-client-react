import React from 'react';
import { connect as connectFormik } from 'formik';

import { DateTimeField } from "ui/control/field";

const ComposePublishAt = ({formik}) => (
    formik.values.publishAtCustomized &&
        <DateTimeField title="Publish at" name="publishAt" horizontal={true} groupClassName="pl-4" col="col-md-4"/>
);

export default connectFormik(ComposePublishAt);
