'use client';

import { useState, useCallback } from 'react';
import { Search, X, FileText, ChevronRight, Loader2, FolderOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SearchResult {
  filePath: string;
  title: string;
  category: string;
  matchedContent: string;
  matchCount: number;
}

interface SearchResponse {
  keyword: string;
  totalResults: number;
  results: SearchResult[];
}

interface DocumentContent {
  filePath: string;
  title: string;
  content: string;
}

const CATEGORIES = [
  { value: 'all', label: '전체' },
  { value: 'info', label: '정보' },
  { value: 'policy', label: '정책' },
  { value: 'info/devices', label: '단말기 정보' },
  { value: 'info/stores', label: '매장 정보' },
  { value: 'info/network', label: '네트워크 정보' },
  { value: 'policy/plans', label: '요금제 정책' },
  { value: 'policy/roaming', label: '로밍 정책' },
  { value: 'policy/membership', label: '멤버십 정책' },
  { value: 'policy/support', label: '고객지원 정책' },
  { value: 'policy/promotions', label: '프로모션' },
];

export function DocumentSearchPanel() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentContent | null>(null);
  const [isDocumentLoading, setIsDocumentLoading] = useState(false);

  const handleSearch = useCallback(async () => {
    if (query.trim().length < 2) return;

    setIsLoading(true);
    setHasSearched(true);

    try {
      const params = new URLSearchParams({ q: query });
      if (category !== 'all') {
        params.append('category', category);
      }

      const response = await fetch(`/api/search?${params}`);
      const data: SearchResponse = await response.json();

      if (response.ok) {
        setResults(data.results);
      } else {
        console.error('Search error:', data);
        setResults([]);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [query, category]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
  };

  const handleOpenDocument = async (filePath: string) => {
    setIsDocumentLoading(true);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath }),
      });

      const data: DocumentContent = await response.json();

      if (response.ok) {
        setSelectedDocument(data);
      }
    } catch (error) {
      console.error('Failed to load document:', error);
    } finally {
      setIsDocumentLoading(false);
    }
  };

  const highlightKeyword = (text: string, keyword: string) => {
    if (!keyword) return text;

    const regex = new RegExp(`(${keyword})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="h-full flex flex-col bg-background border rounded-lg">
      {/* 검색 헤더 */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-semibold">문서 검색</h3>
        </div>

        {/* 검색 입력 */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="검색어 입력 (예: 요금제, 로밍, 분실)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pr-8"
            />
            {query && (
              <button
                onClick={handleClear}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button onClick={handleSearch} disabled={query.length < 2 || isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '검색'}
          </Button>
        </div>

        {/* 카테고리 필터 */}
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="카테고리 선택" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 검색 결과 */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : hasSearched ? (
            results.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  "{query}" 검색 결과: {results.length}건
                </p>
                {results.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => handleOpenDocument(result.filePath)}
                    className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-[#E4002B] flex-shrink-0" />
                        <span className="font-medium truncate">{result.title}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {result.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {result.matchCount}회 일치
                      </span>
                    </div>
                    {result.matchedContent && (
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {highlightKeyword(result.matchedContent, query)}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-muted-foreground">검색 결과가 없습니다</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  다른 검색어나 카테고리를 시도해보세요
                </p>
              </div>
            )
          ) : (
            <div className="text-center py-8">
              <Search className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-muted-foreground">검색어를 입력하세요</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                요금제, 로밍, 분실, 보험 등의 키워드로 검색
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* 문서 상세 모달 */}
      <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#E4002B]" />
              {selectedDocument?.title}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 mt-4">
            {isDocumentLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap text-sm font-sans bg-muted p-4 rounded-lg overflow-auto">
                  {selectedDocument?.content}
                </pre>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
