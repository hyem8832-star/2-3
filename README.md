# 초록놀이터

아이와 보호자가 가까운 자연에서 함께할 수 있는 놀이를 AI가 추천하는 웹 서비스입니다.

장소, 아이 나이, 원하는 테마를 입력하면 추천 활동, 추천 이유, 준비물, 진행 방법, 안전 팁을 한국어로 안내합니다.

## 주요 기능

- 장소, 아이 나이, 놀이 테마를 입력하는 추천 폼
- AI 기반 자연 놀이 추천
- 추천 이유, 준비물, 3단계 진행 방법, 안전 팁 제공
- 입력값 검증 및 오류 안내
- 모바일 화면을 고려한 정적 웹 페이지
- Vercel Python Function을 이용한 API 배포

## 프로젝트 구조

```text
2-3/
├─ api/
│  └─ recommend.py       # Vercel Python API
├─ css/
│  └─ style.css          # 웹 페이지 스타일
├─ images/               # 이미지 리소스
├─ js/
│  └─ main.js            # 폼 검증 및 API 호출
├─ index.html            # 메인 페이지
├─ requirements.txt      # Python 의존성
└─ vercel.json           # Vercel 배포 설정
```

## 실행 흐름

1. 사용자가 장소, 아이 나이, 테마를 입력합니다.
2. `js/main.js`가 입력값을 확인합니다.
3. 브라우저가 `POST /api/recommend`로 JSON 요청을 보냅니다.
4. `api/recommend.py`가 학원 OpenAI 호환 API의 Chat Completions를 호출합니다.
5. AI 추천 결과를 JSON으로 반환합니다.
6. 웹 페이지가 추천 결과를 화면에 표시합니다.

## API

### `GET /api/recommend`

API가 실행 중인지 확인합니다.

```json
{
  "message": "Nature Play API is running."
}
```

### `POST /api/recommend`

요청 본문:

```json
{
  "location": "공원",
  "age": "5살",
  "theme": "탐험"
}
```

성공 응답:

```json
{
  "result": "AI가 작성한 자연 놀이 추천 내용"
}
```

## 환경변수

Vercel 프로젝트의 `Settings → Environments`에서 설정합니다. 실제 키 값은 GitHub나 README에 기록하지 않습니다.

```text
OPENAI_API_KEY=학원에서 발급받은 API 키
OPENAI_API_BASE_URL=https://copa.codyssey.kr/v1
OPENAI_MODEL=gpt-5-mini
```

`OPENAI_MODEL`이 없으면 코드의 기본값으로 `gpt-5-mini`가 사용됩니다. 환경변수를 변경한 뒤에는 새 배포 또는 Redeploy가 필요합니다.

## 로컬 확인

```bash
pip install -r requirements.txt
python -m http.server 3000
```

정적 파일은 위 명령으로 확인할 수 있습니다. API는 Vercel 환경에서 실행하는 것을 기준으로 하며, 로컬 API 테스트에는 같은 환경변수가 필요합니다.

## Vercel 배포

1. GitHub 저장소를 Vercel 프로젝트에 연결합니다.
2. 프로젝트 환경변수에 위의 세 값을 추가합니다.
3. `master` 브랜치에 push하면 자동 배포됩니다.
4. 환경변수를 새로 저장했으면 `Deployments → 최신 배포 → Redeploy`를 실행합니다.
5. 배포가 `Ready`가 된 뒤 `/api/recommend`를 호출해 API 상태를 확인합니다.

## 주의사항

- API 키는 클라이언트 JavaScript나 HTML에 넣지 않습니다.
- 추천 결과는 참고용이며, 실제 활동 전 날씨와 장소 상태, 아이의 컨디션을 확인해야 합니다.
- API 응답이 지연되면 화면의 안내에 따라 잠시 후 다시 시도합니다.
