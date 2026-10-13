// =====================
// 섹션 전환 기능
// =====================
function showSection(sectionId) {
  var sections = document.querySelectorAll('.section');
  sections.forEach(function(s) {
    s.classList.remove('active');
  });

  var target = document.getElementById(sectionId);
  if (target) {
    target.classList.add('active');
  }

  if (sectionId === 'mypage') {
    loadSaved();
  }
}

// =====================
// AI 추천 기능
// =====================
async function getRecommend() {
  var age = document.getElementById('age').value;
  var weather = document.getElementById('weather').value;
  var place = document.getElementById('place').value;
  var errorMsg = document.getElementById('error-msg');

  if (!age || !weather || !place) {
    errorMsg.style.display = 'block';
    return;
  }
  errorMsg.style.display = 'none';

  document.getElementById('loading').style.display = 'block';
  document.getElementById('result-box').style.display = 'none';

  try {
    var response = await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ age: age, weather: weather, place: place })
    });

    if (!response.ok) throw new Error('API 오류');

    var data = await response.json();
    document.getElementById('result-text').innerText = data.result;
    document.getElementById('result-box').style.display = 'block';

    window.currentResult = {
      age: age,
      weather: weather,
      place: place,
      result: data.result
    };

  } catch (error) {
    document.getElementById('result-text').innerText =
      '⚠️ 오류가 발생했어요. 잠시 후 다시 시도해주세요.';
    document.getElementById('result-box').style.display = 'block';

  } finally {
    document.getElementById('loading').style.display = 'none';
  }
}

// =====================
// 저장 기능
// =====================
function saveResult() {
  if (!window.currentResult) {
    alert('저장할 추천 결과가 없어요!');
    return;
  }

  var saved = JSON.parse(localStorage.getItem('savedPlays') || '[]');

  var newItem = {
    id: Date.now(),
    age: window.currentResult.age,
    weather: window.currentResult.weather,
    place: window.currentResult.place,
    result: window.currentResult.result,
    date: new Date().toLocaleDateString('ko-KR')
  };

  saved.unshift(newItem);
  localStorage.setItem('savedPlays', JSON.stringify(saved));
  alert('💾 저장되었어요! 마이페이지에서 확인하세요.');
}

// =====================
// 저장 목록 불러오기
// =====================
function loadSaved() {
  var saved = JSON.parse(localStorage.getItem('savedPlays') || '[]');
  var list = document.getElementById('saved-list');
  var emptyMsg = document.getElementById('empty-msg');

  list.innerHTML = '';

  if (saved.length === 0) {
    emptyMsg.style.display = 'block';
    return;
  }

  emptyMsg.style.display = 'none';

  saved.forEach(function(item) {
    var div = document.createElement('div');
    div.className = 'saved-item';
    div.innerHTML =
      '<p class="tag">📅 ' + item.date +
      ' | 👶 ' + item.age +
      ' | ☀️ ' + item.weather +
      ' | 📍 ' + item.place + '</p>' +
      '<p>' + item.result + '</p>' +
      '<button class="btn-delete" onclick="deleteItem(' + item.id + ')">🗑️ 삭제</button>';
    list.appendChild(div);
  });
}

// =====================
// 삭제 기능
// =====================
function deleteItem(id) {
  var saved = JSON.parse(localStorage.getItem('savedPlays') || '[]');
  saved = saved.filter(function(item) {
    return item.id !== id;
  });
  localStorage.setItem('savedPlays', JSON.stringify(saved));
  loadSaved();
}