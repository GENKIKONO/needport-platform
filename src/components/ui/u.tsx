import clsx from "clsx";

export const u = {
  tabRoot: "inline-flex items-end gap-2 relative",
  tabList: "flex gap-8 px-2 pt-2 pb-0 border-b border-[var(--c-blue)]",
  tabItem: (active:boolean)=>clsx(
    "relative px-3 pb-2 -mb-[1px] text-sm font-medium select-none",
    active ? "text-[var(--c-blue-strong)]" : "text-[var(--c-text-muted)] hover:text-[var(--c-blue)]"
  ),
  /* 付箋（見た目） */
  tabFusen: (active:boolean)=>clsx(
    "absolute left-0 right-0 h-7 -bottom-[1px] rounded-t-[0px]",
    active
      ? "bg-[var(--c-blue-soft)] border-x border-t border-[var(--c-blue)]"
      : "bg-[var(--c-blue-bg)] border-x border-t border-[var(--c-blue-strong)]"
  ),
  /* 実タブ面（繋ぎ） */
  tabSurface: "bg-[var(--c-blue-soft)] border border-[var(--c-blue)] rounded-b-[var(--radius-md)] shadow-[var(--shadow-1)]",

  /* ボタン */
  btn: "inline-flex items-center justify-center gap-2 rounded-[10px] px-4 h-11 text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ring-offset-transparent",
  btnPrimary: "bg-[var(--c-blue)] text-white hover:bg-[var(--c-blue-strong)] focus-visible:ring-[var(--c-blue-strong)]",
  btnGhost: "text-[var(--c-blue)] hover:bg-[var(--c-blue-bg)]",
  btnDanger: "bg-[var(--c-danger)] text-white hover:opacity-90 focus-visible:ring-[var(--c-danger)]",

  /* バッジ */
  badge: "inline-flex items-center gap-1 rounded-full px-2.5 h-6 text-xs font-medium border",
  badgeActive: "bg-[#E8FAF0] text-[#166534] border-[#BBF7D0]",
  badgeClosed: "bg-[#FEF2F2] text-[#7F1D1D] border-[#FECACA]",
  badgeArchived: "bg-[#EFF6FF] text-[#1E3A8A] border-[#BFDBFE]",

  /* カード */
  card: "bg-[var(--c-card)] border border-[var(--c-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-1)]",
  cardPad: "p-5 sm:p-6",
  cardHover: "transition-[transform,box-shadow] hover:-translate-y-[1px] hover:shadow-[var(--shadow-2)]",

  /* フォーカスリング統一 */
  focus: "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--c-blue-strong)] focus-visible:ring-offset-2",

  /* スケルトン */
  skeleton: "animate-pulse bg-slate-200/60 dark:bg-slate-700/50 rounded",
};

export default u;
