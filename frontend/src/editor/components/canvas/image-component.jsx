import { useRef } from "react";
import { useEditor } from "../../context/editor-provider";
import ElementToolbar from "./element-toolbar";
import ResizeHandles from "./resize-handles";

const ImageComponent = ({ element }) => {
  const { dispatch, state } = useEditor();
  const { id, styles, content } = element;
  const containerRef = useRef(null);
  const src = !Array.isArray(content) ? (content.src || "") : "";
  const alt = !Array.isArray(content) ? (content.alt || "") : "";
  const isSelected = state.editor.selectedElement.id === id;
  const isLive = state.editor.liveMode || state.editor.previewMode;
  const border = isSelected && !isLive ? "2px solid #3b82f6" : !isLive ? "1px dashed rgba(255,255,255,0.08)" : "none";

  return (
    <div ref={containerRef} style={{ ...styles, position: "relative", overflow: "hidden", margin: "5px", border, transition: "border 0.15s" }}
      
      onClick={e => { e.stopPropagation(); dispatch({ type: "CHANGE_CLICKED_ELEMENT", payload: { elementDetails: element } }); }}>
      {isSelected && !isLive && <ElementToolbar element={element} />}
      {isSelected && !isLive && <div style={{ position:"absolute",top:-23,left:-1,background:"#3b82f6",color:"#fff",fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:"6px 6px 0 0",zIndex:10 }}>{element.name}</div>}
      {src ? (
        <img src={src} alt={alt} style={{ width: "100%", height: "auto", display: "block", objectFit: styles.objectFit || "cover", borderRadius: styles.borderRadius }} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, background: "rgba(255,255,255,0.04)", width: "100%", height: 192, color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
          <span style={{ fontSize: 32 }}>🖼️</span>
          Add image URL in Settings → Content
        </div>
      )}
      {isSelected && !isLive && <ResizeHandles element={element} containerRef={containerRef} />}
    </div>
  );
};
export default ImageComponent;
