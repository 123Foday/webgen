import { useEditor } from "../../context/editor-provider";
import ElementToolbar from "./element-toolbar";

const BlockquoteElement = ({ element }) => {
  const { state, dispatch } = useEditor();
  const isSelected = state.editor.selectedElement.id === element.id;
  const isLive = state.editor.liveMode || state.editor.previewMode;
  const c = !Array.isArray(element.content) ? element.content : {};
  const border = isSelected && !isLive ? "2px solid #3b82f6" : !isLive ? "1px dashed rgba(255,255,255,0.08)" : "none";
  const updateContent = (key,val) => dispatch({type:"UPDATE_ELEMENT",payload:{elementDetails:{...element,content:{...c,[key]:val}}}});

  return (
    <div style={{...element.styles,position:"relative",width:"100%",margin:"5px",border,transition:"border 0.15s"}}
      
      onClick={e=>{e.stopPropagation();dispatch({type:"CHANGE_CLICKED_ELEMENT",payload:{elementDetails:element}});}}>
      {isSelected&&!isLive&&<ElementToolbar element={element}/>}
      {isSelected&&!isLive&&<div style={{position:"absolute",top:-23,left:-1,background:"#3b82f6",color:"#fff",fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:"6px 6px 0 0",zIndex:10}}>{element.name}</div>}
      <blockquote style={{borderLeft:`4px solid ${c.accentColor||"#6366f1"}`,paddingLeft:20,paddingTop:8,paddingBottom:8,margin:0}}>
        <span contentEditable={!isLive} suppressHydrationWarning style={{display:"block",fontSize:18,fontStyle:"italic",lineHeight:1.7,color:"rgba(255,255,255,0.85)",outline:"none",marginBottom:10}} onBlur={e=>updateContent("text",e.target.innerText)} dangerouslySetInnerHTML={{__html:c.text||"Add your quote here."}}/>
        {(c.author||!isLive)&&<span contentEditable={!isLive} suppressHydrationWarning style={{fontSize:14,fontWeight:600,color:"rgba(255,255,255,0.4)",outline:"none",display:"block"}} onBlur={e=>updateContent("author",e.target.innerText)} dangerouslySetInnerHTML={{__html:c.author||"— Author Name"}}/>}
      </blockquote>
    </div>
  );
};
export default BlockquoteElement;
