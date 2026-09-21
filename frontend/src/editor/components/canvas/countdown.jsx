import { useEffect, useState } from "react";
import { useEditor } from "../../context/editor-provider";
import ElementToolbar from "./element-toolbar";

const CountdownComponent = ({ element }) => {
  const { state, dispatch } = useEditor();
  const isSelected = state.editor.selectedElement.id === element.id;
  const isLive = state.editor.liveMode || state.editor.previewMode;
  const c = !Array.isArray(element.content) ? element.content : {};
  const [timeLeft, setTimeLeft] = useState({ days:0,hours:0,minutes:0,seconds:0 });
  const border = isSelected && !isLive ? "2px solid #3b82f6" : !isLive ? "1px dashed rgba(255,255,255,0.08)" : "none";

  useEffect(() => {
    const calc = () => {
      const target = new Date(c.targetDate||Date.now()+7*24*3600*1000).getTime();
      const diff = Math.max(0,target-Date.now());
      setTimeLeft({ days:Math.floor(diff/86400000),hours:Math.floor((diff%86400000)/3600000),minutes:Math.floor((diff%3600000)/60000),seconds:Math.floor((diff%60000)/1000) });
    };
    calc();
    const id=setInterval(calc,1000);
    return ()=>clearInterval(id);
  },[c.targetDate]);

  const pad = n => String(n).padStart(2,"0");
  const Block = ({ value, label }) => (
    <div style={{ display:"flex",flexDirection:"column",alignItems:"center" }}>
      <div style={{ fontSize:30,fontWeight:800,fontFamily:"monospace",background:"rgba(255,255,255,0.06)",padding:"8px 12px",borderRadius:10,minWidth:60,textAlign:"center",border:"1px solid rgba(255,255,255,0.08)" }}>{value}</div>
      <span style={{ fontSize:11,textTransform:"uppercase",letterSpacing:"0.1em",marginTop:4,color:"rgba(255,255,255,0.4)" }}>{label}</span>
    </div>
  );

  return (
    <div style={{ ...element.styles,position:"relative",width:"100%",margin:"5px",border,transition:"border 0.15s" }}
      
      onClick={e=>{e.stopPropagation();dispatch({type:"CHANGE_CLICKED_ELEMENT",payload:{elementDetails:element}});}}>
      {isSelected&&!isLive&&<ElementToolbar element={element}/>}
      {isSelected&&!isLive&&<div style={{position:"absolute",top:-23,left:-1,background:"#3b82f6",color:"#fff",fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:"6px 6px 0 0",zIndex:10}}>{element.name}</div>}
      {c.label&&<p style={{fontSize:14,fontWeight:600,marginBottom:12,color:"rgba(255,255,255,0.6)"}}>{c.label}</p>}
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"center",gap:12,flexWrap:"wrap"}}>
        <Block value={pad(timeLeft.days)} label="Days"/>
        <span style={{fontSize:28,fontWeight:"bold",marginTop:8,color:"rgba(255,255,255,0.3)"}}>:</span>
        <Block value={pad(timeLeft.hours)} label="Hours"/>
        <span style={{fontSize:28,fontWeight:"bold",marginTop:8,color:"rgba(255,255,255,0.3)"}}>:</span>
        <Block value={pad(timeLeft.minutes)} label="Mins"/>
        <span style={{fontSize:28,fontWeight:"bold",marginTop:8,color:"rgba(255,255,255,0.3)"}}>:</span>
        <Block value={pad(timeLeft.seconds)} label="Secs"/>
      </div>
    </div>
  );
};
export default CountdownComponent;
