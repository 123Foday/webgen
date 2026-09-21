import { useRef } from "react";
import { useEditor } from "../../context/editor-provider";
import ElementToolbar from "./element-toolbar";
import ResizeHandles from "./resize-handles";

const CardElement = ({ element }) => {
  const { state, dispatch } = useEditor();
  const containerRef = useRef(null);
  const isSelected = state.editor.selectedElement.id === element.id;
  const isLive = state.editor.liveMode || state.editor.previewMode;
  const c = !Array.isArray(element.content) ? element.content : {};
  const border = isSelected && !isLive ? "2px solid #3b82f6" : !isLive ? "1px dashed rgba(255,255,255,0.08)" : "none";
  const updateContent = (key, value) => dispatch({ type: "UPDATE_ELEMENT", payload: { elementDetails: { ...element, content: { ...c, [key]: value } } } });

  return (
    <div ref={containerRef} style={{ ...element.styles, position: "relative", margin: "5px", overflow: "hidden", border, transition: "border 0.15s" }}
      
      onClick={e => { e.stopPropagation(); dispatch({ type: "CHANGE_CLICKED_ELEMENT", payload: { elementDetails: element } }); }}>
      {isSelected && !isLive && <ElementToolbar element={element} />}
      {isSelected && !isLive && <div style={{ position:"absolute",top:-23,left:-1,background:"#3b82f6",color:"#fff",fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:"6px 6px 0 0",zIndex:10 }}>{element.name}</div>}
      {c.imageSrc && <img src={c.imageSrc} alt={c.title||""} style={{ width:"100%",height:192,objectFit:"cover" }} />}
      <div style={{ padding:20 }}>
        <span contentEditable={!isLive} suppressHydrationWarning style={{ outline:"none",fontWeight:"bold",fontSize:18,display:"block",marginBottom:8 }} onBlur={e=>updateContent("title",e.target.innerText)} dangerouslySetInnerHTML={{ __html: c.title||"Card Title" }} />
        <span contentEditable={!isLive} suppressHydrationWarning style={{ outline:"none",fontSize:14,color:"rgba(255,255,255,0.55)",display:"block",marginBottom:16 }} onBlur={e=>updateContent("description",e.target.innerText)} dangerouslySetInnerHTML={{ __html: c.description||"Card description." }} />
        {(c.buttonText||!isLive) && (
          <a href={isLive?c.buttonHref||"#":undefined} style={{ display:"inline-block",padding:"8px 16px",background:"linear-gradient(135deg,#f43f5e,#f97316,#f59e0b)",color:"#111",fontSize:14,fontWeight:700,borderRadius:8,cursor:"pointer" }}>
            <span contentEditable={!isLive} suppressHydrationWarning style={{ outline:"none" }} onBlur={e=>updateContent("buttonText",e.target.innerText)} dangerouslySetInnerHTML={{ __html: c.buttonText||"Learn More" }} />
          </a>
        )}
      </div>
      {isSelected && !isLive && <ResizeHandles element={element} containerRef={containerRef} />}
    </div>
  );
};
export default CardElement;
