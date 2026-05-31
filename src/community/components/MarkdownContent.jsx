function renderInline(text) {
  // Bold
  let result = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Italic
  result = result.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // Code
  result = result.replace(/`(.+?)`/g, '<code style="background:rgba(59,250,210,0.1);color:#3bfad2;padding:1px 5px;border-radius:4px;font-size:0.9em">$1</code>');
  return result;
}

export default function MarkdownContent({ content }) {
  const lines = String(content || '').split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) { elements.push(<span key={`sp-${i}`} style={{ display: 'block', height: 8 }} />); i++; continue; }

    if (trimmed.startsWith('### ')) {
      elements.push(<h3 key={i} className="markdown-h3" dangerouslySetInnerHTML={{ __html: renderInline(trimmed.slice(4)) }} />);
      i++; continue;
    }

    if (trimmed.startsWith('## ')) {
      elements.push(<h2 key={i} className="markdown-h2" dangerouslySetInnerHTML={{ __html: renderInline(trimmed.slice(3)) }} />);
      i++; continue;
    }

    if (trimmed.startsWith('# ')) {
      elements.push(<h2 key={i} className="markdown-h2" style={{ fontSize: 'clamp(22px,3vw,30px)' }} dangerouslySetInnerHTML={{ __html: renderInline(trimmed.slice(2)) }} />);
      i++; continue;
    }

    if (trimmed.startsWith('> ')) {
      elements.push(<blockquote key={i} className="markdown-blockquote" dangerouslySetInnerHTML={{ __html: renderInline(trimmed.slice(2)) }} />);
      i++; continue;
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const items = [];
      while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
        items.push(lines[i].trim().slice(2));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="markdown-ul">
          {items.map((item, j) => (
            <li key={j} dangerouslySetInnerHTML={{ __html: renderInline(item) }} />
          ))}
        </ul>
      );
      continue;
    }

    elements.push(<p key={i} className="markdown-p" dangerouslySetInnerHTML={{ __html: renderInline(trimmed) }} />);
    i++;
  }

  return <div className="markdown-content">{elements}</div>;
}
