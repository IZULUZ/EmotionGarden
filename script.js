// [1] Firebase 초기화
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

// [2] 상태 데이터
let state = {
    user: "Jina", lv: 1, points: 0,
    stats: { fert: 0, water: 0, nutr: 0 },
    potions: { 기쁨: 5, 슬픔: 0, 분노: 0, 불안: 0, 평온: 0, 당황: 0 },
    selectedEmoji: [null, null],
    word: "", tags: "", diary: "", activeQuests: []
};

// [3] 이모지 키친 조합
const kitchenDB = { "😊+☁️": "🌤️", "😢+🌊": "🌊", "😡+🔥": "🌋", "🤔+💡": "🧐" };

// [4] 모달 제어 (PDF 6단계)
function openModal(type) {
    document.getElementById('modal-overlay').style.display = 'block';
    if(type === 'emotion') renderStep(1);
    else if(type === 'quest') renderQuestStep();
    else if(type === 'shop') renderShop();
}

function renderStep(step) {
    const content = document.getElementById('modal-step-content');
    const nav = document.getElementById('modal-navigation');

    if(step === 1) { // 1단계: 단어 고르기 (PDF Page 3)
        content.innerHTML = `<h3>[1단계] 감정 단어 고르기</h3><div class="word-grid">${['뿌듯한','설레는','평온한','신나는','든든한','서운한','외로운','울적한','짜증나는','당황스러운'].map(w => `<button onclick="state.word='${w}'; renderStep(2)">${w}</button>`).join('')}</div><p>오늘 나의 감정은 [${state.word || '... '}]에 가까워</p>`;
    }
    else if(step === 2) { // 2단계: 이모지 키친 (PDF Page 3)
        content.innerHTML = `<h3>[2단계] 감정 이모지 고르기</h3><div class="kitchen-display" style="font-size:40px; text-align:center;">${state.selectedEmoji[0]||'❓'} + ${state.selectedEmoji[1]||'❓'} = <span id="e-res">✨</span></div><div class="emoji-grid" style="text-align:center;">${['😊','😢','😡','🤔','☁️','🔥','💡'].map(e => `<button onclick="mixEmoji('${e}')" style="font-size:25px;">${e}</button>`).join('')}</div>`;
        nav.innerHTML = `<button onclick="renderStep(3)">감정 분석실로</button>`;
    }
    else if(step === 3) { // 3단계: 물약 (PDF Page 4)
        content.innerHTML = `<h3>[3단계] 감정 물약 만들기</h3>${Object.keys(state.potions).map(k => `<div class="potion-row"><label>${k}</label><input type="range" min="0" max="10" value="${state.potions[k]}" onchange="state.potions['${k}']=this.value"></div>`).join('')}`;
        nav.innerHTML = `<button onclick="renderStep(5)">일기 기록실로</button>`;
    }
    else if(step === 5) { // 5-6단계: 일기 & 결과 (PDF Page 5)
        content.innerHTML = `<h3>[5단계] 감정 일기 쓰기</h3><textarea id="diary-box" placeholder="오늘 무슨 일이 있었나요?" style="width:100%; height:80px;"></textarea><canvas id="radarChart"></canvas><div id="ai-advice" class="bubble">분석 중...</div>`;
        nav.innerHTML = `<button onclick="finishEmotionRecord()">기록 종료</button>`;
        setTimeout(initRadarChart, 100);
    }
}

// [5] 성장 로직 (비료/물/영양제 세 가지 모두 100 달성 시 성장)
function buyItem(type) {
    if(state.points < 10) return alert("포인트 부족!");
    state.points -= 10;
    state.stats[type] += 34; // 3번 사용 시 100%
    if(state.stats[type] > 100) state.stats[type] = 100;
    
    updateMainUI();
    checkLevelUp();
    syncFirebase();
}

function checkLevelUp() {
    if(state.stats.fert >= 100 && state.stats.water >= 100 && state.stats.nutr >= 100) {
        state.lv++;
        state.stats = { fert: 0, water: 0, nutr: 0 };
        alert("레벨 업! 식물이 성장했습니다!");
        updatePlantIcon();
    }
}

function updateMainUI() {
    document.getElementById('bar-fert').value = state.stats.fert;
    document.getElementById('bar-water').value = state.stats.water;
    document.getElementById('bar-nutr').value = state.stats.nutr;
    document.getElementById('user-point').innerText = state.points;
    document.getElementById('user-lv').innerText = state.lv;
}

function finishEmotionRecord() {
    state.diary = document.getElementById('diary-box').value;
    state.tags = "#" + state.word + " #성장중";
    
    // 우측 카드 실시간 반영
    document.getElementById('card-tags').innerText = state.tags;
    document.getElementById('card-text').innerText = state.diary;
    document.getElementById('card-emoji').innerText = state.finalEmoji || "🌱";
    
    document.getElementById('btn-quest-open').disabled = false;
    document.getElementById('btn-quest-open').classList.remove('disabled');
    closeModal();
    syncFirebase();
}

function syncFirebase() {
    db.ref('students/' + state.user).set(state);
}

function closeModal() { document.getElementById('modal-overlay').style.display = 'none'; }
