import { createContext, useContext, useReducer } from "react";
import { genId, defaultStyles } from "../utils/editor-constants";

// ─── helpers ────────────────────────────────────────────────────────────────

export const deepCloneWithNewIds = (element) => ({
  ...element,
  id: genId(),
  content: Array.isArray(element.content)
    ? element.content.map(deepCloneWithNewIds)
    : { ...element.content },
});

export const findParentAndIndex = (elements, targetId) => {
  for (const el of elements) {
    if (Array.isArray(el.content)) {
      const idx = el.content.findIndex((c) => c.id === targetId);
      if (idx !== -1) return { parent: el, index: idx };
      const nested = findParentAndIndex(el.content, targetId);
      if (nested) return nested;
    }
  }
  return null;
};

const findElementById = (elements, id) => {
  for (const el of elements) {
    if (el.id === id) return el;
    if (Array.isArray(el.content)) {
      const found = findElementById(el.content, id);
      if (found) return found;
    }
  }
  return null;
};

const addAnElement = (arr, action) => {
  return arr.map((item) => {
    if (item.id === action.payload.containerId && Array.isArray(item.content)) {
      return { ...item, content: [...item.content, action.payload.elementDetails] };
    } else if (Array.isArray(item.content)) {
      return { ...item, content: addAnElement(item.content, action) };
    }
    return item;
  });
};

const updateAnElement = (arr, action) => {
  return arr.map((item) => {
    if (item.id === action.payload.elementDetails.id) return { ...item, ...action.payload.elementDetails };
    if (Array.isArray(item.content)) return { ...item, content: updateAnElement(item.content, action) };
    return item;
  });
};

const deleteAnElement = (arr, action) => {
  return arr.filter((item) => {
    if (item.id === action.payload.elementDetails.id) return false;
    if (Array.isArray(item.content)) item.content = deleteAnElement(item.content, action);
    return true;
  });
};

const duplicateAnElement = (arr, action) => {
  const result = [];
  for (const item of arr) {
    result.push(item);
    if (item.id === action.payload.elementDetails.id) {
      result.push(deepCloneWithNewIds(action.payload.elementDetails));
    }
    if (Array.isArray(item.content)) {
      result[result.length - 1] = {
        ...result[result.length - 1],
        content: duplicateAnElement(item.content, action),
      };
    }
  }
  return result;
};

const pasteIntoContainer = (arr, containerId, clipboard) => {
  return arr.map((item) => {
    if (item.id === containerId && Array.isArray(item.content)) {
      return { ...item, content: [...item.content, deepCloneWithNewIds(clipboard)] };
    }
    if (Array.isArray(item.content)) {
      return { ...item, content: pasteIntoContainer(item.content, containerId, clipboard) };
    }
    return item;
  });
};

const reorderInContainer = (arr, action) => {
  const { containerId, fromIndex, toIndex } = action.payload;
  return arr.map((item) => {
    if (item.id === containerId && Array.isArray(item.content)) {
      const newContent = [...item.content];
      const [moved] = newContent.splice(fromIndex, 1);
      newContent.splice(toIndex, 0, moved);
      return { ...item, content: newContent };
    }
    if (Array.isArray(item.content)) {
      return { ...item, content: reorderInContainer(item.content, action) };
    }
    return item;
  });
};

const pushHistory = (state, newEditorState) => {
  const newHistory = [...state.history.history.slice(0, state.history.currentIndex + 1), newEditorState];
  return { editor: newEditorState, history: { history: newHistory, currentIndex: newHistory.length - 1 } };
};

// ─── initial state ───────────────────────────────────────────────────────────

const initialEditorState = {
  elements: [{ content: [], id: "__body", name: "Body", styles: { minHeight: "100vh" }, type: "__body" }],
  selectedElement: { content: [], id: "__body", name: "Body", styles: {}, type: "__body" },
  liveMode: false,
  device: "Desktop",
  previewMode: false,
  clipboard: null,
  theme: {},
};

const initialHistoryState = { history: [initialEditorState], currentIndex: 0 };
const initialState = { editor: initialEditorState, history: initialHistoryState };

// ─── reducer ─────────────────────────────────────────────────────────────────

const editorReducer = (state = initialState, action) => {
  switch (action.type) {
    case "ADD_ELEMENT": {
      const newEditorState = { ...state.editor, elements: addAnElement(state.editor.elements, action) };
      return pushHistory(state, newEditorState);
    }
    case "UPDATE_ELEMENT": {
      const newElements = updateAnElement(state.editor.elements, action);
      const stillSelected = state.editor.selectedElement.id === action.payload.elementDetails.id;
      const newEditorState = {
        ...state.editor,
        elements: newElements,
        selectedElement: stillSelected ? action.payload.elementDetails : { id: "", content: [], name: "", styles: {}, type: null },
      };
      return pushHistory(state, newEditorState);
    }
    case "DELETE_ELEMENT": {
      const newEditorState = { ...state.editor, elements: deleteAnElement(state.editor.elements, action) };
      return pushHistory(state, newEditorState);
    }
    case "DUPLICATE_ELEMENT": {
      const newEditorState = { ...state.editor, elements: duplicateAnElement(state.editor.elements, action) };
      return pushHistory(state, newEditorState);
    }
    case "COPY_ELEMENT":
      return { ...state, editor: { ...state.editor, clipboard: action.payload.elementDetails } };
    case "PASTE_ELEMENT": {
      if (!state.editor.clipboard) return state;
      const newElements = pasteIntoContainer(state.editor.elements, action.payload.containerId, state.editor.clipboard);
      return pushHistory(state, { ...state.editor, elements: newElements });
    }
    case "REORDER_ELEMENT": {
      const newElements = reorderInContainer(state.editor.elements, action);
      return pushHistory(state, { ...state.editor, elements: newElements });
    }
    case "MOVE_ELEMENT": {
      const { elementId, targetContainerId } = action.payload;
      const movingEl = findElementById(state.editor.elements, elementId);
      if (!movingEl) return state;
      const withoutEl = deleteAnElement(state.editor.elements, { type: "DELETE_ELEMENT", payload: { elementDetails: movingEl } });
      const withEl = addAnElement(withoutEl, { type: "ADD_ELEMENT", payload: { containerId: targetContainerId, elementDetails: movingEl } });
      return pushHistory(state, { ...state.editor, elements: withEl });
    }
    case "CHANGE_CLICKED_ELEMENT":
      return {
        ...state,
        editor: {
          ...state.editor,
          selectedElement: action.payload.elementDetails || { id: "", name: "", styles: {}, type: null, content: [] },
        },
      };
    case "CHANGE_DEVICE":
      return { ...state, editor: { ...state.editor, device: action.payload.device } };
    case "TOGGLE_PREVIEW_MODE":
      return { ...state, editor: { ...state.editor, previewMode: !state.editor.previewMode } };
    case "TOGGLE_LIVE_MODE":
      return { ...state, editor: { ...state.editor, liveMode: action.payload ? action.payload.value : !state.editor.liveMode } };
    case "UNDO":
      if (state.history.currentIndex > 0) {
        const prevIdx = state.history.currentIndex - 1;
        return { ...state, editor: state.history.history[prevIdx], history: { ...state.history, currentIndex: prevIdx } };
      }
      return state;
    case "REDO":
      if (state.history.currentIndex < state.history.history.length - 1) {
        const nextIdx = state.history.currentIndex + 1;
        return { ...state, editor: state.history.history[nextIdx], history: { ...state.history, currentIndex: nextIdx } };
      }
      return state;
    case "LOAD_DATA": {
      const loadedElements = action.payload.elements || initialEditorState.elements;
      const bodyElement = Array.isArray(loadedElements) ? loadedElements[0] : initialEditorState.elements[0];
      return {
        ...initialState,
        editor: {
          ...initialState.editor,
          elements: loadedElements,
          liveMode: !!action.payload.withLive,
          selectedElement: bodyElement ?? initialEditorState.selectedElement,
        },
      };
    }
    case "SET_THEME":
      return pushHistory(state, { ...state.editor, theme: { ...state.editor.theme, ...action.payload.theme } });
    default:
      return state;
  }
};

// ─── context ─────────────────────────────────────────────────────────────────

const EditorContext = createContext(null);

export const EditorProvider = ({ children, projectId, projectName }) => {
  const [state, dispatch] = useReducer(editorReducer, initialState);
  return (
    <EditorContext.Provider value={{ state, dispatch, projectId, projectName }}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) throw new Error("useEditor must be used within EditorProvider");
  return context;
};

export default EditorProvider;
