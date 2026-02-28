// Firebase 설정 (공통)
const firebaseConfig = { apiKey: "AIzaSyDw773x1yot2uncAMl_gTQ6z6Njhgh1Od8", databaseURL: "https://secret-quest-class-default-rtdb.firebaseio.com", projectId: "secret-quest-class" };
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let user = { id: "Student_01", points: 0, emoji: [], tags: "", diary: "", potions: {기쁨:0, 슬픔:0, 분노:0, 불안:0, 평온:0} };

function startGame() { document.getElementById('start-screen').style.display='none'; document.getElementById('app-container').style.display='flex'; }

function openPopup(mode) {
    document.getElementById('modal-overlay').style.display = 'block';
    const body = document.getElementById('modal-body');
    const foot = document.getElementById('modal-footer');
    body.innerHTML = ""; foot.innerHTML = "";

    if (mode === 'emotion') renderEmotionStep(1);
    else if (mode === 'quest') renderQuest();
    else if (mode === 'shop') renderShop();
}

// 1. 감정 기록 6단계 로직
function renderEmotionStep(step) {
    const body = document.getElementById('modal-body');
    const foot = document.getElementById('modal-footer');
    
    if(step === 1) {
        const words = ['뿌듯함','설레임','평온함','당황함','서운함','울적함','화남','무서움'];
        body.innerHTML = `<h2>[1단계] 오늘을 대표하는 단어</h2><div class="grid-8">${words.map(w => `<button class="pixel-btn" onclick="user.tags='#${w}'; renderEmotionStep(2)">${w}</button>`).join('')}</div>`;
    } else if(step === 2) {
        const emos = ['😊','😢','😡','🥰','😱','🤔','😴','🥳'];
        body.innerHTML = `<h2>[2단계] 이모지 키친 (2개 선택)</h2><div class="kitchen-box">${user.emoji[0]||'❓'} + ${user.emoji[1]||'❓'}</div>
                          <div class="grid-8">${emos.map(e => `<button class="pixel-btn" onclick="mix('${e}')">${e}</button>`).join('')}</div>`;
        foot.innerHTML = `<button class="pixel-btn" onclick="renderEmotionStep(3)">다음 단계</button>`;
    } else if(step === 3) {
        body.innerHTML = `<h2>[3단계] 감정 물약 농도</h2>${Object.keys(user.potions).map(p => `<div>${p} <input type="range" onchange="user.potions['${p}']=this.value"></div>`).join('')}`;
        foot.innerHTML = `<button class="pixel-btn" onclick="renderEmotionStep(5)">결과 분석</button>`;
    } else if(step === 5) {
        body.innerHTML = `<h2>[5단계] 오늘의 일기</h2><textarea id="diary-text" style="width:100%; height:150px; font-size:1.2rem;"></textarea>
                          <h2>[6단계] 감정 리포트</h2><canvas id="emotionChart" width="400" height="200"></canvas>`;
        foot.innerHTML = `<button class="pixel-btn" onclick="saveEmotion()">기록 종료</button>`;
        setTimeout(initChart, 100);
    }
}

function mix(e) { if(user.emoji.length < 2) user.emoji.push(e); else user.emoji = [e]; renderEmotionStep(2); }

function saveEmotion() {
    user.diary = document.getElementById('diary-text').value;
    document.getElementById('card-emoji').innerText = user.emoji.join('') || '🌱';
    document.getElementById('card-tags').innerText = user.tags;
    document.getElementById('card-diary').innerText = user.diary;
    document.getElementById('modal-overlay').style.display = 'none';
}

// 2. 퀘스트 로직
function renderQuest() {
    const body = document.getElementById('modal-body');
    body.innerHTML = `<h2>📜 오늘의 감정 퀘스트</h2><p>오늘 친구에게 '고마워'라고 3번 말하기</p>
                      <button class="pixel-btn" onclick="acceptQuest()">퀘스트 수락</button>`;
}
function acceptQuest() {
    document.getElementById('quest-content').innerText = "진행중: 친구에게 '고마워'라고 말하기";
    document.getElementById('done-btn').style.display = "block";
    document.getElementById('modal-overlay').style.display = 'none';
}

// 3. 상점 로직
function renderShop() {
    document.getElementById('modal-body').innerHTML = `<h2>🏪 원예 상점</h2><p>보유 포인트: ${user.points}G</p>
        <div class="grid-8"><button class="pixel-btn">비료(5G)</button><button class="pixel-btn">성장촉진제(10G)</button></div>`;
}

function initChart() {
    new Chart(document.getElementById('emotionChart'), {
        type: 'radar',
        data: { labels: Object.keys(user.potions), datasets: [{ data: Object.values(user.potions), backgroundColor: 'rgba(247, 208, 49, 0.5)' }] }
    });
}
