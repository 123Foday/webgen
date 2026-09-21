import { useEditor } from "../../context/editor-provider";
import ElementToolbar from "./element-toolbar";

const IconBox = ({ element }) => {
  const { state, dispatch } = useEditor();
  const isSelected = state.editor.selectedElement.id === element.id;
  const isLive = state.editor.liveMode || state.editor.previewMode;
  const c = !Array.isArray(element.content) ? element.content : {};
  const border = isSelected && !isLive ? "2px solid #3b82f6" : !isLive ? "1px dashed rgba(255,255,255,0.08)" : "none";
  const updateContent = (key, value) => dispatch({ type: "UPDATE_ELEMENT", payload: { elementDetails: { ...element, content: { ...c, [key]: value } } } });

  return (
    <div style={{ ...element.styles, position: "relative", width: "100%", margin: "5px", border, transition: "border 0.15s" }}
      
      onClick={e => { e.stopPropagation(); dispatch({ type: "CHANGE_CLICKED_ELEMENT", payload: { elementDetails: element } }); }}>
      {isSelected && !isLive && <ElementToolbar element={element} />}
      {isSelected && !isLive && <div style={{ position:"absolute",top:-23,left:-1,background:"#3b82f6",color:"#fff",fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:"6px 6px 0 0",zIndex:10 }}>{element.name}</div>}
      <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:8 }}>
        <span contentEditable={!isLive} suppressHydrationWarning style={{ outline:"none",fontSize:36,userSelect:"none" }} onBlur={e=>updateContent("icon",e.target.innerText)} dangerouslySetInnerHTML={{ __html: c.icon||"⭐" }} />
        <span contentEditable={!isLive} suppressHydrationWarning style={{ outline:"none",fontWeight:"bold",fontSize:18,display:"block",width:"100%" }} onBlur={e=>updateContent("title",e.target.innerText)} dangerouslySetInnerHTML={{ __html: c.title||"Feature Title" }} />
        <span contentEditable={!isLive} suppressHydrationWarning style={{ outline:"none",fontSize:14,color:"rgba(255,255,255,0.55)",display:"block",width:"100%" }} onBlur={e=>updateContent("description",e.target.innerText)} dangerouslySetInnerHTML={{ __html: c.description||"Description" }} />
      </div>
    </div>
  );
};
export default IconBox;
