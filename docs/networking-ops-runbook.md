# Ralphthon Networking Engine 운영 인수인계

작성일: 2026-05-16 17:33 KST  
대상: Ralphthon 운영을 맡은 개발자  
원칙: 실제 Discord DM은 승인 전에는 보내지 않는다. 먼저 dry run으로 대상, 문구, 로그만 검증한다.

## 0. 지금 상태

### 배포 URL

- Ralphthon: `https://ralphthon.team-attention.com`
- Ralphthon networking 상태: `https://ralphthon.team-attention.com/admin/networking`
- Networking engine admin: `https://ralph-net.vercel.app/web/admin`
- Networking engine ops: `https://ralph-net.vercel.app/web/ops`

`/web/admin`은 실행 버튼이 있는 관리자 화면이다. `/web/ops`는 읽기 전용 화면으로 운영 현황 확인용이다.

### 2026-05-17 기준 검증 결과

- `https://ralph-net.vercel.app/web/admin` 접속 가능.
- Engine -> Ralphthon status API 호출은 `ok=true`, `http_status=200`.
- 현재 참가자 상태: 97 teams, 170 participants.
- 현재 gate 상태: `export_ready=false`, `invite_ready=true`, `networking_ready=false`.
- `duplicate_emails=3`.
- `discord_linked=0`, `missing_discord=170`.
- `delivery_schema.has_networking_columns=true`.
- production Vercel은 새 Supabase project `dusroyxctqyagrpeqtud`를 보고 있다.

현재 상태는 **real Discord delivery 전 No-Go**다. migration blocker는 해소됐지만 Discord 연결 대상이 아직 0명이고, duplicate email 3건 때문에 export gate가 false다. 먼저 중복 이메일을 운영 기준으로 정리하고, Discord 연결/초대 상태가 채워지는지 확인한다.

해결 후 기대 상태:

- Engine admin 상단의 Ralphthon 연결이 초록색.
- Ralphthon `/admin/networking`에서 참가자 수, Discord linked, Networking ready 값이 보임.
- `missing_discord`, `invalid_discord`, `duplicate_emails`가 운영자가 판단 가능한 숫자로 보임.
- `duplicate_emails = 0`.
- `discord_linked`가 실제 발송 대상 수만큼 증가.

## 1. 전체 플로우

Ralphthon과 networking engine은 DB를 합치지 않는다. Ralphthon은 참가 신청/팀/이메일/Discord 준비 상태의 원본이고, engine은 이메일 기준으로 참가자를 매핑해서 스코어링, 쇼 화면, Discord 결과 전달을 담당한다.

흐름은 다음 순서다.

1. Ralphthon 참가자가 신청한다.
2. Ralphthon DB의 `team_members.email`을 기준으로 engine의 참가자 데이터와 매핑한다.
3. Discord 초대/연결 상태가 Ralphthon 쪽에 기록된다.
4. 운영자가 engine admin에서 Ralphthon 연결과 Discord 준비 상태를 확인한다.
5. 10:00 전후 Spark scoring을 시작한다.
6. 10:30에 쇼 시작 버튼을 눌러 이미 계산된 실제 데이터를 애니메이션처럼 보여준다.
7. 12:00~12:30에 dry run을 확인한 뒤, 승인된 경우에만 Discord DM을 실제 발송한다.

쇼 화면의 실시간 생성 느낌은 실제 LLM token streaming이 아니다. 이미 계산된 실제 사람/매칭 데이터를 애니메이션으로 재생한다. 따라서 10:30 쇼 시작은 전체 계산이 끝나지 않았어도 가능해야 하지만, mock 데이터가 아니라 그 시점까지 실제로 계산된 데이터만 보여줘야 한다.

## 2. 어떤 기준으로 만들었는지

### 데이터 경계

- Ralphthon DB는 원본 참가자 시스템이다.
- Networking engine은 별도 산출물 시스템이다.
- 두 시스템은 이메일로만 조인한다.
- DB 병합이나 양방향 sync는 하지 않는다.

이렇게 한 이유는 행사 신청 시스템을 건드리지 않고, networking engine을 행사 전용으로 빠르게 붙였다 떼기 위해서다.

### 운영 경계

- Vercel serverless는 긴 Spark job이나 Discord 발송을 직접 돌리지 않는다.
- 실제 작업은 admin runner가 수행한다.
- Engine admin은 runner에 실행 요청을 보내고 상태만 모은다.
- Ops 화면은 읽기 전용이어야 한다.

### 안전 기준

- 실제 Discord DM 전에는 반드시 dry run을 한다.
- dry run 결과와 대상 파일을 기준으로 manifest를 만든다.
- real send는 manifest 검증을 통과한 뒤에만 실행한다.
- 발송 시도는 append-only log에 남긴다.
- 토큰/비밀번호는 git에 넣지 않는다. Vercel env 또는 서버 env로만 관리한다.

## 3. 처음 맡은 사람이 사용하는 법

### 3.1 관리자 접속

1. `https://ralph-net.vercel.app/web/admin`을 연다.
2. 운영 비밀번호로 로그인한다.
3. 비밀번호 값은 git 문서에 적지 않는다. Vercel `ADMIN_PASSWORD` 또는 운영 채널의 공유 credential을 확인한다.

### 3.2 상태 확인

관리자 화면에서 먼저 세 가지를 본다.

- Ralphthon 연결: 참가자 원본 DB를 읽을 수 있는지.
- Runner 연결: local workstation runner 또는 EC2 runner 중 하나 이상 연결되어 있는지.
- 단계별 상태: 지금 해야 할 단계, 이미 끝난 단계, 막힌 단계가 무엇인지.

Ralphthon 연결이 빨간색이면 scoring이나 delivery를 진행하지 않는다.

### 3.3 dry run

실제 메시지를 보내지 않는 검증 순서다.

1. `1차 대상` 또는 `2차 대상`을 만든다.
2. `1차 dry-run` 또는 `2차 dry-run`을 실행한다.
3. dry run summary에서 대상 수, 실패 수, 누락 Discord 수를 본다.
4. 문제가 없으면 `manifest`를 만든다.
5. 여기까지는 실제 DM이 나가지 않는다.

주의:

- `1차 발송`, `2차 발송`, `DM 발송`은 실제 Discord 메시지를 보내는 버튼이다.
- dry run만 필요한 사람은 send 계열 버튼을 누르지 않는다.
- 승인 없는 real send는 하지 않는다.

CLI로 dry run이 필요하면 runner가 떠 있는 서버에서 실행한다.

```bash
cd /home/joon/Repos/ralphthon-networking-engine

python3 -m networking_engine.discord_delivery \
  --targets out/delivery-runs/round1/delivery_targets_v1.json \
  --attempt-log out/delivery-runs/round1/delivery_attempts.jsonl \
  --summary out/delivery-runs/round1/dry_run_summary.json \
  --dry-run
```

2차는 `round1`을 `round2`로 바꿔 실행한다. 실제 발송은 `--dry-run`이 아니라 `--send`와 manifest가 필요하므로 dry run 담당자는 사용하지 않는다.

## 4. 상황별 판단

### Ralphthon 연결이 500이면

예: `column team_members.discord_user_id does not exist`

해야 할 일:

1. production Supabase DB에 `supabase/migrations/20260515000001_networking_delivery_fields.sql`이 적용됐는지 확인한다.
2. 적용되지 않았으면 Supabase migration을 먼저 적용한다.
3. 다시 `https://ralph-net.vercel.app/web/admin`에서 Ralphthon 연결을 확인한다.

하지 말 것:

- engine 쪽 scoring을 먼저 시작하지 않는다.
- 누락 column을 무시하도록 임시 patch하지 않는다. Discord delivery 준비 상태가 왜곡된다.

### Ralphthon 연결이 403이면

해야 할 일:

1. Ralphthon Vercel env의 `NETWORKING_BACKOFFICE_TOKEN`을 확인한다.
2. Engine Vercel env의 `RALPHTHON_BACKOFFICE_TOKEN`이 같은 값인지 확인한다.
3. `NETWORKING_BACKOFFICE_ORIGIN`이 `https://ralph-net.vercel.app`인지 확인한다.
4. 양쪽을 redeploy한다.

### Runner가 미연결이면

admin 화면의 실행 버튼은 동작하지 않는다.

로컬 워크스테이션:

```bash
systemctl --user status ralphthon-admin-runner.service
systemctl --user restart ralphthon-admin-runner.service
```

EC2 백업:

```bash
ssh callva-outbound 'systemctl status ralphthon-admin-runner.service'
ssh callva-outbound 'sudo journalctl -u ralphthon-admin-runner.service -n 80 --no-pager'
```

둘 중 하나만 정상이어도 admin에서 작업 실행은 가능하다.

### 10:00에 scoring을 시작해야 하면

조건:

- Ralphthon 연결 정상.
- 참가자 export 가능.
- Runner 연결 정상.
- OpenAI/API credential이 runner 환경에 있음.

admin에서 Spark scoring 시작 계열 액션을 실행한다. 진행률은 admin/ops 화면에서 본다.

### 10:30에 쇼를 시작해야 하면

조건:

- 적어도 일부 실제 collision 결과가 생성되어 있음.
- stage/show 화면이 실제 사람 데이터를 읽고 있음.

계산이 100% 끝나지 않아도 쇼 시작은 가능하다. 단, mock이 아니라 실제 계산된 결과만 보여줘야 한다.

### 12:00~12:30에 Discord 결과를 보내야 하면

순서:

1. 대상 파일 생성.
2. dry run.
3. dry run summary 확인.
4. manifest 생성.
5. 운영 승인.
6. real send.
7. delivery attempt log 확인.

하나라도 실패하면 send를 멈춘다.

## 5. 코드와 배포 구조

### Ralphthon 레포

- GitHub: `https://github.com/team-attention/ralphthon`
- 서버 내 작업 경로: `/home/joon/work/ralphthon`
- 현재 문서를 올리는 안전한 배포 worktree: `/home/joon/work/ralphthon-networking-deploy`

Ralphthon 쪽 networking 관련 파일:

- `src/app/admin/networking/page.tsx`
- `src/app/api/admin/networking-status/route.ts`
- `src/app/api/admin/networking-export/route.ts`
- `supabase/migrations/20260515000001_networking_delivery_fields.sql`

수정 후 기본 검증:

```bash
cd /home/joon/work/ralphthon
pnpm lint
pnpm build
```

### Networking engine 레포

- 현재 코드 경로: `/home/joon/Repos/ralphthon-networking-engine`
- Admin UI: `web/admin.html`, `web/admin.js`, `web/admin.css`
- Ops UI: `web/ops.html`
- Runner: `scripts/admin_runner.py`
- Delivery target build: `networking_engine/delivery_targets.py`
- Discord dry run/send: `networking_engine/discord_delivery.py`
- Manifest: `networking_engine/ops_artifacts.py`

수정 후 기본 검증:

```bash
cd /home/joon/Repos/ralphthon-networking-engine
node --check web/admin.js
node tests/admin_decision_harness.js
PYTHONPATH=. pytest -q
```

### Ralphthon 레포에 engine을 포함시키는 방법

행사 중에는 engine을 급하게 복사하지 않는 편이 안전하다. 지금은 별도 배포 `https://ralph-net.vercel.app`를 운영 기준으로 둔다.

행사 후 정리할 때는 둘 중 하나로 합친다.

권장 1: submodule

```bash
cd /home/joon/work/ralphthon
git submodule add <networking-engine-git-url> tools/ralphthon-networking-engine
git commit -m "Keep networking engine with Ralphthon operations"
git push origin main
```

권장 2: monorepo 편입

```text
apps/ralphthon
apps/networking-engine
packages/shared
```

행사 직전에는 monorepo 편입보다 submodule이 안전하다. dependency, Vercel project, runner service가 이미 별도 기준으로 맞춰져 있기 때문이다.

## 6. 필요한 env

값은 git에 적지 않는다.

Ralphthon Vercel:

- `NETWORKING_BACKOFFICE_TOKEN`
- `NETWORKING_BACKOFFICE_ORIGIN=https://ralph-net.vercel.app`
- 기존 Supabase env
- 기존 admin auth env

Networking engine Vercel:

- `ADMIN_PASSWORD`
- `ADMIN_COOKIE_SECRET`
- `RALPHTHON_STATUS_URL=https://ralphthon.team-attention.com/api/admin/networking-status`
- `RALPHTHON_BACKOFFICE_TOKEN`
- `ADMIN_RUNNER_LOCAL_URL`
- `ADMIN_RUNNER_LOCAL_TOKEN`
- `ADMIN_RUNNER_EC2_URL`
- `ADMIN_RUNNER_EC2_TOKEN`

Runner 서버:

- OpenAI/Codex 실행에 필요한 API credential
- Discord real send 시에만 `DISCORD_BOT_TOKEN`
- `ADMIN_RUNNER_TOKEN`

## 7. Go / No-Go 체크리스트

Dry run Go:

- Ralphthon 연결 초록색.
- Runner 하나 이상 초록색.
- `duplicate_emails = 0`.
- `invalid_discord = 0`.
- 대상 파일 생성 성공.
- dry run summary 생성 성공.
- 실제 send 버튼을 누르지 않음.

Real send Go:

- Dry run summary 확인 완료.
- manifest 생성 완료.
- 운영 승인 완료.
- Discord bot token 확인 완료.
- 발송 대상 수가 예상 범위.
- send 후 attempt log 확인 가능.

No-Go:

- Ralphthon status API 500/403.
- migration 미적용.
- runner 미연결.
- dry run 실패.
- 대상 수가 예상보다 크게 다름.
- Discord ID invalid가 1명 이상.
- 승인자가 없는 상태에서 real send가 필요한 경우.
