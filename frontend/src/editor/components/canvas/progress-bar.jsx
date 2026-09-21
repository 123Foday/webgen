import { useEditor } from "../../context/editor-provider";
import ElementToolbar from "./element-toolbar";

const ProgressBarComponent = ({ element }) => {
  const { state, dispatch } = useEditor();
  const isSelected = state.editor.selectedElement.id === element.id;
  const isLive = state.editor.liveMode || state.editor.previewMode;
  const c = !Array.isArray(element.content) ? element.content : {};
  const pct = Math.min(100,Math.max(0,Number(c.percentage)||75));
  const color = c.color||"#6366f1";
  const border = isSelected && !isLive ? "2px solid #3b82f6" : !isLive ? "1px dashed rgba(255,255,255,0.08)" : "none";

  return (
    <div style={{...element.styles,position:"relative",width:"100%",margin:"5px",border,transition:"border 0.15s"}}
      
      onClick={e=>{e.stopPropagation();dispatch({type:"CHANGE_CLICKED_ELEMENT",payload:{elementDetails:element}});}}>
      {isSelected&&!isLive&&<ElementToolbar element={element}/>}
      {isSelected&&!isLive&&<div style={{position:"absolute",top:-23,left:-1,background:"#3b82f6",color:"#fff",fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:"6px 6px 0 0",zIndex:10}}>{element.name}</div>}
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
        <span style={{fontSize:14,fontWeight:500}}>{c.label||"Progress"}</span>
        <span style={{fontSize:14,fontWeight:600,color}}>{pct}%</span>
      </div>
      <div style={{width:"100%",height:10,background:"rgba(255,255,255,0.08)",borderRadius:999,overflow:"hidden"}}>
        <div style={{width:`${pct}%`,height:"100%",background:color,borderRadius:999,transition:"width 0.7s"}} />
      </div>
    </div>
  );
};
export default ProgressBarComponent;
