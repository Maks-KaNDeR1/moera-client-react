import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cx from 'classnames';

import { Twemoji } from "ui/control";

const EmojiButton = ({icon, emoji, caption, color, invisible, className, buttonRef, onMouseEnter, onMouseLeave,
                      onClick}) => (
    <button className={cx(className, {"invisible": invisible})} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}
            onClick={onClick} ref={buttonRef}>
        {icon && <FontAwesomeIcon icon={icon}/>}
        {emoji && <Twemoji code={emoji}/>}
        {color ?
            <span className="caption" style={{color}}>{caption}</span>
        :
            <span className="caption">{caption}</span>
        }
    </button>
);

export { EmojiButton };
