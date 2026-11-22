@AGENTS.md

# haejin-log

- 구현 기준(요구사항, 확정된 결정): `docs/SPEC.md`. "결정 사항"은 바꾸지 않고, 문서에 없는 결정은 질문한다.
- 진행 상황, 결정 이유, 겪은 문제, 다음 할 일: `docs/PROGRESS.md`. 작업을 시작할 때 먼저 읽고, 작업 단위(Phase, 추가 기능, 중요한 결정)가 끝날 때마다 갱신한다.

@docs/SPEC.md
@docs/PROGRESS.md

## 작업 규칙

- 커밋은 사용자가 요청할 때만 한다.
- 완료 조건 확인: `pnpm lint && pnpm test` (`test`는 빌드한 뒤 Playwright를 실행한다).
- 콘텐츠 검증은 `velite build --strict`로 한다. `--strict` 플래그를 빼면 안 된다 (이유는 PROGRESS.md 참고).
- TypeScript는 6.x로 고정한다.
- 동적 경로는 `lib/route-params.ts`의 `toStaticParams`와 `decodeParam`을 거친다 (Next dev의 한글 파라미터 500 문제 회피, 값이 0개일 때 export 빌드 실패 회피).
- dev 서버를 확인할 때는 3000이 아닌 포트(`next dev -p 3005`)를 쓰고, 종료할 때는 띄운 PID만 kill한다. 사용자가 3000에서 dev를 띄워두고 있을 수 있다.
