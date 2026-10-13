document.addEventListener("DOMContentLoaded", () => {
  // 백엔드 파일에 맞게 둘 중 하나만 사용하세요.
  const API_URL = "/api"; 
  // const API_URL = "/api/recommend";

  const form =
    document.querySelector("#recommendForm") ||
    document.querySelector("form");

  const locationInput =
    document.querySelector("#location") ||
    document.querySelector("[name='location']");

  const ageInput =
    document.querySelector("#age") ||
    document.querySelector("[name='age']");

  const themeInput =
    document.querySelector("#theme") ||
    document.querySelector("[name='theme']");

  let resultBox =
    document.querySelector("#result") ||
    document.querySelector(".result");

  const submitButton =
    document.querySelector("button[type='submit']") ||
    document.querySelector("button");

  if (!form || !locationInput || !ageInput || !themeInput) {
    console.error("폼 또는 입력 요소를 찾을 수 없습니다. index.html의 id/name을 확인하세요.");
    return;
  }

  // 결과 출력 박스가 없으면 자동 생성
  if (!resultBox) {
    resultBox = document.createElement("div");
    resultBox.id = "result";
    resultBox.style.marginTop = "20px";
    resultBox.style.padding = "16px";
    resultBox.style.border = "1px solid #ddd";
    resultBox.style.borderRadius = "12px";
    resultBox.style.backgroundColor = "#f9f9f9";
    resultBox.style.whiteSpace = "pre-wrap";
    form.insertAdjacentElement("afterend", resultBox);
  }

  function showMessage(message, isError = false) {
    resultBox.textContent = message;
    resultBox.style.whiteSpace = "pre-wrap";
    resultBox.style.color = isError ? "#c62828" : "#222";
    resultBox.style.backgroundColor = isError ? "#fff3f3" : "#f9f9f9";
    resultBox.style.border = isError
      ? "1px solid #f1b0b0"
      : "1px solid #ddd";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const location = locationInput.value.trim();
    const age = ageInput.value.trim();
    const theme = themeInput.value.trim();

    if (!location || !age || !theme) {
      showMessage("장소, 나이, 테마를 모두 입력해주세요.", true);
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "추천 생성 중...";
    }

    showMessage("AI가 자연 놀이를 추천하고 있어요. 잠시만 기다려주세요...");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20초

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          location,
          age,
          theme
        }),
        signal: controller.signal
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "서버 요청에 실패했습니다.");
      }

      showMessage(data.result || "추천 결과가 없습니다.");
    } catch (error) {
      if (error.name === "AbortError") {
        showMessage("응답이 지연되고 있어요. 잠시 후 다시 시도해주세요.", true);
      } else {
        showMessage(error.message || "오류가 발생했습니다. 다시 시도해주세요.", true);
      }
    } finally {
      clearTimeout(timeoutId);

      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "추천 받기";
      }
    }
  });
});