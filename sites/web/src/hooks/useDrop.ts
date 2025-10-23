import { useCallback, useEffect, useRef, useState } from "react";

export const useDrop = (onDrop: (files: File[]) => void) => {
  const [isDragover, setIsDragover] = useState(false);

  const dragCounter = useRef(0);

  const handleDragover = (e: DragEvent) => e.preventDefault();

  const handleDragenter = (e: DragEvent) => {
    e.preventDefault();
    dragCounter.current += 1;
    if (e.dataTransfer && e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragover(true);
    }
  };

  const handleDragleave = (e: DragEvent) => {
    e.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragover(false);
    }
  };

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      if (!e.dataTransfer) return;

      const files = [...e.dataTransfer.items]
        .map((item) => {
          if (item.kind !== "file") return null;
          return item.getAsFile();
        })
        .filter((file) => file !== null);

      dragCounter.current = 0;
      setIsDragover(false);

      console.log("drop", files);

      onDrop(files);
    },
    [onDrop],
  );

  useEffect(() => {
    window.addEventListener("drop", handleDrop);
    window.addEventListener("dragover", handleDragover);
    window.addEventListener("dragenter", handleDragenter);
    window.addEventListener("dragleave", handleDragleave);

    return () => {
      window.removeEventListener("drop", handleDrop);
      window.removeEventListener("dragover", handleDragover);
      window.removeEventListener("dragenter", handleDragenter);
      window.removeEventListener("dragleave", handleDragleave);
    };
  }, [handleDrop]);

  return { isDragover };
};
