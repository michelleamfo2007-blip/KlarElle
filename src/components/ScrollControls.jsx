import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';

function ScrollControls() {
  const location = useLocation();
  const [showTop, setShowTop] = useState(false);
  const [showBottom, setShowBottom] = useState(false);

  const hideOnAdmin = location.pathname.startsWith('/admin')
    || location.pathname.startsWith('/super-admin')
    || location.pathname.startsWith('/update-password');

  useEffect(() => {
    const update = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      const max = Math.max(
        0,
        (document.documentElement.scrollHeight || 0) - (window.innerHeight || 0)
      );
      setShowTop(y > 280);
      setShowBottom(max > 400 && y < max - 200);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [location.pathname]);

  if (hideOnAdmin) return null;

  return (
    <div className="scroll-controls" aria-label="Page scroll controls">
      {showTop && (
        <button
          type="button"
          className="scroll-control-btn"
          aria-label="Scroll to top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <ChevronUp size={20} />
        </button>
      )}
      {showBottom && (
        <button
          type="button"
          className="scroll-control-btn"
          aria-label="Scroll to bottom"
          onClick={() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })}
        >
          <ChevronDown size={20} />
        </button>
      )}
    </div>
  );
}

export default ScrollControls;
