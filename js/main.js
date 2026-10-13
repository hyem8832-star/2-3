// API 주소 (api/recommend.py 와 연결됨)
const API_URL = "/api/recommend";

// HTML 요소 가져오기
const form = document.getElementById("recommend-form");
const resultBox = document.getElementById("result-box");
const submitBtn = document.getElementById("submit-btn");

// 폼 제출 이벤트
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // 입력값 가져오기
  const type = document.getElementById("type").value.trim();
  const age = document.getElementById("age").value.trim();
  const period = document.getElementById("period").value.trim();

  // 1. 빈 입력 처리
  if (!type || !age || !period) {
    resultBox.textContent = "⚠️ 필수값을 모두 입력하세요.";
    return;
  }

  // 로딩 상태 표시
  submitBtn.disabled = true;
  resultBox.textContent = "🌱 추천 결과를 불러오는 중입니다...";

  try {
    // 2. 타임아웃 설정 (10초)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    // 3. 백엔드로 요청 보내기
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type, age, period }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // 4. API 오류 처리
    if (!response.ok) {
      resultBox.textContent =
        "❌ 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
      submitBtn.disabled = false;
      return;
    }

    // 5. 결과 표시
    const data = await response.json();
    resultBox.textContent = data.result || "추천 결과가 없습니다.";
  } catch (error) {
    // 6. 타임아웃 / 네트워크 오류 처리
    if (error.name === "AbortError") {
      resultBox.textContent =
        "⏳ 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요.";
    } else {
      resultBox.textContent =
        "❌ 네트워크 오류가 발생했습니다. 다시 시도해주세요.";
    }
  } finally {
    submitBtn.disabled = false;
  }
});