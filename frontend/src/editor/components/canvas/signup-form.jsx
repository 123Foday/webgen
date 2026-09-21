import { useEditor } from "../../context/editor-provider";
import ElementToolbar from "./element-toolbar";

const FIELD_CONFIG = {
  name:     { label:"Full Name",        type:"text",     placeholder:"John Doe" },
  email:    { label:"Email",            type:"email",    placeholder:"you@example.com" },
  phone:    { label:"Phone",            type:"tel",      placeholder:"+1 (555) 000-0000" },
  company:  { label:"Company",          type:"text",     placeholder:"Acme Inc." },
  password: { label:"Password",         type:"password", placeholder:"••••••••" },
  confirm:  { label:"Confirm Password", type:"password", placeholder:"••••••••" },
  message:  { label:"Message",          type:"textarea", placeholder:"Your message..." },
};

const SignupForm = ({ element }) => {
  const { state, dispatch } = useEditor();
  const isSelected = state.editor.selectedElement.id === element.id;
  const isLive = state.editor.liveMode || state.editor.previewMode;
  const c = !Array.isArray(element.content) ? element.content : {};
  const s = element.styles;
  const fields = c.fields ? JSON.parse(c.fields) : ["name","email","password"];
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
          {fields.map(f=>{const cfg=FIELD_CONFIG[f]||{label:f,type:"text",placeholder:""};return(
            <div key={f}><label style={{fontSize:13,fontWeight:500,display:"block",marginBottom:6}}>{cfg.label}</label>
              {cfg.type==="textarea"
                ?<textarea placeholder={cfg.placeholder} disabled rows={3} style={{...inp,resize:"none"}}/>
                :<input type={cfg.type} placeholder={cfg.placeholder} disabled style={inp}/>}
            </div>);})}
          <button disabled style={{width:"100%",padding:"12px",borderRadius:s.borderRadius||8,fontSize:14,fontWeight:700,background:c.buttonColor||"#6366f1",color:"#fff",border:"none",marginTop:4}}>{c.buttonText||"Create Account"}</button>
        </div>
        {c.loginText&&<p style={{fontSize:12,textAlign:"center",marginTop:16,color:"rgba(255,255,255,0.4)"}}>{c.loginText} <a href="#" style={{color:"#6366f1"}}>{c.loginLink||"Sign in"}</a></p>}
      </div>
    </div>
  );
};
export default SignupForm;
