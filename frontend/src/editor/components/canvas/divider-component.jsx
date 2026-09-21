import { useEditor } from "../../context/editor-provider";
import ElementToolbar from "./element-toolbar";

const DividerComponent = ({ element }) => {
  const { state, dispatch } = useEditor();
  const { id, styles } = element;
  const isSelected = state.editor.selectedElement.id === id;
  const isLive = state.editor.liveMode || state.editor.previewMode;
  const border = isSelected && !isLive ? "2px solid #3b82f6" : !isLive ? "1px dashed rgba(255,255,255,0.08)" : "none";

  return (
    <div style={{ position: "relative", width: "100%", margin: "5px", border, transition: "border 0.15s" }}
      
      onClick={e => { e.stopPropagation(); dispatch({ type: "CHANGE_CLICKED_ELEMENT", payload: { elementDetails: element } }); }}>
      {isSelected && !isLive && <ElementToolbar element={element} />}
      {isSelected && !isLive && <div style={{ position:"absolute",top:-23,left:-1,background:"#3b82f6",color:"#fff",fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:"6px 6px 0 0",zIndex:10 }}>{element.name}</div>}
      <hr style={{ ...styles, border: "none", borderTop: styles.borderTopWidth ? `${styles.borderTopWidth} ${styles.borderTopStyle || "solid"} ${styles.borderTopColor || "rgba(255,255,255,0.1)"}` : "1px solid rgba(255,255,255,0.1)", margin: `${styles.marginTop || "16px"} 0 ${styles.marginBottom || "16px"}` }} />
    </div>
  );
};
export default DividerComponent;
