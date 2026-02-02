'use client';

import { useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  FileText,
  X,
  ExternalLink,
  Hash,
  ChevronRight,
  CheckCircle2,
  Circle,
  Quote,
  Minus
} from 'lucide-react';
import { useUIStore } from '@/stores';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

function resolveRelativePath(base: string, relative: string): string {
  const normalizedBase = base.replace(/\\/g, '/');
  const baseDir = normalizedBase.substring(0, normalizedBase.lastIndexOf('/'));
  const parts = baseDir.split('/');
  for (const segment of relative.split('/')) {
    if (segment === '..') {
      parts.pop();
    } else if (segment !== '.') {
      parts.push(segment);
    }
  }
  return parts.join('/');
}

export function DocumentViewer() {
  const { selectedDocument, setSelectedDocument } = useUIStore();
  const selectedDocumentRef = useRef(selectedDocument);
  selectedDocumentRef.current = selectedDocument;

  const handleOpenDocument = useCallback(async (filePath: string) => {
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath }),
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedDocument(data);
      }
    } catch (error) {
      console.error('Failed to load document:', error);
    }
  }, [setSelectedDocument]);

  const markdownComponents = {
    // 헤더 스타일링
    h1: ({ children }: { children?: React.ReactNode }) => (
      <h1 className="flex items-center gap-2 text-xl font-bold text-[#E4002B] border-b-2 border-[#E4002B]/30 pb-2 mb-4 mt-6 first:mt-0">
        <FileText className="w-5 h-5 flex-shrink-0" />
        {children}
      </h1>
    ),
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 className="flex items-center gap-2 text-lg font-semibold bg-muted/50 dark:bg-muted/30 border-l-4 border-[#E4002B] pl-3 py-2 pr-3 rounded-r-md mb-3 mt-5">
        <Hash className="w-4 h-4 text-[#E4002B] flex-shrink-0" />
        {children}
      </h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="flex items-center gap-1.5 text-base font-medium border-l-2 border-gray-300 dark:border-gray-600 pl-3 mb-2 mt-4">
        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        {children}
      </h3>
    ),
    h4: ({ children }: { children?: React.ReactNode }) => (
      <h4 className="text-sm font-medium text-muted-foreground mb-2 mt-3">
        {children}
      </h4>
    ),
    // 단락 스타일링
    p: ({ children }: { children?: React.ReactNode }) => {
      const childArray = Array.isArray(children) ? children : [children];
      const result: React.ReactNode[] = [];
      childArray.forEach((child, i) => {
        if (typeof child === 'string') {
          const parts = child.split(/(?=\nA[:：])/);
          parts.forEach((part, j) => {
            if (part.startsWith('\nA') || (j === 0 && part.match(/^A[:：]/))) {
              result.push(<br key={`br-${i}-${j}`} />);
            }
            result.push(part);
          });
        } else {
          result.push(child);
        }
      });
      return <p className="leading-relaxed mb-3">{result}</p>;
    },
    // 링크 스타일링
    a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
      const { href, children } = props;
      if (href && href.endsWith('.md')) {
        return (
          <a
            href="#"
            className="text-[#E4002B] hover:text-[#E4002B]/80 hover:underline cursor-pointer font-medium transition-colors"
            onClick={(e) => {
              e.preventDefault();
              const currentDoc = selectedDocumentRef.current;
              const resolvedPath = currentDoc
                ? resolveRelativePath(currentDoc.filePath, href)
                : href;
              handleOpenDocument(resolvedPath);
            }}
          >
            {children}
          </a>
        );
      }
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#E4002B] hover:text-[#E4002B]/80 hover:underline font-medium transition-colors inline-flex items-center gap-0.5"
        >
          {children}
          <ExternalLink className="inline w-3 h-3" />
        </a>
      );
    },
    // 테이블 스타일링
    table: ({ children }: { children?: React.ReactNode }) => (
      <div className="overflow-x-auto my-4 rounded-lg border border-border">
        <table className="w-full border-collapse text-sm">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }: { children?: React.ReactNode }) => (
      <thead className="bg-muted/70 dark:bg-muted/50">
        {children}
      </thead>
    ),
    th: ({ children }: { children?: React.ReactNode }) => (
      <th className="px-3 py-2 text-left font-semibold text-foreground border-b border-border">
        {children}
      </th>
    ),
    tbody: ({ children }: { children?: React.ReactNode }) => (
      <tbody className="divide-y divide-border">
        {children}
      </tbody>
    ),
    tr: ({ children }: { children?: React.ReactNode }) => (
      <tr className="even:bg-muted/30 hover:bg-muted/50 transition-colors">
        {children}
      </tr>
    ),
    td: ({ children }: { children?: React.ReactNode }) => (
      <td className="px-3 py-2 text-foreground">
        {children}
      </td>
    ),
    // 인용구 스타일링
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="relative border-l-4 border-[#E4002B] bg-muted/30 dark:bg-muted/20 pl-4 pr-4 py-3 my-4 rounded-r-md italic">
        <Quote className="absolute -left-0.5 -top-2 w-5 h-5 text-[#E4002B]/60 bg-background rounded-full p-0.5" />
        <div className="text-muted-foreground">{children}</div>
      </blockquote>
    ),
    // 리스트 스타일링
    ul: ({ children }: { children?: React.ReactNode }) => (
      <ul className="my-3 space-y-1.5 list-none pl-0">
        {children}
      </ul>
    ),
    ol: ({ children }: { children?: React.ReactNode }) => (
      <ol className="my-3 space-y-1.5 list-none pl-0 counter-reset-list">
        {children}
      </ol>
    ),
    li: ({ children, ordered, index }: { children?: React.ReactNode; ordered?: boolean; index?: number }) => {
      const childArray = Array.isArray(children) ? children : [children];
      const hasCheckbox = childArray.some(
        (child) =>
          child &&
          typeof child === 'object' &&
          'type' in child &&
          child.type === 'input'
      );

      if (hasCheckbox) {
        return <li className="flex items-start gap-2 pl-0">{children}</li>;
      }

      if (ordered) {
        return (
          <li className="flex items-start gap-2 pl-0">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#E4002B]/10 text-[#E4002B] text-xs font-medium flex items-center justify-center mt-0.5">
              {(index ?? 0) + 1}
            </span>
            <span className="flex-1">{children}</span>
          </li>
        );
      }

      return (
        <li className="flex items-start gap-2 pl-0">
          <CheckCircle2 className="w-4 h-4 text-[#E4002B]/70 flex-shrink-0 mt-0.5" />
          <span className="flex-1">{children}</span>
        </li>
      );
    },
    // 체크박스 스타일링
    input: ({ type, checked, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => {
      if (type === 'checkbox') {
        return checked ? (
          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
        ) : (
          <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
        );
      }
      return <input type={type} checked={checked} {...props} />;
    },
    // 코드 스타일링
    code: ({ className, children }: { className?: string; children?: React.ReactNode }) => {
      const isCodeBlock = className?.includes('language-');
      if (isCodeBlock) {
        return (
          <code className={cn('block', className)}>
            {children}
          </code>
        );
      }
      return (
        <code className="px-1.5 py-0.5 bg-[#E4002B]/10 text-[#E4002B] dark:bg-[#E4002B]/20 dark:text-red-300 rounded text-sm font-mono">
          {children}
        </code>
      );
    },
    pre: ({ children }: { children?: React.ReactNode }) => (
      <pre className="my-4 p-4 bg-slate-900 dark:bg-slate-950 text-slate-100 rounded-lg overflow-x-auto text-sm">
        {children}
      </pre>
    ),
    // 수평선 스타일링
    hr: () => (
      <div className="my-6 flex items-center gap-2">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <Minus className="w-4 h-4 text-muted-foreground/50" />
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>
    ),
    // 강조 스타일링
    strong: ({ children }: { children?: React.ReactNode }) => (
      <strong className="font-semibold text-foreground">{children}</strong>
    ),
    em: ({ children }: { children?: React.ReactNode }) => (
      <em className="italic text-muted-foreground">{children}</em>
    ),
  };

  const handleClose = () => {
    setSelectedDocument(null);
  };

  if (!selectedDocument) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4" />
            문서 뷰어
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-sm">
              AI 분석 결과에서 문서를 선택하면
              <br />
              이곳에 내용이 표시됩니다.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2 min-w-0">
            <FileText className="w-4 h-4 flex-shrink-0 text-[#E4002B]" />
            <span className="truncate">{selectedDocument.title}</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0"
            onClick={handleClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 max-w-none text-foreground">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {selectedDocument.content}
            </ReactMarkdown>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
