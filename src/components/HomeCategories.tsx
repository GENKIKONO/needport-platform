import Link from "next/link";
import Icon from "./Icon";

const categories = [
  { name: "住まい", iconName: "house", href: "/needs?category=住まい" },
  { name: "モノづくり", iconName: "craft", href: "/needs?category=モノづくり" },
  { name: "飲食", iconName: "food", href: "/needs?category=飲食" },
  { name: "健康", iconName: "category", href: "/needs?category=健康" },
  { name: "ビジネス相談", iconName: "company", href: "/needs?category=ビジネス相談" },
  { name: "その他", iconName: "category", href: "/needs?category=その他" },
];

export default function HomeCategories() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 bg-white">
      {categories.map(category => (
        <Link 
          key={category.name} 
          href={category.href} 
          className="np-card p-4 text-center hover:shadow-lg transition-shadow"
        >
          <div className="mb-2 flex justify-center">
            <Icon name={category.iconName || 'category'} className="size-8 text-neutral-600" />
          </div>
          <div className="text-sm font-medium text-gray-900">{category.name}</div>
        </Link>
      ))}
    </div>
  );
}
