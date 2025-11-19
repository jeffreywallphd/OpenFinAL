// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

import React, { useEffect, useState, useRef } from "react";
import { Howl } from "howler";

const VOID_TAGS = new Set([
  "area","base","br","col","embed","hr","img","input",
  "link","meta","param","source","track","wbr"
]);

function Slide(props) {
  const [contents, setContents] = useState(null);
  const [state, setState] = useState({ disable: false });
  const soundRef = useRef(null);

  // Load the HTML file for this page
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const pageUrl = props?.page?.pageContentUrl;
      if (!pageUrl) return;
      let html = await window.file.read(
        `src/View/LearningModule/Slideshow/${pageUrl}`
      );

      // Sanitize the loaded HTML to remove style blocks and fixed sizing that can
      // prevent embedded content (PDFs/iframes/objects) from scaling to the viewer.
      const sanitizeHtml = (s) => {
        if (!s) return s;
        try {
          // remove any <style>...</style> blocks
          s = s.replace(/<style[\s\S]*?<\/style>/gi, "");
          // remove width/height/max-width/max-height attributes
          s = s.replace(/\s(?:width|height|max-width|max-height)\s*=\s*['"][^'"]*['"]/gi, "");
          // remove inline width/height/style declarations (e.g., style="width:300px; height:200px;")
          s = s.replace(/(?:width|height|max-width|max-height)\s*:\s*[^;"']+;?/gi, "");
          // remove any style tags left with empty declarations
          s = s.replace(/style=\s*["']\s*["']/gi, "");
        } catch (e) {
          // fallback: return original
        }
        return s;
      };

      html = sanitizeHtml(html);
      if (isMounted) setContents(html);
    })();
    return () => { isMounted = false; };
  }, [props?.page?.pageContentUrl]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => { if (soundRef.current) soundRef.current.unload(); };
  }, []);

  // Prepare slide-level voiceover (optional; SlideshowWindow also handles audio)
  useEffect(() => {
    if (props?.page?.voiceoverUrl) {
      soundRef.current = new Howl({
        src: [`Asset/LearningModulesVoiceovers/${props.page.voiceoverUrl}`],
        onend: () => setState({ disable: false }),
      });
    }
  }, [props?.page?.voiceoverUrl]);

  // ---- HTML -> React -------------------------------------------------------

  // Resolve a relative asset path (e.g., "page1.png") against the HTML file's folder
  const makeAssetPath = (p) => {
    if (!p) return p;
    // leave absolute/data/Asset or root-absolute
    if (/^(https?:|data:|Asset\/|\/)/i.test(p)) return p;
    // Map the module folder name to a public URL under /Asset/LearningModules/
    const htmlRel = props?.page?.pageContentUrl || "";
    const folder = htmlRel.includes("/") ? htmlRel.slice(0, htmlRel.lastIndexOf("/")) : "";
    const parts = folder.split("/");                  // e.g., ["BlockchainAdvanced"]
    const modName = parts[parts.length - 1] || folder;
    // Serve from /Asset/LearningModules/<module>/<file>
    return `/Asset/LearningModules/${modName}/${p}`;
  };

  // Convert inline CSS string to a React style object
  const inlineStyleToObject = (styleStr) => {
    const out = {};
    styleStr.split(";").forEach((decl) => {
      const [k, v] = decl.split(":");
      if (!k || !v) return;
      const prop = k.trim().toLowerCase();

      // Skip width/height declarations so fixed pixel sizing from the HTML doesn't constrain the viewer
      if (prop === "width" || prop === "height") return;

      const camel = prop.replace(/-([a-z])/g, (_, g) => g.toUpperCase());
      out[camel] = v.trim();
    });
    return out;
  };

  // Convert a DOM Node to a React Element (recursively)
  const convertNodeToComponent = (node) => {
    // Text node
    if (node.nodeType === Node.TEXT_NODE) {
      return <>{node.textContent}</>;
    }

    // Only process element nodes
    if (node.nodeType !== Node.ELEMENT_NODE) return null;

    const tagName = node.tagName ? node.tagName.toLowerCase() : null;
    if (!tagName) return null;

    // Attributes -> React props
    const propsObj = {};
    if (node.attributes && node.attributes.length) {
      for (const attr of node.attributes) {
        const name = attr.name.toLowerCase();
        const value = attr.value;

        // Skip fixed width/height attributes so embedded content can be made responsive
        if (name === "width" || name === "height") continue;

        if (name === "class") propsObj.className = value;
        else if (name === "for") propsObj.htmlFor = value;
        else if (name === "style") propsObj.style = inlineStyleToObject(value);
        else propsObj[name] = value;
      }
    }

    // Rewrite relative assets
    if (tagName === "img" && propsObj.src) propsObj.src = makeAssetPath(propsObj.src);
    
    // Ensure inline styles don't force fixed sizes
    if (propsObj.style) {
      // remove any width/height that might still exist
      try {
        delete propsObj.style.width;
        delete propsObj.style.height;
        delete propsObj.style.maxWidth;
        delete propsObj.style.maxHeight;
      } catch (e) {
        // ignore
      }
    }

    // Force responsive sizing for embedded/media elements
    if (["img", "iframe", "embed", "object"].includes(tagName)) {
      propsObj.style = Object.assign({}, propsObj.style || {}, {
        width: "100%",
        height: "100%",
        maxWidth: "100%",
        maxHeight: "100%",
      });
    }
    // (Optional future support)
    // if (tagName === "link" && propsObj.href) propsObj.href = makeAssetPath(propsObj.href);
    // if (tagName === "script" && propsObj.src) propsObj.src = makeAssetPath(propsObj.src);

    // Void elements must not have children
    if (VOID_TAGS.has(tagName)) {
      return React.createElement(tagName, propsObj);
    }

    // Recurse for non-void tags
    const children = [];
    for (const child of node.childNodes) {
      const converted = convertNodeToComponent(child);
      if (converted != null) {
        children.push(
          React.isValidElement(converted)
            ? React.cloneElement(converted, { key: child.id || `k-${children.length}` })
            : converted
        );
      }
    }

    return React.createElement(tagName, propsObj, children);
  };

  // Parse the loaded HTML string and convert all <body> children
  const parseHtmlToComponents = (htmlString) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    const bodyNodes = Array.from(doc.body?.childNodes || []);
    if (bodyNodes.length === 0) return null;

    return bodyNodes
      .map((n, i) => {
        const el = convertNodeToComponent(n);
        return el == null ? null : React.cloneElement(el, { key: `root-${i}` });
      })
      .filter(Boolean);
  };

  // -------------------------------------------------------------------------

  return (
    <div className="slide">
      {props.page.pageType === "ContentPage" ? (
        <h2>{props.page.title}</h2>
      ) : (
        <div className="titleContainer">
          <h1>
            {props.page.title}
            {props.page.subTitle != null ? <span>:</span> : null}
          </h1>
          {props.page.subTitle != null ? (
            <h2 className="slideSubTitle">{props.page.subTitle}</h2>
          ) : null}
        </div>
      )}

      {contents != null ? (
        <div className="contentContainer">{parseHtmlToComponents(contents)}</div>
      ) : null}
    </div>
  );
}

export { Slide };