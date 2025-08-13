import { readFileSync } from 'fs';
import { join } from 'path';
import { remark } from 'remark';
import html from 'remark-html';

interface MarkdownViewProps {
  content: string;
  className?: string;
}

export default async function MarkdownView({ content, className = '' }: MarkdownViewProps) {
  const processedContent = await remark()
    .use(html)
    .process(content);

  return (
    <div 
      className={`prose prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: processedContent.toString() }}
    />
  );
}

export function getMarkdownContent(filename: string): string {
  try {
    const filePath = join(process.cwd(), 'content', 'legal', filename);
    return readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error(`Error reading markdown file: ${filename}`, error);
    return '# ページが見つかりません\n\n申し訳ございませんが、要求されたページは存在しません。';
  }
}
