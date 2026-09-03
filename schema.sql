-- auto-generated definition
create table content_stats
(
    uuid          text not null
        primary key,
    view_count    integer default 0 not null,
    like_count    integer default 0 not null
)
    using ???;

alter table content_stats
    owner to postgres;

grant delete, insert, references, select, trigger, truncate, update on content_stats to anon;

grant delete, insert, references, select, trigger, truncate, update on content_stats to authenticated;

grant delete, insert, references, select, trigger, truncate, update on content_stats to service_role;


-- auto-generated definition
create table daycares
(
    daycare_code                     varchar(20) not null
        primary key,
    sigungu_code                     varchar(10) not null,
    sido_name                        varchar(50),
    sigungu_name                     varchar(50),
    name                             varchar(150) not null,
    type_name                        varchar(50),
    status                           varchar(20),
    zip_code                         varchar(10),
    address                          varchar(300),
    phone                            varchar(20),
    fax                              varchar(20),
    homepage                         varchar(200),
    latitude                         varchar(30),
    longitude                        varchar(30),
    capacity                         integer,
    current_child_count              integer,
    nursery_room_count               integer,
    nursery_room_size                numeric(18, 2),
    playground_count                 integer,
    cctv_count                       integer,
    childcare_staff_count            integer,
    class_count_total                integer,
    child_count_total                integer,
    staff_total                      integer,
    waiting_child_total              integer,
    representative_name              varchar(60),
    certified_date                   varchar(10),
    abolished_date                   varchar(10),
    synced_at                        timestamp default now() not null,
    vehicle_operation                varchar(10),
    pause_start_date                 varchar(10),
    pause_end_date                   varchar(10),
    data_standard_date               varchar(10),
    services                         varchar(150),
    class_count_age_0                integer,
    class_count_age_1                integer,
    class_count_age_2                integer,
    class_count_age_3                integer,
    class_count_age_4                integer,
    class_count_age_5                integer,
    class_count_infant_mixed         integer,
    class_count_child_mixed          integer,
    class_count_special              integer,
    child_count_age_0                integer,
    child_count_age_1                integer,
    child_count_age_2                integer,
    child_count_age_3                integer,
    child_count_age_4                integer,
    child_count_age_5                integer,
    child_count_infant_mixed         integer,
    child_count_child_mixed          integer,
    child_count_special              integer,
    staff_tenure_under_1y            double precision,
    staff_tenure_1y_to_2y            double precision,
    staff_tenure_2y_to_4y            double precision,
    staff_tenure_4y_to_6y            double precision,
    staff_tenure_over_6y             double precision,
    staff_director_count             integer,
    staff_teacher_count              integer,
    staff_special_teacher_count      integer,
    staff_therapist_count            integer,
    staff_nutritionist_count         integer,
    staff_nurse_count                integer,
    staff_nursing_assistant_count    integer,
    staff_cook_count                 integer,
    staff_office_count               integer,
    waiting_child_age_0              integer,
    waiting_child_age_1              integer,
    waiting_child_age_2              integer,
    waiting_child_age_3              integer,
    waiting_child_age_4              integer,
    waiting_child_age_5              integer,
    waiting_child_age_over_6         integer,
    ai_analysis                      jsonb
)
    using ???;

comment on table daycares is '어린이집 기본정보 (cpmsapi030)';

comment on column daycares.daycare_code is '어린이집코드';

comment on column daycares.sigungu_code is '시군구코드';

comment on column daycares.sido_name is '시도명';

comment on column daycares.sigungu_name is '시군구명';

comment on column daycares.name is '어린이집명';

comment on column daycares.type_name is '어린이집 유형명';

comment on column daycares.status is '운영상태명';

comment on column daycares.zip_code is '우편번호';

comment on column daycares.address is '주소';

comment on column daycares.phone is '전화번호';

comment on column daycares.fax is '팩스번호';

comment on column daycares.homepage is '홈페이지';

comment on column daycares.latitude is '위도';

comment on column daycares.longitude is '경도';

comment on column daycares.capacity is '정원';

comment on column daycares.current_child_count is '현원';

comment on column daycares.nursery_room_count is '보육실 수';

comment on column daycares.nursery_room_size is '보육실 면적(㎡)';

comment on column daycares.playground_count is '놀이터 수';

comment on column daycares.cctv_count is 'CCTV 설치 수';

comment on column daycares.childcare_staff_count is '보육교직원 수';

comment on column daycares.class_count_total is '반 수 합계';

comment on column daycares.child_count_total is '아동 수 합계';

comment on column daycares.staff_total is '교직원 수 합계';

comment on column daycares.waiting_child_total is '입소대기 아동 수 합계';

comment on column daycares.representative_name is '대표자명';

comment on column daycares.certified_date is '인가일자 (YYYYMMDD)';

comment on column daycares.abolished_date is '폐지일자 (YYYYMMDD)';

comment on column daycares.synced_at is '동기화 시각';

comment on column daycares.vehicle_operation is '통학차량운영여부 (운영, 미운영, NULL)';

comment on column daycares.pause_start_date is '휴지시작일자 (YYYYMMDD)';

comment on column daycares.pause_end_date is '휴지종료일자 (YYYYMMDD)';

comment on column daycares.data_standard_date is '데이터기준일자 (YYYYMMDD, 실시간 현재시간)';

comment on column daycares.services is '제공서비스 (예: 일반, 일시보육)';

comment on column daycares.class_count_age_0 is '반수-만0세';

comment on column daycares.class_count_age_1 is '반수-만1세';

comment on column daycares.class_count_age_2 is '반수-만2세';

comment on column daycares.class_count_age_3 is '반수-만3세';

comment on column daycares.class_count_age_4 is '반수-만4세';

comment on column daycares.class_count_age_5 is '반수-만5세';

comment on column daycares.class_count_infant_mixed is '반수-영아혼합(만0~2세)';

comment on column daycares.class_count_child_mixed is '반수-유아혼합(만3~5세)';

comment on column daycares.class_count_special is '반수-특수장애';

comment on column daycares.child_count_age_0 is '아동수-만0세';

comment on column daycares.child_count_age_1 is '아동수-만1세';

comment on column daycares.child_count_age_2 is '아동수-만2세';

comment on column daycares.child_count_age_3 is '아동수-만3세';

comment on column daycares.child_count_age_4 is '아동수-만4세';

comment on column daycares.child_count_age_5 is '아동수-만5세';

comment on column daycares.child_count_infant_mixed is '아동수-영아혼합(만0~2세)';

comment on column daycares.child_count_child_mixed is '아동수-유아혼합(만3~5세)';

comment on column daycares.child_count_special is '아동수-특수장애';

comment on column daycares.staff_tenure_under_1y is '근속년수-1년미만';

comment on column daycares.staff_tenure_1y_to_2y is '근속년수-1년이상~2년미만';

comment on column daycares.staff_tenure_2y_to_4y is '근속년수-2년이상~4년미만';

comment on column daycares.staff_tenure_4y_to_6y is '근속년수-4년이상~6년미만';

comment on column daycares.staff_tenure_over_6y is '근속년수-6년이상';

comment on column daycares.staff_director_count is '교직원현황-원장';

comment on column daycares.staff_teacher_count is '교직원현황-보육교사';

comment on column daycares.staff_special_teacher_count is '교직원현황-특수교사';

comment on column daycares.staff_therapist_count is '교직원현황-치료교사';

comment on column daycares.staff_nutritionist_count is '교직원현황-영양사';

comment on column daycares.staff_nurse_count is '교직원현황-간호사';

comment on column daycares.staff_nursing_assistant_count is '교직원현황-간호조무사';

comment on column daycares.staff_cook_count is '교직원현황-조리원';

comment on column daycares.staff_office_count is '교직원현황-사무직원';

comment on column daycares.waiting_child_age_0 is '입소대기아동수-0세';

comment on column daycares.waiting_child_age_1 is '입소대기아동수-1세';

comment on column daycares.waiting_child_age_2 is '입소대기아동수-2세';

comment on column daycares.waiting_child_age_3 is '입소대기아동수-3세';

comment on column daycares.waiting_child_age_4 is '입소대기아동수-4세';

comment on column daycares.waiting_child_age_5 is '입소대기아동수-5세';

comment on column daycares.waiting_child_age_over_6 is '입소대기아동수-6세이상';

comment on column daycares.ai_analysis is 'AI 요약 분석 결과 (summary, strengths, considerations, tags)';

alter table daycares
    owner to postgres;

create index idx_daycares_address_trgm
    on daycares using gin (address gin_trgm_ops);

create index idx_daycares_map_bbox
    on daycares using btree (status, latitude, longitude) WHERE ((latitude IS NOT NULL) AND (longitude IS NOT NULL));

create index idx_daycares_nearby
    on daycares using btree (sigungu_code) INCLUDE (daycare_code, name, type_name, address, latitude, longitude) WHERE (((status)::text = '정상'::text) AND (latitude IS NOT NULL) AND (longitude IS NOT NULL));

create index idx_daycares_name_trgm
    on daycares using gin (name gin_trgm_ops);

create index idx_daycares_ranking_capacity
    on daycares using btree (capacity DESC) WHERE (((status)::text = '정상'::text) AND (capacity > 0));

create index idx_daycares_ranking_certified
    on daycares using btree (certified_date DESC) WHERE (((status)::text = '정상'::text) AND (certified_date IS NOT NULL));

create index idx_daycares_ranking_waiting
    on daycares using btree (waiting_child_total DESC) WHERE (((status)::text = '정상'::text) AND (waiting_child_total > 0));

create index idx_daycares_sido_capacity
    on daycares using btree (sido_name, capacity DESC) WHERE (((status)::text = '정상'::text) AND (capacity > 0));

create index idx_daycares_sido_certified
    on daycares using btree (sido_name, certified_date DESC) WHERE (((status)::text = '정상'::text) AND (certified_date IS NOT NULL));

create index idx_daycares_sido_name
    on daycares using btree (sido_name);

create index idx_daycares_sido_waiting
    on daycares using btree (sido_name, waiting_child_total DESC) WHERE (((status)::text = '정상'::text) AND (waiting_child_total > 0));

create index idx_daycares_sigungu_code
    on daycares using btree (sigungu_code);

create index idx_daycares_sigungu_status
    on daycares using btree (sigungu_code, status);

create index idx_daycares_status
    on daycares using btree (status);

create index idx_daycares_status_latlng_float
    on daycares using btree (status, ((latitude)::double precision), ((longitude)::double precision)) WHERE (((status)::text = '정상'::text) AND ((latitude)::text <> ''::text) AND ((longitude)::text <> ''::text));

grant delete, insert, references, select, trigger, truncate, update on daycares to anon;

grant delete, insert, references, select, trigger, truncate, update on daycares to authenticated;

grant delete, insert, references, select, trigger, truncate, update on daycares to service_role;


-- auto-generated definition
create table flyway_schema_history
(
    installed_rank    integer not null
        primary key,
    version           varchar(50),
    description       varchar(200) not null,
    type              varchar(20) not null,
    script            varchar(1000) not null,
    checksum          integer,
    installed_by      varchar(100) not null,
    installed_on      timestamp default now() not null,
    execution_time    integer not null,
    success           boolean not null
)
    using ???;

alter table flyway_schema_history
    owner to postgres;

create unique index flyway_schema_history_pk
    on flyway_schema_history using btree (installed_rank);

create index flyway_schema_history_s_idx
    on flyway_schema_history using btree (success);

grant delete, insert, references, select, trigger, truncate, update on flyway_schema_history to anon;

grant delete, insert, references, select, trigger, truncate, update on flyway_schema_history to authenticated;

grant delete, insert, references, select, trigger, truncate, update on flyway_schema_history to service_role;


-- auto-generated definition
create table sigungus
(
    arcode       varchar(10) not null
        primary key,
    sidoname     varchar(50) not null,
    sigunname    varchar(50) not null,
    synced_at    timestamp default now() not null
)
    using ???;

comment on table sigungus is '시군구 정보 (cpmsapi020)';

comment on column sigungus.arcode is '시군구코드';

comment on column sigungus.sidoname is '시도명';

comment on column sigungus.sigunname is '시군구명';

comment on column sigungus.synced_at is '동기화 시각';

alter table sigungus
    owner to postgres;

create index idx_sigungus_sidoname
    on sigungus using btree (sidoname);

grant delete, insert, references, select, trigger, truncate, update on sigungus to anon;

grant delete, insert, references, select, trigger, truncate, update on sigungus to authenticated;

grant delete, insert, references, select, trigger, truncate, update on sigungus to service_role;


-- auto-generated definition
create table sync_histories
(
    id                   bigint default nextval('sync_histories_id_seq'::regclass) not null
        primary key,
    sync_type            varchar(10) not null,
    target_year_month    varchar(7),
    status               varchar(10) default 'RUNNING'::character varying not null,
    total_count          integer default 0 not null,
    upsert_count         integer default 0 not null,
    closed_count         integer default 0 not null,
    error_message        varchar(2000),
    started_at           timestamp default now() not null,
    finished_at          timestamp
)
    using ???;

comment on table sync_histories is '동기화 실행 이력';

comment on column sync_histories.id is '식별자';

comment on column sync_histories.sync_type is '동기화 유형 (FULL / MONTHLY)';

comment on column sync_histories.target_year_month is '대상 연월 (YYYY-MM, MONTHLY 동기화 시 사용)';

comment on column sync_histories.status is '상태 (RUNNING / SUCCESS / FAILED)';

comment on column sync_histories.total_count is '전체 처리 건수';

comment on column sync_histories.upsert_count is '추가/수정 건수';

comment on column sync_histories.closed_count is '폐지 처리 건수';

comment on column sync_histories.error_message is '오류 메시지';

comment on column sync_histories.started_at is '동기화 시작 시각';

comment on column sync_histories.finished_at is '동기화 완료 시각';

alter table sync_histories
    owner to postgres;

create index idx_sync_histories_started_at
    on sync_histories using btree (started_at DESC);

create index idx_sync_histories_sync_type
    on sync_histories using btree (sync_type);

grant delete, insert, references, select, trigger, truncate, update on sync_histories to anon;

grant delete, insert, references, select, trigger, truncate, update on sync_histories to authenticated;

grant delete, insert, references, select, trigger, truncate, update on sync_histories to service_role;


-- auto-generated definition
create view daycare_service_types as
SELECT DISTINCT TRIM(BOTH FROM s.service_name) AS service_name
   FROM daycares,
    LATERAL unnest(string_to_array((daycares.services)::text, ','::text)) s(service_name)
  WHERE (((daycares.status)::text = '정상'::text) AND (daycares.services IS NOT NULL) AND (TRIM(BOTH FROM s.service_name) <> ''::text))
  ORDER BY (TRIM(BOTH FROM s.service_name));

alter table daycare_service_types
    owner to postgres;

grant delete, insert, references, select, trigger, truncate, update on daycare_service_types to anon;

grant delete, insert, references, select, trigger, truncate, update on daycare_service_types to authenticated;

grant delete, insert, references, select, trigger, truncate, update on daycare_service_types to service_role;


-- auto-generated definition
create view daycare_type_names as
SELECT DISTINCT type_name
   FROM daycares
  WHERE (((status)::text = '정상'::text) AND (type_name IS NOT NULL) AND ((type_name)::text <> ''::text))
  ORDER BY type_name;

alter table daycare_type_names
    owner to postgres;

grant delete, insert, references, select, trigger, truncate, update on daycare_type_names to anon;

grant delete, insert, references, select, trigger, truncate, update on daycare_type_names to authenticated;

grant delete, insert, references, select, trigger, truncate, update on daycare_type_names to service_role;


