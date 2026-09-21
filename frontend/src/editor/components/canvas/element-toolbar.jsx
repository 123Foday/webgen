import { useState, useRef, useEffect } from "react";
import { Copy, Trash2, Clipboard, GripVertical, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { useEditor } from "../../context/editor-provider";
import { genId } from "../../utils/editor-constants";

const ToolBtn = ({ title, onClick, children, danger }) => (
  <button
    title={title}
    onClick={onClick}
    style={{
      padding: "4px 6px", borderRadius: 6, border: "none", cursor: "pointer", display: "flex", alignItems: "center",
      background: "transparent", color: danger ? "#f87171" : "rgba(255,255,255,0.6)", transition: "all 0.12s",
    }}
    onMouseEnter={e => { e.currentTarget.style.background = danger ? "rgba(248,113,113,0.1)" : "rgba(255,255,255,0.08)"; e.currentTarget.style.color = danger ? "#f87171" : "#fff"; }}
    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = danger ? "#f87171" : "rgba(255,255,255,0.6)"; }}
  >
    {children}
  </button>
);

const Divider = () => <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.1)", margin: "0 2px", flexShrink: 0 }} />;

const ElementToolbar = ({ element }) => {
  const { dispatch, state } = useEditor();
  const [showOpacity, setShowOpacity] = useState(false);
  const opacityRef = useRef(null);
  const isContainer = Array.isArray(element.content);
  const hasClipboard = !!state.editor.clipboard;

  const rawOpacity = element.styles.opacity;
  const currentOpacity = rawOpacity !== undefined
    ? Math.round(parseFloat(String(rawOpacity).replace("%", "")) * (String(rawOpacity).includes("%") ? 1 : 100))
    : 100;

  useEffect(() => {
    const handler = (e) => { if (opacityRef.current && !opacityRef.current.contains(e.target)) setShowOpacity(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const updateStyle = (key, value) =>
    dispatch({ type: "UPDATE_ELEMENT", payload: { elementDetails: { ...element, styles: { ...element.styles, [key]: value } } } });

  return (
    <div
      style={{
        position: "absolute", top: -42, left: 0, display: "flex", alignItems: "center", gap: 2,
        background: "#0a0b0c", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
        padding: "3px 6px", zIndex: 100, minWidth: "max-content", boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
      }}
      onClick={e => e.stopPropagation()}
      onMouseDown={e => e.stopPropagation()}
    >
      {/* Opacity */}
      <div ref={opacityRef} style={{ position: "relative" }}>
        <button
          onClick={e => { e.stopPropagation(); setShowOpacity(v => !v); }}
          style={{ padding: "3px 8px", fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.6)", background: "transparent", border: "none", cursor: "pointer", borderRadius: 5 }}
        >
          {currentOpacity}%
        </button>
        {showOpacity && (
          <div
            style={{ position: "absolute", top: 38, left: 0, background: "#0a0b0c", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: 12, zIndex: 110, width: 180, boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}
            onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Opacity</span>
              <span style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.7)" }}>{currentOpacity}%</span>
            </div>
            <input
              type="range" min={0} max={100} step={1} value={currentOpacity}
              onChange={e => updateStyle("opacity", parseInt(e.target.value) / 100)}
              style={{ width: "100%", accentColor: "#6366f1" }}
            />
          </div>
        )}
      </div>

      {/* Text align for containers */}
      {isContainer && (
        <>
          <Divider />
          {[["left", <AlignLeft size={12}/>], ["center", <AlignCenter size={12}/>], ["right", <AlignRight size={12}/>]].map(([align, icon]) => (
            <ToolBtn key={align} title={`Align ${align}`} onClick={e => { e.stopPropagation(); updateStyle("textAlign", align); }}>
              {icon}
            </ToolBtn>
          ))}
        </>
      )}

      <Divider />

      {/* Copy */}
      <ToolBtn title="Copy (Ctrl+C)" onClick={e => { e.stopPropagation(); dispatch({ type: "COPY_ELEMENT", payload: { elementDetails: element } }); }}>
        <Copy size={12} />
      </ToolBtn>

      {/* Paste inside (only containers with clipboard content) */}
      {isContainer && hasClipboard && (
        <ToolBtn title="Paste inside" onClick={e => { e.stopPropagation(); dispatch({ type: "PASTE_ELEMENT", payload: { containerId: element.id } }); }}>
          <Clipboard size={12} />
        </ToolBtn>
      )}

      {/* Duplicate */}
      <ToolBtn title="Duplicate (Ctrl+D)" onClick={e => { e.stopPropagation(); dispatch({ type: "DUPLICATE_ELEMENT", payload: { elementDetails: element, containerId: "" } }); }}>
        <GripVertical size={12} />
      </ToolBtn>

      <Divider />

      {/* Delete */}
      <ToolBtn danger title="Delete (Del)" onClick={e => { e.stopPropagation(); dispatch({ type: "DELETE_ELEMENT", payload: { elementDetails: element } }); }}>
        <Trash2 size={12} />
      </ToolBtn>
    </div>
  );
};

export default ElementToolbar;
