# Sunwoo Takbae (rebuild pack)

## Files
- index.html (main)
- kiosk.html
- tracking.html
- label.html
- netlify/functions/*
- netlify.toml
- package.json

## Deploy (Netlify + GitHub)
1) Push this folder contents to repo root.
2) In Netlify site settings:
   - Build command: (empty)
   - Publish directory: .
3) Deploy. Then test:
   - /api/kv/get?key=TEST
   - /api/reservations


[V2] Added /api/ping and UI banner when API is offline to prevent '기기 바뀌면 데이터 사라짐' 착시(로컬/다른 origin 접속).