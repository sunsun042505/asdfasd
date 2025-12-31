기존 UI + 서버저장(기기공용) 패치팩 v1
build: 2025-12-31 16:04:25 KST

✅ 바뀐 점
- 기존 index.html / kiosk.html UI는 그대로 두고, 데이터 저장만 서버(/api, Netlify Blobs)로 전환
- 점포/기사/접수 데이터: 기기 공용 (서버 저장)
- 로그인(세션): 기기별(세션스토리지)로만 유지(로그인 유지 X)
- 키오스크: 점포명+점포코드 로그인 게이트 복구
- 키오스크: 운송장 발급 후 '운송장 출력(라벨)' + '배송조회' 버튼 추가

중요
- Netlify 배포가 반드시 되어야 /api 가 동작함 (GitHub → Netlify 자동배포 OK)
- netlify.toml / package.json / netlify/functions/data.mjs 가 레포에 있어야 함

테스트
1) index.html 에서 /api 테스트 OK 확인
2) 점포 등록 → 키오스크 점포 로그인 → 현장접수 발급 → tracking/label 확인
