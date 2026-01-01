선우택배 시스템 패치팩 v1.0
build: 2026-01-01 13:34:51 KST

포함:
- 기존 UI 유지(index/kiosk/tracking/label)
- 클릭/시간 먹통 방지: 안전한 $() 적용(없는 요소여도 크래시 X)
- 서버 저장(기기 공용): /api/kv + reservations(upsert/byWaybill)
- 메인 홈: 배송조회 버튼(goTracking) 추가
- 배송조회(tracking): /api/reservations/byWaybill/<운송장> 단건 조회로 변경([] 문제 감소)
- 키오스크: 점포명+점포코드 로그인 게이트 추가(/api/stores/login)
- 키오스크: 발급 시 점포접수 이벤트 기록 + 라벨 출력/배송조회 버튼(라벨 출력) 제공
- 버전 표시: 상단 v1.0 (서버 키 sunwoo_app_version 갱신)

업그레이드(1.1, 1.2 ...):
- index/kiosk/tracking/label 안의 APP_VERSION 값만 올리면 자동으로 서버 버전도 갱신되게 되어 있음.
