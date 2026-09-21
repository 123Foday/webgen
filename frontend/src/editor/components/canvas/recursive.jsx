import Container from "./container";
import TextComponent from "./text";
import HeadingComponent from "./heading";
import LinkComponent from "./link";
import VideoComponent from "./video";
import ImageComponent from "./image-component";
import ButtonComponent from "./button-component";
import DividerComponent from "./divider-component";
import SpacerComponent from "./spacer";
import ListElement from "./list-element";
import IconBox from "./icon-box";
import CardElement from "./card-element";
import CountdownComponent from "./countdown";
import ProgressBarComponent from "./progress-bar";
import LoginForm from "./login-form";
import SignupForm from "./signup-form";
import TableElement from "./table-element";
import AlertBox from "./alert-box";
import CodeBlock from "./code-block";
import BlockquoteElement from "./blockquote";
import InputGroup from "./input-group";
import RawHtmlBlock from "./raw-html-block";

const Recursive = ({ element }) => {
  switch (element.type) {
    case "text":         return <TextComponent element={element} />;
    case "heading":      return <HeadingComponent element={element} />;
    case "link":         return <LinkComponent element={element} />;
    case "video":        return <VideoComponent element={element} />;
    case "image":        return <ImageComponent element={element} />;
    case "button":       return <ButtonComponent element={element} />;
    case "divider":      return <DividerComponent element={element} />;
    case "spacer":       return <SpacerComponent element={element} />;
    case "list":         return <ListElement element={element} />;
    case "icon-box":     return <IconBox element={element} />;
    case "card":         return <CardElement element={element} />;
    case "countdown":    return <CountdownComponent element={element} />;
    case "progress-bar": return <ProgressBarComponent element={element} />;
    case "login-form":   return <LoginForm element={element} />;
    case "signup-form":  return <SignupForm element={element} />;
    case "table":        return <TableElement element={element} />;
    case "alert":        return <AlertBox element={element} />;
    case "code":         return <CodeBlock element={element} />;
    case "blockquote":   return <BlockquoteElement element={element} />;
    case "input-group":  return <InputGroup element={element} />;
    case "raw-html":     return <RawHtmlBlock element={element} />;
    case "container":
    case "2Col": case "3Col": case "4Col": case "__body":
      return <Container element={element} />;
    default: return null;
  }
};

export default Recursive;
