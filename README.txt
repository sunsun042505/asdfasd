선우택배 서버저장 버전(v1) - build 2025-12-31 15:48:00 KST

✅ 너가 말한 문제를 같이 해결
- 키오스크: 점포코드 로그인 복구
- 키오스크에서 접수/발급하면: 서버(Netlify Blobs)에 저장됨 → 점포/기사 화면 + 배송조회 + 라벨에서 바로 뜸
- 라벨 출력 버튼: 발급 완료 화면에 있음
- 시간/클릭 먹통: DOMContentLoaded로 고침

배포(중요)
- GitHub에 올려도 되지만, 배포는 Netlify로 해야 /api 가 동작함.
- Netlify site 설정에서 repo 연결(자동배포)되어 있으면 push할 때마다 자동 반영.

확인
1) 메인에서 "/api/kv/get 테스트" → OK
2) 점포등록 → 키오스크 점포 로그인 → 현장접수 발급 → 배송조회(invoice_no=...) 확인
3) 점포화면 로그인하면 목록 뜨는지, 기사화면 로그인하면 집화 대기 뜨는지 확인

파일
- index.html / kiosk.html / tracking.html / label.html / style.css / client.js
- netlify.toml / package.json
- netlify/functions/data.mjs
