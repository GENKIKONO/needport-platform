export type UserRole = 'general' | 'vendor' | 'admin';
export type Role = 'guest' | UserRole;

export function getUserRole(session: any): Role {
  if (!session) return 'guest';
  return session.role ?? 'guest';
}

// 基本権限チェック
export const isAuthed = (r: Role) => r !== 'guest';
export const isVendor = (r: Role) => r === 'vendor' || r === 'admin';
export const isAdmin = (r: Role) => r === 'admin';
export const canPropose = (r: Role) => isVendor(r);
export const canSeeKaichuFull = (r: Role) => isAuthed(r);

// 詳細権限チェック
export function isGeneralUser(role: UserRole): boolean {
  return role === 'general';
}

export function isVendorUser(role: UserRole): boolean {
  return role === 'vendor';
}

export function isAdminUser(role: UserRole): boolean {
  return role === 'admin';
}

// ページ別権限
export const canAccessNeeds = (r: Role) => true; // 全ユーザー
export const canAccessNeedsNew = (r: Role) => isAuthed(r); // 登録ユーザーのみ
export const canAccessKaichu = (r: Role) => true; // 全ユーザー（内容は制限）
export const canAccessMe = (r: Role) => true; // 全ユーザー（ゲストも表示可能）
export const canAccessVendorRegister = (r: Role) => true; // 全ユーザー
export const canAccessAuth = (r: Role) => true; // 全ユーザー
