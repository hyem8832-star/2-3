import json
import os
from http.server import BaseHTTPRequestHandler
from openai import OpenAI


def get_client():
    api_key = os.environ.get("OPENAI_API_KEY")
    base_url = os.environ.get("OPENAI_API_BASE_URL")

    if not api_key:
        raise ValueError("OPENAI_API_KEY environment variable is missing.")

    client_options = {"api_key": api_key}
    if base_url:
        client_options["base_url"] = base_url

    return OpenAI(**client_options)


SYSTEM_PROMPT = """
너는 자연 놀이 추천 전문가다.
사용자의 입력(장소, 아이 나이, 원하는 분위기/테마)을 바탕으로
부모와 아이가 함께 할 수 있는 자연 놀이 활동을 추천해라.

반드시 아래 형식으로 답변해라.

1. 추천 활동 이름
2. 왜 이 활동이 잘 맞는지
3. 준비물
4. 진행 방법 3단계
5. 안전 팁
6. 한 줄 응원 메시지

답변은 친절하고 이해하기 쉬운 한국어로 작성해라.
""".strip()


class handler(BaseHTTPRequestHandler):
    def _set_headers(self, status_code=200):
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(200)
        self.wfile.write(b"")

    def do_GET(self):
        self._set_headers(200)
        self.wfile.write(
            json.dumps(
                {
                    "message": "Nature Play API is running."
                },
                ensure_ascii=False
            ).encode("utf-8")
        )

    def do_POST(self):
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            raw_body = self.rfile.read(content_length)

            if not raw_body:
                self._set_headers(400)
                self.wfile.write(
                    json.dumps(
                        {"error": "요청 본문이 비어 있습니다."},
                        ensure_ascii=False
                    ).encode("utf-8")
                )
                return

            data = json.loads(raw_body.decode("utf-8"))

            location = str(data.get("location", "")).strip()
            age = str(data.get("age", "")).strip()
            theme = str(data.get("theme", "")).strip()

            if not location or not age or not theme:
                self._set_headers(400)
                self.wfile.write(
                    json.dumps(
                        {"error": "장소, 나이, 테마를 모두 입력해주세요."},
                        ensure_ascii=False
                    ).encode("utf-8")
                )
                return

            client = get_client()
            model = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")

            user_prompt = f"""
장소: {location}
아이 나이: {age}
원하는 테마/분위기: {theme}

위 조건에 맞는 자연 놀이를 1개 추천해줘.
실제로 부모가 바로 따라할 수 있게 구체적으로 설명해줘.
""".strip()

            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7
            )

            result_text = response.choices[0].message.content.strip()

            self._set_headers(200)
            self.wfile.write(
                json.dumps(
                    {"result": result_text},
                    ensure_ascii=False
                ).encode("utf-8")
            )

        except json.JSONDecodeError:
            self._set_headers(400)
            self.wfile.write(
                json.dumps(
                    {"error": "JSON 형식이 올바르지 않습니다."},
                    ensure_ascii=False
                ).encode("utf-8")
            )

        except Exception as e:
            self._set_headers(500)
            self.wfile.write(
                json.dumps(
                    {"error": f"서버 오류가 발생했습니다: {str(e)}"},
                    ensure_ascii=False
                ).encode("utf-8")
            )