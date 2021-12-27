import React, { MouseEvent, useState } from 'react';
import ReactDOM from 'react-dom';
import { connect, ConnectedProps } from 'react-redux';
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';

import { ClientState } from "state/state";
import { getNodeRootPage } from "state/node/selectors";
import { getNamingNameNodeUri } from "state/naming/selectors";
import { RichTextMedia } from "state/richtexteditor/actions";
import { RichTextValue } from "ui/control";
import UploadedImage from "ui/control/richtexteditor/UploadedImage";
import AttachedImage from "ui/control/richtexteditor/AttachedImage";
import { mediaHashesExtract } from "util/media-images";
import "./RichTextEditorImageList.css";

interface OwnProps {
    value: RichTextValue;
    nodeName: string | null;
    selectImage: (image: RichTextMedia | null) => void;
    onDeleted?: (id: string) => void;
    onReorder?: (activeId: string, overId: string) => void;
}

type Props = OwnProps & ConnectedProps<typeof connector>;

function RichTextEditorImageList({value, selectImage, onDeleted, onReorder, rootPage}: Props) {
    const mouseSensor = useSensor(PointerSensor, {
        activationConstraint: {
            distance: 10
        }
    });
    const keyboardSensor = useSensor(KeyboardSensor);

    const sensors = useSensors(
        mouseSensor,
        keyboardSensor,
    );

    const [dragged, setDragged] = useState<RichTextMedia | null>(null);

    if (value.media == null || value.media.length === 0) {
        return null;
    }

    const embedded = mediaHashesExtract(value.text);
    const mediaList = value.media
        .filter((media): media is RichTextMedia => media != null && !embedded.has(media.hash));
    const mediaIds = mediaList.map(mf => mf.id);

    const onDragStart = ({active}: DragStartEvent) =>
        setDragged(mediaList.find(mf => mf.id === active.id) ?? null);
    const onDragEnd = ({active, over}: DragEndEvent) => {
        if (onReorder != null && over != null && active.id !== over.id) {
            onReorder(active.id, over.id);
        }
        setDragged(null);
    };
    const onDragCancel = () => setDragged(null);

    const onDelete = (id: string) => () => {
        if (onDeleted) {
            onDeleted(id);
        }
    }

    const onClick = (image: RichTextMedia) => (event: MouseEvent) => {
        selectImage(image);
        event.preventDefault();
    }

    return (
        <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={onDragCancel}>
            <SortableContext items={mediaIds}>
                <div>
                    {mediaList.map(media =>
                        <UploadedImage key={media.id} media={media} rootPage={rootPage}
                                       onDeleteClick={!dragged ? onDelete(media.id) : undefined}
                                       onClick={!dragged ? onClick(media) : undefined}/>
                    )}
                </div>
            </SortableContext>
            {ReactDOM.createPortal(
                <DragOverlay zIndex={1080} dropAnimation={null}>
                    {dragged &&
                        <AttachedImage media={dragged} rootPage={rootPage}/>
                    }
                </DragOverlay>,
                document.querySelector("#modal-root")!
            )}
        </DndContext>
    );
}

const connector = connect(
    (state: ClientState, props: OwnProps) => ({
        rootPage: props.nodeName ? getNamingNameNodeUri(state, props.nodeName) : getNodeRootPage(state)
    })
);

export default connector(RichTextEditorImageList);
