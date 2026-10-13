const recommendForm = document.getElementById("recommendForm");
const locationInput = document.getElementById("location");
const ageInput = document.getElementById("age");
const themeInput = document.getElementById("theme");
const submitButton = document.getElementById("submitButton");
const statusMessage = document.getElementById("statusMessage");
const resultContent = document.getElementById("resultContent");

const API_URL = "/api/recommend";

function setStatus(message, type = "") {
  statusMessage.textContent = message;
  statusMessage.className = "status-message";

  if (type) {
    statusMessage.classList.add(type);
  }
}

function setLoading(isLoading) {
  if (isLoading) {
    submitButton.disabled = true;
    submitButton.textContent = "추천 생성 중...";
    setStatus("AI가 자연 놀이를 추천하고 있어요. 잠시만 기다려주세요.", "");
  } else {
    submitButton.disabled = false;
    submitButton.textContent = "추천 받기";
  }
}

function validateInputs(location, age, theme) {
  if (!location || !age || !theme) {
    return "장소, 아이 나이, 원하는 테마를 모두 입력해주세요.";
  }

  if (location.length > 100) {
    return "장소 입력은 100자 이내로 작성해주세요.";
  }

  if (age.length > 50) {
    return "아이 나이는 50자 이내로 작성해주세요.";
  }

  if (theme.length > 100) {
    return "테마 입력은 100자 이내로 작성해주세요.";
  }

  return "";
}

async function fetchWithTimeout(url, options, timeout = 30000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

recommendForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const location = locationInput.value.trim();
  const age = ageInput.value.trim();
  const theme = themeInput.value.trim();

  const validationMessage = validateInputs(location, age, theme);

  if (validationMessage) {
    setStatus(validationMessage, "error");
    resultContent.textContent = "입력값을 확인한 뒤 다시 시도해주세요.";
    return;
  }

  setLoading(true);
  resultContent.textContent = "추천 결과를 불러오는 중입니다...";

  try {
    const response = await fetchWithTimeout(
      API_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          location: location,
          age: age,
          theme: theme
        })
      },
      30000
    );

    let data = {};

    try {
      data = await response.json();
    } catch (jsonError) {
      throw new Error("서버 응답을 읽을 수 없습니다.");
    }

    if (!response.ok) {
      const errorMessage = data.error || "AI 추천을 가져오지 못했습니다.";
      throw new Error(errorMessage);
    }

    if (!data.result) {
      throw new Error("AI 추천 결과가 비어 있습니다.");
    }

    resultContent.textContent = data.result;
    setStatus("추천이 완료되었습니다.", "success");
  } catch (error) {
    console.error("AI 추천 오류:", error);

    if (error.name === "AbortError") {
      setStatus("응답 시간이 너무 오래 걸립니다. 잠시 후 다시 시도해주세요.", "error");
      resultContent.textContent = "AI 응답이 지연되고 있습니다. 다시 시도해주세요.";
      return;
    }

    setStatus(error.message || "오류가 발생했습니다. 잠시 후 다시 시도해주세요.", "error");
    resultContent.textContent = "추천 결과를 가져오지 못했습니다.";
  } finally {
    setLoading(false);
  }
});