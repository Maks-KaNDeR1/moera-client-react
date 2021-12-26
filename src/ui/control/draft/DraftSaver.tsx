import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useFormikContext } from 'formik';
import debounce from 'lodash.debounce';
import deepEqual from 'react-fast-compare';
import "./DraftSaver.css";

interface DraftSaverProps<Text, Values> {
    initialText: Text;
    savingDraft: boolean;
    savedDraft: boolean;
    toText: (values: Values) => Text | null;
    isChanged: (text: Text) => boolean;
    save: (text: Text, values: Values) => void;
    drop: () => void;
}

export function DraftSaver<Text, Values>(props: DraftSaverProps<Text, Values>) {
    const {initialText, savingDraft, savedDraft, toText, isChanged, save, drop} = props;

    const [, setPrevText] = useState<Text>(initialText);
    const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);
    const {status, values} = useFormikContext<Values>();

    const statusRef = useRef<string>();
    statusRef.current = status;
    const valuesRef = useRef<Values>();
    valuesRef.current = values;
    const savingDraftRef = useRef<boolean>();
    savingDraftRef.current = savingDraft;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const onSave = useCallback(
        debounce(() => {
            if (statusRef.current === "submitted" || valuesRef.current == null) {
                return;
            }
            const thisText = toText(valuesRef.current);
            if (thisText == null || savingDraftRef.current) {
                return;
            }
            if (isChanged(thisText)) {
                save(thisText, valuesRef.current);
            } else {
                drop();
            }
            setUnsavedChanges(false);
        }, 1500, {maxWait: 10000}),
    [statusRef, valuesRef, savingDraftRef, toText, isChanged, save, drop, setUnsavedChanges]);

    useEffect(() => {
        return () => {
            onSave.cancel();
        }
    }, [onSave]);

    useEffect(() => {
        setPrevText(prevText => {
            const thisText = toText(values);
            if (thisText == null) {
                return prevText;
            }
            if (!deepEqual(prevText, thisText)) {
                setUnsavedChanges(true);
                onSave();
            }
            return thisText;
        });
    }, [values, props, setPrevText, initialText, setUnsavedChanges, onSave, toText]);

    return (
        <div className="draft-saver">
            {!unsavedChanges && savingDraft && "Saving..."}
            {!unsavedChanges && savedDraft && "Draft saved."}
        </div>
    );
}
