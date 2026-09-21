import { useEditor } from "../../context/editor-provider";
import ElementToolbar from "./element-toolbar";

const LoginForm = ({ element }) => {
  const { state, dispatch } = useEditor();
  const isSelected = state.editor.selectedElement.id === element.id;
  const isLive = state.editor.liveMode || state.editor.previewMode;
  const c = !Array.isArray(element.content) ? element.content : {};
  const s = element.styles;
  const border = isSelected && !isLive ? "2px solid #3b82f6" : !isLive ? "1px dashed rgba(255,255,255,0.08)" : "none";
  const inp = { width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"10px 14px",fontSize:14,color:"#fff",outline:"none" };

  return (
    <div style={{...s,position:"relative",width:"100%",margin:"5px",border,transition:"border 0.15s"}}
      
      onClick={e=>{e.stopPropagation();dispatch({type:"CHANGE_CLICKED_ELEMENT",payload:{elementDetails:element}});}}>
      {isSelected&&!isLive&&<ElementToolbar element={element}/>}
      {isSelected&&!isLive&&<div style={{position:"absolute",top:-23,left:-1,background:"#3b82f6",color:"#fff",fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:"6px 6px 0 0",zIndex:10}}>{element.name}</div>}
      <div style={{maxWidth:380,margin:"0 auto"}}>
        {c.title&&<h3 style={{fontSize:22,fontWeight:700,textAlign:"center",marginBottom:6,color:"#fff"}}>{c.title}</h3>}
        {c.subtitle&&<p style={{fontSize:14,textAlign:"center",marginBottom:24,color:"rgba(255,255,255,0.45)"}}>{c.subtitle}</p>}
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div><label style={{fontSize:13,fontWeight:500,display:"block",marginBottom:6}}>Email</label><input type="email" placeholder={c.emailPlaceholder||"you@example.com"} disabled style={inp}/></div>
          <div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <label style={{fontSize:13,fontWeight:500}}>Password</label>
              {c.showForgot!=="false"&&<a href="#" style={{fontSize:12,color:"#6366f1"}}>Forgot password?</a>}
            </div>
            <input type="password" placeholder="••••••••" disabled style={inp}/>
          </div>
          <button disabled style={{width:"100%",padding:"12px",borderRadius:s.borderRadius||8,fontSize:14,fontWeight:700,cursor:"pointer",background:c.buttonColor||"#6366f1",color:"#fff",border:"none",marginTop:4}}>{c.buttonText||"Sign In"}</button>
        </div>
        {c.signupText&&<p style={{fontSize:12,textAlign:"center",marginTop:16,color:"rgba(255,255,255,0.4)"}}>{c.signupText} <a href="#" style={{color:"#6366f1"}}>{c.signupLink||"Create account"}</a></p>}
      </div>
    </div>
  );
};
export default LoginForm;
