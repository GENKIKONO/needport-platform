export function createButton({ text, href, variant = 'primary' }: { text: string; href: string; variant?: 'primary' | 'secondary' }) {
  const className = variant === 'secondary' ? 'button secondary' : 'button';
  return `<a href="${href}" class="${className}">${text}</a>`;
}

export function createMutedText({ text }: { text: string }) {
  return `<p class="muted-text">${text}</p>`;
}

export function createInfoBox({ title, content }: { title: string; content: string }) {
  return `
    <div class="info-box">
      <h3 style="margin: 0 0 8px 0; color: #1e40af;">${title}</h3>
      <div>${content}</div>
    </div>
  `;
}

export function createWarningBox({ title, content }: { title: string; content: string }) {
  return `
    <div class="warning-box">
      <h3 style="margin: 0 0 8px 0; color: #d97706;">${title}</h3>
      <div>${content}</div>
    </div>
  `;
}

export function createSuccessBox({ title, content }: { title: string; content: string }) {
  return `
    <div class="success-box">
      <h3 style="margin: 0 0 8px 0; color: #059669;">${title}</h3>
      <div>${content}</div>
    </div>
  `;
}

export function createErrorBox({ title, content }: { title: string; content: string }) {
  return `
    <div class="error-box">
      <h3 style="margin: 0 0 8px 0; color: #dc2626;">${title}</h3>
      <div>${content}</div>
    </div>
  `;
}

export function createDivider() {
  return '<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">';
}

export function createSpacer({ height = '16px' }: { height?: string } = {}) {
  return `<div style="height: ${height};"></div>`;
}

export function formatJPY(amount: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
