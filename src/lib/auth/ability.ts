import { Role } from './roles';

export const canPropose = (r: Role) => r === 'vendor' || r === 'admin';
export const canApplyChat = (r: Role) => r !== 'guest';
export const canViewRoom = (r: Role, isMember: boolean) => isMember || r === 'admin';
export const canViewKaichuFull = (r: Role) => r !== 'guest';
export const canAccessMe = (r: Role) => r !== 'guest';
export const canAccessNeedsNew = (r: Role) => r !== 'guest';
export const canAccessVendorRegister = (r: Role) => r !== 'guest';
export const canAccessAuth = (r: Role) => true; // 全ユーザーアクセス可能
