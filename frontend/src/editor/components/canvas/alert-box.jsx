import { useEditor } from "../../context/editor-provider";
import ElementToolbar from "./element-toolbar";

const VARIANTS = {
  info:    { bg:"rgba(99,102,241,0.1)",  border:"rgba(99,102,241,0.3)",  text:"#a5b4fc", icon:"ℹ️" },
  success: { bg:"rgba(16,185,129,0.1)",  border:"rgba(16,185,129,0.3)",  text:"#6ee7b7", icon:"✅" },
  warning: { bg:"rgba(245,158,11,0.1)",  border:"rgba(245,158,11,0.3)",  text:"#fcd34d", icon:"⚠️" },
  error:   { bg:"rgba(239,68,68,0.1)",   border:"rgba(239,68,68,0.3)",   text:"#fca5a5", icon:"❌" },
};

const AlertBox = ({ element }) => {
  const { state, dispatch } = useEditor();
  const isSelected = state.editor.selectedElement.id === element.id;
  const isLive = state.editor.liveMode || state.editor.previewMode;
  const c = !Array.isArray(element.content) ? element.content : {};
  const v = VARIANTS[c.variant||"info"]||VARIANTS.info;
  const border = isSelected && !isLive ? "2px solid #3b82f6" : !isLive ? "1px dashed rgba(255,255,255,0.08)" : "none";

  return (
    <div style={{...element.styles,position:"relative",width:"100%",margin:"5px",border,transition:"border 0.15s"}}
    
      onClick={e=>{e.stopPropagation();dispatch({type:"CHANGE_CLICKED_ELEMENT",payload:{elementDetails:element}});}}>
      {isSelected&&!isLive&&<ElementToolbar element={element}/>}
      {isSelected&&!isLive&&<div style={{position:"absolute",top:-23,left:-1,background:"#3b82f6",color:"#fff",fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:"6px 6px 0 0",zIndex:10}}>{element.name}</div>}
      <div style={{display:"flex",alignItems:"flex-start",gap:12,padding:"12px 16px",borderRadius:10,border:`1px solid ${v.border}`,background:v.bg}}>
        <span style={{flexShrink:0,marginTop:1,fontSize:15}}>{v.icon}</span>
        <div>
          {c.title&&<p style={{fontWeight:600,fontSize:14,marginBottom:3,color:v.text}}>{c.title}</p>}
          <p style={{fontSize:14,color:v.text,opacity:0.9}}>{c.message||"This is an alert message."}</p>
        </div>
      </div>
    </div>
  );
};
export default AlertBox;
