import { useState } from "react";
import { useEditor } from "../../../context/editor-provider";

const PRESETS = [
  { name:"dark-default",  label:"Dark Default",   desc:"The native dark theme",     colors:{ primary:"#6366f1",secondary:"#8b5cf6",accent:"#f43f5e",background:"#08090a",foreground:"#ffffff",muted:"rgba(255,255,255,0.04)" }, fonts:{ heading:"Inter",body:"Inter" },          radius:"8px"  },
  { name:"neon-dark",     label:"Neon Dark",       desc:"Vibrant, futuristic",       colors:{ primary:"#00ff88",secondary:"#a0aec0",accent:"#ff2cf1",background:"#0a0a0a",foreground:"#ffffff",muted:"rgba(255,255,255,0.04)" }, fonts:{ heading:"Poppins",body:"Poppins" },       radius:"6px"  },
  { name:"midnight-blue", label:"Midnight Blue",   desc:"Deep ocean tones",          colors:{ primary:"#3b82f6",secondary:"#64748b",accent:"#06b6d4",background:"#0a0f1e",foreground:"#e2e8f0",muted:"rgba(255,255,255,0.04)" }, fonts:{ heading:"Inter",body:"Inter" },          radius:"10px" },
  { name:"clean-white",   label:"Clean Light",     desc:"Minimal, airy",             colors:{ primary:"#3b82f6",secondary:"#64748b",accent:"#f59e0b",background:"#ffffff",foreground:"#0f172a",muted:"#f1f5f9"                }, fonts:{ heading:"Inter",body:"Inter" },          radius:"8px"  },
  { name:"emerald",       label:"Emerald",         desc:"Fresh, natural green",      colors:{ primary:"#10b981",secondary:"#6b7280",accent:"#f59e0b",background:"#ffffff",foreground:"#111827",muted:"#f0fdf4"                }, fonts:{ heading:"DM Sans",body:"DM Sans" },     radius:"10px" },
  { name:"rose",          label:"Rose",            desc:"Warm, creative pink",       colors:{ primary:"#f43f5e",secondary:"#78716c",accent:"#f97316",background:"#0f0a0a",foreground:"#fff1f2",muted:"rgba(255,255,255,0.04)" }, fonts:{ heading:"Raleway",body:"Lato" },         radius:"12px" },
  { name:"purple",        label:"Purple",          desc:"Bold, creative brand",      colors:{ primary:"#8b5cf6",secondary:"#64748b",accent:"#06b6d4",background:"#0d0b1a",foreground:"#ede9fe",muted:"rgba(255,255,255,0.04)" }, fonts:{ heading:"Poppins",body:"Poppins" },      radius:"8px"  },
  { name:"warm-orange",   label:"Warm Orange",     desc:"Energetic, friendly",       colors:{ primary:"#f97316",secondary:"#78716c",accent:"#eab308",background:"#0f0a05",foreground:"#fff7ed",muted:"rgba(255,255,255,0.04)" }, fonts:{ heading:"Nunito",body:"Nunito" },        radius:"12px" },
  { name:"corporate",     label:"Corporate",       desc:"Formal, trustworthy",       colors:{ primary:"#1e3a5f",secondary:"#475569",accent:"#0ea5e9",background:"#ffffff",foreground:"#1e293b",muted:"#f8fafc"                }, fonts:{ heading:"Roboto",body:"Open Sans" },    radius:"4px"  },
  { name:"soft-pastel",   label:"Soft Pastel",     desc:"Calm, gentle palette",      colors:{ primary:"#a78bfa",secondary:"#94a3b8",accent:"#86efac",background:"#fefce8",foreground:"#374151",muted:"#faf5ff"                }, fonts:{ heading:"Nunito",body:"Nunito" },        radius:"16px" },
];

const FONTS = ["Inter","DM Sans","Roboto","Open Sans","Montserrat","Playfair Display","Lato","Poppins","Nunito","Raleway","Georgia","monospace"];
const RADII = [["0px","Sharp"],["4px","Subtle"],["8px","Rounded"],["12px","Soft"],["16px","Pill"],["999px","Full pill"]];

const ColorSwatch = ({ label, value, onChange }) => (
  <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8 }}>
    <input type="color" value={value||"#000000"} onChange={e=>onChange(e.target.value)}
      style={{ width:32,height:32,borderRadius:7,border:"1px solid rgba(255,255,255,0.1)",padding:2,background:"transparent",cursor:"pointer",flexShrink:0 }}/>
    <div style={{ flex:1,minWidth:0 }}>
      <p style={{ fontSize:10,textTransform:"uppercase",letterSpacing:"0.06em",color:"rgba(255,255,255,0.4)",margin:0,marginBottom:2 }}>{label}</p>
      <p style={{ fontSize:11,fontFamily:"monospace",color:"rgba(255,255,255,0.7)",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{value||"—"}</p>
    </div>
  </div>
);

const Separator = () => <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)",margin:"12px 0" }}/>;

const ThemeTab = () => {
  const { state, dispatch } = useEditor();
  const theme = state.editor.theme;
  const [activePreset, setActivePreset] = useState(theme.preset||"dark-default");

  const applyPreset = (preset) => {
    setActivePreset(preset.name);
    dispatch({ type:"SET_THEME", payload:{ theme:{
      preset: preset.name,
      primary: preset.colors.primary, secondary: preset.colors.secondary,
      accent: preset.colors.accent, background: preset.colors.background,
      foreground: preset.colors.foreground, muted: preset.colors.muted,
      headingFont: preset.fonts.heading, bodyFont: preset.fonts.body,
      borderRadius: preset.radius,
    }}});
  };

  const updateColor = (key, value) => {
    dispatch({ type:"SET_THEME", payload:{ theme:{ [key]:value, preset:"custom" }}});
    setActivePreset("custom");
  };

  const cur = PRESETS.find(p=>p.name===activePreset)||PRESETS[0];
  const colors = {
    primary:    theme.primary    ?? cur.colors.primary,
    secondary:  theme.secondary  ?? cur.colors.secondary,
    accent:     theme.accent     ?? cur.colors.accent,
    background: theme.background ?? cur.colors.background,
    foreground: theme.foreground ?? cur.colors.foreground,
    muted:      theme.muted      ?? cur.colors.muted,
  };

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:0 }}>
      {/* Preset grid */}
      <div style={{ padding:"14px 16px" }}>
        <p style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"rgba(255,255,255,0.4)",marginBottom:10,marginTop:0 }}>Preset Themes</p>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
          {PRESETS.map(preset=>(
            <button key={preset.name} onClick={()=>applyPreset(preset)}
              style={{ textAlign:"left",borderRadius:10,border:`2px solid ${activePreset===preset.name?"#6366f1":"rgba(255,255,255,0.06)"}`,padding:10,background:activePreset===preset.name?"rgba(99,102,241,0.1)":"rgba(255,255,255,0.02)",cursor:"pointer",transition:"all 0.15s",position:"relative" }}>
              {activePreset===preset.name&&<span style={{ position:"absolute",top:6,right:6,fontSize:10 }}>✓</span>}
              <div style={{ display:"flex",gap:4,marginBottom:6 }}>
                {[preset.colors.primary,preset.colors.accent,preset.colors.secondary,preset.colors.background].map((c,i)=>(
                  <div key={i} style={{ width:12,height:12,borderRadius:999,background:c,border:"1px solid rgba(255,255,255,0.1)",flexShrink:0 }}/>
                ))}
              </div>
              <p style={{ fontSize:11,fontWeight:600,color:"#fff",margin:0,lineHeight:1.3 }}>{preset.label}</p>
              <p style={{ fontSize:10,color:"rgba(255,255,255,0.35)",margin:0,marginTop:2 }}>{preset.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <Separator/>

      {/* Custom colors */}
      <div style={{ padding:"0 16px 4px" }}>
        <p style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"rgba(255,255,255,0.4)",marginBottom:10,marginTop:0 }}>Custom Colors</p>
        <ColorSwatch label="Primary" value={colors.primary} onChange={v=>updateColor("primary",v)}/>
        <ColorSwatch label="Secondary" value={colors.secondary} onChange={v=>updateColor("secondary",v)}/>
        <ColorSwatch label="Accent" value={colors.accent} onChange={v=>updateColor("accent",v)}/>
        <ColorSwatch label="Background" value={colors.background} onChange={v=>updateColor("background",v)}/>
        <ColorSwatch label="Text / Foreground" value={colors.foreground} onChange={v=>updateColor("foreground",v)}/>
        <ColorSwatch label="Muted surfaces" value={colors.muted} onChange={v=>updateColor("muted",v)}/>
      </div>

      <Separator/>

      {/* Typography */}
      <div style={{ padding:"0 16px" }}>
        <p style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"rgba(255,255,255,0.4)",marginBottom:10,marginTop:0 }}>Typography</p>
        <div style={{ marginBottom:10 }}>
          <p style={{ fontSize:11,color:"rgba(255,255,255,0.5)",marginBottom:4,marginTop:0 }}>Heading Font</p>
          <select value={theme.headingFont||cur.fonts.heading} onChange={e=>dispatch({type:"SET_THEME",payload:{theme:{headingFont:e.target.value}}})}
            style={{ width:"100%",background:"#0a0b0c",border:"1px solid rgba(255,255,255,0.08)",borderRadius:7,padding:"6px 10px",fontSize:12,color:"#fff",outline:"none" }}>
            {FONTS.map(f=><option key={f} value={f} style={{fontFamily:f}}>{f}</option>)}
          </select>
        </div>
        <div style={{ marginBottom:10 }}>
          <p style={{ fontSize:11,color:"rgba(255,255,255,0.5)",marginBottom:4,marginTop:0 }}>Body Font</p>
          <select value={theme.bodyFont||cur.fonts.body} onChange={e=>dispatch({type:"SET_THEME",payload:{theme:{bodyFont:e.target.value}}})}
            style={{ width:"100%",background:"#0a0b0c",border:"1px solid rgba(255,255,255,0.08)",borderRadius:7,padding:"6px 10px",fontSize:12,color:"#fff",outline:"none" }}>
            {FONTS.map(f=><option key={f} value={f} style={{fontFamily:f}}>{f}</option>)}
          </select>
        </div>
        <div style={{ marginBottom:10 }}>
          <p style={{ fontSize:11,color:"rgba(255,255,255,0.5)",marginBottom:4,marginTop:0 }}>Global Border Radius</p>
          <select value={theme.borderRadius||cur.radius} onChange={e=>dispatch({type:"SET_THEME",payload:{theme:{borderRadius:e.target.value}}})}
            style={{ width:"100%",background:"#0a0b0c",border:"1px solid rgba(255,255,255,0.08)",borderRadius:7,padding:"6px 10px",fontSize:12,color:"#fff",outline:"none" }}>
            {RADII.map(([v,l])=><option key={v} value={v}>{l} ({v})</option>)}
          </select>
        </div>
      </div>

      <Separator/>

      {/* Reset */}
      <div style={{ padding:"0 16px 20px" }}>
        <button onClick={()=>{ dispatch({type:"SET_THEME",payload:{theme:{}}}); applyPreset(PRESETS[0]); }}
          style={{ width:"100%",padding:"8px",borderRadius:8,border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"rgba(255,255,255,0.5)",fontSize:12,cursor:"pointer",transition:"all 0.15s" }}
          onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.05)";e.currentTarget.style.color="#fff";}}
          onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="rgba(255,255,255,0.5)";}}>
          Reset to default
        </button>
      </div>
    </div>
  );
};

export default ThemeTab;
