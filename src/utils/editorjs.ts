interface OutputData {
  time: number;
  blocks: any[];
  version: string;
}

export interface EditorJSBlock {
  id?: string;
  type: string;
  data: any;
}

export const convertEditorJSToHTML = (editorData: OutputData): string => {
  if (!editorData.blocks || editorData.blocks.length === 0) {
    return "";
  }

  const htmlBlocks = editorData.blocks.map((block: EditorJSBlock) => {
    switch (block.type) {
      case "header":
        const level = block.data.level || 2;
        return `<h${level}>${block.data.text}</h${level}>`;

      case "paragraph":
        return `<p>${block.data.text}</p>`;

      case "list":
        console.log("List block data:", JSON.stringify(block.data, null, 2));

        let listItems = [];

        if (Array.isArray(block.data.items)) {
          listItems = block.data.items.map((item: any) => {
            // Handle if item is an object with content or text property
            if (typeof item === "object" && item !== null) {
              const content = item.content || item.text || item.value || item.data || "";
              return `<li>${content}</li>`;
            }
            // Handle if item is a string
            return `<li>${item}</li>`;
          });
        } else {
          console.warn("List items is not an array:", block.data.items);
        }

        const listTag = block.data.style === "ordered" ? "ol" : "ul";
        return `<${listTag}>${listItems.join("")}</${listTag}>`;

      case "image":
        const caption = block.data.caption ? `<figcaption>${block.data.caption}</figcaption>` : "";
        return `<figure><img src="${block.data.file.url}" alt="${block.data.caption || ""}" />${caption}</figure>`;

      case "quote":
        const author = block.data.caption ? `<cite>${block.data.caption}</cite>` : "";
        return `<blockquote>${block.data.text}${author}</blockquote>`;

      case "delimiter":
        return "<hr />";

      case "table":
        const rows = block.data.content
          .map((row: string[], index: number) => {
            const cells = row
              .map((cell) => {
                const tag = index === 0 && block.data.withHeadings ? "th" : "td";
                return `<${tag}>${cell}</${tag}>`;
              })
              .join("");
            return `<tr>${cells}</tr>`;
          })
          .join("");
        return `<table><tbody>${rows}</tbody></table>`;

      case "code":
        return `<pre><code>${block.data.code}</code></pre>`;

      case "linkTool":
        return `<a href="${block.data.link}" target="_blank" rel="noopener noreferrer">${block.data.meta.title || block.data.link}</a>`;

      default:
        // Handle unknown block types or return raw text
        if (block.data.text) {
          return `<p>${block.data.text}</p>`;
        }
        return "";
    }
  });

  return htmlBlocks.join("");
};

// ...existing code...

export const convertHTMLToEditorJS = (html: string): OutputData => {
  if (!html || html.trim() === "") {
    return {
      time: Date.now(),
      blocks: [],
      version: "2.28.2",
    };
  }

  // Create a temporary DOM element to parse HTML properly
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const body = doc.body;

  const blocks: EditorJSBlock[] = [];

  // Function to process each element and convert to EditorJS blocks
  const processElement = (element: Element, index: number): EditorJSBlock | null => {
    const tagName = element.tagName.toLowerCase();
    const textContent = element.textContent?.trim() || "";
    const innerHTML = element.innerHTML?.trim() || "";

    switch (tagName) {
      case "h1":
      case "h2":
      case "h3":
      case "h4":
      case "h5":
      case "h6":
        if (textContent) {
          return {
            id: `block_${index}`,
            type: "header",
            data: {
              text: textContent,
              level: parseInt(tagName.charAt(1)),
            },
          };
        }
        break;

      case "p":
        if (textContent) {
          return {
            id: `block_${index}`,
            type: "paragraph",
            data: {
              text: innerHTML, // Use innerHTML to preserve inline formatting like <strong>, <em>, etc.
            },
          };
        }
        break;

      case "ul":
      case "ol":
        const listItems = Array.from(element.querySelectorAll("li"))
          .map((li) => li.textContent?.trim() || "")
          .filter((item) => item.length > 0);

        if (listItems.length > 0) {
          return {
            id: `block_${index}`,
            type: "list",
            data: {
              style: tagName === "ol" ? "ordered" : "unordered",
              items: listItems,
            },
          };
        }
        break;

      case "blockquote":
        if (textContent) {
          const cite = element.querySelector("cite");
          return {
            id: `block_${index}`,
            type: "quote",
            data: {
              text: textContent.replace(cite?.textContent || "", "").trim(),
              caption: cite?.textContent?.trim() || "",
            },
          };
        }
        break;

      case "img":
        const src = element.getAttribute("src");
        const alt = element.getAttribute("alt") || "";
        if (src) {
          return {
            id: `block_${index}`,
            type: "image",
            data: {
              file: {
                url: src,
              },
              caption: alt,
              withBorder: false,
              withBackground: false,
              stretched: false,
            },
          };
        }
        break;

      case "figure":
        const img = element.querySelector("img");
        const figcaption = element.querySelector("figcaption");
        if (img) {
          const src = img.getAttribute("src");
          if (src) {
            return {
              id: `block_${index}`,
              type: "image",
              data: {
                file: {
                  url: src,
                },
                caption: figcaption?.textContent?.trim() || img.getAttribute("alt") || "",
                withBorder: false,
                withBackground: false,
                stretched: false,
              },
            };
          }
        }
        break;

      case "pre":
        const code = element.querySelector("code");
        const codeText = code ? code.textContent : textContent;
        if (codeText) {
          return {
            id: `block_${index}`,
            type: "code",
            data: {
              code: codeText,
            },
          };
        }
        break;

      case "hr":
        return {
          id: `block_${index}`,
          type: "delimiter",
          data: {},
        };

      case "table":
        const rows = Array.from(element.querySelectorAll("tr"));
        const content = rows.map((row) => Array.from(row.querySelectorAll("td, th")).map((cell) => cell.textContent?.trim() || ""));

        if (content.length > 0) {
          return {
            id: `block_${index}`,
            type: "table",
            data: {
              withHeadings: element.querySelector("th") !== null,
              content: content,
            },
          };
        }
        break;

      default:
        // For other elements with text content, create a paragraph
        if (textContent && !["script", "style", "meta", "title"].includes(tagName)) {
          return {
            id: `block_${index}`,
            type: "paragraph",
            data: {
              text: innerHTML || textContent,
            },
          };
        }
    }

    return null;
  };

  // Process all direct children of the body
  let blockIndex = 0;
  Array.from(body.children).forEach((element) => {
    const block = processElement(element, blockIndex);
    if (block) {
      blocks.push(block);
      blockIndex++;
    }
  });

  // If no blocks were created, try to process the entire content as paragraphs
  if (blocks.length === 0) {
    // Split by line breaks and create paragraph blocks
    const lines = html
      .split(/\n|<br\s*\/?>/i)
      .map((line) => line.replace(/<[^>]*>/g, "").trim())
      .filter((line) => line.length > 0);

    lines.forEach((line, index) => {
      blocks.push({
        id: `block_${index}`,
        type: "paragraph",
        data: {
          text: line,
        },
      });
    });
  }

  // If still no blocks, create a single paragraph with the stripped text
  if (blocks.length === 0 && html.trim()) {
    const plainText = html.replace(/<[^>]*>/g, "").trim();
    if (plainText) {
      blocks.push({
        id: "block_0",
        type: "paragraph",
        data: {
          text: plainText,
        },
      });
    }
  }

  return {
    time: Date.now(),
    blocks,
    version: "2.28.2",
  };
};
