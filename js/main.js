document.addEventListener("DOMContentLoaded", () => {
  const locationInput = document.getElementById("location");
  const ageInput = document.getElementById("age");
  const themeInput = document.getElementById("theme");
  const recommendBtn = document.getElementById("recommendBtn");
  const resultBox = document.getElementById("result");
  const statusBox = document.getElementById("status");

  function showMessage(message, type = "info") {
    statusBox.textContent = message;
    statusBox.className = `status ${type}`;
  }

  function showResult(message) {
    resultBox.textContent = message;
  }

  recommendBtn.addEventListener("click", async () => {
    const location = locationInput.value.trim();
    const age = ageInput.value.trim();
    const theme = themeInput.value.trim();

    if (!location || !age || !theme) {
      showMessage("장소, 나이, 테마를 모두 입력해주세요.", "error");
      showResult("");
      return;
    }

    showMessage("AI가 자연 놀이를 추천하고 있어요...", "loading");
    showResult("");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch("/api", {
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
        showMessage(data.error || "요청 처리 중 오류가 발생했습니다.", "error");
        showResult("");
        return;
      }

      showMessage("추천이 완료됐어요!", "success");
      showResult(data.result || "결과가 비어 있습니다.");
    } catch (error) {
      if (error.name === "AbortError") {
        showMessage("응답이 지연되고 있어요. 잠시 후 다시 시도해주세요.", "error");
      } else {
        showMessage("네트워크 또는 서버 오류가 발생했습니다.", "error");
      }
      showResult("");
    } finally {
      clearTimeout(timeoutId);
    }
  });
});