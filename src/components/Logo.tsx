import ShipIcon from "@/components/icons/Ship";

export default function Logo({ showText = true }: { showText?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <ShipIcon className="w-6 h-6 text-sky-600 np-logo-ship" />
      {showText && <span className="font-semibold text-neutral-900">NeedPort</span>}
    </span>
  );
}
