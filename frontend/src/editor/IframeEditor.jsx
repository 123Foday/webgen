import { useState, useRef, useEffect, useCallback } from "react";
import API from "../utils/api";

const SELECTION_ATTR = "data-webgen-select";
const INTERCEPTOR_SCRIPT_ATTR = "data-webgen-interceptor";
const EDITOR_STYLE_ID = "webgen-editor-styles";

const INTERCEPTOR_SCRIPT = `
(function() {
  let currentEl = null;
  window.__webgenPreview = window.__webgenPreview || false;

  if (!document.getElementById("${EDITOR_STYLE_ID}")) {
    const style = document.createElement("style");
    style.id = "${EDITOR_STYLE_ID}";
    style.textContent = "[${SELECTION_ATTR}] { outline: 2px solid #6366f1 !important; outline-offset: 2px; }";
    document.head.appendChild(style);
  }

  const deselect = () => {
    if (currentEl) {
      currentEl.removeAttribute("${SELECTION_ATTR}");
      currentEl.style.outline = "";
      currentEl.style.outlineOffset = "";
      currentEl = null;
    }
  };

  const getSelector = (el) => {
    const parts = [];
    let node = el;
    while (node && node !== document.body) {
      let sel = node.tagName.toLowerCase();
      if (node.id) { sel += "#" + node.id; parts.unshift(sel); break; }
      const siblings = node.parentElement ? Array.from(node.parentElement.children).filter(c => c.tagName === node.tagName) : [];
      if (siblings.length > 1) sel += ":nth-of-type(" + (siblings.indexOf(node) + 1) + ")";
      parts.unshift(sel);
      node = node.parentElement;
    }
    return parts.join(" > ");
  };

  const getComputedProps = (el) => {
    const cs = window.getComputedStyle(el);
    return {
      fontSize: cs.fontSize,
      fontFamily: cs.fontFamily,
      fontWeight: cs.fontWeight,
      textAlign: cs.textAlign,
      lineHeight: cs.lineHeight,
      letterSpacing: cs.letterSpacing,
      color: cs.color,
      textDecoration: cs.textDecorationLine,
      textTransform: cs.textTransform,
      backgroundColor: cs.backgroundColor,
      backgroundImage: cs.backgroundImage === "none" ? "" : cs.backgroundImage,
      backgroundSize: cs.backgroundSize,
      width: cs.width,
      height: cs.height,
      minWidth: cs.minWidth,
      maxWidth: cs.maxWidth,
      minHeight: cs.minHeight,
      maxHeight: cs.maxHeight,
      paddingTop: cs.paddingTop,
      paddingRight: cs.paddingRight,
      paddingBottom: cs.paddingBottom,
      paddingLeft: cs.paddingLeft,
      marginTop: cs.marginTop,
      marginRight: cs.marginRight,
      marginBottom: cs.marginBottom,
      marginLeft: cs.marginLeft,
      borderRadius: cs.borderRadius,
      borderWidth: cs.borderWidth,
      borderStyle: cs.borderStyle,
      borderColor: cs.borderColor,
      display: cs.display,
      flexDirection: cs.flexDirection,
      justifyContent: cs.justifyContent,
      alignItems: cs.alignItems,
      gap: cs.gap,
      opacity: cs.opacity,
      position: cs.position,
      zIndex: cs.zIndex,
      overflow: cs.overflow,
    };
  };

  document.addEventListener("click", (e) => {
    if (window.__webgenPreview) return;
    e.preventDefault();
    e.stopPropagation();
    deselect();
    const el = e.target;
    currentEl = el;
    el.setAttribute("${SELECTION_ATTR}", "");
    const selector = getSelector(el);
    const styles = getComputedProps(el);
    const tag = el.tagName.toLowerCase();
    window.parent.postMessage({
      type: "ELEMENT_SELECTED",
      payload: {
        selector,
        tag,
        styles,
        innerText: el.innerText || "",
        innerHTML: el.innerHTML || "",
        id: el.id || "",
        className: el.className || "",
        href: el.href || el.getAttribute("href") || "",
        src: el.src || el.getAttribute("src") || "",
        alt: el.alt || el.getAttribute("alt") || "",
      }
    }, "*");
  }, true);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      deselect();
      window.parent.postMessage({ type: "ELEMENT_DESELECTED" }, "*");
    }
  });

  window.addEventListener("message", (e) => {
    if (e.data?.type === "WEBGEN_SET_PREVIEW") {
      window.__webgenPreview = !!e.data.value;
      if (window.__webgenPreview) {
        deselect();
        window.parent.postMessage({ type: "ELEMENT_DESELECTED" }, "*");
      }
    }
    if (e.data?.type === "WEBGEN_DESELECT") {
      deselect();
      window.parent.postMessage({ type: "ELEMENT_DESELECTED" }, "*");
    }
  });
})();
`;

function stripEditorArtifacts(doc) {
    if (!doc) return;
    doc.querySelectorAll(`[${SELECTION_ATTR}]`).forEach(el => {
        el.removeAttribute(SELECTION_ATTR);
        el.style.outline = "";
        el.style.outlineOffset = "";
    });
    doc.querySelectorAll("*").forEach(el => {
        if (el.style.outline?.includes("6366f1") || el.style.outline?.includes("rgb(99, 102, 241)")) {
            el.style.outline = "";
            el.style.outlineOffset = "";
        }
    });
    doc.querySelectorAll(`script[${INTERCEPTOR_SCRIPT_ATTR}]`).forEach(s => s.remove());
    doc.getElementById(EDITOR_STYLE_ID)?.remove();
}

function injectEditorScript(doc) {
    if (!doc?.body) return;
    if (doc.querySelector(`script[${INTERCEPTOR_SCRIPT_ATTR}]`)) return;
    const script = doc.createElement("script");
    script.setAttribute(INTERCEPTOR_SCRIPT_ATTR, "true");
    script.textContent = INTERCEPTOR_SCRIPT;
    doc.body.appendChild(script);
}

function serializeIframeDocument(doc) {
    stripEditorArtifacts(doc);
    return "<!DOCTYPE html>\n" + doc.documentElement.outerHTML;
}

function postToIframe(iframe, message) {
    iframe?.contentWindow?.postMessage(message, "*");
}

// ── Properties Panel ─────────────────────────────────────────────────────────

const PROPS_GROUPS = [
    {
        label: "Typography",
        fields: [
            { key: "fontSize", label: "Font Size", type: "text", unit: "px" },
            { key: "fontFamily", label: "Font Family", type: "font" },
            {
                key: "fontWeight", label: "Font Weight", type: "select",
                options: ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
            },
            { key: "textAlign", label: "Text Align", type: "align" },
            { key: "lineHeight", label: "Line Height", type: "text" },
            { key: "letterSpacing", label: "Letter Spacing", type: "text" },
            { key: "color", label: "Text Color", type: "color" },
            {
                key: "textDecoration", label: "Decoration", type: "select",
                options: ["none", "underline", "line-through", "overline"]
            },
            {
                key: "textTransform", label: "Transform", type: "select",
                options: ["none", "uppercase", "lowercase", "capitalize"]
            },
        ],
    },
    {
        label: "Background",
        fields: [
            { key: "backgroundColor", label: "Background", type: "color" },
            { key: "backgroundImage", label: "Background Image", type: "text" },
            {
                key: "backgroundSize", label: "Background Size", type: "select",
                options: ["auto", "cover", "contain"]
            },
        ],
    },
    {
        label: "Dimensions",
        fields: [
            { key: "width", label: "Width", type: "text" },
            { key: "height", label: "Height", type: "text" },
            { key: "minWidth", label: "Min Width", type: "text" },
            { key: "maxWidth", label: "Max Width", type: "text" },
            { key: "minHeight", label: "Min Height", type: "text" },
            { key: "maxHeight", label: "Max Height", type: "text" },
        ],
    },
    {
        label: "Spacing",
        fields: [
            { key: "paddingTop", label: "Pad Top", type: "text" },
            { key: "paddingRight", label: "Pad Right", type: "text" },
            { key: "paddingBottom", label: "Pad Bottom", type: "text" },
            { key: "paddingLeft", label: "Pad Left", type: "text" },
            { key: "marginTop", label: "Mar Top", type: "text" },
            { key: "marginRight", label: "Mar Right", type: "text" },
            { key: "marginBottom", label: "Mar Bottom", type: "text" },
            { key: "marginLeft", label: "Mar Left", type: "text" },
        ],
    },
    {
        label: "Border",
        fields: [
            { key: "borderRadius", label: "Radius", type: "text" },
            { key: "borderWidth", label: "Width", type: "text" },
            {
                key: "borderStyle", label: "Style", type: "select",
                options: ["none", "solid", "dashed", "dotted", "double"]
            },
            { key: "borderColor", label: "Color", type: "color" },
        ],
    },
    {
        label: "Layout",
        fields: [
            {
                key: "display", label: "Display", type: "select",
                options: ["block", "flex", "grid", "inline", "inline-block", "none"]
            },
            {
                key: "flexDirection", label: "Flex Dir", type: "select",
                options: ["row", "column", "row-reverse", "column-reverse"]
            },
            {
                key: "justifyContent", label: "Justify", type: "select",
                options: ["flex-start", "center", "flex-end", "space-between", "space-evenly"]
            },
            {
                key: "alignItems", label: "Align", type: "select",
                options: ["flex-start", "center", "flex-end", "stretch"]
            },
            { key: "gap", label: "Gap", type: "text" },
            { key: "opacity", label: "Opacity", type: "range" },
            {
                key: "position", label: "Position", type: "select",
                options: ["static", "relative", "absolute", "fixed", "sticky"]
            },
            { key: "zIndex", label: "Z-Index", type: "text" },
            {
                key: "overflow", label: "Overflow", type: "select",
                options: ["visible", "hidden", "scroll", "auto"]
            },
        ],
    },
    {
        label: "Content",
        fields: [
            { key: "__innerText", label: "Text Content", type: "textarea" },
            { key: "__href", label: "Link URL", type: "text" },
            { key: "__src", label: "Image/Video Src", type: "text" },
            { key: "__alt", label: "Alt Text", type: "text" },
        ],
    },
];

const FONTS = ["Inter", "DM Sans", "Roboto", "Open Sans", "Montserrat", "Poppins", "Lato", "Nunito", "Raleway", "Playfair Display", "Georgia", "monospace"];

const SLabel = ({ children }) => (
    <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(255,255,255,0.4)", margin: 0, marginBottom: 3 }}>
        {children}
    </p>
);

const SInput = ({ value, onChange, placeholder, type = "text" }) => (
    <input type={type} value={value || ""} onChange={onChange} placeholder={placeholder || ""}
        style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "5px 8px", fontSize: 12, color: "#fff", outline: "none", boxSizing: "border-box" }} />
);

const PropertiesPanel = ({ selected, onStyleChange, onContentChange }) => {
    const [openGroups, setOpenGroups] = useState(["Typography", "Background", "Dimensions", "Spacing", "Border", "Layout", "Content"]);

    const toggle = (label) => setOpenGroups(prev =>
        prev.includes(label) ? prev.filter(g => g !== label) : [...prev, label]
    );

    if (!selected) return (
        <div style={{ padding: 24, textAlign: "center", color: "rgba(255,255,255,0.3)" }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>🖱️</p>
            <p style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.45)" }}>Click any element</p>
            <p style={{ fontSize: 12, marginTop: 4 }}>Select an element in the canvas to edit its properties</p>
        </div>
    );

    const renderField = (field) => {
        const val = selected.styles[field.key] || "";

        if (field.key === "__innerText") {
            if (["img", "video", "iframe", "input", "hr", "br"].includes(selected.tag)) return null;
            return (
                <div key={field.key} style={{ marginBottom: 8 }}>
                    <SLabel>{field.label}</SLabel>
                    <textarea
                        value={selected.innerText || ""}
                        onChange={e => onContentChange("__innerText", e.target.value)}
                        rows={3}
                        style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "5px 8px", fontSize: 12, color: "#fff", outline: "none", resize: "none", boxSizing: "border-box" }}
                    />
                </div>
            );
        }

        if (field.key === "__href") {
            if (!["a"].includes(selected.tag)) return null;
            return (
                <div key={field.key} style={{ marginBottom: 8 }}>
                    <SLabel>{field.label}</SLabel>
                    <SInput value={selected.href || ""} onChange={e => onContentChange("__href", e.target.value)} placeholder="https://example.com" />
                </div>
            );
        }

        if (field.key === "__src") {
            if (!["img", "iframe", "video"].includes(selected.tag)) return null;
            return (
                <div key={field.key} style={{ marginBottom: 8 }}>
                    <SLabel>{field.label}</SLabel>
                    <SInput value={selected.src || ""} onChange={e => onContentChange("__src", e.target.value)} placeholder="https://…" />
                </div>
            );
        }

        if (field.key === "__alt") {
            if (!["img"].includes(selected.tag)) return null;
            return (
                <div key={field.key} style={{ marginBottom: 8 }}>
                    <SLabel>{field.label}</SLabel>
                    <SInput value={selected.alt || ""} onChange={e => onContentChange("__alt", e.target.value)} placeholder="Alt text" />
                </div>
            );
        }

        if (field.type === "color") return (
            <div key={field.key} style={{ marginBottom: 8 }}>
                <SLabel>{field.label}</SLabel>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <input type="color" value={val || "#000000"} onChange={e => onStyleChange(field.key, e.target.value)}
                        style={{ width: 28, height: 28, borderRadius: 5, border: "1px solid rgba(255,255,255,0.1)", padding: 2, background: "transparent", cursor: "pointer", flexShrink: 0 }} />
                    <SInput value={val} onChange={e => onStyleChange(field.key, e.target.value)} placeholder="#000000" />
                </div>
            </div>
        );

        if (field.type === "select") return (
            <div key={field.key} style={{ marginBottom: 8 }}>
                <SLabel>{field.label}</SLabel>
                <select value={val} onChange={e => onStyleChange(field.key, e.target.value)}
                    style={{ width: "100%", background: "#0a0b0c", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "5px 8px", fontSize: 12, color: "#fff", outline: "none" }}>
                    <option value="">—</option>
                    {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
            </div>
        );

        if (field.type === "font") return (
            <div key={field.key} style={{ marginBottom: 8 }}>
                <SLabel>{field.label}</SLabel>
                <select value={val} onChange={e => onStyleChange(field.key, e.target.value)}
                    style={{ width: "100%", background: "#0a0b0c", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "5px 8px", fontSize: 12, color: "#fff", outline: "none" }}>
                    <option value="">—</option>
                    {FONTS.map(f => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
                </select>
            </div>
        );

        if (field.type === "align") return (
            <div key={field.key} style={{ marginBottom: 8 }}>
                <SLabel>{field.label}</SLabel>
                <div style={{ display: "flex", gap: 4 }}>
                    {["left", "center", "right", "justify"].map(a => (
                        <button key={a} onClick={() => onStyleChange("textAlign", a)}
                            style={{ flex: 1, padding: "4px 0", background: val === a ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.05)", border: `1px solid ${val === a ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.08)"}`, borderRadius: 5, color: val === a ? "#a5b4fc" : "rgba(255,255,255,0.5)", fontSize: 11, cursor: "pointer" }}>
                            {a === "left" ? "⬅" : a === "center" ? "↔" : a === "right" ? "➡" : "⇔"}
                        </button>
                    ))}
                </div>
            </div>
        );

        if (field.type === "range") return (
            <div key={field.key} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <SLabel>{field.label}</SLabel>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{val || "1"}</span>
                </div>
                <input type="range" min={0} max={1} step={0.01} value={parseFloat(val) || 1}
                    onChange={e => onStyleChange("opacity", e.target.value)}
                    style={{ width: "100%", accentColor: "#6366f1" }} />
            </div>
        );

        if (field.type === "textarea") return (
            <div key={field.key} style={{ marginBottom: 8 }}>
                <SLabel>{field.label}</SLabel>
                <textarea value={val} onChange={e => onStyleChange(field.key, e.target.value)}
                    rows={3} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "5px 8px", fontSize: 12, color: "#fff", outline: "none", resize: "none", boxSizing: "border-box" }} />
            </div>
        );

        return (
            <div key={field.key} style={{ marginBottom: 8 }}>
                <SLabel>{field.label}</SLabel>
                <SInput value={val} onChange={e => onStyleChange(field.key, e.target.value)} placeholder="—" />
            </div>
        );
    };

    return (
        <div style={{ padding: "0 12px 24px" }}>
            {/* Selected element info */}
            <div style={{ padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 8 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#a5b4fc", margin: 0 }}>
                    &lt;{selected.tag}&gt;
                    {selected.id ? ` #${selected.id}` : ""}
                    {selected.className ? ` .${selected.className.split(" ")[0]}` : ""}
                </p>
            </div>

            {PROPS_GROUPS.map(group => (
                <div key={group.label} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <button onClick={() => toggle(group.label)}
                        style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", background: "transparent", border: "none", cursor: "pointer" }}>
                        <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.45)" }}>{group.label}</span>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", transform: openGroups.includes(group.label) ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>▾</span>
                    </button>
                    {openGroups.includes(group.label) && (
                        <div style={{ paddingBottom: 8 }}>
                            {group.fields.map(field => renderField(field))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

// ── Main IframeEditor ─────────────────────────────────────────────────────────

const IframeEditor = ({ project, onSave, isSaving, onUndoChange }) => {
    const iframeRef = useRef(null);
    const lastLoadedProjectIdRef = useRef(null);
    const [html, setHtml] = useState(project?.html || "");
    const [urlInput, setUrlInput] = useState("");
    const [urlLoading, setUrlLoading] = useState(false);
    const [urlError, setUrlError] = useState("");
    const [selected, setSelected] = useState(null);
    const [selectorPath, setSelectorPath] = useState(null);
    const [htmlHistory, setHtmlHistory] = useState(() => [project?.html || ""]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [isPreview, setIsPreview] = useState(false);

    const deselectInIframe = useCallback(() => {
        postToIframe(iframeRef.current, { type: "WEBGEN_DESELECT" });
        setSelected(null);
        setSelectorPath(null);
    }, []);

    // ── Load HTML into iframe ─────────────────────────────────────────────────
    const loadHtmlIntoIframe = useCallback((htmlString, { editMode = true } = {}) => {
        const iframe = iframeRef.current;
        if (!iframe) return;
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) return;
        doc.open();
        doc.write(htmlString);
        doc.close();
        const finishLoad = () => {
            if (editMode) {
                injectEditorScript(doc);
                postToIframe(iframe, { type: "WEBGEN_SET_PREVIEW", value: false });
            } else {
                postToIframe(iframe, { type: "WEBGEN_SET_PREVIEW", value: true });
            }
        };
        iframe.onload = finishLoad;
        if (doc.readyState === "complete") finishLoad();
    }, []);

    const pushHtmlHistory = useCallback((newHtml) => {
        setHtmlHistory(prev => {
            const trimmed = prev.slice(0, historyIndex + 1);
            return [...trimmed, newHtml];
        });
        setHistoryIndex(prev => prev + 1);
    }, [historyIndex]);

    const snapshotIframeHtml = useCallback(() => {
        setTimeout(() => {
            const iframe = iframeRef.current;
            const doc = iframe?.contentDocument;
            if (!doc) return;
            const serialized = serializeIframeDocument(doc);
            pushHtmlHistory(serialized);
            if (!isPreview) injectEditorScript(doc);
        }, 50);
    }, [pushHtmlHistory, isPreview]);

    const handleUndo = useCallback(() => {
        if (historyIndex <= 0) return;
        const newIndex = historyIndex - 1;
        const nextHtml = htmlHistory[newIndex];
        setHistoryIndex(newIndex);
        setHtml(nextHtml);
        loadHtmlIntoIframe(nextHtml, { editMode: !isPreview });
        deselectInIframe();
    }, [historyIndex, htmlHistory, loadHtmlIntoIframe, isPreview, deselectInIframe]);

    const handleRedo = useCallback(() => {
        if (historyIndex >= htmlHistory.length - 1) return;
        const newIndex = historyIndex + 1;
        const nextHtml = htmlHistory[newIndex];
        setHistoryIndex(newIndex);
        setHtml(nextHtml);
        loadHtmlIntoIframe(nextHtml, { editMode: !isPreview });
        deselectInIframe();
    }, [historyIndex, htmlHistory, loadHtmlIntoIframe, isPreview, deselectInIframe]);

    const handleSave = useCallback(async () => {
        const iframe = iframeRef.current;
        if (!iframe) return;
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) return;

        deselectInIframe();
        const serialized = serializeIframeDocument(doc);
        setHtml(serialized);
        await onSave(serialized);
        if (!isPreview) injectEditorScript(doc);
    }, [onSave, isPreview, deselectInIframe]);

    useEffect(() => {
        if (!project?.id) return;
        if (lastLoadedProjectIdRef.current === project.id) return;
        lastLoadedProjectIdRef.current = project.id;
        const initialHtml = project.html || "";
        setHtml(initialHtml);
        setHtmlHistory([initialHtml]);
        setHistoryIndex(0);
        if (initialHtml) loadHtmlIntoIframe(initialHtml);
    }, [project?.id, project?.html, loadHtmlIntoIframe]);

    useEffect(() => {
        const iframe = iframeRef.current;
        const doc = iframe?.contentDocument;
        postToIframe(iframe, { type: "WEBGEN_SET_PREVIEW", value: isPreview });
        if (isPreview) {
            deselectInIframe();
        } else if (doc) {
            injectEditorScript(doc);
        }
    }, [isPreview, deselectInIframe]);

    useEffect(() => {
        const handler = (e) => {
            if (isPreview) return;
            if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
                e.preventDefault();
                handleUndo();
            }
            if ((e.metaKey || e.ctrlKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
                e.preventDefault();
                handleRedo();
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [handleUndo, handleRedo, isPreview]);

    useEffect(() => {
        const handler = () => { handleSave(); };
        document.addEventListener("iframe-save", handler);
        return () => document.removeEventListener("iframe-save", handler);
    }, [handleSave]);

    const handlePreviewToggle = useCallback(() => setIsPreview(p => !p), []);

    useEffect(() => {
        onUndoChange?.({
            canUndo: historyIndex > 0,
            canRedo: historyIndex < htmlHistory.length - 1,
            onUndo: handleUndo,
            onRedo: handleRedo,
            isPreview,
            onPreviewToggle: handlePreviewToggle,
        });
    }, [historyIndex, htmlHistory.length, isPreview, handleUndo, handleRedo, handlePreviewToggle, onUndoChange]);

    // ── Listen for postMessage from iframe ────────────────────────────────────
    useEffect(() => {
        const handler = (e) => {
            if (e.data?.type === 'ELEMENT_SELECTED') {
                setSelected(e.data.payload);
                setSelectorPath(e.data.payload.selector);
            }
            if (e.data?.type === 'ELEMENT_DESELECTED') {
                setSelected(null);
                setSelectorPath(null);
            }
        };
        window.addEventListener('message', handler);
        return () => window.removeEventListener('message', handler);
    }, []);

    // ── Apply style change to iframe element ──────────────────────────────────
    const applyStyleToIframe = useCallback((cssKey, value) => {
        if (!selectorPath) return;
        const iframe = iframeRef.current;
        if (!iframe) return;
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) return;
        try {
            const el = doc.querySelector(selectorPath);
            if (!el) return;
            // Convert camelCase to kebab-case for style assignment
            el.style[cssKey] = value;
            // Update selected state to reflect change
            setSelected(prev => prev ? { ...prev, styles: { ...prev.styles, [cssKey]: value } } : prev);
            snapshotIframeHtml();
        } catch (err) {
            console.warn('Style apply failed:', err);
        }
    }, [selectorPath, snapshotIframeHtml]);

    // ── Apply content change to iframe element ────────────────────────────────
    const applyContentToIframe = useCallback((key, value) => {
        if (!selectorPath) return;
        const iframe = iframeRef.current;
        if (!iframe) return;
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) return;
        try {
            const el = doc.querySelector(selectorPath);
            if (!el) return;
            if (key === "__innerText") {
                el.textContent = value;
                setSelected(prev => prev ? { ...prev, innerText: value } : prev);
            }
            if (key === "__href") {
                el.setAttribute('href', value);
                setSelected(prev => prev ? { ...prev, href: value } : prev);
            }
            if (key === "__src") {
                el.setAttribute('src', value);
                setSelected(prev => prev ? { ...prev, src: value } : prev);
            }
            if (key === "__alt") {
                el.setAttribute('alt', value);
                setSelected(prev => prev ? { ...prev, alt: value } : prev);
            }
            snapshotIframeHtml();
        } catch (err) {
            console.warn('Content apply failed:', err);
        }
    }, [selectorPath, snapshotIframeHtml]);

    // ── Load external URL ─────────────────────────────────────────────────────
    const handleLoadUrl = async () => {
        if (!urlInput.trim()) return;
        setUrlLoading(true);
        setUrlError("");
        try {
            const res = await API.post('/projects/fetch-url', { url: urlInput.trim() });
            const fetched = res.data.html;
            setHtml(fetched);
            loadHtmlIntoIframe(fetched, { editMode: !isPreview });
            pushHtmlHistory(fetched);
            deselectInIframe();
        } catch (err) {
            setUrlError(err.response?.data?.error || "Failed to load URL.");
        } finally {
            setUrlLoading(false);
        }
    };

    return (
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
            {/* ── Canvas area ──────────────────────────────────────────────────── */}
            <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>

                {/* URL bar */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#0a0b0c", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>

                    <span style={{ fontSize: 16, flexShrink: 0 }}>🌐</span>
                    <input
                        value={urlInput}
                        onChange={e => setUrlInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleLoadUrl(); }}
                        placeholder="Paste a URL to load an external website, or edit your project below…"
                        style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "7px 12px", fontSize: 13, color: "#fff", outline: "none" }}
                    />
                    <button onClick={handleLoadUrl} disabled={urlLoading || !urlInput.trim()}
                        style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: urlLoading || !urlInput.trim() ? "rgba(255,255,255,0.08)" : "rgba(99,102,241,0.8)", color: urlLoading || !urlInput.trim() ? "rgba(255,255,255,0.3)" : "#fff", fontSize: 13, fontWeight: 600, cursor: urlLoading || !urlInput.trim() ? "not-allowed" : "pointer", flexShrink: 0, transition: "all 0.15s" }}>
                        {urlLoading ? "Loading…" : "Load"}
                    </button>
                    <button onClick={handleSave} disabled={isSaving}
                        style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: isSaving ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg,#f43f5e,#f97316,#f59e0b)", color: isSaving ? "rgba(255,255,255,0.3)" : "#111", fontSize: 13, fontWeight: 700, cursor: isSaving ? "not-allowed" : "pointer", flexShrink: 0 }}>
                        {isSaving ? "Saving…" : "Save"}
                    </button>
                </div>

                {/* URL error */}
                {urlError && (
                    <div style={{ padding: "8px 12px", background: "rgba(239,68,68,0.1)", borderBottom: "1px solid rgba(239,68,68,0.2)", fontSize: 12, color: "#fca5a5" }}>
                        ⚠️ {urlError}
                    </div>
                )}

                {/* Iframe canvas */}
                <iframe
                    ref={iframeRef}
                    title="HTML Editor Canvas"
                    sandbox="allow-same-origin allow-scripts"
                    style={{ flex: 1, border: "none", width: "100%", height: "100%", background: "#fff" }}
                />
            </div>

            {!isPreview && (
                <div style={{ width: 300, minWidth: 300, height: "100%", display: "flex", flexDirection: "column", background: "#0a0b0c", borderLeft: "1px solid rgba(255,255,255,0.06)", overflow: "hidden", flexShrink: 0 }}>
                    <div style={{ padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
                        <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)", margin: 0 }}>Properties</p>
                    </div>
                    <div style={{ flex: 1, overflowY: "auto" }}>
                        <PropertiesPanel
                            selected={selected}
                            onStyleChange={applyStyleToIframe}
                            onContentChange={applyContentToIframe}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default IframeEditor;