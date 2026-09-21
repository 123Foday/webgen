import { useEffect, useRef } from "react";
import { useEditor } from "../../context/editor-provider";
import ElementToolbar from "./element-toolbar";
import ResizeHandles from "./resize-handles";

const TextComponent = ({ element }) => {
  const { state, dispatch } = useEditor();
  const { id, styles, content } = element;
  const spanRef = useRef(null);
  const containerRef = useRef(null);
  const isSelected = state.editor.selectedElement.id === id;
  const isLive = state.editor.liveMode || state.editor.previewMode;

  useEffect(() => {
    if (spanRef.current && !Array.isArray(content)) spanRef.current.innerText = content.innerText || "";
  }, []);

  const handleBlur = () => {
    if (spanRef.current) dispatch({ type: "UPDATE_ELEMENT", payload: { elementDetails: { ...element, content: { innerText: spanRef.current.innerText } } } });
  };

  const border = isSelected && !isLive ? "2px solid #3b82f6" : !isLive && !isSelected ? "1px dashed rgba(255,255,255,0.08)" : "none";

  return (
    <div ref={containerRef} style={{ ...styles, position: "relative", border, transition: "border 0.15s", margin: "5px", padding: "2px" }}
      
      onClick={e => { e.stopPropagation(); dispatch({ type: "CHANGE_CLICKED_ELEMENT", payload: { elementDetails: element } }); }}>
      {isSelected && !isLive && <ElementToolbar element={element} />}
      {isSelected && !isLive && <div style={{ position:"absolute",top:-23,left:-1,background:"#3b82f6",color:"#fff",fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:"6px 6px 0 0",zIndex:10 }}>{element.name}</div>}
      <span ref={spanRef} suppressHydrationWarning contentEditable={!isLive} onBlur={handleBlur} style={{ outline: "none", minWidth: 4, display: "block" }} />
      {isSelected && !isLive && <ResizeHandles element={element} containerRef={containerRef} />}
    </div>
  );
};
export default TextComponent;
