import React from 'react';
import { useField } from 'formik';

import { CheckboxField, EmojiListInputField } from "ui/control/field";

export default function ComposeReactions() {
    const [, {value}] = useField<boolean>("reactionVisible");

    if (!value) {
        return null;
    }

    return (
        <>
            <EmojiListInputField title={"Allowed \"Support\" reactions"} name="reactionsPositive" horizontal={true}
                                 groupClassName="pl-2" labelClassName="col-md-3" col="col-md-8" negative={false}/>
            <EmojiListInputField title={"Allowed \"Oppose\" reactions"} name="reactionsNegative" horizontal={true}
                                 groupClassName="pl-2" labelClassName="col-md-3" col="col-md-8" negative={true}/>
            <CheckboxField title="Show the detailed list of reactions" name="reactionsVisible" groupClassName="pl-2"/>
            <CheckboxField title="Show the number of reactions" name="reactionTotalsVisible" groupClassName="pl-2"/>
        </>
    );
}