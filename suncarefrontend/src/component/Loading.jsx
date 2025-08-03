import React, { useEffect } from "react";

const Loading = () => {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      :root {
        --l: 2.75em;
        --t: 1.5s;
      }

      html, body, div {
        display: grid;
      }

      html {
        height: 100%;
      }

      div {
        transform-style: preserve-3d;
      }

      .grid {
        grid-template-columns: repeat(var(--n), var(--l));
        gap: 0.5em;
        place-self: center;
        transform: rotateX(55deg) rotate(45deg);
      }

      .cube:nth-child(4n + 1) { --i: 0 }
      .cube:nth-child(4n + 2) { --i: 1 }
      .cube:nth-child(4n + 3) { --i: 2 }
      .cube:nth-child(4n + 4) { --i: 3 }

      .cube:nth-child(n + 1)  { --j: 0 }
      .cube:nth-child(n + 5)  { --j: 1 }
      .cube:nth-child(n + 9)  { --j: 2 }
      .cube:nth-child(n + 13) { --j: 3 }

      .cube {
        width: var(--l);
        aspect-ratio: 1;
        transform-origin: 50% 50% calc(-1 * var(--l));
        background: #fff;
        animation: ani var(--t) ease-in-out infinite;
        animation-delay: calc((var(--n) - 1 - var(--j) + var(--i)) * 0.05 * var(--t));
      }

      .cube::before,
      .cube::after {
        --i: 0;
        --j: calc(1 - var(--i));
        grid-area: 1 / 1;
        transform-origin: calc(var(--j)*50%) calc(var(--i)*50%);
        translate: calc(var(--i)*100%) calc(var(--j)*100%);
        rotate: var(--j) var(--i) 0 calc((2 * var(--i) - 1) * 90deg);
        background: hsl(0, 0%, calc(85% - var(--i)*30%));
        content: '';
      }

      .cube::after {
        --i: 1;
      }

      @keyframes ani {
        0%, 50%, 100% { scale: 1 1 0 }
        25% { scale: 1 1 0.5 }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="grid" style={{ "--n": 4 }}>
      {Array.from({ length: 16 }).map((_, i) => (
        <div key={i} className="cube"></div>
      ))}
    </div>
  );
};

export default Loading;