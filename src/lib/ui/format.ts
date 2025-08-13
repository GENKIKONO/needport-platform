/**
 * 数値、日付、通貨のフォーマッタ関数群
 */

/**
 * 通貨をフォーマット（円）
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * 日付をフォーマット
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/**
 * 日時をフォーマット
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * 残り時間を計算してフォーマット
 */
export function formatTimeRemaining(deadline: string): string {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diff = deadlineDate.getTime() - now.getTime();
  
  if (diff <= 0) {
    return '締切終了';
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return `あと${days}日`;
  } else if (hours > 0) {
    return `あと${hours}時間`;
  } else {
    return `あと${minutes}分`;
  }
}

/**
 * 人数をフォーマット
 */
export function formatPeople(count: number): string {
  return `${count}名`;
}

/**
 * 残り人数をフォーマット
 */
export function formatRemainingPeople(remaining: number): string {
  const actual = Math.max(0, remaining);
  return `あと${actual}名`;
}
