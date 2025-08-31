-- 公開ニーズのサンプルが少ない時用
insert into needs (id, title, summary, region, category, public, created_at, updated_at, deadline)
select gen_random_uuid(), 'テスト案件 '||gs::text, '概要ダミー '||gs::text, '高知', '介護', true, now() - (gs||' days')::interval, now() - (gs||' days')::interval, now() + ((gs%10)+3||' days')::interval
from generate_series(1,12) as gs
on conflict do nothing;
