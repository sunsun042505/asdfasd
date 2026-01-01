선우택배 패치 v1.0 (fix2)

이번에 고친 것(사용자 에러 기준):
1) kiosk.html: 'await is only valid...' 에러 해결
   - <script> 전체를 (async()=>{ ... })(); 로 감싸서 top-level await를 없앰.

2) /api/ping: NO_ROUTE 해결
   - netlify/functions/data.mjs에 GET /ping(/api/ping) 라우트 추가.

3) 메인 버튼/시간 클릭 먹통 방지
   - const $ 를 안전한 getter로 교체(없는 id여도 크래시 X) -> 스크립트가 중간에 안 죽어서 goTracking 등 클릭이 살아남.

4) 메인 메뉴 배송조회(goTracking) 강제 보장 + 클릭 이동
5) 기사 화면에 배송조회 버튼 추가(c_track) -> 선택 운송장 tracking.html로 이동

중요:
- netlify.toml 리다이렉트는 반드시 /api/* -> /.netlify/functions/data/:splat 로 써야 함.
