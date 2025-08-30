import { readCms } from "@/lib/cms/storage";

export default async function Footer() {
  const cms = await readCms();
  const footer = cms.footer;

  return (
    <footer className="mt-auto border-t bg-white">
      <div className="mx-auto max-w-6xl px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
          {footer.columns.map((column, i) => (
            <div key={i}>
              <h3 className="font-semibold text-gray-900 mb-2">{column.title}</h3>
              <ul className="space-y-1">
                {column.links.map((link, j) => (
                  <li key={j}>
                    <a 
                      href={link.href} 
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="text-xs text-gray-500 border-t pt-4">
          {footer.copyright}
        </div>
      </div>
    </footer>
  );
}
