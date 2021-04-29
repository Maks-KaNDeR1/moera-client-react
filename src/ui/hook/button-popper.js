import { useCallback, useEffect, useState } from 'react';
import { usePopper } from 'react-popper';

export function useButtonPopper(placement, options = {}) {
    const [visible, setVisible] = useState(false);

    const onToggle = useCallback(event => {
        setVisible(visible => !visible);
        event.preventDefault();
    }, [setVisible]);

    const onHide = useCallback(event => {
        setVisible(false)
        event.preventDefault();
    }, [setVisible]);

    useEffect(() => {
        if (visible) {
            document.getElementById("app-root").addEventListener("click", onHide);
            document.getElementById("modal-root").addEventListener("click", onHide);
            return () => {
                document.getElementById("app-root").removeEventListener("click", onHide);
                document.getElementById("modal-root").removeEventListener("click", onHide);
            }
        }
    }, [visible, onHide])

    const [buttonRef, setButtonRef] = useState(null);
    const [popperRef, setPopperRef] = useState(null);
    const [arrowRef, setArrowRef] = useState(null);
    const {styles, attributes} = usePopper(buttonRef, popperRef,
        {placement, ...options, modifiers: [{name: "arrow", options: {element: arrowRef}}]});

    const arrowStyles = styles && styles.arrow ? {
        ...styles.arrow,
        transform: styles.arrow.transform + " rotate(45deg)"
    } : {};

    return {
        visible, onToggle, setButtonRef, setPopperRef, setArrowRef,
        popperStyles: styles ? styles.popper : {},
        popperAttributes: attributes ? attributes.popper : {},
        arrowStyles,
    };
}
