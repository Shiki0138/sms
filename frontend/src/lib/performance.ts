/**
 * パフォーマンス最適化ユーティリティ
 */

// 画像の遅延読み込み
export const lazyLoadImages = () => {
  const images = document.querySelectorAll('img[data-src]');
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        img.src = img.dataset.src || '';
        img.classList.add('fade-in');
        observer.unobserve(img);
      }
    });
  });

  images.forEach(img => imageObserver.observe(img));
};

// デバウンス処理
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// スロットル処理
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// メモ化
export const memoize = <T extends (...args: any[]) => any>(
  fn: T
): T => {
  const cache = new Map();

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

// リクエストキャッシュ
export class RequestCache {
  private static cache = new Map<string, { data: any; timestamp: number }>();
  private static readonly TTL = 5 * 60 * 1000; // 5分

  static async get(url: string, fetcher: () => Promise<any>): Promise<any> {
    const cached = this.cache.get(url);
    
    if (cached && Date.now() - cached.timestamp < this.TTL) {
      return cached.data;
    }

    const data = await fetcher();
    this.cache.set(url, { data, timestamp: Date.now() });
    return data;
  }

  static clear(): void {
    this.cache.clear();
  }

  static remove(url: string): void {
    this.cache.delete(url);
  }
}

// 仮想スクロール用ヘルパー
export const calculateVisibleItems = (
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  totalItems: number,
  buffer: number = 5
): { start: number; end: number } => {
  const start = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const end = Math.min(totalItems, start + visibleCount + buffer * 2);

  return { start, end };
};

// パフォーマンス監視
export class PerformanceMonitor {
  private static marks = new Map<string, number>();

  static mark(name: string): void {
    this.marks.set(name, performance.now());
  }

  static measure(name: string, startMark: string): number {
    const start = this.marks.get(startMark);
    if (!start) {
      console.warn(`Mark ${startMark} not found`);
      return 0;
    }

    const duration = performance.now() - start;
    console.log(`${name}: ${duration.toFixed(2)}ms`);
    return duration;
  }

  static async measureAsync<T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      console.log(`${name}: ${duration.toFixed(2)}ms`);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      console.error(`${name} failed after ${duration.toFixed(2)}ms`, error);
      throw error;
    }
  }
}

// Service Worker登録
export const registerServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};