import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { EditorProvider, useEditor, findParentAndIndex } from "./context/editor-provider";
import EditorNavigation from "./components/navigation/EditorNavigation";
import EditorSidebar from "./components/sidebar/EditorSidebar";
import Recursive from "./components/canvas/recursive";
import API from "../utils/api";
import { genId } from "./utils/editor-constants";
import {
  Copy, Trash2, Clipboard, CopyPlus, MoveUp, MoveDown,
  BoxSelect, Layers, Rows3, Columns3, Grid3X3, ZoomIn, ZoomOut,
  ChevronUp, ChevronDown,
} from "lucide-react";

// ── Canvas + context menu (inner component, inside EditorProvider) ─────────

const EditorCanvas = ({ projectId, projectName, onSave, isSaving }) => {
  const { dispatch, state } = useEditor();
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(false);
  const [ctxMenu, setCtxMenu] = useState(null);
  const ctxRef = useRef(null);

  const selected = state.editor.selectedElement;
  const hasSelected = !!selected.id && selected.type !== "__body";
  const isPreview = state.editor.previewMode || state.editor.liveMode;
  const device = state.editor.device;
  const theme = state.editor.theme;

  // ── Theme CSS vars ──────────────────────────────────────────────────────
  const themeVars = {
    fontFamily: theme.bodyFont || "Inter",
    backgroundColor: theme.background || undefined,
    color: theme.foreground || undefined,
    "--theme-primary": theme.primary || "#6366f1",
    "--theme-secondary": theme.secondary || "#8b5cf6",
    "--theme-accent": theme.accent || "#f43f5e",
    "--theme-radius": theme.borderRadius || "8px",
  };

  // ── Close context menu on outside click ────────────────────────────────
  useEffect(() => {
    const h = (e) => { if (ctxRef.current && !ctxRef.current.contains(e.target)) setCtxMenu(null); };
    if (ctxMenu) document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [ctxMenu]);

  // ── Keyboard shortcuts ─────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      const editable = (e.target).isContentEditable || ["INPUT", "TEXTAREA"].includes(e.target.tagName);
      if (e.metaKey || e.ctrlKey) {
        if (e.key === "z" && !e.shiftKey) { e.preventDefault(); dispatch({ type: "UNDO" }); }
        if ((e.key === "z" && e.shiftKey) || e.key === "y") { e.preventDefault(); dispatch({ type: "REDO" }); }
        if (e.key === "=" || e.key === "+") { e.preventDefault(); setZoom(z => Math.min(z + 10, 200)); }
        if (e.key === "-") { e.preventDefault(); setZoom(z => Math.max(z - 10, 25)); }
        if (e.key === "0") { e.preventDefault(); setZoom(100); }
        if (e.key === "c" && hasSelected) { e.preventDefault(); dispatch({ type: "COPY_ELEMENT", payload: { elementDetails: selected } }); }
        if (e.key === "v" && state.editor.clipboard) {
          e.preventDefault();
          const cId = hasSelected && Array.isArray(selected.content) ? selected.id : "__body";
          dispatch({ type: "PASTE_ELEMENT", payload: { containerId: cId } });
        }
        if (e.key === "d" && hasSelected) { e.preventDefault(); dispatch({ type: "DUPLICATE_ELEMENT", payload: { elementDetails: selected, containerId: "" } }); }
      }
      if (!editable && (e.key === "Delete" || e.key === "Backspace") && hasSelected)
        dispatch({ type: "DELETE_ELEMENT", payload: { elementDetails: selected } });
      if (e.key === "Escape") { setCtxMenu(null); dispatch({ type: "CHANGE_CLICKED_ELEMENT", payload: {} }); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, state.editor.clipboard, hasSelected, dispatch]);

  // ── Context menu helpers ───────────────────────────────────────────────
  const ctxAction = (fn) => { fn(); setCtxMenu(null); };

  const getParent = () => hasSelected ? findParentAndIndex(state.editor.elements, selected.id) : null;

  const moveUp = () => {
    const f = getParent(); if (!f || f.index === 0) return;
    dispatch({ type: "REORDER_ELEMENT", payload: { containerId: f.parent.id, fromIndex: f.index, toIndex: f.index - 1 } });
  };
  const moveDown = () => {
    const f = getParent(); if (!f) return;
    const max = f.parent.content.length - 1; if (f.index >= max) return;
    dispatch({ type: "REORDER_ELEMENT", payload: { containerId: f.parent.id, fromIndex: f.index, toIndex: f.index + 1 } });
  };
  const setParentLayout = (dir) => {
    const f = getParent(); if (!f) return;
    dispatch({ type: "UPDATE_ELEMENT", payload: { elementDetails: { ...f.parent, styles: { ...f.parent.styles, display: "flex", flexDirection: dir } } } });
  };
  const wrapInContainer = () => {
    const f = getParent(); if (!f) return;
    const wrapper = { id: genId(), name: "Container", type: "container", styles: { width: "100%", padding: "16px" }, content: [selected] };
    const newContent = [...f.parent.content]; newContent[f.index] = wrapper;
    dispatch({ type: "UPDATE_ELEMENT", payload: { elementDetails: { ...f.parent, content: newContent } } });
    dispatch({ type: "CHANGE_CLICKED_ELEMENT", payload: { elementDetails: wrapper } });
  };
  const selectParent = () => {
    const f = getParent();
    if (f) dispatch({ type: "CHANGE_CLICKED_ELEMENT", payload: { elementDetails: f.parent } });
  };

  // ── Device canvas size ─────────────────────────────────────────────────
  const deviceWidth = device === "Mobile" ? "390px" : device === "Tablet" ? "768px" : "100%";

  // ── Context menu item component ────────────────────────────────────────
  const CtxItem = ({ icon, label, kbd, onClick, danger, disabled }) => (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        display: "flex", width: "100%", alignItems: "center", gap: 10, padding: "6px 14px",
        background: "transparent", border: "none", cursor: disabled ? "not-allowed" : "pointer",
        fontSize: 13, color: danger ? "#f87171" : disabled ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.8)",
        textAlign: "left", transition: "background 0.12s",
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = danger ? "rgba(248,113,113,0.08)" : "rgba(255,255,255,0.05)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
    >
      <span style={{ flexShrink: 0, opacity: 0.6 }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {kbd && <kbd style={{ fontSize: 10, opacity: 0.35, fontFamily: "monospace" }}>{kbd}</kbd>}
    </button>
  );

  const CtxDivider = () => <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "4px 0" }} />;

  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>
      {/* ── Canvas area ─────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Zoom/grid toolbar */}
        {!isPreview && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 16px", background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.04)", flexShrink: 0, fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <button onClick={() => setZoom(z => Math.max(z - 10, 25))} style={{ padding: "3px 6px", background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", borderRadius: 5 }}><ZoomOut size={11} /></button>
              <span onClick={() => setZoom(100)} style={{ minWidth: 36, textAlign: "center", cursor: "pointer", fontFamily: "monospace", fontSize: 11, userSelect: "none" }}>{zoom}%</span>
              <button onClick={() => setZoom(z => Math.min(z + 10, 200))} style={{ padding: "3px 6px", background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", borderRadius: 5 }}><ZoomIn size={11} /></button>
              <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.08)", margin: "0 4px" }} />
              <button onClick={() => setShowGrid(g => !g)} style={{ padding: "3px 6px", background: showGrid ? "rgba(99,102,241,0.15)" : "transparent", border: "none", cursor: "pointer", color: showGrid ? "#a5b4fc" : "rgba(255,255,255,0.4)", borderRadius: 5 }} title="Toggle grid"><Grid3X3 size={11} /></button>
            </div>
            <div style={{ display: "flex", gap: 12, opacity: 0.5, fontSize: 10, fontFamily: "monospace" }}>
              <span>⌘Z Undo</span><span>⌘C Copy</span><span>⌘V Paste</span><span>⌘D Dup</span><span>Del Delete</span>
            </div>
          </div>
        )}

        {/* Scrollable canvas */}
        <div
          style={{ flex: 1, overflow: "auto", background: "#0c0d0f", position: "relative", padding: isPreview ? "0" : "40px" }}
          onClick={() => { dispatch({ type: "CHANGE_CLICKED_ELEMENT", payload: {} }); setCtxMenu(null); }}
          onContextMenu={e => { if (isPreview) return; e.preventDefault(); setCtxMenu({ x: e.clientX, y: e.clientY }); }}
        >
          {/* Google Fonts injection */}
          {(theme.headingFont || theme.bodyFont) && (
            <style>{`@import url('https://fonts.googleapis.com/css2?family=${(theme.headingFont || "Inter").replace(/ /g, "+")}:wght@400;600;700;800&family=${(theme.bodyFont || "Inter").replace(/ /g, "+")}:wght@400;500;600&display=swap');
              .editor-canvas h1,.editor-canvas h2,.editor-canvas h3,.editor-canvas h4,.editor-canvas h5,.editor-canvas h6 { font-family:'${theme.headingFont || "Inter"}',sans-serif!important; }
              .editor-canvas { font-family:'${theme.bodyFont || "Inter"}',sans-serif; }
            `}</style>
          )}

          {/* Device wrapper */}
          <div style={{
            margin: "0 auto",
            width: isPreview ? "100%" : deviceWidth,
            ...(device !== "Desktop" ? {
              boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
              borderRadius: device === "Mobile" ? 40 : 16,
              overflow: "hidden",
              border: device === "Mobile" ? "8px solid #1a1a1f" : "6px solid #16161b",
            } : {}),
          }}>
            <div
              className="editor-canvas"
              style={{
                ...themeVars,
                transform: !isPreview ? `scale(${zoom / 100})` : undefined,
                transformOrigin: "top center",
                minHeight: device === "Mobile" ? "812px" : device === "Tablet" ? "1024px" : "100vh",
                background: theme.background || "#08090a",
                backgroundImage: showGrid && !isPreview ? "radial-gradient(circle,rgba(255,255,255,0.04) 1px,transparent 1px)" : undefined,
                backgroundSize: showGrid && !isPreview ? "24px 24px" : undefined,
              }}
            >
              {state.editor.elements.map(el => <Recursive key={el.id} element={el} />)}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right-click context menu ─────────────────────────────────────── */}
      {ctxMenu && !isPreview && (
        <div ref={ctxRef}
          style={{ position: "fixed", zIndex: 9999, left: ctxMenu.x, top: ctxMenu.y, background: "#0a0b0c", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, boxShadow: "0 16px 48px rgba(0,0,0,0.7)", minWidth: 220, overflow: "hidden", padding: "6px 0" }}
          onClick={e => e.stopPropagation()}
        >
          {hasSelected && (
            <>
              <div style={{ padding: "6px 14px 4px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 4 }}>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "rgba(255,255,255,0.35)", margin: 0 }}>{selected.name}</p>
              </div>
              <CtxItem icon={<Copy size={13} />} label="Copy" kbd="⌘C" onClick={() => ctxAction(() => dispatch({ type: "COPY_ELEMENT", payload: { elementDetails: selected } }))} />
              {state.editor.clipboard && <CtxItem icon={<Clipboard size={13} />} label="Paste inside" kbd="⌘V" onClick={() => ctxAction(() => dispatch({ type: "PASTE_ELEMENT", payload: { containerId: Array.isArray(selected.content) ? selected.id : "__body" } }))} />}
              <CtxItem icon={<CopyPlus size={13} />} label="Duplicate" kbd="⌘D" onClick={() => ctxAction(() => dispatch({ type: "DUPLICATE_ELEMENT", payload: { elementDetails: selected, containerId: "" } }))} />
              <CtxDivider />
              <CtxItem icon={<MoveUp size={13} />} label="Move up" onClick={() => ctxAction(moveUp)} />
              <CtxItem icon={<MoveDown size={13} />} label="Move down" onClick={() => ctxAction(moveDown)} />
              <CtxDivider />
              <CtxItem icon={<Rows3 size={13} />} label="Set parent: row layout" onClick={() => ctxAction(() => setParentLayout("row"))} />
              <CtxItem icon={<Columns3 size={13} />} label="Set parent: column layout" onClick={() => ctxAction(() => setParentLayout("column"))} />
              <CtxDivider />
              <CtxItem icon={<BoxSelect size={13} />} label="Wrap in container" onClick={() => ctxAction(wrapInContainer)} />
              <CtxItem icon={<Layers size={13} />} label="Select parent" onClick={() => ctxAction(selectParent)} />
              <CtxDivider />
              <CtxItem icon={<Trash2 size={13} />} label="Delete" kbd="Del" danger onClick={() => ctxAction(() => dispatch({ type: "DELETE_ELEMENT", payload: { elementDetails: selected } }))} />
              <CtxDivider />
            </>
          )}
          {!hasSelected && state.editor.clipboard && (
            <>
              <CtxItem icon={<Clipboard size={13} />} label="Paste" kbd="⌘V" onClick={() => ctxAction(() => dispatch({ type: "PASTE_ELEMENT", payload: { containerId: "__body" } }))} />
              <CtxDivider />
            </>
          )}
          <CtxItem icon={<ChevronUp size={13} />} label="Undo" kbd="⌘Z" disabled={state.history.currentIndex === 0} onClick={() => ctxAction(() => dispatch({ type: "UNDO" }))} />
          <CtxItem icon={<ChevronDown size={13} />} label="Redo" kbd="⌘⇧Z" disabled={state.history.currentIndex === state.history.history.length - 1} onClick={() => ctxAction(() => dispatch({ type: "REDO" }))} />
          <CtxItem icon={<Grid3X3 size={13} />} label={`${showGrid ? "Hide" : "Show"} grid`} onClick={() => ctxAction(() => setShowGrid(g => !g))} />
        </div>
      )}
    </div>
  );
};

// ── EditorPage: loads project data + wraps EditorProvider ─────────────────

const EditorPageInner = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dispatch, state } = useEditor();
  const [project, setProject] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(() => window.innerWidth <= 900);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth > 900);

  useEffect(() => {
    const handleResize = () => {
      const smallScreen = window.innerWidth <= 900;
      setIsSmallScreen(smallScreen);
      if (smallScreen) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load project + existing editor content
  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get(`/projects/${id}`);
        const proj = res.data.project || res.data;
        console.log("Loaded project:", proj);
        console.log("editorContent:", proj.editorContent);
        setProject(proj);
        if (proj.editorContent) {
          const parsed = JSON.parse(proj.editorContent);
          dispatch({ type: "LOAD_DATA", payload: { elements: parsed, withLive: false } });
        }
      } catch (err) {
        console.error("Failed to load project:", err);
      }
    };
    load();
  }, [id]);

  const elementToHtml = (element) => {
    if (!element) return "";

    const styleStr = Object.entries(element.styles || {})
      .map(([k, v]) => `${k.replace(/([A-Z])/g, m => `-${m.toLowerCase()}`)}:${v}`)
      .join(";");

    const attrs = `style="${styleStr}"`;
    const c = !Array.isArray(element.content) ? element.content : null;

    switch (element.type) {
      case "__body":
        return `<div ${attrs}>${Array.isArray(element.content) ? element.content.map(elementToHtml).join("") : ""}</div>`;
      case "text":
        return `<p ${attrs}>${c?.innerText || ""}</p>`;
      case "heading": {
        const tag = c?.level || "h2";
        return `<${tag} ${attrs}>${c?.innerText || ""}</${tag}>`;
      }
      case "button":
        return `<a href="${c?.href || "#"}" ${attrs}>${c?.innerText || "Button"}</a>`;
      case "link":
        return `<a href="${c?.href || "#"}" ${attrs}>${c?.innerText || ""}</a>`;
      case "image":
        return `<img src="${c?.src || ""}" alt="${c?.alt || ""}" ${attrs} />`;
      case "video":
        return `<iframe src="${c?.src || ""}" ${attrs} frameborder="0" allowfullscreen></iframe>`;
      case "divider":
        return `<hr ${attrs} />`;
      case "spacer":
        return `<div ${attrs}></div>`;
      case "list": {
        const tag = c?.ordered ? "ol" : "ul";
        const items = (c?.items || []).map(i => `<li>${i}</li>`).join("");
        return `<${tag} ${attrs}>${items}</${tag}>`;
      }
      case "blockquote":
        return `<blockquote ${attrs}><p>${c?.text || ""}</p>${c?.author || ""}</blockquote>`;
      case "code":
        return `<pre ${attrs}><code>${c?.code || ""}</code></pre>`;
      case "progress-bar":
        return `<div ${attrs}><div style="width:${c?.percentage || 0}%;background:${c?.color || "#6366f1"};height:10px;border-radius:999px"></div></div>`;
      case "alert":
        return `<div ${attrs}>${c?.title ? `<strong>${c.title}</strong> ` : ""}${c?.message || ""}</div>`;
      case "icon-box":
        return `<div ${attrs}><div style="font-size:36px">${c?.icon || ""}</div><h3>${c?.title || ""}</h3><p>${c?.description || ""}</p></div>`;
      case "card":
        return `<div ${attrs}>${c?.imageSrc ? `<img src="${c.imageSrc}" style="width:100%" />` : ""}<div style="padding:20px"><h3>${c?.title || ""}</h3><p>${c?.description || ""}</p>${c?.buttonText ? `<a href="${c?.buttonHref || "#"}">${c.buttonText}</a>` : ""}</div></div>`;
      case "input-group":
        return `<div ${attrs}>${c?.label ? `<label>${c.label}</label>` : ""}<input type="${c?.inputType || "text"}" placeholder="${c?.placeholder || ""}" /></div>`;
      case "login-form":
        return `<div ${attrs}><h3>${c?.title || ""}</h3><p>${c?.subtitle || ""}</p><input type="email" placeholder="Email" /><input type="password" placeholder="Password" /><button>${c?.buttonText || "Sign In"}</button></div>`;
      case "signup-form":
        return `<div ${attrs}><h3>${c?.title || ""}</h3><p>${c?.subtitle || ""}</p><button>${c?.buttonText || "Create Account"}</button></div>`;
      case "table": {
        const headers = c?.headers ? JSON.parse(c.headers) : [];
        const rows = c?.rows ? JSON.parse(c.rows) : [];
        return `<table ${attrs}><thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(cell => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
      }
      case "raw-html":
        return element.meta?.rawHtml || "";
      case "container":
      case "2Col":
      case "3Col":
      case "4Col":
        return `<div ${attrs}>${Array.isArray(element.content) ? element.content.map(elementToHtml).join("") : ""}</div>`;
      default:
        return Array.isArray(element.content)
          ? `<div ${attrs}>${element.content.map(elementToHtml).join("")}</div>`
          : "";
    }
  };

  const elementsToHtmlPage = (elements) => {
    const body = elements.map(elementToHtml).join("");
    return `<!DOCTYPE html>
      <html lang="en">
      <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Project</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Inter, sans-serif; }
        a { text-decoration: none; }
        img { max-width: 100%; }
      </style>
      </head>
      <body>${body}</body>
      </html>`;
  };

  const handleSave = useCallback(async () => {
  if (!id) return;
  setIsSaving(true);
  try {
    const elements = window.__currentEditorElements;
    if (!elements) return;

    const html = elementsToHtmlPage(elements);

    await API.patch(`/projects/${id}`, {
      editorContent: JSON.stringify(elements),
      html,
    });
    console.log("Saved successfully");
  } catch (err) {
    console.error("Save failed:", err.response?.data);
  } finally {
    setIsSaving(false);
  }
}, [id]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#08090a", overflow: "hidden", color: "#fff" }}>
      <EditorNavigation
        projectId={id}
        projectName={project?.name}
        onSave={handleSave}
        isSaving={isSaving}
        zoom={zoom} setZoom={setZoom}
        showGrid={showGrid} setShowGrid={setShowGrid}
        isSmallScreen={isSmallScreen}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(open => !open)}
      />
      <div style={{ display: "flex", flex: 1, minHeight: 0, position: "relative" }}>
        <EditorCanvas
          projectId={id}
          projectName={project?.name}
          onSave={handleSave}
          isSaving={isSaving}
          zoom={zoom} setZoom={setZoom}
          showGrid={showGrid} setShowGrid={setShowGrid}
        />

        {!state.editor.previewMode && !state.editor.liveMode && (
          isSmallScreen ? (
            isSidebarOpen && (
              <>
                <div
                  onClick={() => setIsSidebarOpen(false)}
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0,0,0,0.45)",
                    zIndex: 20,
                  }}
                />
                <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, zIndex: 21 }}>
                  <EditorSidebar isMobile isOpen={isSidebarOpen} />
                </div>
              </>
            )
          ) : (
            <EditorSidebar />
          )
        )}
      </div>
    </div>
  );
};

// ── EditorStateSync: writes state to window ref so save handler can access it
const EditorStateSync = ({ children }) => {
  const { state } = useEditor();
  useEffect(() => {
    window.__currentEditorElements = state.editor.elements;
  }, [state.editor.elements]);
  return children;
};

// ── Top-level: wraps in EditorProvider ────────────────────────────────────
const EditorPage = () => {
  const { id } = useParams();
  return (
    <EditorProvider projectId={id}>
      <EditorStateSync>
        <EditorPageInner />
      </EditorStateSync>
    </EditorProvider>
  );
};

export default EditorPage;
