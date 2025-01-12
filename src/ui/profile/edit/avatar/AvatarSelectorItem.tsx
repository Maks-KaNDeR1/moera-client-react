import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Avatar, DeleteButton } from "ui/control";
import { AvatarInfo } from "api/node/api-types";

interface Props {
    nodeName: string | null,
    avatar: AvatarInfo;
    onSelect: ((avatar: AvatarInfo) => void) | null;
    onDelete: ((id: string) => void) | null;
}

export default function AvatarSelectorItem({nodeName, avatar, onSelect, onDelete}: Props) {
    const sortable = useSortable({id: avatar.id});
    const sortableStyle = {
        transform: CSS.Transform.toString(sortable.transform),
        transition: sortable.transition ?? undefined,
    };

    const onClick = () => onSelect && onSelect(avatar);
    const onDeleteClick = () => onDelete && onDelete(avatar.id);

    return (
        <>
            {onDelete && <DeleteButton onClick={onDeleteClick}/>}
            <div ref={sortable.setNodeRef} style={sortableStyle} {...sortable.attributes} {...sortable.listeners}>
                <Avatar avatar={avatar} ownerName={nodeName} size={100} shape="design" draggable={false}
                        onClick={onClick}/>
            </div>
        </>
    );
}
