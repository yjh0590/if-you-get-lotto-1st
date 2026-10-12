# IF 세계를 기존 GitHub 사이트에 연결하기

현재 게임은 정적 HTML/CSS/JavaScript입니다. 서버나 비밀키 없이 하위 경로에서 동작합니다. 이 전달본은 사용자가 직접 연결하도록 준비한 파일입니다. GitHub 저장소 업로드나 사이트 배포는 실행하지 않았습니다.

## 기존 개인 홈페이지에 게임을 추가할 때

1. 저장소의 기존 배포 구성을 먼저 확인합니다.
2. `npm run export:web`로 `exports/if-world/` 폴더를 만듭니다.
3. 기존 사이트의 정적 파일 경로 아래 `projects/if-world/` 같은 위치에 이 폴더의 내용을 넣습니다.
4. 홈페이지에 `/projects/if-world/` 링크를 추가합니다.
5. 기존 사이트의 배포 작업으로 배포합니다.

경로가 `projects/if-world/`라면 그 안에 `index.html`, `app.js`, `styles.css`와 모든 데이터 모듈이 함께 있어야 합니다. 자산 경로는 상대 경로이므로 서브폴더에 넣을 수 있습니다. Vite/Next.js 사이트라면 보통 해당 프레임워크의 public 폴더 아래에 정적 게임을 넣을 수 있으나 실제 저장소 구조에 맞춰 확인해야 합니다.

기존 홈페이지 저장소에서는 아래 단독 Pages 워크플로를 그대로 실행하지 마세요. 저장소의 Pages 홈페이지 전체를 게임으로 대체하는 작업입니다. 연결 대상의 구조를 확인한 뒤 기존 배포에 맞춰 통합해야 합니다.

## IF 세계 전용 저장소로 배포할 때

- 프로젝트 소스와 `.github/workflows/if-world-pages.yml`을 저장소에 넣습니다. `.openai/`와 기존 프로젝트 Git 정보는 가져가지 않습니다.
- 저장소 Settings → Pages → Source에서 GitHub Actions를 선택합니다.
- Actions → IF World standalone Pages (manual) → Run workflow로 실행합니다.
- 테스트와 빌드 확인 뒤 `dist/`를 Pages에 배포합니다.

푸시 자동 배포는 현재 켜지 않았습니다. 대상 저장소와 공개 범위를 확인한 뒤 원하는 브랜치에 맞춰 추가할 수 있습니다. 사용자 지정 도메인이나 기존 CNAME은 이 파일에서 설정하지 않습니다.

## 저장 기록

기록은 브라우저 localStorage에 저장됩니다. 기존 사이트와 현재 IF 사이트는 주소가 다르면 기록을 자동 공유하지 않습니다. ‘선택의 기록’에서 JSON을 내려받고 새 주소에서 불러오면 이어서 플레이할 수 있습니다. 서버 동기화는 없습니다.

## 확인된 범위

게임 로직·정적 빌드는 로컬에서 검증했습니다. GitHub 계정 연결·원격 저장소 업로드·Actions 실행·사용자 사이트 연결은 아직 완료하지 않았습니다. 실제 배포 후 브라우저 화면과 경로를 확인해야 합니다.

공식 참고: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
