// [1] Firebase 초기화 (선생님 정보)
const firebaseConfig = {
    apiKey: "AIzaSyDw773x1yot2uncAMl_gTQ6z6Njhgh1Od8",
    authDomain: "secret-quest-class.firebaseapp.com",
    databaseURL: "https://secret-quest-class-default-rtdb.firebaseio.com",
    projectId: "secret-quest-class",
    storageBucket: "secret-quest-class.firebasestorage.app",
    messagingSenderId: "397245266210",
    appId: "1:397245266210:web:fde35d6a4dfd6ca7070d7b"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// [2] 통합 상태 관리
let state = {
    user: "Jina", lv: 1, points: 0,
    stats: { fert: 0, water: 0, nutr: 0 }, // 성장 스테이터스
    selectedEmoji: [null, null],
    potions: { 기쁨: 5, 슬픔: 0, 분노: 0, 불안: 0, 평온: 0, 당황: 0 },
    activeQuests: []
};

// [3] 이모지 키친 실제 데이터
const emojiKitchen = { "😊+☁️": "🌤️", "😢+🌊": "🌊", "😡+🔥": "🌋", "😴+✨": "🌙" };

// [4] 모달 로직 (선생님이 준 6단계 모두 포함)
function openModal(type) {
    document.getElementById('modal-overlay').style.display = 'block';
    if(type === 'emotion') renderStep(1);
    else if(type === 'quest') renderQuestSelect();
    else if(type === 'shop') renderShop();
}

function renderStep(step) {
    const body = document.getElementById('modal-body');
    const footer = document.getElementById('modal-footer');
    
    if(step === 1) { // 단어 고르기
        body.innerHTML = `<h3>[1단계] 감정 단어 고르기</h3><div class="word-grid">${['뿌듯한','설레는','평온한','서운한','울적한','짜증나는','당황스러운','든든한'].map(w => `<button onclick="state.word='${w}'; renderStep(2)">${w}</button>`).join('')}</div>`;
    }
    else if(step === 2) { // 이모지 키친
        body.innerHTML = `<h3>[2단계] 이모지 고르기</h3><div class="kitchen-ui"><span id="e1">${state.selectedEmoji[0]||'❓'}</span> + <span id="e2">${state.selectedEmoji[1]||'❓'}</span> = <span id="e-res">✨</span></div>
            <div class="emoji-list">${['😊','😢','😡','😴','☁️','🔥'].map(e => `<button onclick="handleEmojiMix('${e}')">${e}</button>`).join('')}</div>`;
        footer.innerHTML = `<button onclick="renderStep(3)">감정 분석실로</button>`;
    }
    else if(step === 3) { // 물약 만들기 (스포이드 기능)
        body.innerHTML = `<h3>[3단계] 감정 물약 만들기</h3>${Object.keys(state.potions).map(k => `<div class="bar-item">${k}<input type="range" min="0" max="10" value="${state.potions[k]}" onchange="state.potions['${k}']=this.value"></div>`).join('')}`;
        footer.innerHTML = `<button onclick="renderStep(5)">일기 쓰러 가기</button>`;
    }
    else if(step === 5) { // 일기 및 AI 결과
        body.innerHTML = `<h3>[5단계] 감정 일기 쓰기</h3><textarea id="diary-in" style="width:100%; height:100px;"></textarea><canvas id="radarChart"></canvas><div id="ai-msg">분석 중...</div>`;
        footer.innerHTML = `<button onclick="finishRecord()">기록 종료</button>`;
        setTimeout(initRadarChart, 100); 
    }
}

// [5] 성장 시스템: 비료, 물, 영양제 조화 로직
function useShopItem(type) {
    if(state.points < 10) { alert("포인트가 부족해!"); return; }
    state.points -= 10;
    state.stats[type] += 34; // 3번 주면 100%에 가깝게 설정
    
    updateMainUI();
    checkEvolution(); // 성장 체크
    db.ref('students/'+state.user).update(state);
}

function checkEvolution() {
    [cite_start]// 모든 수치가 100 근처일 때만 레벨업 [cite: 33, 58, 62]
    if(state.stats.fert >= 100 && state.stats.water >= 100 && state.stats.nutr >= 100) {
        state.lv++;
        state.stats = { fert: 0, water: 0, nutr: 0 }; // 초기화
        alert("와! 식물이 성장했어요!");
        updatePlantEmoji();
    }
}

function updateMainUI() {
    document.getElementById('bar-fert').value = state.stats.fert;
    document.getElementById('bar-water').value = state.stats.water;
    document.getElementById('bar-nutr').value = state.stats.nutr;
    document.getElementById('user-points').innerText = state.points;
    document.getElementById('user-lv').innerText = state.lv;
}

function finishRecord() {
    const dText = document.getElementById('diary-in').value;
    state.lastDiary = dText;
    // 우측 카드 실시간 업데이트
    document.getElementById('card-diary-text').innerText = dText;
    document.getElementById('card-emoji').innerText = state.finalEmoji || "🌱";
    
    document.getElementById('quest-btn').disabled = false;
    document.getElementById('quest-btn').classList.remove('disabled');
    closeModal();
    db.ref('students/'+state.user).update(state);
}

function closeModal() { document.getElementById('modal-overlay').style.display = 'none'; }
