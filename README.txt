# Sunwoo Takbae - Stable Pack

## Deploy (GitHub -> Netlify)
1) Put all files in repo root (same level).
2) Netlify settings:
   - Publish directory: .
   - Functions directory: netlify/functions (from netlify.toml)
3) Deploy, then test:
   - /api/ping  -> {"ok":true,...}
   - /api/kv/get?key=DELIVERY_STORES_V1
   - /api/reservations

## Notes
- All data is stored in Netlify Blobs store: "sunwoo-takbae-v1"
- Works across devices as long as you use the same deployed domain.


## IMPORTANT (데이터가 기기마다 달라지는 문제)
- 이제 localStorage 백업을 끄고(기본), Netlify Blobs(store: sunwoo-takbae-v1)에만 저장하도록 했어요.
- GitHub에 올릴 때 반드시 netlify/functions 폴더도 같이 올라가야 /api/* 가 동작합니다.
- 배포 후 테스트: /api/ping , /api/kv/get?key=DELIVERY_RESERVATIONS_V1 , /api/reservations
