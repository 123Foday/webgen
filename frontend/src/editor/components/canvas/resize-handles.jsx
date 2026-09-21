import { useRef, useCallback } from "react";
import { useEditor } from "../../context/editor-provider";

const HANDLES = [
  { id: "nw", style: { top: -5, left: -5 },                                       cursor: "nw-resize" },
  { id: "n",  style: { top: -5, left: "50%", transform: "translateX(-50%)" },     cursor: "n-resize"  },
  { id: "ne", style: { top: -5, right: -5 },                                      cursor: "ne-resize" },
  { id: "e",  style: { right: -5, top: "50%", transform: "translateY(-50%)" },    cursor: "e-resize"  },
  { id: "se", style: { bottom: -5, right: -5 },                                   cursor: "se-resize" },
  { id: "s",  style: { bottom: -5, left: "50%", transform: "translateX(-50%)" },  cursor: "s-resize"  },
  { id: "sw", style: { bottom: -5, left: -5 },                                    cursor: "sw-resize" },
  { id: "w",  style: { left: -5, top: "50%", transform: "translateY(-50%)" },     cursor: "w-resize"  },
];

const getCanvasScale = (el) => {
  let node = el.parentElement;
  while (node) {
    const t = window.getComputedStyle(node).transform;
    if (t && t !== "none") {
      const m = t.match(/matrix\(([^)]+)\)/);
      if (m) {
        const scale = parseFloat(m[1].split(",")[0]);
        if (scale && scale !== 1) return scale;
      }
    }
    node = node.parentElement;
  }
  return 1;
};

const ResizeHandles = ({ element, containerRef }) => {
  const { dispatch } = useEditor();
  const startRef = useRef(null);

  const onMouseDown = useCallback((e, handle) => {
    e.preventDefault();
    e.stopPropagation();
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const scale = getCanvasScale(el);
    startRef.current = { x: e.clientX, y: e.clientY, w: rect.width, h: rect.height, handle, scale };

    const onMouseMove = (me) => {
      if (!startRef.current) return;
      const { x, y, w, h, handle: hnd, scale: sc } = startRef.current;
      const dx = (me.clientX - x) / sc;
      const dy = (me.clientY - y) / sc;
      const newStyles = { ...element.styles };
      if (hnd.includes("e")) newStyles.width  = `${Math.max(20, w / sc + dx)}px`;
      if (hnd.includes("w")) newStyles.width  = `${Math.max(20, w / sc - dx)}px`;
      if (hnd.includes("s")) newStyles.height = `${Math.max(20, h / sc + dy)}px`;
      if (hnd.includes("n")) newStyles.height = `${Math.max(20, h / sc - dy)}px`;
      dispatch({ type: "UPDATE_ELEMENT", payload: { elementDetails: { ...element, styles: newStyles } } });
    };

    const onMouseUp = () => {
      startRef.current = null;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }, [element, dispatch, containerRef]);

  return (
    <>
      {HANDLES.map(({ id, style, cursor }) => (
        <div
          key={id}
          style={{ ...style, cursor, position: "absolute", width: 10, height: 10, backgroundColor: "white", border: "2px solid #3b82f6", borderRadius: 2, zIndex: 60 }}
          onMouseDown={(e) => onMouseDown(e, id)}
        />
      ))}
    </>
  );
};

export default ResizeHandles;
