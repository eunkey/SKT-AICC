'use client';

import { useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, X, ExternalLink } from 'lucide-react';
import { useUIStore } from '@/stores';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
      return <p>{result}</p>;
    },
    a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
      const { href, children } = props;
      if (href && href.endsWith('.md')) {
        return (
          <a
            href="#"
            className="text-primary hover:underline cursor-pointer"
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
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          {children}
          <ExternalLink className="inline w-3 h-3 ml-1" />
        </a>
      );
    },
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
          <div className="p-4 prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {selectedDocument.content}
            </ReactMarkdown>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
