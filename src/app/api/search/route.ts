import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface SearchResult {
  filePath: string;
  title: string;
  category: string;
  matchedContent: string;
  matchCount: number;
}

// texts 폴더 내 모든 markdown 파일 찾기
function findMarkdownFiles(dir: string, files: string[] = []): string[] {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      findMarkdownFiles(fullPath, files);
    } else if (item.endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files;
}

// 파일에서 제목 추출
function extractTitle(content: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1] : '제목 없음';
}

// 카테고리 추출 (폴더 경로에서)
function extractCategory(filePath: string, basePath: string): string {
  const relativePath = path.relative(basePath, filePath);
  const parts = relativePath.split(path.sep);

  if (parts.length >= 2) {
    const categoryMap: Record<string, string> = {
      'info': '정보',
      'policy': '정책',
      'devices': '단말기',
      'stores': '매장',
      'network': '네트워크',
      'services': '서비스',
      'plans': '요금제',
      'roaming': '로밍',
      'membership': '멤버십',
      'broadband': '인터넷/TV',
      'support': '고객지원',
      'vas': '부가서비스',
      'promotions': '프로모션',
      'scenarios': '시나리오',
    };

    return parts
      .slice(0, -1)
      .map(p => categoryMap[p] || p)
      .join(' > ');
  }

  return '기타';
}

// 검색어 주변 텍스트 추출 (컨텍스트 포함)
function extractMatchedContent(content: string, keyword: string, maxLength: number = 200): string {
  const lowerContent = content.toLowerCase();
  const lowerKeyword = keyword.toLowerCase();
  const index = lowerContent.indexOf(lowerKeyword);

  if (index === -1) return '';

  const start = Math.max(0, index - 50);
  const end = Math.min(content.length, index + keyword.length + 150);

  let excerpt = content.slice(start, end);

  // 앞뒤로 자른 표시
  if (start > 0) excerpt = '...' + excerpt;
  if (end < content.length) excerpt = excerpt + '...';

  // 마크다운 문법 일부 제거
  excerpt = excerpt.replace(/[#*`|]/g, '').replace(/\n+/g, ' ').trim();

  return excerpt;
}

// 검색어 매칭 횟수 계산
function countMatches(content: string, keyword: string): number {
  const lowerContent = content.toLowerCase();
  const lowerKeyword = keyword.toLowerCase();
  let count = 0;
  let pos = 0;

  while ((pos = lowerContent.indexOf(lowerKeyword, pos)) !== -1) {
    count++;
    pos += lowerKeyword.length;
  }

  return count;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const keyword = searchParams.get('q');
  const category = searchParams.get('category');

  if (!keyword || keyword.trim().length < 2) {
    return NextResponse.json(
      { error: '검색어는 2자 이상 입력해주세요.' },
      { status: 400 }
    );
  }

  try {
    const textsPath = path.join(process.cwd(), 'texts');

    if (!fs.existsSync(textsPath)) {
      return NextResponse.json(
        { error: 'texts 폴더를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const markdownFiles = findMarkdownFiles(textsPath);
    const results: SearchResult[] = [];

    for (const filePath of markdownFiles) {
      // 카테고리 필터링
      if (category && category !== 'all') {
        const relativePath = path.relative(textsPath, filePath);
        if (!relativePath.startsWith(category)) {
          continue;
        }
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      const lowerContent = content.toLowerCase();
      const lowerKeyword = keyword.toLowerCase();

      if (lowerContent.includes(lowerKeyword)) {
        const relativePath = path.relative(textsPath, filePath);

        results.push({
          filePath: relativePath,
          title: extractTitle(content),
          category: extractCategory(filePath, textsPath),
          matchedContent: extractMatchedContent(content, keyword),
          matchCount: countMatches(content, keyword),
        });
      }
    }

    // 매칭 횟수 기준 정렬
    results.sort((a, b) => b.matchCount - a.matchCount);

    return NextResponse.json({
      keyword,
      totalResults: results.length,
      results: results.slice(0, 20), // 최대 20개 결과
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: '검색 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 문서 내용 가져오기
export async function POST(request: NextRequest) {
  try {
    const { filePath } = await request.json();

    if (!filePath) {
      return NextResponse.json(
        { error: '파일 경로가 필요합니다.' },
        { status: 400 }
      );
    }

    const textsPath = path.join(process.cwd(), 'texts');
    const fullPath = path.join(textsPath, filePath);

    // 경로 순회 공격 방지
    if (!fullPath.startsWith(textsPath)) {
      return NextResponse.json(
        { error: '잘못된 파일 경로입니다.' },
        { status: 400 }
      );
    }

    if (!fs.existsSync(fullPath)) {
      return NextResponse.json(
        { error: '파일을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const content = fs.readFileSync(fullPath, 'utf-8');

    return NextResponse.json({
      filePath,
      title: extractTitle(content),
      content,
    });

  } catch (error) {
    console.error('Document fetch error:', error);
    return NextResponse.json(
      { error: '문서를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
