export type Key = 
  | 'adopted'
  | 'adopt'
  | 'unadopt'
  | 'price'
  | 'vendor'
  | 'people'
  | 'deadline'
  | 'min_people'
  | 'total_people'
  | 'remaining_people'
  | 'recruitment_closed'
  | 'recruitment_open'
  | 'deadline_passed'
  | 'target_reached'
  | 'admin_closed'
  | 'search_needs'
  | 'search_placeholder'
  | 'sort_new'
  | 'sort_popular'
  | 'search'
  | 'clear'
  | 'results_count'
  | 'page'
  | 'of'
  | 'prev'
  | 'next'
  | 'upload_file'
  | 'download'
  | 'no_attachments'
  | 'uploading'
  | 'upload_success'
  | 'upload_error'
  | 'load_error';

export const dicts = {
  ja: {
    adopted: '採用済み',
    adopt: '採用',
    unadopt: '採用解除',
    price: '価格',
    vendor: '提供者',
    people: '人',
    deadline: '締切',
    min_people: '最低人数',
    total_people: '応募人数',
    remaining_people: '残り人数',
    recruitment_closed: '募集終了',
    recruitment_open: '募集中',
    deadline_passed: '締切超過',
    target_reached: '目標達成',
    admin_closed: '管理者による終了',
    search_needs: '募集を検索',
    search_placeholder: '募集タイトルで検索...',
    sort_new: '新しい順',
    sort_popular: '人気順',
    search: '検索',
    clear: 'クリア',
    results_count: '件の募集',
    page: 'ページ',
    of: '/',
    prev: '前へ',
    next: '次へ',
    upload_file: 'ファイルをアップロード',
    download: 'ダウンロード',
    no_attachments: '添付ファイルはありません',
    uploading: 'アップロード中...',
    upload_success: 'ファイルをアップロードしました',
    upload_error: 'アップロードに失敗しました',
    load_error: '読み込みに失敗しました',
  },
  en: {
    adopted: 'Adopted',
    adopt: 'Adopt',
    unadopt: 'Unadopt',
    price: 'Price',
    vendor: 'Vendor',
    people: 'people',
    deadline: 'Deadline',
    min_people: 'Min People',
    total_people: 'Total People',
    remaining_people: 'Remaining People',
    recruitment_closed: 'Recruitment Closed',
    recruitment_open: 'Recruitment Open',
    deadline_passed: 'Deadline Passed',
    target_reached: 'Target Reached',
    admin_closed: 'Closed by Admin',
    search_needs: 'Search Needs',
    search_placeholder: 'Search by title...',
    sort_new: 'Newest',
    sort_popular: 'Popular',
    search: 'Search',
    clear: 'Clear',
    results_count: 'needs found',
    page: 'Page',
    of: 'of',
    prev: 'Previous',
    next: 'Next',
    upload_file: 'Upload File',
    download: 'Download',
    no_attachments: 'No attachments',
    uploading: 'Uploading...',
    upload_success: 'File uploaded successfully',
    upload_error: 'Upload failed',
    load_error: 'Failed to load',
  },
};

export function t(lang: 'ja' | 'en', key: Key, vars?: Record<string, string | number>): string {
  const dict = dicts[lang];
  let text = dict[key] || dicts.ja[key] || key;

  if (vars) {
    Object.entries(vars).forEach(([varName, value]) => {
      text = text.replace(new RegExp(`\\$\\{${varName}\\}`, 'g'), String(value));
    });
  }

  return text;
}
