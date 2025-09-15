-- ${USER_UUID} を Node スクリプトから置換して実行するテンプレート
select set_config('request.jwt.claim.sub', '${USER_UUID}', true);

insert into public.needs (title, body) values ('テスト投稿', '本文テスト');

select id, title, owner_id, status, published, created_at
from public.needs
order by created_at desc
limit 1;