import ShipIcon from "@/components/icons/Ship";
export default function Logo({ showText=true }){
  return (
    <span className="flex items-center gap-2">
      <ShipIcon />
      {showText && <span className="font-semibold text-neutral-900">NeedPort</span>}
    </span>
  );
}
