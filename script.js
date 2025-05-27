const wordPool = [
  // 총 100개 단어
  '사과', '바나나', '포도', '딸기', '수박', '참외', '귤', '복숭아', '자두', '오렌지',
  '김밥', '떡볶이', '라면', '피자', '햄버거', '국수', '밥', '김치', '빵', '주스',
  '사탕', '초콜릿', '우유', '요구르트', '치즈', '계란', '미역국', '된장국', '샐러드', '만두',
  '강아지', '고양이', '토끼', '호랑이', '사자', '곰', '여우', '코끼리', '돼지', '기린',
  '말', '다람쥐', '너구리', '오리', '닭', '독수리', '펭귄', '하마', '물개', '고래',
  '가방', '연필', '지우개', '공책', '의자', '책상', '시계', '우산', '컵', '신발',
  '모자', '옷', '장갑', '전화기', '텔레비전', '냉장고', '컴퓨터', '선풍기', '청소기', '거울',
  '구름', '비', '눈', '해', '달', '별', '산', '강', '바다', '나무',
  '꽃', '풀', '돌', '불', '바람', '모래', '무지개', '하늘', '연못', '숲',
  '웃음', '울음', '걷기', '달리기', '점프', '노래', '춤', '그림', '놀이', '공부'
];

const TOTAL_QUESTIONS = 20;
let words = [];
let currentWordIndex = 0;
let score = 0;

function generateQuestions() {
  const shuffled = [...wordPool].sort(() => 0.5 - Math.random());
  words = shuffled.slice(0, TOTAL_QUESTIONS).map(word => {
    const others = wordPool.filter(w => w !== word);
    const randomChoices = others.sort(() => 0.5 - Math.random()).slice(0, 4);
    const choices = [...randomChoices, word].sort(() => 0.5 - Math.random());
    return {
      word,
      correct: word,
      choices
    };
  });
  currentWordIndex = 0;
  score = 0;
}

function playWord() {
  const utterance = new SpeechSynthesisUtterance(words[currentWordIndex].word);
  utterance.lang = 'ko-KR';
  speechSynthesis.speak(utterance);
  renderChoices();
}

function renderChoices() {
  const container = document.getElementById('choices');
  const current = words[currentWordIndex];
  const counter = document.getElementById('counter');

  // ✅ 모든 자식 요소 완전히 제거 (DOM 메모리에서 제거)
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  // 카운터 업데이트
  counter.textContent = `${currentWordIndex + 1} / ${words.length}`;

  current.choices.forEach(choice => {
    const btn = document.createElement('button');
    btn.className = 'choice-button';
    btn.textContent = choice;
    btn.onclick = () => checkAnswer(choice);
    container.appendChild(btn);
  });
}

function checkAnswer(selectedText) {
  const current = words[currentWordIndex];
  const feedback = document.getElementById('feedback');

  // 모든 버튼에서 .selected 클래스 제거
  document.querySelectorAll('.choice-button').forEach(btn => {
    btn.classList.remove('selected');
  });

  // 사용자가 누른 버튼에만 .selected 클래스 추가
  const buttons = document.querySelectorAll('.choice-button');
  buttons.forEach(btn => {
    if (btn.textContent === selectedText) {
      btn.classList.add('selected');
    }
  });

  if (selectedText === current.correct) {
    score++;
    feedback.textContent = '🎉 딩동댕~';
    feedback.style.color = '#333333';
  } else {
    feedback.textContent = '❌ 땡';
    feedback.style.color = '#333333';
  }

  setTimeout(() => {
    feedback.textContent = '';
    currentWordIndex++;
    if (currentWordIndex < words.length) {
      playWord();
    } else {
      showFinalResult();
    }
  }, 800);
}

function showFinalResult() {
  const container = document.getElementById('choices');
  const feedback = document.getElementById('feedback');
  const speakBtn = document.getElementById('speakBtn');

  speakBtn.style.display = 'none'; // 다시 듣기 숨기기
  container.innerHTML = '';
  feedback.innerHTML = `게임 끝!<br>${words.length}문제 중 <strong>${score}</strong>개 맞혔어요! 🎉`;

  const restartBtn = document.createElement('button');
  restartBtn.textContent = '다시 시작';
  restartBtn.className = 'speak-btn';
  restartBtn.onclick = () => {
    generateQuestions();
    feedback.innerHTML = ''; // ✅ 다시 시작 시 결과 문구 숨기기
    speakBtn.style.display = 'inline-block'; // 다시 듣기 복원
    playWord();
  };
  container.appendChild(restartBtn);
}


window.onload = () => {
  generateQuestions();
  playWord();
};
