/* ───────────────────────────────────────────────────────────────
   PDFForge – PageGallery with drag-and-drop
   ─────────────────────────────────────────────────────────────── */

import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { usePdfForgeStore } from '../../store/pdfForgeStore';
import { PageThumbnail } from './PageThumbnail';

export function PageGallery() {
  const pages = usePdfForgeStore((s) => s.pages);
  const reorderPages = usePdfForgeStore((s) => s.reorderPages);

  function handleDragEnd(result: DropResult) {
    if (!result.destination) return;
    const from = result.source.index;
    const to = result.destination.index;
    if (from === to) return;

    const reordered = [...pages];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    reorderPages(reordered);
  }

  if (pages.length === 0) return null;

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="page-gallery" direction="horizontal">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex flex-row gap-4 p-5 min-w-full w-fit"
          >
            {pages.map((page, index) => (
              <Draggable key={page.id} draggableId={page.id} index={index}>
                {(dragProvided, snapshot) => (
                  <div
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    className={`w-[140px] transition-transform ${snapshot.isDragging ? 'z-50 scale-105' : ''}`}
                  >
                    <PageThumbnail
                      page={page}
                      index={index}
                      dragHandleProps={(dragProvided.dragHandleProps ?? undefined) as any}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
