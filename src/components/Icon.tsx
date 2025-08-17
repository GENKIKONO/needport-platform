import {
  RiHome2Line,
  RiListCheck2,
  RiBriefcase3Line,
  RiMapPinLine,
  RiSearchLine,
  RiHeart3Line,
  RiChat3Line,
  RiUser3Line,
  RiSettings3Line,
  RiInformationLine,
  RiShieldCheckLine,
  RiFileList2Line,
  RiBuildingLine,
  RiFolder3Line,
  RiHomeSmile2Line,
  RiRestaurant2Line,
  RiHammerLine,
  RiCupLine,
  RiArmchairLine,
  RiTShirt2Line,
} from "@remixicon/react";

const map = {
  home:        RiHome2Line,
  needs:       RiListCheck2,
  services:    RiBriefcase3Line,
  map:         RiMapPinLine,
  search:      RiSearchLine,
  heart:       RiHeart3Line,
  chat:        RiChat3Line,
  user:        RiUser3Line,
  settings:    RiSettings3Line,
  info:        RiInformationLine,
  shield:      RiShieldCheckLine,
  terms:       RiFileList2Line,
  company:     RiBuildingLine,
  category:    RiFolder3Line,
  // カテゴリー例（必要に応じて使う）
  house:       RiHomeSmile2Line,
  food:        RiRestaurant2Line,
  craft:       RiHammerLine,
  cafe:        RiCupLine,
  furniture:   RiArmchairLine,
  clothing:    RiTShirt2Line,
} as const;

export default function Icon({
  name,
  className = "size-5 text-neutral-600",
}: { name: keyof typeof map | string; className?: string }) {
  const Cmp = (map as any)[name] ?? RiFileList2Line;
  return <Cmp className={className} aria-hidden="true" />;
}
