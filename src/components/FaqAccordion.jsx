import React, { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';

function escapeText(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function inlineHtml(value) {
  return escapeText(value)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+|\/[^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

function formatAnswerHtml(lines) {
  const html = [];
  let listItems = [];
  const flushList = () => {
    if (!listItems.length) return;
    html.push(`<ul>${listItems.map((item) => `<li>${inlineHtml(item)}</li>`).join('')}</ul>`);
    listItems = [];
  };
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      return;
    }
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      listItems.push(trimmed.slice(2));
      return;
    }
    flushList();
    html.push(`<p>${inlineHtml(trimmed)}</p>`);
  });
  flushList();
  return html.join('');
}

export function parseFaqSections(text) {
  const lines = String(text || '').replace(/\r\n/g, '\n').split('\n');
  const sections = [];
  let currentSection = null;
  let currentItem = null;

  const pushItem = () => {
    if (!currentSection || !currentItem) return;
    currentSection.items.push({
      question: currentItem.question,
      answerHtml: formatAnswerHtml(currentItem.answerLines)
    });
    currentItem = null;
  };

  const pushSection = () => {
    pushItem();
    if (currentSection) sections.push(currentSection);
    currentSection = null;
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('## ')) {
      pushSection();
      currentSection = { title: trimmed.slice(3).trim(), items: [] };
      return;
    }
    if (trimmed.startsWith('### ')) {
      pushItem();
      if (!currentSection) currentSection = { title: 'FAQ', items: [] };
      currentItem = { question: trimmed.slice(4).trim(), answerLines: [] };
      return;
    }
    if (currentItem) currentItem.answerLines.push(line);
  });

  pushSection();
  return sections.filter((section) => section.items.length > 0);
}

function FaqAccordion({ text }) {
  const sections = useMemo(() => parseFaqSections(text), [text]);
  const [openKey, setOpenKey] = useState(null);

  if (!sections.length) {
    return <p style={{ color: '#666' }}>FAQ content will be available soon.</p>;
  }

  return (
    <div className="faq-accordion">
      {sections.map((section) => (
        <section key={section.title} className="faq-section">
          <h2 className="faq-section-title">{section.title}</h2>
          <div className="faq-items">
            {section.items.map((item, index) => {
              const key = `${section.title}-${index}`;
              const open = openKey === key;
              return (
                <div key={key} className={`faq-item ${open ? 'is-open' : ''}`}>
                  <button
                    type="button"
                    className="faq-question"
                    aria-expanded={open}
                    onClick={() => setOpenKey(open ? null : key)}
                  >
                    <span>{item.question}</span>
                    <ChevronDown size={18} className="faq-chevron" />
                  </button>
                  {open && (
                    <div
                      className="faq-answer"
                      dangerouslySetInnerHTML={{ __html: item.answerHtml }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

export default FaqAccordion;
