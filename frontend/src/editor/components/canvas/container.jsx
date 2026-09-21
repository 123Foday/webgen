import { useRef, useEffect } from "react";
import { useEditor, deepCloneWithNewIds } from "../../context/editor-provider";
import { genId, defaultStyles } from "../../utils/editor-constants";
import Recursive from "./recursive";
import ResizeHandles from "./resize-handles";
import ElementToolbar from "./element-toolbar";

const findEl = (elements, id) => {
  for (const el of elements) {
    if (el.id === id) return el;
    if (Array.isArray(el.content)) {
      const found = findEl(el.content, id);
      if (found) return found;
    }
  }
  return null;
};

const makeEl = (overrides) => ({
  id: genId(), name: "Element", content: [], styles: { ...defaultStyles }, type: "container", ...overrides,
});

const buildDropElement = (componentType) => {
  const map = {
    text: makeEl({ name: "Text", content: { innerText: "Your text here" }, styles: { ...defaultStyles, fontSize: "16px" }, type: "text" }),
    heading: makeEl({ name: "Heading", content: { innerText: "Your Heading", level: "h2" }, styles: { ...defaultStyles, fontSize: "32px", fontWeight: "700" }, type: "heading" }),
    link: makeEl({ name: "Link", content: { innerText: "Click here", href: "#" }, styles: { ...defaultStyles, color: "#6366f1" }, type: "link" }),
    video: makeEl({ name: "Video", content: { src: "https://www.youtube.com/embed/A3l6YYkXzzg" }, styles: { width: "100%", height: "315px" }, type: "video" }),
    image: makeEl({ name: "Image", content: { src: "https://placehold.co/600x400?text=Image", alt: "Image" }, styles: { ...defaultStyles, width: "100%" }, type: "image" }),
    button: makeEl({ name: "Button", content: { innerText: "Click Me", href: "#" }, styles: { ...defaultStyles, background: "linear-gradient(135deg, #f43f5e, #f97316, #f59e0b)", color: "#111", paddingTop: "12px", paddingBottom: "12px", paddingLeft: "28px", paddingRight: "28px", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "15px", display: "inline-block" }, type: "button" }),
    divider: makeEl({ name: "Divider", content: {}, styles: { width: "100%", marginTop: "16px", marginBottom: "16px", borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "rgba(255,255,255,0.1)" }, type: "divider" }),
    spacer: makeEl({ name: "Spacer", content: {}, styles: { width: "100%", height: "48px", display: "block" }, type: "spacer" }),
    list: makeEl({ name: "List", content: { items: ["First item", "Second item", "Third item"], ordered: false }, styles: { ...defaultStyles, paddingLeft: "20px" }, type: "list" }),
    "icon-box": makeEl({ name: "Icon Box", content: { icon: "⭐", title: "Feature Title", description: "Add a short description of this great feature here." }, styles: { ...defaultStyles, textAlign: "center", padding: "24px" }, type: "icon-box" }),
    card: makeEl({ name: "Card", content: { title: "Card Title", description: "Card description goes here.", buttonText: "Learn More", buttonHref: "#", imageSrc: "" }, styles: { ...defaultStyles, borderRadius: "12px", overflow: "hidden", backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }, type: "card" }),
    countdown: makeEl({ name: "Countdown", content: { targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], label: "Sale ends in" }, styles: { ...defaultStyles, textAlign: "center", padding: "24px" }, type: "countdown" }),
    "progress-bar": makeEl({ name: "Progress Bar", content: { label: "Progress", percentage: 75, color: "#6366f1" }, styles: { ...defaultStyles, padding: "8px 0" }, type: "progress-bar" }),
    container: makeEl({ name: "Container", content: [], styles: { ...defaultStyles, minHeight: "100px", padding: "16px" }, type: "container" }),
    "login-form": makeEl({ name: "Login Form", content: { title: "Welcome back", subtitle: "Sign in to your account", buttonText: "Sign In", buttonColor: "#6366f1", showForgot: "true", signupText: "Don't have an account?", signupLink: "Create account" }, styles: { ...defaultStyles, padding: "32px", backgroundColor: "rgba(255,255,255,0.04)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)" }, type: "login-form" }),
    "signup-form": makeEl({ name: "Sign Up Form", content: { title: "Create your account", subtitle: "Start your free trial today", fields: JSON.stringify(["name", "email", "password"]), buttonText: "Create Account", buttonColor: "#6366f1" }, styles: { ...defaultStyles, padding: "32px", backgroundColor: "rgba(255,255,255,0.04)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)" }, type: "signup-form" }),
    table: makeEl({ name: "Table", content: { headers: JSON.stringify(["Name", "Email", "Role", "Status"]), rows: JSON.stringify([["Alice Smith", "alice@example.com", "Admin", "Active"], ["Bob Jones", "bob@example.com", "Editor", "Active"]]), striped: "true", headerBg: "rgba(255,255,255,0.06)" }, styles: { ...defaultStyles, width: "100%", borderRadius: "8px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }, type: "table" }),
    alert: makeEl({ name: "Alert", content: { variant: "info", title: "Heads up!", message: "This is an informational message." }, styles: { ...defaultStyles, width: "100%" }, type: "alert" }),
    code: makeEl({ name: "Code Block", content: { language: "javascript", code: 'const greet = (name) => `Hello, ${name}!`;\nconsole.log(greet("World"));' }, styles: { ...defaultStyles, width: "100%", borderRadius: "8px" }, type: "code" }),
    blockquote: makeEl({ name: "Blockquote", content: { text: "The best way to predict the future is to create it.", author: "— Peter Drucker", accentColor: "#6366f1" }, styles: { ...defaultStyles, padding: "16px 0" }, type: "blockquote" }),
    "input-group": makeEl({ name: "Input Field", content: { label: "Your Name", placeholder: "Enter your name", inputType: "text" }, styles: { ...defaultStyles, width: "100%" }, type: "input-group" }),
    "2Col": makeEl({ name: "Two Columns", type: "2Col", styles: { ...defaultStyles, display: "flex", gap: "16px" }, content: [makeEl({ name: "Column 1", content: [], styles: { ...defaultStyles, width: "100%", minHeight: "100px" }, type: "container" }), makeEl({ name: "Column 2", content: [], styles: { ...defaultStyles, width: "100%", minHeight: "100px" }, type: "container" })] }),
    "3Col": makeEl({ name: "Three Columns", type: "3Col", styles: { ...defaultStyles, display: "flex", gap: "16px" }, content: [makeEl({ name: "Column 1", content: [], styles: { ...defaultStyles, width: "100%", minHeight: "100px" }, type: "container" }), makeEl({ name: "Column 2", content: [], styles: { ...defaultStyles, width: "100%", minHeight: "100px" }, type: "container" }), makeEl({ name: "Column 3", content: [], styles: { ...defaultStyles, width: "100%", minHeight: "100px" }, type: "container" })] }),
    "4Col": makeEl({ name: "Four Columns", type: "4Col", styles: { ...defaultStyles, display: "flex", gap: "16px" }, content: [1, 2, 3, 4].map(n => makeEl({ name: `Column ${n}`, content: [], styles: { ...defaultStyles, width: "100%", minHeight: "100px" }, type: "container" })) }),
    // ── Section templates ───────────────────────────────────────────────────────
    "section-navbar": makeEl({
      name: "Navbar", type: "container", styles: { width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 40px", backgroundColor: "rgba(10,11,12,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "sticky", top: "0px", zIndex: 50 }, content: [
        makeEl({ name: "Logo", content: { innerText: "YourBrand" }, styles: { fontSize: "20px", fontWeight: "800", color: "#ffffff", letterSpacing: "-0.5px" }, type: "text" }),
        makeEl({ name: "Nav Links", type: "container", styles: { display: "flex", alignItems: "center", gap: "32px" }, content: ["Home", "Features", "Pricing", "About"].map(l => makeEl({ name: l, content: { innerText: l, href: "#" }, styles: { color: "rgba(255,255,255,0.7)", fontSize: "14px", fontWeight: "500" }, type: "link" })) }),
        makeEl({ name: "CTA", content: { innerText: "Get Started", href: "#" }, styles: { background: "linear-gradient(135deg,#f43f5e,#f97316,#f59e0b)", color: "#111", paddingTop: "10px", paddingBottom: "10px", paddingLeft: "20px", paddingRight: "20px", borderRadius: "8px", fontSize: "14px", fontWeight: "700", cursor: "pointer", display: "inline-block" }, type: "button" }),
      ]
    }),
    "section-hero": makeEl({
      name: "Hero Section", type: "container", styles: { width: "100%", minHeight: "500px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "80px 40px", backgroundColor: "#08090a", backgroundImage: "radial-gradient(ellipse at top,rgba(99,102,241,0.15) 0%,transparent 70%)" }, content: [
        makeEl({ name: "Eyebrow", content: { innerText: "Welcome to our platform" }, styles: { color: "#a5b4fc", fontSize: "13px", fontWeight: "600", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px" }, type: "text" }),
        makeEl({ name: "Hero Heading", content: { innerText: "Build something amazing", level: "h1" }, styles: { color: "#ffffff", fontSize: "52px", fontWeight: "800", lineHeight: "1.1", marginBottom: "24px", maxWidth: "700px" }, type: "heading" }),
        makeEl({ name: "Hero Subtext", content: { innerText: "The all-in-one platform to launch and grow your online business." }, styles: { color: "rgba(255,255,255,0.55)", fontSize: "18px", lineHeight: "1.7", marginBottom: "40px", maxWidth: "540px" }, type: "text" }),
        makeEl({ name: "Hero CTA", content: { innerText: "Get started free →", href: "#" }, styles: { background: "linear-gradient(135deg,#f43f5e,#f97316,#f59e0b)", color: "#111", paddingTop: "16px", paddingBottom: "16px", paddingLeft: "36px", paddingRight: "36px", borderRadius: "10px", fontSize: "16px", fontWeight: "700", cursor: "pointer", display: "inline-block" }, type: "button" }),
      ]
    }),
    "section-features": makeEl({
      name: "Features Section", type: "container", styles: { width: "100%", padding: "80px 40px", backgroundColor: "#0a0b0c" }, content: [
        makeEl({ name: "Features Heading", content: { innerText: "Everything you need", level: "h2" }, styles: { fontSize: "36px", fontWeight: "700", textAlign: "center", marginBottom: "16px", color: "#ffffff" }, type: "heading" }),
        makeEl({ name: "Features Subtext", content: { innerText: "Powerful features to help you build better products faster." }, styles: { fontSize: "16px", color: "rgba(255,255,255,0.55)", textAlign: "center", marginBottom: "56px" }, type: "text" }),
        makeEl({
          name: "Feature Grid", type: "3Col", styles: { display: "flex", gap: "24px" }, content: [
            makeEl({ name: "Feature 1", content: { icon: "🚀", title: "Fast Setup", description: "Get started in minutes." }, styles: { textAlign: "center", padding: "32px 24px", backgroundColor: "rgba(255,255,255,0.04)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.06)" }, type: "icon-box" }),
            makeEl({ name: "Feature 2", content: { icon: "🎨", title: "Fully Customizable", description: "Make it yours." }, styles: { textAlign: "center", padding: "32px 24px", backgroundColor: "rgba(255,255,255,0.04)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.06)" }, type: "icon-box" }),
            makeEl({ name: "Feature 3", content: { icon: "📈", title: "Built to Scale", description: "Grow with confidence." }, styles: { textAlign: "center", padding: "32px 24px", backgroundColor: "rgba(255,255,255,0.04)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.06)" }, type: "icon-box" }),
          ]
        }),
      ]
    }),
    "section-pricing": makeEl({
      name: "Pricing Section", type: "container", styles: { width: "100%", padding: "80px 40px", backgroundColor: "#0c0d0f" }, content: [
        makeEl({ name: "Pricing Heading", content: { innerText: "Simple, transparent pricing", level: "h2" }, styles: { fontSize: "36px", fontWeight: "700", textAlign: "center", color: "#ffffff", marginBottom: "12px" }, type: "heading" }),
        makeEl({ name: "Pricing Sub", content: { innerText: "No hidden fees. Cancel anytime." }, styles: { textAlign: "center", color: "rgba(255,255,255,0.45)", marginBottom: "56px", fontSize: "16px" }, type: "text" }),
        makeEl({
          name: "Pricing Grid", type: "3Col", styles: { display: "flex", gap: "24px" }, content: [
            makeEl({
              name: "Starter", type: "container", styles: { padding: "32px", backgroundColor: "rgba(255,255,255,0.04)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", gap: "16px" }, content: [
                makeEl({ name: "Plan", content: { innerText: "Starter", level: "h3" }, styles: { fontSize: "18px", fontWeight: "700", color: "#fff" }, type: "heading" }),
                makeEl({ name: "Price", content: { innerText: "$0" }, styles: { fontSize: "48px", fontWeight: "800", color: "#fff" }, type: "text" }),
                makeEl({ name: "Desc", content: { innerText: "Perfect for individuals." }, styles: { fontSize: "14px", color: "rgba(255,255,255,0.45)" }, type: "text" }),
                makeEl({ name: "CTA", content: { innerText: "Get started free", href: "#" }, styles: { backgroundColor: "rgba(255,255,255,0.08)", color: "#fff", padding: "12px", borderRadius: "8px", textAlign: "center", fontWeight: "600", fontSize: "14px", cursor: "pointer", display: "block" }, type: "button" }),
              ]
            }),
            makeEl({
              name: "Pro", type: "container", styles: { padding: "32px", background: "linear-gradient(135deg,rgba(99,102,241,0.3),rgba(139,92,246,0.3))", borderRadius: "16px", border: "1px solid rgba(99,102,241,0.4)", display: "flex", flexDirection: "column", gap: "16px" }, content: [
                makeEl({ name: "Badge", content: { innerText: "Most Popular" }, styles: { fontSize: "11px", fontWeight: "700", backgroundColor: "rgba(99,102,241,0.3)", color: "#a5b4fc", padding: "4px 10px", borderRadius: "999px", display: "inline-block" }, type: "text" }),
                makeEl({ name: "Plan", content: { innerText: "Pro", level: "h3" }, styles: { fontSize: "18px", fontWeight: "700", color: "#fff" }, type: "heading" }),
                makeEl({ name: "Price", content: { innerText: "$29/mo" }, styles: { fontSize: "48px", fontWeight: "800", color: "#fff" }, type: "text" }),
                makeEl({ name: "Desc", content: { innerText: "For growing teams." }, styles: { fontSize: "14px", color: "rgba(255,255,255,0.6)" }, type: "text" }),
                makeEl({ name: "CTA", content: { innerText: "Start Pro", href: "#" }, styles: { background: "linear-gradient(135deg,#f43f5e,#f97316,#f59e0b)", color: "#111", padding: "12px", borderRadius: "8px", textAlign: "center", fontWeight: "700", fontSize: "14px", cursor: "pointer", display: "block" }, type: "button" }),
              ]
            }),
            makeEl({
              name: "Enterprise", type: "container", styles: { padding: "32px", backgroundColor: "rgba(255,255,255,0.04)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", gap: "16px" }, content: [
                makeEl({ name: "Plan", content: { innerText: "Enterprise", level: "h3" }, styles: { fontSize: "18px", fontWeight: "700", color: "#fff" }, type: "heading" }),
                makeEl({ name: "Price", content: { innerText: "Custom" }, styles: { fontSize: "48px", fontWeight: "800", color: "#fff" }, type: "text" }),
                makeEl({ name: "Desc", content: { innerText: "Custom solutions for large orgs." }, styles: { fontSize: "14px", color: "rgba(255,255,255,0.45)" }, type: "text" }),
                makeEl({ name: "CTA", content: { innerText: "Contact sales", href: "#" }, styles: { backgroundColor: "rgba(255,255,255,0.08)", color: "#fff", padding: "12px", borderRadius: "8px", textAlign: "center", fontWeight: "600", fontSize: "14px", cursor: "pointer", display: "block" }, type: "button" }),
              ]
            }),
          ]
        }),
      ]
    }),
    "section-cta": makeEl({
      name: "CTA Section", type: "container", styles: { width: "100%", padding: "80px 40px", background: "linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.2))", borderTop: "1px solid rgba(99,102,241,0.2)", borderBottom: "1px solid rgba(99,102,241,0.2)", textAlign: "center" }, content: [
        makeEl({ name: "CTA Heading", content: { innerText: "Ready to get started?", level: "h2" }, styles: { fontSize: "40px", fontWeight: "800", color: "#ffffff", marginBottom: "16px" }, type: "heading" }),
        makeEl({ name: "CTA Sub", content: { innerText: "Join thousands of businesses already using our platform." }, styles: { fontSize: "18px", color: "rgba(255,255,255,0.55)", marginBottom: "40px" }, type: "text" }),
        makeEl({ name: "CTA Button", content: { innerText: "Start for free", href: "#" }, styles: { background: "linear-gradient(135deg,#f43f5e,#f97316,#f59e0b)", color: "#111", paddingTop: "16px", paddingBottom: "16px", paddingLeft: "36px", paddingRight: "36px", borderRadius: "10px", fontSize: "16px", fontWeight: "700", cursor: "pointer", display: "inline-block" }, type: "button" }),
      ]
    }),
    "section-faq": makeEl({
      name: "FAQ Section", type: "container", styles: { width: "100%", padding: "80px 40px", backgroundColor: "#0a0b0c" }, content: [
        makeEl({ name: "FAQ Heading", content: { innerText: "Frequently asked questions", level: "h2" }, styles: { fontSize: "36px", fontWeight: "700", textAlign: "center", color: "#ffffff", marginBottom: "48px" }, type: "heading" }),
        makeEl({
          name: "FAQ Items", type: "container", styles: { maxWidth: "720px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "0px" }, content: [
            ["How does it work?", "Our platform connects directly with your existing tools. Setup takes less than 5 minutes."],
            ["Is there a free trial?", "Yes! Every plan starts with a 14-day free trial. No credit card required."],
            ["Can I cancel anytime?", "Absolutely. Cancel or downgrade your plan at any time with no penalty."],
            ["Do you offer support?", "Email support on all plans and live chat on Pro and Enterprise."],
          ].map(([q, a]) => makeEl({
            name: "FAQ Item", type: "container", styles: { borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "20px 0" }, content: [
              makeEl({ name: "Q", content: { innerText: q }, styles: { fontSize: "16px", fontWeight: "600", color: "#ffffff", marginBottom: "8px", cursor: "pointer" }, type: "text" }),
              makeEl({ name: "A", content: { innerText: a }, styles: { fontSize: "15px", color: "rgba(255,255,255,0.55)", lineHeight: "1.7" }, type: "text" }),
            ]
          }))
        }),
      ]
    }),
    "section-stats": makeEl({
      name: "Stats Section", type: "container", styles: { width: "100%", padding: "72px 40px", backgroundColor: "#08090a", borderTop: "1px solid rgba(255,255,255,0.04)" }, content: [
        makeEl({ name: "Stats Heading", content: { innerText: "Trusted by teams worldwide", level: "h2" }, styles: { fontSize: "32px", fontWeight: "700", textAlign: "center", color: "#ffffff", marginBottom: "48px" }, type: "heading" }),
        makeEl({
          name: "Stats Grid", type: "4Col", styles: { display: "flex", gap: "8px", textAlign: "center" }, content: [["10K+", "Active users"], ["99.9%", "Uptime SLA"], ["4.9★", "Avg rating"], ["2min", "Response time"]].map(([n, l]) => makeEl({
            name: l, type: "container", styles: { padding: "24px 16px" }, content: [
              makeEl({ name: "Num", content: { innerText: n }, styles: { fontSize: "40px", fontWeight: "800", color: "#6366f1", display: "block" }, type: "text" }),
              makeEl({ name: "Label", content: { innerText: l }, styles: { fontSize: "14px", color: "rgba(255,255,255,0.45)", marginTop: "4px", display: "block" }, type: "text" }),
            ]
          }))
        }),
      ]
    }),
    "section-testimonial": makeEl({
      name: "Testimonial", type: "container", styles: { width: "100%", padding: "80px 40px", backgroundColor: "#0a0b0c", textAlign: "center" }, content: [
        makeEl({ name: "Quote Mark", content: { innerText: "\u201c" }, styles: { fontSize: "72px", lineHeight: "1", color: "#6366f1", marginBottom: "8px", fontFamily: "Georgia,serif" }, type: "text" }),
        makeEl({ name: "Quote", content: { innerText: "This platform transformed how we do business. We grew 3x in just 6 months." }, styles: { fontSize: "22px", lineHeight: "1.7", color: "rgba(255,255,255,0.85)", maxWidth: "640px", margin: "0 auto", marginBottom: "32px", fontStyle: "italic" }, type: "text" }),
        makeEl({ name: "Author", content: { innerText: "Sarah Johnson, CEO" }, styles: { fontSize: "15px", fontWeight: "700", color: "#ffffff" }, type: "text" }),
        makeEl({ name: "Company", content: { innerText: "Acme Corp" }, styles: { fontSize: "13px", color: "rgba(255,255,255,0.35)" }, type: "text" }),
      ]
    }),
    "section-team": makeEl({
      name: "Team Section", type: "container", styles: { width: "100%", padding: "80px 40px", backgroundColor: "#0c0d0f" }, content: [
        makeEl({ name: "Team Heading", content: { innerText: "Meet the team", level: "h2" }, styles: { fontSize: "36px", fontWeight: "700", textAlign: "center", color: "#ffffff", marginBottom: "12px" }, type: "heading" }),
        makeEl({ name: "Team Sub", content: { innerText: "The people behind the product." }, styles: { textAlign: "center", color: "rgba(255,255,255,0.45)", marginBottom: "56px", fontSize: "16px" }, type: "text" }),
        makeEl({
          name: "Team Grid", type: "3Col", styles: { display: "flex", gap: "24px" }, content: [
            ["Alex Morgan", "Co-founder & CEO", "https://i.pravatar.cc/150?img=1"],
            ["Jordan Lee", "Head of Product", "https://i.pravatar.cc/150?img=5"],
            ["Sam Rivera", "Lead Engineer", "https://i.pravatar.cc/150?img=8"],
          ].map(([name, role, img]) => makeEl({
            name: `${name} Card`, type: "container", styles: { textAlign: "center", padding: "32px 24px", borderRadius: "16px", backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }, content: [
              makeEl({ name: "Avatar", content: { src: img, alt: name }, styles: { width: "80px", height: "80px", borderRadius: "50%", margin: "0 auto 16px", display: "block", objectFit: "cover" }, type: "image" }),
              makeEl({ name: "Name", content: { innerText: name, level: "h3" }, styles: { fontSize: "17px", fontWeight: "700", color: "#ffffff", marginBottom: "4px" }, type: "heading" }),
              makeEl({ name: "Role", content: { innerText: role }, styles: { fontSize: "14px", color: "rgba(255,255,255,0.45)" }, type: "text" }),
            ]
          }))
        }),
      ]
    }),
    "section-footer": makeEl({
      name: "Footer", type: "container", styles: { width: "100%", padding: "48px 40px 32px", backgroundColor: "#08090a", borderTop: "1px solid rgba(255,255,255,0.06)" }, content: [
        makeEl({
          name: "Footer Top", type: "container", styles: { display: "flex", justifyContent: "space-between", gap: "40px", marginBottom: "48px", flexWrap: "wrap" }, content: [
            makeEl({
              name: "Brand", type: "container", styles: { display: "flex", flexDirection: "column", gap: "12px", minWidth: "200px" }, content: [
                makeEl({ name: "Brand Name", content: { innerText: "YourBrand" }, styles: { fontSize: "20px", fontWeight: "800", color: "#ffffff" }, type: "text" }),
                makeEl({ name: "Tagline", content: { innerText: "The platform that helps you build and grow your business online." }, styles: { fontSize: "14px", color: "rgba(255,255,255,0.35)", lineHeight: "1.6", maxWidth: "220px" }, type: "text" }),
              ]
            }),
            ...["Product", "Company", "Support"].map(col => makeEl({
              name: `${col} Links`, type: "container", styles: { display: "flex", flexDirection: "column", gap: "8px" }, content: [
                makeEl({ name: "Col Header", content: { innerText: col }, styles: { fontSize: "12px", fontWeight: "700", color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }, type: "text" }),
                ...["Features", "Pricing", "About", "Contact"].map(l => makeEl({ name: l, content: { innerText: l, href: "#" }, styles: { fontSize: "14px", color: "rgba(255,255,255,0.45)" }, type: "link" })),
              ]
            })),
          ]
        }),
        makeEl({ name: "Divider", content: {}, styles: { width: "100%", marginBottom: "24px", borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "rgba(255,255,255,0.06)" }, type: "divider" }),
        makeEl({ name: "Copyright", content: { innerText: `© ${new Date().getFullYear()} YourBrand. All rights reserved.` }, styles: { fontSize: "13px", color: "rgba(255,255,255,0.25)", textAlign: "center" }, type: "text" }),
      ]
    }),
  };
  return map[componentType] || null;
};

const Container = ({ element }) => {
  const { id, name, type, styles, content, meta } = element;
  const { dispatch, state } = useEditor();
  const containerRef = useRef(null);
  const isImported = !!meta?.imported;
  const isSmallDevice = state.editor.device === "Mobile";
  const isTablet = state.editor.device === "Tablet";

  useEffect(() => {
    if (isImported && meta?.originalStyleText && containerRef.current) {
      containerRef.current.style.cssText += `;${meta.originalStyleText}`;
    }
  }, [isImported, meta?.originalStyleText]);

  const handleOnDrop = (e) => {
    e.stopPropagation();

    // Ignore drops from existing canvas elements
    const elementId = e.dataTransfer.getData("elementId");
    if (elementId) return;

    // Only handle sidebar drops
    const componentType = e.dataTransfer.getData("componentType");
    if (!componentType) return;
    const el = buildDropElement(componentType);
    if (el) dispatch({ type: "ADD_ELEMENT", payload: { containerId: id, elementDetails: el } });
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleDragStart = (e) => {
    if (type === "__body") return;
    e.dataTransfer.setData("componentType", "container");
    e.dataTransfer.setData("elementId", id);
  };
  const handleOnClickBody = (e) => {
    e.stopPropagation();
    dispatch({ type: "CHANGE_CLICKED_ELEMENT", payload: { elementDetails: element } });
  };

  const isSelected = state.editor.selectedElement.id === id;
  const isBody = type === "__body";
  const isLive = state.editor.liveMode || state.editor.previewMode;

  const borderStyle = isSelected && !isLive && !isBody
    ? "2px solid #3b82f6"
    : !isLive && !isSelected
      ? "1px dashed rgba(255,255,255,0.08)"
      : "none";

  const outlineBorder = isSelected && !isLive && isBody ? "4px solid #f59e0b" : undefined;

  return (
    <div
      ref={containerRef}
      style={{
        ...styles,
        position: "relative",
        border: borderStyle,
        outline: outlineBorder,
        transition: "border 0.15s, outline 0.15s",
        padding: !isBody ? (styles.padding || "16px") : undefined,
        ...(type === "__body" ? { minHeight: "100vh" } : {}),
        ...(["2Col", "3Col", "4Col"].includes(type) ? {
          display: styles.display || "flex",
          flexDirection: isSmallDevice ? "column" : (isTablet && type === "4Col" ? "column" : (styles.flexDirection || "row")),
          gap: styles.gap || "16px",
        } : {}),
        ...(isSmallDevice && styles.justifyContent === "space-between" ? {
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "16px",
        } : {}),
      }}
      onDrop={handleOnDrop}
      onDragOver={handleDragOver}
      draggable={!isBody}
      onClick={handleOnClickBody}
      onDragStart={handleDragStart}
    >
      {/* Floating toolbar */}
      {isSelected && !isLive && !isBody && <ElementToolbar element={element} />}

      {/* Name badge */}
      {isSelected && !isLive && !isBody && (
        <div style={{ position: "absolute", top: -23, left: -1, background: "#3b82f6", color: "#fff", fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: "6px 6px 0 0", zIndex: 10, whiteSpace: "nowrap" }}>
          {name}
        </div>
      )}

      {/* Empty drop hint */}
      {!isLive && Array.isArray(content) && content.length === 0 && (
        <div style={{ width: "100%", minHeight: 64, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "rgba(255,255,255,0.2)", border: "2px dashed rgba(255,255,255,0.06)", borderRadius: 8, pointerEvents: "none", userSelect: "none" }}>
          Drop elements here
        </div>
      )}

      {Array.isArray(content) && content.map((child) => <Recursive key={child.id} element={child} />)}

      {/* Resize handles */}
      {isSelected && !isLive && !isBody && <ResizeHandles element={element} containerRef={containerRef} />}
    </div>
  );
};

export default Container;
