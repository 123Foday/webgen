import { useState } from "react";
import { LayoutPanelLeft, Paintbrush, Settings, Layers2, Plus } from "lucide-react";
import ComponentsTab from "./tabs/ComponentsTab";
import SettingsTab from "./tabs/SettingsTab";
import ThemeTab from "./tabs/ThemeTab";
import LayersTab from "./tabs/LayersTab";

const TABS = [
  { id:"Components", icon:<Plus size={14}/>,             label:"Add" },
  { id:"Theme",      icon:<Paintbrush size={14}/>,       label:"Theme" },
  { id:"Layers",     icon:<Layers2 size={14}/>,          label:"Layers" },
  { id:"Settings",   icon:<Settings size={14}/>,         label:"Settings" },
];

const EditorSidebar = ({ isMobile = false, isOpen = true }) => {
  const [active, setActive] = useState("Components");

  if (isMobile && !isOpen) return null;

  return (
    <div style={{
      width: isMobile ? "min(82vw, 320px)" : 320,
      minWidth: isMobile ? "min(82vw, 320px)" : 320,
      height:"100%", display:"flex", flexDirection:"column",
      background:"#0a0b0c",
      borderLeft: isMobile ? "none" : "1px solid rgba(255,255,255,0.06)",
      borderRight: isMobile ? "1px solid rgba(255,255,255,0.06)" : "none",
      overflow:"hidden", flexShrink:0,
      boxShadow: isMobile ? "-8px 0 24px rgba(0,0,0,0.35)" : "none",
    }}>
      {/* Tab bar */}
      <div style={{ display:"flex", borderBottom:"1px solid rgba(255,255,255,0.06)", flexShrink:0, background:"#08090a" }}>
        {TABS.map(tab=>(
          <button key={tab.id} onClick={()=>setActive(tab.id)}
            style={{
              flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
              gap:3, padding:"10px 4px", background:"transparent", border:"none", cursor:"pointer",
              borderBottom: active===tab.id ? "2px solid #6366f1" : "2px solid transparent",
              color: active===tab.id ? "#a5b4fc" : "rgba(255,255,255,0.35)",
              fontSize:9, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em",
              transition:"all 0.15s",
            }}
            onMouseEnter={e=>{ if(active!==tab.id) e.currentTarget.style.color="rgba(255,255,255,0.6)"; }}
            onMouseLeave={e=>{ if(active!==tab.id) e.currentTarget.style.color="rgba(255,255,255,0.35)"; }}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Scrollable content */}
      <div style={{ flex:1, overflowY:"auto", overflowX:"hidden" }}>
        {active==="Components" && <ComponentsTab/>}
        {active==="Theme"      && <ThemeTab/>}
        {active==="Layers"     && <LayersTab/>}
        {active==="Settings"   && <SettingsTab/>}
      </div>
    </div>
  );
};

export default EditorSidebar;
