import { useRef } from "react";
import { useEditor } from "../../context/editor-provider";
import ElementToolbar from "./element-toolbar";
import ResizeHandles from "./resize-handles";

const RawHtmlBlock = ({ element }) => {
  const { state, dispatch } = useEditor();
  const containerRef = useRef(null);
  const isSelected = state.editor.selectedElement.id === element.id;
  const isLive = state.editor.liveMode || state.editor.previewMode;
  const meta = element.meta;
  const border = isSelected && !isLive ? "2px solid #f59e0b" : !isLive ? "1px dashed rgba(245,158,11,0.2)" : "none";

  return (
    <div ref={containerRef} style={{...element.styles,position:"relative",width:"100%",margin:"5px",border,transition:"border 0.15s"}}
      
      onClick={e=>{e.stopPropagation();dispatch({type:"CHANGE_CLICKED_ELEMENT",payload:{elementDetails:element}});}}>
      {isSelected&&!isLive&&<ElementToolbar element={element}/>}
      {isSelected&&!isLive&&<div style={{position:"absolute",top:-23,left:-1,background:"#f59e0b",color:"#111",fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:"6px 6px 0 0",zIndex:10,display:"flex",alignItems:"center",gap:4}}>⚡ {element.name}</div>}
      <div dangerouslySetInnerHTML={{ __html: meta?.rawHtml||"" }}/>
      {isSelected&&!isLive&&<ResizeHandles element={element} containerRef={containerRef}/>}
    </div>
  );
};
export default RawHtmlBlock;
