import { useEditor } from "../../context/editor-provider";
import ElementToolbar from "./element-toolbar";

const ListElement = ({ element }) => {
  const { state, dispatch } = useEditor();
  const isSelected = state.editor.selectedElement.id === element.id;
  const isLive = state.editor.liveMode || state.editor.previewMode;
  const content = !Array.isArray(element.content) ? element.content : {};
  const items = content.items || ["List item"];
  const ordered = !!content.ordered;
  const border = isSelected && !isLive ? "2px solid #3b82f6" : !isLive ? "1px dashed rgba(255,255,255,0.08)" : "none";

  const updateItems = (newItems) =>
    dispatch({ type: "UPDATE_ELEMENT", payload: { elementDetails: { ...element, content: { ...content, items: newItems } } } });

  const Tag = ordered ? "ol" : "ul";

  return (
    <div style={{ ...element.styles, position: "relative", width: "100%", margin: "5px", border, transition: "border 0.15s" }}
      
      onClick={e => { e.stopPropagation(); dispatch({ type: "CHANGE_CLICKED_ELEMENT", payload: { elementDetails: element } }); }}>
      {isSelected && !isLive && <ElementToolbar element={element} />}
      {isSelected && !isLive && <div style={{ position:"absolute",top:-23,left:-1,background:"#3b82f6",color:"#fff",fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:"6px 6px 0 0",zIndex:10 }}>{element.name}</div>}
      <Tag style={{ listStyleType: ordered ? "decimal" : "disc", paddingLeft: "20px", margin: 0 }}>
        {items.map((item, i) => (
          <li key={i}>
            <span contentEditable={!isLive} suppressHydrationWarning style={{ outline: "none" }}
              onBlur={e => { const n=[...items]; n[i]=e.target.innerText; updateItems(n); }}
              onKeyDown={e => {
                if (e.key==="Enter"){e.preventDefault();const n=[...items];n.splice(i+1,0,"");updateItems(n);}
                if (e.key==="Backspace"&&e.target.innerText===""&&items.length>1){e.preventDefault();updateItems(items.filter((_,idx)=>idx!==i));}
              }}
              dangerouslySetInnerHTML={{ __html: item }} />
          </li>
        ))}
      </Tag>
    </div>
  );
};
export default ListElement;
