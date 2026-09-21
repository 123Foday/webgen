import { useState } from "react";
import { useEditor } from "../../../context/editor-provider";
import { LayoutPanelLeft } from "lucide-react";

// ── Reusable mini components ────────────────────────────────────────────────
const Label = ({ children }) => (
  <p style={{ fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.07em",color:"rgba(255,255,255,0.4)",marginBottom:4,marginTop:0 }}>{children}</p>
);

const StyledInput = ({ value, onChange, placeholder, type="text", style={} }) => (
  <input type={type} value={value||""} onChange={onChange} placeholder={placeholder}
    style={{ width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:7,padding:"6px 10px",fontSize:12,color:"#fff",outline:"none",boxSizing:"border-box",...style }}/>
);

const StyledSelect = ({ value, onChange, children }) => (
  <select value={value||""} onChange={onChange}
    style={{ width:"100%",background:"#0a0b0c",border:"1px solid rgba(255,255,255,0.08)",borderRadius:7,padding:"6px 10px",fontSize:12,color:"#fff",outline:"none",boxSizing:"border-box" }}>
    {children}
  </select>
);

const ColorRow = ({ label, value, onChange }) => (
  <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8 }}>
    <input type="color" value={value||"#000000"} onChange={e=>onChange(e.target.value)}
      style={{ width:30,height:30,borderRadius:6,border:"1px solid rgba(255,255,255,0.1)",padding:2,background:"transparent",cursor:"pointer",flexShrink:0 }}/>
    <div style={{ flex:1,minWidth:0 }}>
      <Label>{label}</Label>
      <StyledInput value={value} onChange={e=>onChange(e.target.value)} placeholder="#000000"/>
    </div>
  </div>
);

const Toggle = ({ checked, onChange, label }) => (
  <label style={{ display:"flex",alignItems:"center",gap:8,cursor:"pointer" }}>
    <div onClick={()=>onChange(!checked)}
      style={{ width:34,height:18,borderRadius:999,background:checked?"#6366f1":"rgba(255,255,255,0.1)",position:"relative",transition:"background 0.2s",cursor:"pointer",flexShrink:0 }}>
      <div style={{ position:"absolute",top:2,left:checked?18:2,width:14,height:14,borderRadius:999,background:"#fff",transition:"left 0.2s" }}/>
    </div>
    <span style={{ fontSize:12,color:"rgba(255,255,255,0.6)" }}>{label}</span>
  </label>
);

const Section = ({ title, children, defaultOpen=true }) => {
  const [open,setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
      <button onClick={()=>setOpen(v=>!v)} style={{ width:"100%",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",background:"transparent",border:"none",cursor:"pointer" }}>
        <span style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"rgba(255,255,255,0.55)" }}>{title}</span>
        <span style={{ fontSize:11,color:"rgba(255,255,255,0.3)",transform:open?"rotate(180deg)":"rotate(0)",transition:"transform 0.2s" }}>▾</span>
      </button>
      {open && <div style={{ paddingBottom:14,display:"flex",flexDirection:"column",gap:8 }}>{children}</div>}
    </div>
  );
};

const TabBtn = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{ flex:1,padding:"6px 0",fontSize:11,fontWeight:600,background:"transparent",border:"none",cursor:"pointer",borderBottom:`2px solid ${active?"#6366f1":"transparent"}`,color:active?"#a5b4fc":"rgba(255,255,255,0.4)",transition:"all 0.15s" }}>
    {children}
  </button>
);

const AlignBtn = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{ flex:1,height:28,display:"flex",alignItems:"center",justifyContent:"center",background:active?"rgba(99,102,241,0.2)":"transparent",border:`1px solid ${active?"rgba(99,102,241,0.5)":"rgba(255,255,255,0.08)"}`,borderRadius:6,cursor:"pointer",color:active?"#a5b4fc":"rgba(255,255,255,0.4)",transition:"all 0.15s" }}>
    {children}
  </button>
);

const FONTS = ["Inter","DM Sans","Roboto","Open Sans","Montserrat","Playfair Display","Lato","Poppins","Nunito","Raleway","Georgia","monospace"];

// ── Main component ──────────────────────────────────────────────────────────
const SettingsTab = () => {
  const { state, dispatch } = useEditor();
  const [activeTab, setActiveTab] = useState("style");
  const el = state.editor.selectedElement;
  const s = el.styles;
  const c = !Array.isArray(el.content) ? el.content : null;

  const update = (id, value) =>
    dispatch({ type:"UPDATE_ELEMENT", payload:{ elementDetails:{ ...el, styles:{ ...s, [id]:value } } } });
  const updateContent = (id, value) =>
    dispatch({ type:"UPDATE_ELEMENT", payload:{ elementDetails:{ ...el, content:{ ...(c||{}), [id]:value } } } });

  if (!el.type) return (
    <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8,padding:"48px 16px",textAlign:"center",color:"rgba(255,255,255,0.3)" }}>
      <LayoutPanelLeft size={32} style={{ opacity:0.3 }}/>
      <p style={{ fontSize:13,fontWeight:500,margin:0,color:"rgba(255,255,255,0.45)" }}>No element selected</p>
      <p style={{ fontSize:12,margin:0 }}>Click any element on the canvas to edit it</p>
    </div>
  );

  return (
    <div style={{ display:"flex",flexDirection:"column",height:"100%" }}>
      {/* Tab switcher */}
      <div style={{ display:"flex",borderBottom:"1px solid rgba(255,255,255,0.06)",padding:"0 16px",flexShrink:0 }}>
        <TabBtn active={activeTab==="style"} onClick={()=>setActiveTab("style")}>Style</TabBtn>
        <TabBtn active={activeTab==="content"} onClick={()=>setActiveTab("content")}>Content</TabBtn>
        <TabBtn active={activeTab==="advanced"} onClick={()=>setActiveTab("advanced")}>Advanced</TabBtn>
      </div>

      <div style={{ flex:1,overflowY:"auto",padding:"0 16px" }}>

        {/* ── STYLE TAB ── */}
        {activeTab==="style" && (
          <>
            <Section title="Typography">
              <div>
                <Label>Text Align</Label>
                <div style={{ display:"flex",gap:4 }}>
                  {["left","center","right","justify"].map(a=><AlignBtn key={a} active={s.textAlign===a} onClick={()=>update("textAlign",a)}>{a==="left"?"⬅":a==="center"?"↔":a==="right"?"➡":"⇔"}</AlignBtn>)}
                </div>
              </div>
              <div>
                <Label>Font Family</Label>
                <StyledSelect value={s.fontFamily} onChange={e=>update("fontFamily",e.target.value)}>
                  <option value="">Default</option>
                  {FONTS.map(f=><option key={f} value={f} style={{fontFamily:f}}>{f}</option>)}
                </StyledSelect>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
                <div><Label>Color</Label><ColorRow value={s.color} onChange={v=>update("color",v)}/></div>
                <div><Label>Weight</Label>
                  <StyledSelect value={s.fontWeight} onChange={e=>update("fontWeight",e.target.value)}>
                    {[["100","Thin"],["300","Light"],["400","Regular"],["500","Medium"],["600","SemiBold"],["700","Bold"],["800","ExtraBold"],["900","Black"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}
                  </StyledSelect>
                </div>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
                <div><Label>Font Size</Label><StyledInput value={s.fontSize} onChange={e=>update("fontSize",e.target.value)} placeholder="16px"/></div>
                <div><Label>Line Height</Label><StyledInput value={s.lineHeight} onChange={e=>update("lineHeight",e.target.value)} placeholder="1.5"/></div>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
                <div><Label>Letter Spacing</Label><StyledInput value={s.letterSpacing} onChange={e=>update("letterSpacing",e.target.value)} placeholder="0px"/></div>
                <div><Label>Transform</Label>
                  <StyledSelect value={s.textTransform} onChange={e=>update("textTransform",e.target.value)}>
                    {["none","uppercase","lowercase","capitalize"].map(v=><option key={v} value={v}>{v}</option>)}
                  </StyledSelect>
                </div>
              </div>
            </Section>

            <Section title="Dimensions">
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
                {[["width","W"],["height","H"],["minWidth","Min W"],["maxWidth","Max W"],["minHeight","Min H"],["maxHeight","Max H"]].map(([k,l])=>(
                  <div key={k}><Label>{l}</Label><StyledInput value={s[k]} onChange={e=>update(k,e.target.value)} placeholder="auto"/></div>
                ))}
              </div>
              <Label>Margin</Label>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:6 }}>
                {[["marginTop","Top"],["marginRight","Right"],["marginBottom","Bottom"],["marginLeft","Left"]].map(([k,l])=>(
                  <div key={k}><Label>{l}</Label><StyledInput value={s[k]} onChange={e=>update(k,e.target.value)} placeholder="0"/></div>
                ))}
              </div>
              <Label>Padding</Label>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:6 }}>
                {[["paddingTop","Top"],["paddingRight","Right"],["paddingBottom","Bottom"],["paddingLeft","Left"]].map(([k,l])=>(
                  <div key={k}><Label>{l}</Label><StyledInput value={s[k]} onChange={e=>update(k,e.target.value)} placeholder="0"/></div>
                ))}
              </div>
            </Section>

            <Section title="Decorations">
              <div><Label>Background Color</Label><ColorRow value={s.backgroundColor} onChange={v=>update("backgroundColor",v)}/></div>
              <div><Label>Background Image</Label><StyledInput value={s.backgroundImage} onChange={e=>update("backgroundImage",e.target.value)} placeholder="url(…) or gradient"/></div>
              <div>
                <Label>Background Size</Label>
                <div style={{ display:"flex",gap:4 }}>
                  {["cover","contain","auto"].map(v=><AlignBtn key={v} active={s.backgroundSize===v} onClick={()=>update("backgroundSize",v)}>{v}</AlignBtn>)}
                </div>
              </div>
              <div>
                <Label>Border Radius — {parseFloat(String(s.borderRadius||"0").replace(/[^0-9.]/g,""))||0}px</Label>
                <input type="range" min={0} max={100} step={1} value={parseFloat(String(s.borderRadius||"0").replace(/[^0-9.]/g,""))||0}
                  onChange={e=>update("borderRadius",`${e.target.value}px`)} style={{ width:"100%",accentColor:"#6366f1" }}/>
              </div>
              <div><Label>Box Shadow</Label><StyledInput value={s.boxShadow} onChange={e=>update("boxShadow",e.target.value)} placeholder="0 4px 6px rgba(0,0,0,0.3)"/></div>
            </Section>

            <Section title="Border">
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8 }}>
                <div><Label>Width</Label><StyledInput value={s.borderWidth} onChange={e=>update("borderWidth",e.target.value)} placeholder="0px"/></div>
                <div><Label>Style</Label>
                  <StyledSelect value={s.borderStyle} onChange={e=>update("borderStyle",e.target.value)}>
                    {["none","solid","dashed","dotted","double"].map(v=><option key={v} value={v}>{v}</option>)}
                  </StyledSelect>
                </div>
                <div><Label>Color</Label><input type="color" value={s.borderColor||"#ffffff"} onChange={e=>update("borderColor",e.target.value)} style={{ width:"100%",height:32,borderRadius:6,border:"1px solid rgba(255,255,255,0.1)",padding:2,background:"transparent",cursor:"pointer" }}/></div>
              </div>
            </Section>

            <Section title="Flexbox">
              <Toggle checked={s.display==="flex"} onChange={v=>update("display",v?"flex":"block")} label="Enable Flexbox"/>
              {s.display==="flex" && (
                <>
                  <div><Label>Direction</Label>
                    <StyledSelect value={s.flexDirection} onChange={e=>update("flexDirection",e.target.value)}>
                      {["row","column","row-reverse","column-reverse"].map(v=><option key={v} value={v}>{v}</option>)}
                    </StyledSelect>
                  </div>
                  <div><Label>Justify Content</Label>
                    <div style={{ display:"flex",gap:4 }}>
                      {["flex-start","center","flex-end","space-between","space-evenly"].map(v=><AlignBtn key={v} active={s.justifyContent===v} onClick={()=>update("justifyContent",v)}>{v==="flex-start"?"⊣":v==="center"?"↔":v==="flex-end"?"⊢":v==="space-between"?"⇔":"≡"}</AlignBtn>)}
                    </div>
                  </div>
                  <div><Label>Align Items</Label>
                    <div style={{ display:"flex",gap:4 }}>
                      {["flex-start","center","flex-end","stretch"].map(v=><AlignBtn key={v} active={s.alignItems===v} onClick={()=>update("alignItems",v)}>{v==="flex-start"?"⊤":v==="center"?"↕":v==="flex-end"?"⊥":"↨"}</AlignBtn>)}
                    </div>
                  </div>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
                    <div><Label>Wrap</Label>
                      <StyledSelect value={s.flexWrap} onChange={e=>update("flexWrap",e.target.value)}>
                        {["nowrap","wrap","wrap-reverse"].map(v=><option key={v} value={v}>{v}</option>)}
                      </StyledSelect>
                    </div>
                    <div><Label>Gap</Label><StyledInput value={s.gap} onChange={e=>update("gap",e.target.value)} placeholder="0px"/></div>
                  </div>
                </>
              )}
            </Section>
          </>
        )}

        {/* ── CONTENT TAB ── */}
        {activeTab==="content" && (
          <div style={{ paddingTop:12,display:"flex",flexDirection:"column",gap:12 }}>
            {!c && <p style={{ fontSize:12,color:"rgba(255,255,255,0.3)",textAlign:"center",padding:"24px 0" }}>No editable content for this element.</p>}
            {c && <>
              {(el.type==="link"||el.type==="button")&&<div><Label>URL</Label><StyledInput value={c.href} onChange={e=>updateContent("href",e.target.value)} placeholder="https://example.com"/></div>}
              {el.type==="image"&&<>
                <div><Label>Image URL</Label><StyledInput value={c.src} onChange={e=>updateContent("src",e.target.value)} placeholder="https://…/image.png"/></div>
                <div><Label>Alt Text</Label><StyledInput value={c.alt} onChange={e=>updateContent("alt",e.target.value)} placeholder="Describe the image"/></div>
                <div><Label>Object Fit</Label><StyledSelect value={s.objectFit} onChange={e=>update("objectFit",e.target.value)}>{["cover","contain","fill","none","scale-down"].map(v=><option key={v} value={v}>{v}</option>)}</StyledSelect></div>
              </>}
              {el.type==="video"&&<div><Label>Embed URL</Label><StyledInput value={c.src} onChange={e=>updateContent("src",e.target.value)} placeholder="https://www.youtube.com/embed/…"/></div>}
              {el.type==="heading"&&<div><Label>Heading Level</Label><StyledSelect value={c.level||"h2"} onChange={e=>updateContent("level",e.target.value)}>{["h1","h2","h3","h4","h5","h6"].map(v=><option key={v} value={v}>{v.toUpperCase()}</option>)}</StyledSelect></div>}
              {el.type==="list"&&<Toggle checked={!!c.ordered} onChange={v=>updateContent("ordered",v)} label="Ordered (numbered) list"/>}
              {el.type==="icon-box"&&<>
                <div><Label>Icon (emoji)</Label><StyledInput value={c.icon} onChange={e=>updateContent("icon",e.target.value)} placeholder="⭐"/></div>
                <div><Label>Title</Label><StyledInput value={c.title} onChange={e=>updateContent("title",e.target.value)} placeholder="Feature Title"/></div>
                <div><Label>Description</Label><textarea value={c.description||""} onChange={e=>updateContent("description",e.target.value)} placeholder="Short description" rows={3} style={{ width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:7,padding:"6px 10px",fontSize:12,color:"#fff",outline:"none",resize:"none",boxSizing:"border-box" }}/></div>
              </>}
              {el.type==="card"&&<>
                <div><Label>Image URL</Label><StyledInput value={c.imageSrc} onChange={e=>updateContent("imageSrc",e.target.value)} placeholder="https://…/image.jpg"/></div>
                <div><Label>Title</Label><StyledInput value={c.title} onChange={e=>updateContent("title",e.target.value)} placeholder="Card Title"/></div>
                <div><Label>Button Text</Label><StyledInput value={c.buttonText} onChange={e=>updateContent("buttonText",e.target.value)} placeholder="Learn More"/></div>
                <div><Label>Button URL</Label><StyledInput value={c.buttonHref} onChange={e=>updateContent("buttonHref",e.target.value)} placeholder="#"/></div>
              </>}
              {el.type==="countdown"&&<>
                <div><Label>Target Date</Label><StyledInput type="date" value={c.targetDate} onChange={e=>updateContent("targetDate",e.target.value)}/></div>
                <div><Label>Label</Label><StyledInput value={c.label} onChange={e=>updateContent("label",e.target.value)} placeholder="Sale ends in"/></div>
              </>}
              {el.type==="progress-bar"&&<>
                <div><Label>Label</Label><StyledInput value={c.label} onChange={e=>updateContent("label",e.target.value)} placeholder="Progress"/></div>
                <div>
                  <Label>Percentage — {Number(c.percentage)||75}%</Label>
                  <input type="range" min={0} max={100} step={1} value={Number(c.percentage)||75} onChange={e=>updateContent("percentage",e.target.value)} style={{ width:"100%",accentColor:"#6366f1" }}/>
                </div>
                <div><Label>Bar Color</Label><ColorRow value={c.color} onChange={v=>updateContent("color",v)}/></div>
              </>}
              {el.type==="alert"&&<>
                <div><Label>Type</Label><StyledSelect value={c.variant||"info"} onChange={e=>updateContent("variant",e.target.value)}>{["info","success","warning","error"].map(v=><option key={v} value={v}>{v.charAt(0).toUpperCase()+v.slice(1)}</option>)}</StyledSelect></div>
                <div><Label>Title</Label><StyledInput value={c.title} onChange={e=>updateContent("title",e.target.value)} placeholder="Heads up!"/></div>
                <div><Label>Message</Label><textarea value={c.message||""} onChange={e=>updateContent("message",e.target.value)} rows={3} style={{ width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:7,padding:"6px 10px",fontSize:12,color:"#fff",outline:"none",resize:"none",boxSizing:"border-box" }}/></div>
              </>}
              {el.type==="code"&&<>
                <div><Label>Language</Label><StyledSelect value={c.language||"javascript"} onChange={e=>updateContent("language",e.target.value)}>{["javascript","typescript","python","html","css","bash","json","sql","rust","go","php","java"].map(l=><option key={l} value={l}>{l}</option>)}</StyledSelect></div>
                <div><Label>Code</Label><textarea value={c.code||""} onChange={e=>updateContent("code",e.target.value)} rows={8} style={{ width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:7,padding:"6px 10px",fontSize:11,fontFamily:"monospace",color:"#34d399",outline:"none",resize:"none",boxSizing:"border-box" }}/></div>
              </>}
              {el.type==="blockquote"&&<>
                <div><Label>Quote</Label><textarea value={c.text||""} onChange={e=>updateContent("text",e.target.value)} rows={3} style={{ width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:7,padding:"6px 10px",fontSize:12,color:"#fff",outline:"none",resize:"none",boxSizing:"border-box" }}/></div>
                <div><Label>Author</Label><StyledInput value={c.author} onChange={e=>updateContent("author",e.target.value)} placeholder="— Author Name"/></div>
                <div><Label>Accent Color</Label><ColorRow value={c.accentColor} onChange={v=>updateContent("accentColor",v)}/></div>
              </>}
              {el.type==="input-group"&&<>
                <div><Label>Label</Label><StyledInput value={c.label} onChange={e=>updateContent("label",e.target.value)} placeholder="Your Name"/></div>
                <div><Label>Placeholder</Label><StyledInput value={c.placeholder} onChange={e=>updateContent("placeholder",e.target.value)} placeholder="Enter value…"/></div>
                <div><Label>Input Type</Label><StyledSelect value={c.inputType||"text"} onChange={e=>updateContent("inputType",e.target.value)}>{["text","email","password","number","tel","url","date","textarea","select","checkbox","radio"].map(t=><option key={t} value={t}>{t}</option>)}</StyledSelect></div>
                {(c.inputType==="select"||c.inputType==="radio")&&<div><Label>Options (comma-separated)</Label><StyledInput value={c.options} onChange={e=>updateContent("options",e.target.value)} placeholder="Option 1, Option 2"/></div>}
                <div><Label>Helper Text</Label><StyledInput value={c.helperText} onChange={e=>updateContent("helperText",e.target.value)} placeholder="Optional note"/></div>
              </>}
              {el.type==="login-form"&&<>
                <div><Label>Title</Label><StyledInput value={c.title} onChange={e=>updateContent("title",e.target.value)} placeholder="Welcome back"/></div>
                <div><Label>Subtitle</Label><StyledInput value={c.subtitle} onChange={e=>updateContent("subtitle",e.target.value)} placeholder="Sign in"/></div>
                <div><Label>Button Text</Label><StyledInput value={c.buttonText} onChange={e=>updateContent("buttonText",e.target.value)} placeholder="Sign In"/></div>
                <div><Label>Button Color</Label><ColorRow value={c.buttonColor} onChange={v=>updateContent("buttonColor",v)}/></div>
              </>}
              {el.type==="signup-form"&&<>
                <div><Label>Title</Label><StyledInput value={c.title} onChange={e=>updateContent("title",e.target.value)} placeholder="Create account"/></div>
                <div><Label>Button Text</Label><StyledInput value={c.buttonText} onChange={e=>updateContent("buttonText",e.target.value)} placeholder="Create Account"/></div>
                <div><Label>Button Color</Label><ColorRow value={c.buttonColor} onChange={v=>updateContent("buttonColor",v)}/></div>
              </>}
              {el.type==="table"&&<>
                <div><Label>Headers (comma-separated)</Label><StyledInput value={c.headers?JSON.parse(c.headers).join(", "):""} onChange={e=>updateContent("headers",JSON.stringify(e.target.value.split(",").map(s=>s.trim())))} placeholder="Name, Email, Role"/></div>
                <div><Label>Header Background</Label><ColorRow value={c.headerBg} onChange={v=>updateContent("headerBg",v)}/></div>
                <Toggle checked={c.striped!=="false"} onChange={v=>updateContent("striped",v?"true":"false")} label="Striped rows"/>
              </>}
            </>}
          </div>
        )}

        {/* ── ADVANCED TAB ── */}
        {activeTab==="advanced" && (
          <>
            <Section title="Visibility & Opacity">
              <div>
                <Label>Opacity — {Math.round((parseFloat(String(s.opacity||"1"))<=1?parseFloat(String(s.opacity||"1"))*100:parseFloat(String(s.opacity||"100"))))}%</Label>
                <input type="range" min={0} max={100} step={1}
                  value={Math.round(parseFloat(String(s.opacity||"1"))<=1?parseFloat(String(s.opacity||"1"))*100:parseFloat(String(s.opacity||"100")))}
                  onChange={e=>update("opacity",parseInt(e.target.value)/100)} style={{ width:"100%",accentColor:"#6366f1" }}/>
              </div>
              <Toggle checked={s.visibility==="hidden"} onChange={v=>update("visibility",v?"hidden":"visible")} label="Hidden (invisible, keeps space)"/>
              <Toggle checked={s.display==="none"} onChange={v=>update("display",v?"none":"block")} label="Remove from layout (display:none)"/>
            </Section>

            <Section title="Transform">
              <div><Label>Custom Transform</Label><StyledInput value={s.transform} onChange={e=>update("transform",e.target.value)} placeholder="rotate(0deg) scale(1)"/></div>
              <div><Label>Transition</Label><StyledInput value={s.transition} onChange={e=>update("transition",e.target.value)} placeholder="all 0.3s ease"/></div>
            </Section>

            <Section title="Position">
              <div><Label>Position</Label>
                <StyledSelect value={s.position||"static"} onChange={e=>update("position",e.target.value)}>
                  {["static","relative","absolute","fixed","sticky"].map(v=><option key={v} value={v}>{v}</option>)}
                </StyledSelect>
              </div>
              {(s.position==="absolute"||s.position==="fixed"||s.position==="sticky")&&(
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
                  {[["top","Top"],["right","Right"],["bottom","Bottom"],["left","Left"]].map(([k,l])=>(
                    <div key={k}><Label>{l}</Label><StyledInput value={s[k]} onChange={e=>update(k,e.target.value)} placeholder="auto"/></div>
                  ))}
                </div>
              )}
              <div><Label>Z-Index</Label><StyledInput type="number" value={s.zIndex} onChange={e=>update("zIndex",e.target.value)} placeholder="0"/></div>
            </Section>

            <Section title="Animation">
              <div><Label>CSS Animation</Label>
                <StyledSelect value={s.animation||"none"} onChange={e=>update("animation",e.target.value)}>
                  <option value="none">None</option>
                  <option value="pulse 2s infinite">Pulse</option>
                  <option value="bounce 1s infinite">Bounce</option>
                  <option value="spin 1s linear infinite">Spin</option>
                  <option value="ping 1s cubic-bezier(0,0,0.2,1) infinite">Ping</option>
                </StyledSelect>
              </div>
              <div><Label>Custom Animation</Label><StyledInput value={s.animation} onChange={e=>update("animation",e.target.value)} placeholder="fadeIn 0.5s ease"/></div>
              <div><Label>Cursor</Label>
                <StyledSelect value={s.cursor||"auto"} onChange={e=>update("cursor",e.target.value)}>
                  {["auto","default","pointer","text","move","not-allowed","crosshair","grab"].map(v=><option key={v} value={v}>{v}</option>)}
                </StyledSelect>
              </div>
              <div><Label>Overflow</Label>
                <StyledSelect value={s.overflow||"visible"} onChange={e=>update("overflow",e.target.value)}>
                  {["visible","hidden","scroll","auto"].map(v=><option key={v} value={v}>{v}</option>)}
                </StyledSelect>
              </div>
            </Section>
          </>
        )}
      </div>
    </div>
  );
};

export default SettingsTab;
