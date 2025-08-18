// @needport: do-not-edit-outside-design-task
import FlowStrip from "@/components/FlowStrip";

/* small inline icons (SVG) */
const I = {
  pen:    <svg viewBox="0 0 24 24" className="w-4 h-4 text-sky-700"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41L18.37 3.3a1 1 0 0 0-1.41 0l-1.34 1.34l3.75 3.75l1.34-1.35z"/></svg>,
  thumb:  <svg viewBox="0 0 24 24" className="w-4 h-4 text-sky-700"><path fill="currentColor" d="M2 21h4V9H2v12zm19-11h-6.31l.95-4.57l.03-.32a1 1 0 0 0-.29-.7L14.17 3L7.59 9.59A2 2 0 0 0 7 11v8a2 2 0 0 0 2 2h7a2 2 0 0 0 1.98-1.75l1-7A2 2 0 0 0 21 10z"/></svg>,
  shield: <svg viewBox="0 0 24 24" className="w-4 h-4 text-sky-700"><path fill="currentColor" d="M12 2l7 4v6c0 5-3.4 9.74-7 10c-3.6-.26-7-5-7-10V6l7-4z"/></svg>,
  chat:   <svg viewBox="0 0 24 24" className="w-4 h-4 text-sky-700"><path fill="currentColor" d="M20 2H4a2 2 0 0 0-2 2v14l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/></svg>,
  card:   <svg viewBox="0 0 24 24" className="w-4 h-4 text-sky-700"><path fill="currentColor" d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 6H4V8h16v2z"/></svg>,
};

const pills = [
  { icon: I.pen,   t: "困りごと投稿", d: "個人情報は書かない" },
  { icon: I.thumb, t: "賛同・提案",   d: "業者から見積もり" },
  { icon: I.shield,t: "承認",         d: "運営と安全に進行" },
  { icon: I.chat,  t: "ルーム",       d: "関係者だけでやり取り" },
  { icon: I.card,  t: "支払い",       d: "Stripeで安全に" },
];

export default function ServiceFlowCompact() {
  return (
    <div className="space-y-4">
      <FlowStrip active={0} steps={5} />
      <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
        <div className="flex gap-2 min-w-max px-1">
          {(pills ?? []).map((p, i) => (
            <div key={i} className="flex-shrink-0 bg-white rounded-full border border-sky-200 px-3 py-2">
              <div className="flex items-center gap-2 text-xs">
                {p.icon}
                <div>
                  <div className="font-medium text-sky-700">{p.t}</div>
                  <div className="text-neutral-500">{p.d}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
