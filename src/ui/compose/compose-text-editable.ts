import React, { useEffect, useRef, useState } from 'react';
import { FieldInputProps, useField } from 'formik';

interface ComposeTextEditableProps<T, E> {
    edit: boolean;
    field: FieldInputProps<T>
    value: T;
    setValue: (value: T) => void;
    inputRef: React.RefObject<HTMLInputElement>;
    onEdit: () => void;
    onReset: () => void;
    onKeyDown: (event: React.KeyboardEvent<E>) => void;
}

export default function useComposeTextEditable<T, E>(name: string, postingId: string | null,
                                                     draftId: string | null): ComposeTextEditableProps<T, E> {
    const [field, {value, initialValue}, {setValue}] = useField<T>(name);
    const [edit, setEdit] = useState(false);

    const onEdit = () => setEdit(true);

    const onReset = () => {
        if (initialValue) {
            setValue(initialValue);
        }
        setEdit(false);
    };

    const onKeyDown = (event: React.KeyboardEvent<E>) => {
        if (event.key === "Escape" && onReset) {
            onReset();
        }
    };

    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        if (edit && inputRef.current) {
            inputRef.current.focus();
        }
    }, [inputRef, edit]);

    useEffect(() => {
        setEdit(false);
    }, [postingId, draftId, setEdit]);

    return {edit, field, value, setValue, inputRef, onEdit, onReset, onKeyDown};
}
