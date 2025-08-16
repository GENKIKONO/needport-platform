export type LintIssue = { 
  id: string; 
  severity: 'error' | 'warn'; 
  message: string; 
  match?: string 
};

const PATTERNS = [
  { 
    id: 'contact-email', 
    re: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i, 
    msg: 'メールアドレスの直書きは避けてください（採用後に連絡先が開示されます）' 
  },
  { 
    id: 'contact-phone', 
    re: /\+?\d{1,3}[\s\-]?\(?\d{2,4}\)?[\s\-]?\d{2,4}[\s\-]?\d{3,4}/, 
    msg: '電話番号の直書きは避けてください' 
  },
  { 
    id: 'external-link', 
    re: /(https?:\/\/|www\.)/i, 
    msg: '外部リンクの誘導は控えてください（提案内で完結させてください）' 
  },
];

export function lintProposal(input: {
  vendorName: string;
  deliverables: string[];
  riskNotes?: string;
  terms?: string;
}): LintIssue[] {
  const text = [
    input.vendorName, 
    ...(input.deliverables || []), 
    input.riskNotes, 
    input.terms
  ].filter(Boolean).join('\n');
  
  const issues: LintIssue[] = [];
  
  for (const p of PATTERNS) {
    const m = text.match(p.re);
    if (m) {
      issues.push({ 
        id: p.id, 
        severity: p.id === 'external-link' ? 'warn' : 'error', 
        message: p.msg, 
        match: m[0] 
      });
    }
  }
  
  if (!input.deliverables?.length) {
    issues.push({ 
      id: 'no-deliverables', 
      severity: 'error', 
      message: '成果物を最低1つは入力してください' 
    });
  }
  
  return issues;
}
