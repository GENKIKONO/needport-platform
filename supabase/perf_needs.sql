-- パフォーマンス用インデックス（存在しなければ作成）
create index if not exists idx_needs_public_created_at on needs(public, created_at desc);
create index if not exists idx_needs_region on needs(region);
create index if not exists idx_needs_category on needs(category);
