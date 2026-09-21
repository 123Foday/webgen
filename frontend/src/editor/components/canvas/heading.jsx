import { useEffect, useRef } from "react";
import { useEditor } from "../../context/editor-provider";
import ElementToolbar from "./element-toolbar";
import ResizeHandles from "./resize-handles";

const HeadingComponent = ({ element }) => {
  const { state, dispatch } = useEditor();
  const { id, styles, content } = element;
  const ref = useRef(null);
  const containerRef = useRef(null);
  const isSelected = state.editor.selectedElement.id === id;
  const isLive = state.editor.liveMode || state.editor.previewMode;
  const level = !Array.isArray(content) ? (content.level || "h2") : "h2";
  const text = !Array.isArray(content) ? (content.innerText || "Your Heading") : "Your Heading";

  useEffect(() => { if (ref.current) ref.current.innerText = text; }, []);

  const handleBlur = () => {
    if (ref.current) dispatch({ type: "UPDATE_ELEMENT", payload: { elementDetails: { ...element, content: { ...(!Array.isArray(content) ? content : {}), innerText: ref.current.innerText } } } });
  };

  const Tag = level;
  const border = isSelected && !isLive ? "2px solid #3b82f6" : !isLive && !isSelected ? "1px dashed rgba(255,255,255,0.08)" : "none";

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%", margin: "5px", border, transition: "border 0.15s" }}
      
      onClick={e => { e.stopPropagation(); dispatch({ type: "CHANGE_CLICKED_ELEMENT", payload: { elementDetails: element } }); }}>
      {isSelected && !isLive && <ElementToolbar element={element} />}
      {isSelected && !isLive && <div style={{ position:"absolute",top:-23,left:-1,background:"#3b82f6",color:"#fff",fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:"6px 6px 0 0",zIndex:10 }}>{element.name}</div>}
      <Tag ref={ref} style={styles} contentEditable={!isLive} suppressHydrationWarning onBlur={handleBlur} style={{ ...styles, outline: "none", display: "block", width: "100%" }} />
      {isSelected && !isLive && <ResizeHandles element={element} containerRef={containerRef} />}
    </div>
  );
};
export default HeadingComponent;
