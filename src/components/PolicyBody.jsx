import React from 'react';

function escapeText(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function inlineHtml(value) {
  const escaped = escapeText(value);
  return escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

function parseBlocks(text) {
  const lines = String(text || '').replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let paragraph = [];
  let list = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push({ type: 'p', text: paragraph.join(' ') });
    paragraph = [];
  };

  const flushList = () => {
    if (!list.length) return;
    blocks.push({ type: 'ul', items: list });
    list = [];
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      flushList();
      return;
    }
    if (trimmed.startsWith('### ')) {
      flushParagraph();
      flushList();
      blocks.push({ type: 'h3', text: trimmed.slice(4) });
      return;
    }
    if (trimmed.startsWith('## ')) {
      flushParagraph();
      flushList();
      blocks.push({ type: 'h2', text: trimmed.slice(3) });
      return;
    }
    if (trimmed.startsWith('# ')) {
      flushParagraph();
      flushList();
      blocks.push({ type: 'h2', text: trimmed.slice(2) });
      return;
    }
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      flushParagraph();
      list.push(trimmed.slice(2));
      return;
    }
    flushList();
    paragraph.push(trimmed);
  });

  flushParagraph();
  flushList();
  return blocks;
}

function PolicyBody({ text }) {
  const blocks = parseBlocks(text);
  return (
    <div style={{ lineHeight: '1.6' }}>
      {blocks.map((block, index) => {
        if (block.type === 'h2') {
          return (
            <h2
              key={index}
              style={{ marginTop: index === 0 ? 0 : '32px', marginBottom: '16px', fontSize: '20px', textTransform: 'uppercase' }}
              dangerouslySetInnerHTML={{ __html: inlineHtml(block.text) }}
            />
          );
        }
        if (block.type === 'h3') {
          return (
            <h3
              key={index}
              style={{ marginTop: '24px', marginBottom: '12px', fontSize: '16px' }}
              dangerouslySetInnerHTML={{ __html: inlineHtml(block.text) }}
            />
          );
        }
        if (block.type === 'ul') {
          return (
            <ul key={index} style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '16px' }}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex} style={{ marginBottom: '8px' }} dangerouslySetInnerHTML={{ __html: inlineHtml(item) }} />
              ))}
            </ul>
          );
        }
        return (
          <p
            key={index}
            style={{ marginBottom: '16px' }}
            dangerouslySetInnerHTML={{ __html: inlineHtml(block.text) }}
          />
        );
      })}
    </div>
  );
}

export default PolicyBody;
