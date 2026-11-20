/** Drag-and-drop payload of a gig card: its id, under a type only the board's columns accept. */
const GIG_DRAG_TYPE = 'application/x-brontosound-gig-id';

export function startGigDrag(event: DragEvent, gigId: number) {
    event.dataTransfer?.setData(GIG_DRAG_TYPE, String(gigId));
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
}

export function isGigDrag(event: DragEvent): boolean {
    return event.dataTransfer?.types.includes(GIG_DRAG_TYPE) ?? false;
}

export function droppedGigId(event: DragEvent): number | null {
    const id = Number(event.dataTransfer?.getData(GIG_DRAG_TYPE));
    return id ? id : null;
}
