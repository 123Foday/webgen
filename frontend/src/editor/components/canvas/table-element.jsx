import { useRef } from "react";
import { useEditor } from "../../context/editor-provider";
import ElementToolbar from "./element-toolbar";
import ResizeHandles from "./resize-handles";

const TableElement = ({ element }) => {
  const { state, dispatch } = useEditor();
  const containerRef = useRef(null);
  const isSelected = state.editor.selectedElement.id === element.id;
  const isLive = state.editor.liveMode || state.editor.previewMode;
  const c = !Array.isArray(element.content) ? element.content : {};
  const headers = c.headers ? JSON.parse(c.headers) : ["Name","Email","Role","Status"];
  const rows = c.rows ? JSON.parse(c.rows) : [["Alice Smith","alice@example.com","Admin","Active"],["Bob Jones","bob@example.com","Editor","Active"]];
  const striped = c.striped !== "false";
  const border = isSelected && !isLive ? "2px solid #3b82f6" : !isLive ? "1px dashed rgba(255,255,255,0.08)" : "none";

  return (
    <div ref={containerRef} style={{...element.styles,position:"relative",width:"100%",margin:"5px",overflow:"hidden",border,transition:"border 0.15s"}}
      
      onClick={e=>{e.stopPropagation();dispatch({type:"CHANGE_CLICKED_ELEMENT",payload:{elementDetails:element}});}}>
      {isSelected&&!isLive&&<ElementToolbar element={element}/>}
      {isSelected&&!isLive&&<div style={{position:"absolute",top:-23,left:-1,background:"#3b82f6",color:"#fff",fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:"6px 6px 0 0",zIndex:10}}>{element.name}</div>}
      <div style={{overflowX:"auto",width:"100%"}}>
        <table style={{width:"100%",fontSize:14,borderCollapse:"collapse"}}>
          <thead>
            <tr style={{background:c.headerBg||"rgba(255,255,255,0.06)"}}>
              {headers.map((h,i)=><th key={i} style={{textAlign:"left",padding:"12px 16px",fontWeight:600,fontSize:11,textTransform:"uppercase",letterSpacing:"0.05em",borderBottom:"1px solid rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.7)"}}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row,ri)=>(
              <tr key={ri} style={{background:striped&&ri%2===1?"rgba(255,255,255,0.02)":"transparent",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                {row.map((cell,ci)=><td key={ci} style={{padding:"12px 16px",color:"rgba(255,255,255,0.8)"}}>{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isSelected&&!isLive&&<ResizeHandles element={element} containerRef={containerRef}/>}
    </div>
  );
};
export default TableElement;
