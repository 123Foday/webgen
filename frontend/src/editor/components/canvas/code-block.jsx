import { useEditor } from "../../context/editor-provider";
import ElementToolbar from "./element-toolbar";

const CodeBlock = ({ element }) => {
  const { state, dispatch } = useEditor();
  const isSelected = state.editor.selectedElement.id === element.id;
  const isLive = state.editor.liveMode || state.editor.previewMode;
  const c = !Array.isArray(element.content) ? element.content : {};
  const border = isSelected && !isLive ? "2px solid #3b82f6" : !isLive ? "1px dashed rgba(255,255,255,0.08)" : "none";

  return (
    <div style={{...element.styles,position:"relative",width:"100%",margin:"5px",border,transition:"border 0.15s"}}
      
      onClick={e=>{e.stopPropagation();dispatch({type:"CHANGE_CLICKED_ELEMENT",payload:{elementDetails:element}});}}>
      {isSelected&&!isLive&&<ElementToolbar element={element}/>}
      {isSelected&&!isLive&&<div style={{position:"absolute",top:-23,left:-1,background:"#3b82f6",color:"#fff",fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:"6px 6px 0 0",zIndex:10}}>{element.name}</div>}
      <div style={{borderRadius:10,overflow:"hidden",border:"1px solid rgba(255,255,255,0.08)"}}>
        {c.language&&<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(255,255,255,0.04)",padding:"8px 16px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
          <div style={{display:"flex",gap:6}}>{["#ef4444","#f59e0b","#22c55e"].map(c=><div key={c} style={{width:12,height:12,borderRadius:999,background:c}}/>)}</div>
          <span style={{fontSize:12,fontFamily:"monospace",color:"rgba(255,255,255,0.35)"}}>{c.language}</span>
        </div>}
        <pre style={{background:"#0a0b0c",margin:0,padding:16,overflowX:"auto"}}>
          <code contentEditable={!isLive} suppressHydrationWarning
            style={{color:"#34d399",fontFamily:"monospace",fontSize:14,lineHeight:1.6,outline:"none"}}
            onBlur={e=>dispatch({type:"UPDATE_ELEMENT",payload:{elementDetails:{...element,content:{...c,code:e.target.innerText}}}})}
            dangerouslySetInnerHTML={{ __html: c.code||'console.log("Hello, World!");' }}/>
        </pre>
      </div>
    </div>
  );
};
export default CodeBlock;
