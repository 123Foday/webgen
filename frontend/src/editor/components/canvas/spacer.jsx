import { useRef, useCallback } from "react";
import { useEditor } from "../../context/editor-provider";
import ElementToolbar from "./element-toolbar";

const SpacerComponent = ({ element }) => {
  const { state, dispatch } = useEditor();
  const containerRef = useRef(null);
  const dragRef = useRef(null);
  const isSelected = state.editor.selectedElement.id === element.id;
  const isLive = state.editor.liveMode || state.editor.previewMode;
  const currentH = parseFloat(String(element.styles.height || "48").replace(/[^0-9.]/g, "")) || 48;

  const onHandleMouseDown = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    dragRef.current = { startY: e.clientY, startH: currentH };
    const onMouseMove = (me) => {
      if (!dragRef.current) return;
      const dy = me.clientY - dragRef.current.startY;
      const newH = Math.max(8, dragRef.current.startH + dy);
      dispatch({ type: "UPDATE_ELEMENT", payload: { elementDetails: { ...element, styles: { ...element.styles, height: `${newH}px` } } } });
    };
    const onMouseUp = () => { dragRef.current = null; window.removeEventListener("mousemove", onMouseMove); window.removeEventListener("mouseup", onMouseUp); };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }, [element, dispatch, currentH]);

  const border = isSelected && !isLive ? "2px dashed #3b82f6" : !isLive ? "1px dashed rgba(255,255,255,0.06)" : "none";

  return (
    <div ref={containerRef} style={{ ...element.styles, display: "block", position: "relative", width: "100%", border, transition: "border 0.15s" }}
      
      onClick={e => { e.stopPropagation(); dispatch({ type: "CHANGE_CLICKED_ELEMENT", payload: { elementDetails: element } }); }}>
      {isSelected && !isLive && <ElementToolbar element={element} />}
      {!isLive && <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none",userSelect:"none",fontSize:10,color:"rgba(255,255,255,0.2)" }}>{Math.round(currentH)}px spacer</div>}
      {isSelected && !isLive && (
        <>
          <div style={{ position:"absolute",top:-23,left:-1,background:"#3b82f6",color:"#fff",fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:"6px 6px 0 0",zIndex:10 }}>{element.name}</div>
          <div onMouseDown={onHandleMouseDown} style={{ position:"absolute",bottom:0,left:"50%",transform:"translateX(-50%)",width:64,height:12,display:"flex",alignItems:"center",justifyContent:"center",cursor:"s-resize",zIndex:50 }}>
            <div style={{ width:32,height:4,borderRadius:999,background:"#3b82f6" }} />
          </div>
        </>
      )}
    </div>
  );
};
export default SpacerComponent;
