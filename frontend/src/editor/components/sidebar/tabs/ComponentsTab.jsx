import { useState } from "react";

// ── Drag source helper ──────────────────────────────────────────────────────
const Tile = ({ icon, label, type, isSection }) => {
  const onDrag = (e) => e.dataTransfer.setData("componentType", type);
  return (
    <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:4 }}>
      <div
        draggable onDragStart={onDrag}
        style={{
          width:56,height:56,borderRadius:10,cursor:"grab",userSelect:"none",display:"flex",flexDirection:"column",
          alignItems:"center",justifyContent:"center",gap:4,fontSize:10,fontWeight:500,
          background: isSection ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.04)",
          border: isSection ? "2px dashed rgba(99,102,241,0.4)" : "2px dashed rgba(255,255,255,0.08)",
          color:"rgba(255,255,255,0.55)",transition:"all 0.15s",
        }}
        onMouseEnter={e=>{e.currentTarget.style.background=isSection?"rgba(99,102,241,0.2)":"rgba(255,255,255,0.08)";e.currentTarget.style.borderColor=isSection?"#6366f1":"rgba(255,255,255,0.2)";e.currentTarget.style.color="#fff";}}
        onMouseLeave={e=>{e.currentTarget.style.background=isSection?"rgba(99,102,241,0.12)":"rgba(255,255,255,0.04)";e.currentTarget.style.borderColor=isSection?"rgba(99,102,241,0.4)":"rgba(255,255,255,0.08)";e.currentTarget.style.color="rgba(255,255,255,0.55)";}}
      >
        <span style={{fontSize:isSection?14:18,lineHeight:1}}>{icon}</span>
        {isSection && <span style={{fontSize:9,fontWeight:700,color:"rgba(99,102,241,0.9)",textTransform:"uppercase",letterSpacing:"0.05em"}}>{label}</span>}
      </div>
      {!isSection && <span style={{fontSize:10,color:"rgba(255,255,255,0.4)",textAlign:"center",maxWidth:56,lineHeight:1.3}}>{label}</span>}
    </div>
  );
};

const GROUP_META = [
  { id:"layout",      label:"Layout",      desc:"Structure & spacing" },
  { id:"content",     label:"Content",     desc:"Text, media & buttons" },
  { id:"interactive", label:"Interactive", desc:"Cards, timers & data" },
  { id:"forms",       label:"Forms",       desc:"Collect user info" },
  { id:"sections",    label:"Sections",    desc:"Full pre-built sections" },
];

const ELEMENTS = [
  // Layout
  { icon:"□",  label:"Container",    type:"container",    group:"layout",      kw:["box","div","wrapper"] },
  { icon:"⊟",  label:"2 Columns",   type:"2Col",         group:"layout",      kw:["two","columns","grid"] },
  { icon:"⊞",  label:"3 Columns",   type:"3Col",         group:"layout",      kw:["three","columns"] },
  { icon:"⊠",  label:"4 Columns",   type:"4Col",         group:"layout",      kw:["four","columns"] },
  { icon:"↕",  label:"Spacer",      type:"spacer",       group:"layout",      kw:["gap","space","height"] },
  { icon:"─",  label:"Divider",     type:"divider",      group:"layout",      kw:["line","separator","hr"] },
  // Content
  { icon:"H1", label:"Heading",     type:"heading",      group:"content",     kw:["h1","h2","title","headline"] },
  { icon:"¶",  label:"Text",        type:"text",         group:"content",     kw:["paragraph","body","copy"] },
  { icon:"⬛", label:"Button",      type:"button",       group:"content",     kw:["cta","click","action"] },
  { icon:"🔗", label:"Link",        type:"link",         group:"content",     kw:["anchor","url","href"] },
  { icon:"🖼️", label:"Image",       type:"image",        group:"content",     kw:["photo","picture","img"] },
  { icon:"▶️", label:"Video",       type:"video",        group:"content",     kw:["youtube","embed","media"] },
  { icon:"•",  label:"List",        type:"list",         group:"content",     kw:["bullet","ordered","ul","ol"] },
  { icon:"❝",  label:"Blockquote",  type:"blockquote",   group:"content",     kw:["quote","cite","pull"] },
  { icon:"</>",label:"Code Block",  type:"code",         group:"content",     kw:["code","syntax","developer"] },
  // Interactive
  { icon:"⭐", label:"Icon Box",    type:"icon-box",     group:"interactive", kw:["feature","icon","benefits"] },
  { icon:"🃏", label:"Card",        type:"card",         group:"interactive", kw:["card","tile","product"] },
  { icon:"⏱", label:"Countdown",   type:"countdown",    group:"interactive", kw:["timer","clock","deadline"] },
  { icon:"█",  label:"Progress",    type:"progress-bar", group:"interactive", kw:["progress","percentage","bar"] },
  { icon:"⚠",  label:"Alert",       type:"alert",        group:"interactive", kw:["alert","notice","warning"] },
  { icon:"⊞",  label:"Table",       type:"table",        group:"interactive", kw:["table","data","rows"] },
  // Forms
  { icon:"🔑", label:"Login Form",  type:"login-form",   group:"forms",       kw:["login","signin","auth"] },
  { icon:"📝", label:"Sign Up",     type:"signup-form",  group:"forms",       kw:["signup","register","create"] },
  { icon:"▭",  label:"Input Field", type:"input-group",  group:"forms",       kw:["input","field","textarea"] },
  // Sections
  { icon:"≡",  label:"Navbar",      type:"section-navbar",      group:"sections", kw:["nav","header","menu","logo"] },
  { icon:"🚀", label:"Hero",        type:"section-hero",        group:"sections", kw:["hero","banner","landing"] },
  { icon:"✦",  label:"Features",    type:"section-features",    group:"sections", kw:["features","benefits","grid"] },
  { icon:"💎", label:"Pricing",     type:"section-pricing",     group:"sections", kw:["pricing","plans","cost"] },
  { icon:"📣", label:"CTA",         type:"section-cta",         group:"sections", kw:["cta","call to action"] },
  { icon:"❓", label:"FAQ",         type:"section-faq",         group:"sections", kw:["faq","questions","answers"] },
  { icon:"#",  label:"Stats",       type:"section-stats",       group:"sections", kw:["stats","numbers","metrics"] },
  { icon:"❝",  label:"Testimonial", type:"section-testimonial", group:"sections", kw:["testimonial","quote","review"] },
  { icon:"👥", label:"Team",        type:"section-team",        group:"sections", kw:["team","people","staff"] },
  { icon:"⬛", label:"Footer",      type:"section-footer",      group:"sections", kw:["footer","copyright","links"] },
];

const AccordionGroup = ({ id, label, desc, elements, open, onToggle }) => (
  <div style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
    <button onClick={onToggle} style={{ width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",background:"transparent",border:"none",cursor:"pointer",color:"rgba(255,255,255,0.55)" }}>
      <div style={{ textAlign:"left" }}>
        <p style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color: open?"#fff":"rgba(255,255,255,0.55)",margin:0 }}>{label}</p>
        <p style={{ fontSize:10,color:"rgba(255,255,255,0.3)",margin:0,marginTop:1 }}>{desc}</p>
      </div>
      <span style={{ fontSize:12,transform: open?"rotate(180deg)":"rotate(0)",transition:"transform 0.2s",flexShrink:0 }}>▾</span>
    </button>
    {open && (
      <div style={{ display:"flex",flexWrap:"wrap",gap:10,paddingBottom:14 }}>
        {elements.map(el => <Tile key={el.type} icon={el.icon} label={el.label} type={el.type} isSection={id==="sections"} />)}
      </div>
    )}
  </div>
);

const ComponentsTab = () => {
  const [search, setSearch] = useState("");
  const [openGroups, setOpenGroups] = useState(["layout","content","interactive","forms","sections"]);
  const q = search.trim().toLowerCase();

  const filtered = q ? ELEMENTS.filter(el => el.label.toLowerCase().includes(q) || el.kw.some(k=>k.includes(q))) : ELEMENTS;
  const toggle = (id) => setOpenGroups(prev => prev.includes(id) ? prev.filter(g=>g!==id) : [...prev,id]);

  return (
    <div style={{ padding:"12px 16px 24px" }}>
      {/* Search */}
      <div style={{ position:"relative",marginBottom:12 }}>
        <span style={{ position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"rgba(255,255,255,0.3)",fontSize:13 }}>🔍</span>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search 35+ components…"
          style={{ width:"100%",paddingLeft:32,paddingRight:12,paddingTop:7,paddingBottom:7,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,fontSize:12,color:"#fff",outline:"none",boxSizing:"border-box" }}/>
      </div>

      {q ? (
        <div style={{ display:"flex",flexWrap:"wrap",gap:10,paddingTop:4 }}>
          {filtered.length===0 ? <p style={{ fontSize:12,color:"rgba(255,255,255,0.3)",textAlign:"center",width:"100%",padding:"24px 0" }}>No components found</p>
            : filtered.map(el=><Tile key={el.type} icon={el.icon} label={el.label} type={el.type} isSection={el.group==="sections"}/>)}
        </div>
      ) : (
        GROUP_META.map(g => (
          <AccordionGroup key={g.id} id={g.id} label={g.label} desc={g.desc}
            elements={ELEMENTS.filter(el=>el.group===g.id)}
            open={openGroups.includes(g.id)} onToggle={()=>toggle(g.id)}/>
        ))
      )}
    </div>
  );
};

export default ComponentsTab;
