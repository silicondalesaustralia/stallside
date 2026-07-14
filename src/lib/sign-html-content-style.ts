/** Shared rules so TinyMCE and print preview render spacing the same way. */
export const SIGN_HTML_CONTENT_STYLE = `
  body, .safe-sign-html {
    font-family: var(--font-body, system-ui, sans-serif);
    font-size: 15px;
    line-height: 1.45;
    color: #182c1b;
    white-space: pre-wrap;
  }
  .safe-sign-html p,
  body p { margin: 0 0 0.55em; min-height: 1.15em; }
  .safe-sign-html p:last-child,
  body p:last-child { margin-bottom: 0; }
  .safe-sign-html h2,
  body h2 { margin: 0.4em 0; font-size: 1.5em; font-weight: 700; }
  .safe-sign-html h3,
  body h3 { margin: 0.35em 0; font-size: 1.2em; font-weight: 600; }
  .safe-sign-html ul,
  .safe-sign-html ol,
  body ul,
  body ol { margin: 0.35em 0; padding-left: 1.4em; white-space: normal; }
  .safe-sign-html ul { list-style: disc; }
  .safe-sign-html ol { list-style: decimal; }
  .safe-sign-html li,
  body li { margin: 0.2em 0; }
  .safe-sign-html li > p,
  body li > p { margin: 0; }
  .safe-sign-html a,
  body a { color: #2e7d3f; text-decoration: underline; }
`.trim();

