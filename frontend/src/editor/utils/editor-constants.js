// Editor element type constants
export const EDITOR_BTNS = [
  "text","heading","container","section","contactForm","paymentForm",
  "link","2Col","video","__body","image","3Col","4Col","button",
  "spacer","divider","list","icon-box","card","countdown","progress-bar",
  "login-form","signup-form","table","alert","code","blockquote","input-group","raw-html"
];

export const defaultStyles = {
  backgroundPosition: "center",
  objectFit: "cover",
  backgroundRepeat: "no-repeat",
  textAlign: "left",
  opacity: "100%",
};

// Simple cn() helper - replaces clsx
export const cn = (...classes) => classes.filter(Boolean).join(" ");

// Generate a unique ID - replaces uuid
export const genId = () => crypto.randomUUID();
