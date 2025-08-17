import Link from "next/link";

const categories = [
  { name: "住まい", icon: "🏠", href: "/needs?category=住まい" },
  { name: "モノづくり", icon: "⚙️", href: "/needs?category=モノづくり" },
  { name: "飲食", icon: "🍽️", href: "/needs?category=飲食" },
  { name: "健康", icon: "💊", href: "/needs?category=健康" },
  { name: "ビジネス相談", icon: "💼", href: "/needs?category=ビジネス相談" },
  { name: "その他", icon: "📦", href: "/needs?category=その他" },
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
          <div className="text-2xl mb-2">{category.icon}</div>
          <div className="text-sm font-medium text-gray-900">{category.name}</div>
        </Link>
      ))}
    </div>
  );
}
