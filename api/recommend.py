from http.server import BaseHTTPRequestHandler
import json
import os
from openai import OpenAI

class handler(BaseHTTPRequestHandler):

    def do_POST(self):
        # 요청 본문 읽기
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        data = json.loads(body)

        age = data.get('age', '')
        weather = data.get('weather', '')
        place = data.get('place', '')

        # 빈 입력 체크
        if not age or not weather or not place:
            self.send_response(400)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': '필수값이 누락되었습니다.'}).encode())
            return

        # OpenAI 호출
        try:
            client = OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))

            prompt = (
                f"아이 나이: {age}\n"
                f"날씨: {weather}\n"
                f"장소: {place}\n\n"
                "위 조건에 맞는 자연 놀이 활동을 3가지 추천해줘. "
                "각 활동마다 이름, 방법, 기대 효과를 간단히 설명해줘. "
                "친근하고 따뜻한 말투로 부모에게 말하듯이 써줘."
            )

            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "당신은 아이 자연 놀이 전문가입니다. 부모에게 친절하게 놀이를 추천해주세요."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=800
            )

            result = response.choices[0].message.content

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'result': result}).encode())

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())