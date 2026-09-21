import { useEffect, useRef } from "react";
import { useEditor } from "../../context/editor-provider";
import ElementToolbar from "./element-toolbar";

const ButtonComponent = ({ element }) => {
  const { dispatch, state } = useEditor();
  const { id, styles, content } = element;
  const spanRef = useRef(null);
  const isSelected = state.editor.selectedElement.id === id;
  const isLive = state.editor.liveMode || state.editor.previewMode;
  const text = !Array.isArray(content) ? (content.innerText || "Button") : "Button";

  useEffect(() => { if (spanRef.current) spanRef.current.innerText = text; }, []);

  const border = isSelected && !isLive ? "2px solid #3b82f6" : !isLive ? "1px dashed rgba(255,255,255,0.08)" : "none";

  return (
    <div style={{ position: "relative", display: "inline-block", margin: "5px", border, transition: "border 0.15s" }}
      
      onClick={e => { e.stopPropagation(); dispatch({ type: "CHANGE_CLICKED_ELEMENT", payload: { elementDetails: element } }); }}>
      {isSelected && !isLive && <ElementToolbar element={element} />}
      {isSelected && !isLive && <div style={{ position:"absolute",top:-23,left:-1,background:"#3b82f6",color:"#fff",fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:"6px 6px 0 0",zIndex:10 }}>{element.name}</div>}
      <span ref={spanRef} style={styles} contentEditable={!isLive} suppressHydrationWarning
        onBlur={e => dispatch({ type: "UPDATE_ELEMENT", payload: { elementDetails: { ...element, content: { ...(!Array.isArray(content)?content:{}), innerText: e.target.innerText } } } })}
        style={{ ...styles, outline: "none", cursor: "pointer" }} />
    </div>
  );
};
export default ButtonComponent;
