from flask import Flask, request, jsonify
from openai import OpenAI
import os

app = Flask(__name__)

@app.route('/api/recommend', methods=['POST'])
def recommend():
    data = request.get_json()
    location = data.get('location', '')
    age = data.get('age', '')
    theme = data.get('theme', '')

    client = OpenAI(
        api_key=os.environ.get('OPENAI_API_KEY'),
        base_url=os.environ.get('OPENAI_API_BASE_URL')
    )

    prompt = f"장소: {location}, 나이: {age}, 테마: {theme}에 맞는 자연 놀이 활동 3가지를 추천해줘. 각각 제목과 설명을 포함해서 한국어로 답해줘."

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}]
    )

    result = response.choices[0].message.content
    return jsonify({"result": result})

# ✅ Vercel용 handler
def handler(request):
    with app.test_request_context(
        path=request.path,
        method=request.method,
        data=request.get_data(),
        content_type=request.content_type
    ):
        return app.full_dispatch_request()