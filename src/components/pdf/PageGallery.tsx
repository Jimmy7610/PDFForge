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

    reorderPages(from, to);
  }

  if (pages.length === 0) return null;

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="pdf-pages" direction="horizontal">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex flex-row items-start gap-4 p-5 min-w-max"
          >
            {pages.map((page, index) => (
              <Draggable key={page.id} draggableId={page.id} index={index}>
                {(dragProvided, snapshot) => (
                  <div
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    className={`shrink-0 w-[140px] select-none transition-all ${
                      snapshot.isDragging ? 'z-50' : 'z-0'
                    }`}
                  >
                    <PageThumbnail
                      page={page}
                      index={index}
                      isDragging={snapshot.isDragging}
                      dragHandleProps={dragProvided.dragHandleProps as any}
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
