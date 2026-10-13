import json
import os
from http.server import BaseHTTPRequestHandler
from openai import OpenAI


SYSTEM_PROMPT = """
너는 자연 놀이 추천 전문가다.
사용자의 입력값을 바탕으로 아이와 보호자가 함께 할 수 있는 자연 놀이를 추천한다.

답변은 반드시 아래 형식으로 작성한다.

1. 추천 활동 이름
2. 추천 이유
3. 준비물
4. 진행 방법 3단계
5. 안전 팁
6. 한 줄 응원 메시지

답변은 친절하고 쉬운 한국어로 작성한다.
""".strip()


def create_openai_client():
    api_key = os.environ.get("OPENAI_API_KEY")
    base_url = os.environ.get("OPENAI_API_BASE_URL")

    if not api_key:
        raise ValueError("OPENAI_API_KEY 환경변수가 설정되지 않았습니다.")

    client_options = {
        "api_key": api_key
    }

    if base_url:
        client_options["base_url"] = base_url

    return OpenAI(**client_options)


class handler(BaseHTTPRequestHandler):
    def set_json_headers(self, status_code=200):
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def send_json(self, status_code, data):
        self.set_json_headers(status_code)
        response = json.dumps(data, ensure_ascii=False)
        self.wfile.write(response.encode("utf-8"))

    def do_OPTIONS(self):
        self.send_json(200, {"message": "ok"})

    def do_GET(self):
        self.send_json(200, {"message": "Nature Play API is running."})

    def do_POST(self):
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            raw_body = self.rfile.read(content_length)

            if not raw_body:
                self.send_json(400, {"error": "요청 본문이 비어 있습니다."})
                return

            try:
                data = json.loads(raw_body.decode("utf-8"))
            except json.JSONDecodeError:
                self.send_json(400, {"error": "JSON 형식이 올바르지 않습니다."})
                return

            location = str(data.get("location", "")).strip()
            age = str(data.get("age", "")).strip()
            theme = str(data.get("theme", "")).strip()

            if not location or not age or not theme:
                self.send_json(400, {"error": "장소, 나이, 테마를 모두 입력해주세요."})
                return

            client = create_openai_client()
            model = os.environ.get("OPENAI_MODEL", "gpt-5-mini")

            user_prompt = f"""
아래 조건에 맞는 자연 놀이를 추천해줘.

장소: {location}
아이 나이: {age}
원하는 테마: {theme}

부모가 바로 따라 할 수 있도록 구체적이고 안전하게 설명해줘.
""".strip()

            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt}
                ]
            )

            result = ""

            if response and response.choices:
                message = response.choices[0].message
                if message and message.content:
                    result = message.content.strip()

            if not result:
                self.send_json(500, {"error": "AI 응답이 비어 있습니다. 다시 시도해주세요."})
                return

            self.send_json(200, {"result": result})

        except ValueError as error:
            self.send_json(500, {"error": str(error)})

        except Exception:
            self.send_json(500, {"error": "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요."})
