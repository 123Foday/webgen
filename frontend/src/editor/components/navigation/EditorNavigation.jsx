import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useEditor } from "../../context/editor-provider";
import {
  Monitor, Tablet, Smartphone, Eye, EyeOff,
  Undo2, Redo2, Save, ArrowLeft, ZoomIn, ZoomOut,
  Grid3X3, Clipboard, Menu, X,
} from "lucide-react";
import API from "../../../utils/api";
import { useEffect } from "react";

const DeviceBtn = ({ device, current, onClick, icon, title }) => (
  <button onClick={() => onClick(device)} title={title}
    style={{
      padding: "5px 8px", borderRadius: 7, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
      background: current === device ? "rgba(99,102,241,0.2)" : "transparent",
      color: current === device ? "#a5b4fc" : "rgba(255,255,255,0.4)",
      transition: "all 0.15s",
    }}
    onMouseEnter={e => { if (current !== device) { e.currentTarget.style.color = "rgba(255,255,255,0.8)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; } }}
    onMouseLeave={e => { if (current !== device) { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; e.currentTarget.style.background = "transparent"; } }}
  >
    {icon}
  </button>
);

const NavBtn = ({ onClick, title, children, disabled, accent }) => (
  <button onClick={onClick} disabled={disabled} title={title}
    style={{
      padding: "5px 8px", borderRadius: 7, border: "none", cursor: disabled ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 5,
      background: accent ? "linear-gradient(135deg,#f43f5e,#f97316,#f59e0b)" : "rgba(255,255,255,0.05)",
      color: accent ? "#111" : disabled ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.7)",
      fontSize: 12, fontWeight: accent ? 700 : 500, opacity: disabled ? 0.4 : 1, transition: "all 0.15s",
    }}
    onMouseEnter={e => { if (!disabled && !accent) e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
    onMouseLeave={e => { if (!disabled && !accent) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
  >
    {children}
  </button>
);

const EditorNavigation = ({ projectId, projectName, onSave, isSaving, zoom, setZoom, showGrid, setShowGrid, isSmallScreen, isSidebarOpen, toggleSidebar }) => {
  const { dispatch, state } = useEditor();
  const navigate = useNavigate();
  const device = state.editor.device;
  const isPreview = state.editor.previewMode;
  const canUndo = state.history.currentIndex > 0;
  const canRedo = state.history.currentIndex < state.history.history.length - 1;

  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(projectName || "Untitled Project");

  useEffect(() => {
    if (projectName) setNameValue(projectName);
  }, [projectName]);

  const handleNameSave = async () => {
    setEditingName(false);
    if (!nameValue.trim() || nameValue === projectName) return;
    try {
      await API.patch(`/projects/${projectId}`, { name: nameValue.trim() });
    } catch (err) {
      console.error("Name save failed:", err);
    }
  };

  return (
    <div style={{
      height: 52, display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 16px", background: "#08090a", borderBottom: "1px solid rgba(255,255,255,0.06)",
      flexShrink: 0, gap: 12,
    }}>
      {/* Left: back + project name */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: "0 0 auto" }}>
        <button onClick={() => navigate(`/projects/${projectId}`)}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "rgba(255,255,255,0.6)", fontSize: 12, cursor: "pointer", flexShrink: 0, transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; e.currentTarget.style.background = "transparent"; }}>
          <ArrowLeft size={13} /> Back
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>V</div>
          {editingName ? (
            <input
              autoFocus
              value={nameValue}
              onChange={e => setNameValue(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={e => { if (e.key === "Enter") handleNameSave(); if (e.key === "Escape") setEditingName(false); }}
              style={{
                background: "rgba(255,255,255,0.08)", border: "1px solid rgba(99,102,241,0.5)",
                borderRadius: 6, padding: "3px 8px", fontSize: 13, fontWeight: 600,
                color: "#fff", outline: "none", maxWidth: 180,
              }}
            />
          ) : (
            <span
              onClick={() => setEditingName(true)}
              title="Click to rename"
              style={{
                fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                maxWidth: 180, cursor: "pointer", borderBottom: "1px dashed rgba(255,255,255,0.2)",
                paddingBottom: 1,
              }}
            >
              {nameValue || "Untitled Project"}
            </span>
          )}
        </div>
      </div>

      {/* Center: devices + zoom + grid */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, justifyContent: "center" }}>
        {/* Devices */}
        <div style={{ display: "flex", alignItems: "center", gap: 2, padding: "3px", background: "rgba(255,255,255,0.04)", borderRadius: 9, border: "1px solid rgba(255,255,255,0.06)" }}>
          <DeviceBtn device="Desktop" current={device} onClick={d => dispatch({ type: "CHANGE_DEVICE", payload: { device: d } })} icon={<Monitor size={14} />} title="Desktop" />
          <DeviceBtn device="Tablet" current={device} onClick={d => dispatch({ type: "CHANGE_DEVICE", payload: { device: d } })} icon={<Tablet size={14} />} title="Tablet (768px)" />
          <DeviceBtn device="Mobile" current={device} onClick={d => dispatch({ type: "CHANGE_DEVICE", payload: { device: d } })} icon={<Smartphone size={14} />} title="Mobile (390px)" />
        </div>

        <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.08)" }} />

        {/* Zoom */}
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <NavBtn onClick={() => setZoom(z => Math.max(z - 10, 25))} title="Zoom out (Ctrl -)"><ZoomOut size={13} /></NavBtn>
          <span onClick={() => setZoom(100)} title="Reset zoom" style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.5)", cursor: "pointer", minWidth: 36, textAlign: "center", userSelect: "none" }}>{zoom}%</span>
          <NavBtn onClick={() => setZoom(z => Math.min(z + 10, 200))} title="Zoom in (Ctrl +)"><ZoomIn size={13} /></NavBtn>
        </div>

        {/* Grid toggle */}
        <NavBtn onClick={() => setShowGrid(g => !g)} title="Toggle grid">
          <Grid3X3 size={13} style={{ color: showGrid ? "#6366f1" : "rgba(255,255,255,0.4)" }} />
        </NavBtn>

        {/* Clipboard indicator */}
        {state.editor.clipboard && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#a5b4fc", background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 999, padding: "3px 8px" }}>
            <Clipboard size={10} /> "{state.editor.clipboard.name}" copied
          </div>
        )}
      </div>

      {/* Right: undo/redo + preview + save */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flex: "0 0 auto" }}>
        {isSmallScreen && (
          <NavBtn onClick={toggleSidebar} title={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}>
            {isSidebarOpen ? <X size={13} /> : <Menu size={13} />}
            {isSidebarOpen ? "Close" : "Sidebar"}
          </NavBtn>
        )}

        <NavBtn onClick={() => dispatch({ type: "UNDO" })} disabled={!canUndo} title="Undo (Ctrl+Z)"><Undo2 size={13} /></NavBtn>
        <NavBtn onClick={() => dispatch({ type: "REDO" })} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)"><Redo2 size={13} /></NavBtn>

        <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.08)" }} />

        <NavBtn
          onClick={() => dispatch({ type: "TOGGLE_PREVIEW_MODE" })}
          title={isPreview ? "Exit Preview" : "Preview"}
        >
          {isPreview ? <EyeOff size={13} /> : <Eye size={13} />}
          {isPreview ? "Exit" : "Preview"}
        </NavBtn>

        <NavBtn onClick={onSave} disabled={isSaving} accent title="Save to project">
          <Save size={13} />
          {isSaving ? "Saving…" : "Save"}
        </NavBtn>
      </div>
    </div>
  );
};

export default EditorNavigation;
