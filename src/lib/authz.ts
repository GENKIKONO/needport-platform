import { auth } from '@clerk/nextjs';

export async function requireUser() {
  const { userId } = auth();
  // TODO: 仕様確定後に権限判定を実装
  return { userId };
}

export async function requireVendor() {
  const { userId } = auth();
  // TODO: vendor判定ロジック（組織/メタデータ等）
  return { userId, isVendor: true };
}
