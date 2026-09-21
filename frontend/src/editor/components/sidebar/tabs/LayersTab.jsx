import { useEditor } from "../../../context/editor-provider";

const LayerItem = ({ element, depth = 0 }) => {
  const { dispatch, state } = useEditor();
  const isSelected = state.editor.selectedElement.id === element.id;
  const hasChildren = Array.isArray(element.content) && element.content.length > 0;

  const icons = {
    text:"T", heading:"H", image:"🖼", video:"▶", link:"🔗", button:"⬛",
    divider:"─", spacer:"↕", list:"•", "icon-box":"⭐", card:"🃏",
    countdown:"⏱", "progress-bar":"█", "login-form":"🔑", "signup-form":"📝",
    table:"⊞", alert:"⚠", code:"</>", blockquote:"❝", "input-group":"▭",
    container:"□", "2Col":"⊟", "3Col":"⊞", "4Col":"⊠", __body:"◈", "raw-html":"⚡",
  };

  return (
    <div>
      <div
        onClick={() => dispatch({ type:"CHANGE_CLICKED_ELEMENT", payload:{ elementDetails:element }})}
        style={{
          display:"flex", alignItems:"center", gap:6, padding:`5px ${8 + depth * 14}px`,
          cursor:"pointer", borderRadius:6, margin:"1px 4px",
          background: isSelected ? "rgba(99,102,241,0.15)" : "transparent",
          border: isSelected ? "1px solid rgba(99,102,241,0.3)" : "1px solid transparent",
          transition:"all 0.12s",
        }}
        onMouseEnter={e=>{ if(!isSelected) e.currentTarget.style.background="rgba(255,255,255,0.04)"; }}
        onMouseLeave={e=>{ if(!isSelected) e.currentTarget.style.background="transparent"; }}
      >
        <span style={{ fontSize:11,width:16,textAlign:"center",flexShrink:0,color:"rgba(255,255,255,0.4)" }}>{icons[element.type]||"□"}</span>
        <span style={{ fontSize:12,color: isSelected?"#a5b4fc":"rgba(255,255,255,0.7)",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{element.name}</span>
        {hasChildren&&<span style={{ fontSize:10,color:"rgba(255,255,255,0.25)",flexShrink:0 }}>{element.content.length}</span>}
      </div>
      {hasChildren && element.content.map(child=><LayerItem key={child.id} element={child} depth={depth+1}/>)}
    </div>
  );
};

const LayersTab = () => {
  const { state } = useEditor();

  return (
    <div style={{ padding:"12px 0 24px" }}>
      <p style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"rgba(255,255,255,0.35)",margin:"0 16px 10px",paddingBottom:8,borderBottom:"1px solid rgba(255,255,255,0.06)" }}>Page Layers</p>
      {state.editor.elements.map(el=><LayerItem key={el.id} element={el}/>)}
    </div>
  );
};

export default LayersTab;
