선우택배 (기기공용 저장 버전)

- index.html / kiosk.html: UI는 그대로, 데이터는 Netlify Blobs(서버)로 저장되어 기기 바뀌어도 유지됨
- tracking.html / label.html: /api/reservations 기반 조회

배포(Netlify + GitHub):
1) 이 폴더 내용을 그대로 레포 루트에 업로드/커밋
2) Netlify에서 Build settings:
   - Build command: (비움)
   - Publish directory: .
3) /api/ping 접속해서 OK 뜨면 함수 연결 성공
