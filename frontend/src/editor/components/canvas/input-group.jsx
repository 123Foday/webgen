import { useEditor } from "../../context/editor-provider";
import ElementToolbar from "./element-toolbar";

const InputGroup = ({ element }) => {
  const { state, dispatch } = useEditor();
  const isSelected = state.editor.selectedElement.id === element.id;
  const isLive = state.editor.liveMode || state.editor.previewMode;
  const c = !Array.isArray(element.content) ? element.content : {};
  const s = element.styles;
  const inputType = c.inputType||"text";
  const border = isSelected && !isLive ? "2px solid #3b82f6" : !isLive ? "1px dashed rgba(255,255,255,0.08)" : "none";
  const inp = { width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:s.borderRadius||8,padding:"10px 14px",fontSize:14,color:"#fff",outline:"none" };

  return (
    <div style={{...s,position:"relative",width:"100%",margin:"5px",border,transition:"border 0.15s"}}
      
      onClick={e=>{e.stopPropagation();dispatch({type:"CHANGE_CLICKED_ELEMENT",payload:{elementDetails:element}});}}>
      {isSelected&&!isLive&&<ElementToolbar element={element}/>}
      {isSelected&&!isLive&&<div style={{position:"absolute",top:-23,left:-1,background:"#3b82f6",color:"#fff",fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:"6px 6px 0 0",zIndex:10}}>{element.name}</div>}
      <div style={{display:"flex",flexDirection:"column",gap:6,width:"100%"}}>
        {c.label&&<label style={{fontSize:13,fontWeight:500,color:"rgba(255,255,255,0.8)"}}>{c.label}</label>}
        {inputType==="textarea"
          ?<textarea placeholder={c.placeholder||"Enter text…"} disabled rows={Number(c.rows)||4} style={{...inp,resize:"none"}}/>
          :inputType==="select"
            ?<select disabled style={inp}>{(c.options||"Option 1,Option 2,Option 3").split(",").map(o=><option key={o}>{o.trim()}</option>)}</select>
            :inputType==="checkbox"
              ?<label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}><input type="checkbox" disabled style={{width:16,height:16}}/><span style={{fontSize:14}}>{c.placeholder||"Check this box"}</span></label>
              :inputType==="radio"
                ?<div style={{display:"flex",flexDirection:"column",gap:8}}>{(c.options||"Option 1,Option 2,Option 3").split(",").map(o=><label key={o} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}><input type="radio" disabled name={element.id} style={{width:16,height:16}}/><span style={{fontSize:14}}>{o.trim()}</span></label>)}</div>
                :<input type={inputType} placeholder={c.placeholder||"Enter value…"} disabled style={inp}/>}
        {c.helperText&&<p style={{fontSize:12,color:"rgba(255,255,255,0.35)"}}>{c.helperText}</p>}
      </div>
    </div>
  );
};
export default InputGroup;
