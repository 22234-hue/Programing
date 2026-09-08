-- Run once in Supabase SQL Editor. This creates MC Chat's private application tables.
create table if not exists public.users(id text primary key,name text not null,handle text not null unique,bio text not null default '',color text not null default '#338fc6',created double precision not null,seen double precision not null);
create table if not exists public.rooms(id text primary key,name text not null,kind text not null check(kind in ('notes','direct','group')),owner text not null references public.users(id),pair text unique,created double precision not null,updated double precision not null);
create table if not exists public.members(room text not null references public.rooms(id) on delete cascade,member_id text not null references public.users(id),read_at double precision not null default 0,archived integer not null default 0 check(archived in (0,1)),primary key(room,member_id));
create table if not exists public.messages(id text primary key,room text not null references public.rooms(id) on delete cascade,sender text not null references public.users(id),body text not null,created double precision not null,edited double precision,deleted integer not null default 0 check(deleted in (0,1)),reply text references public.messages(id));
create table if not exists public.friends(id text primary key,sender text not null references public.users(id),recipient text not null references public.users(id),pair text not null unique,status text not null default 'pending' check(status in ('pending','accepted')),created double precision not null);
create table if not exists public.reactions(message text not null references public.messages(id) on delete cascade,member_id text not null references public.users(id),emoji text not null,primary key(message,member_id,emoji));
create table if not exists public.files(id text primary key,room text not null references public.rooms(id),uploader text not null references public.users(id),name text not null,type text not null,size integer not null check(size>0 and size<=10485760),created double precision not null);
create index if not exists idx_members_user on public.members(member_id,archived);
create index if not exists idx_messages_room_created on public.messages(room,created,id);
create index if not exists idx_messages_sender_created on public.messages(sender,created);
create index if not exists idx_friends_recipient on public.friends(recipient,status);
create index if not exists idx_friends_sender on public.friends(sender,status);
create index if not exists idx_files_room_created on public.files(room,created);
-- Application tables are reached only through server routes with membership checks.
alter table public.users enable row level security;alter table public.rooms enable row level security;alter table public.members enable row level security;alter table public.messages enable row level security;alter table public.friends enable row level security;alter table public.reactions enable row level security;alter table public.files enable row level security;
-- Private bucket. Signed upload/download URLs are issued only after server membership checks.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('mc-chat','mc-chat',false,10485760,array['image/jpeg','image/png','image/webp','image/gif','audio/webm','audio/ogg','audio/mp4','audio/mpeg','audio/wav','application/pdf','text/plain','application/zip']) on conflict(id) do update set public=false,file_size_limit=10485760,allowed_mime_types=excluded.allowed_mime_types;
