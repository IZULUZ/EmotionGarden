let user = { points: 0, tags: "", diary: "", potionVals: {기쁨:0, 슬픔:0, 분노:0, 불안:0, 평온:0}, selectedEmojis: [] };

function startGame() { 
    document.getElementById('start-screen').style.display = 'none'; 
    document.getElementById('app-container').style.display = 'block'; 
}

function openModal(type) {
    document.getElementById('modal-overlay').style.display = 'block';
    if(type === 'emotion') renderEmotion(1);
    if(type === 'quest') renderQuest();
    if(type === 'shop') renderShop();
}

function closeModal() { document.getElementById('modal-overlay').style.display = 'none'; }

/* ===== 1. 감정 기록 6단계 (이모지 키친 & 물약) ===== */
function renderEmotion(step) {
    const body = document.getElementById('modal-body');
    const foot = document.getElementById('modal-footer');
    
    if(step === 1) {
        const words = ['행복한','뿌듯한','평온한','서운한','화가난','우울한','당황한','조마조마한'];
        body.innerHTML = `<h2>1. 오늘을 대표하는 감정 단어는?</h2>
            <div class="grid-btns">${words.map(w => `<button class="game-btn" onclick="user.tags='#${w}'; renderEmotion(2)">${w}</button>`).join('')}</div>`;
        foot.innerHTML = "";
    } 
    else if(step === 2) {
        // 이모지 키친: 두 개를 고르면 합성됨
        const emos = ['😊','😢','😡','😱','😌'];
        let display = user.selectedEmojis.length === 0 ? "이모지 2개를 선택해봐!" : 
                      user.selectedEmojis.length === 1 ? `${user.selectedEmojis[0]} + ❓ = ...` :
                      `${user.selectedEmojis[0]} + ${user.selectedEmojis[1]} = ✨${combineEmojis(user.selectedEmojis[0], user.selectedEmojis[1])}✨`;
                      
        body.innerHTML = `<h2>2. 이모지 키친 (2개를 섞어보자!)</h2>
            <div style="font-size: 40px; text-align: center; margin: 30px; background: #fff; padding: 20px; border-radius: 15px;">${display}</div>
            <div class="grid-btns">${emos.map(e => `<button class="game-btn" onclick="selectEmoji('${e}')">${e}</button>`).join('')}</div>`;
            
        if(user.selectedEmojis.length === 2) {
            foot.innerHTML = `<button class="game-btn" style="width:100%; padding:15px; margin-top:20px;" onclick="renderEmotion(3)">다음으로</button>`;
        } else { foot.innerHTML = ""; }
    }
    else if(step === 3) {
        body.innerHTML = `<h2>3. 마법의 감정 물약 만들기 🧪</h2>
            <div style="display:flex; flex-direction:column; gap:15px; margin-top:20px;">
                ${Object.keys(user.potionVals).map(p => 
                    `<div style="display:flex; align-items:center; justify-content:space-between; background:white; padding:10px; border-radius:10px;">
                        <span>🫙 ${p} 물약</span>
                        <input type="range" min="0" max="10" value="${user.potionVals[p]}" style="width:60%;" onchange="user.potionVals['${p}']=this.value">
                    </div>`
                ).join('')}
            </div>`;
        foot.innerHTML = `<button class="game-btn" style="width:100%; padding:15px; margin-top:20px;" onclick="renderEmotion(5)">일기장으로</button>`;
    }
    else if(step === 5) {
        body.innerHTML = `<h2>5. 오늘의 마음 일기 📝</h2>
            <textarea id="diary-in" style="width:100%; height:150px; font-size:1.5rem; font-family:'Jua'; padding:10px; margin-top:10px; border-radius:10px;"></textarea>
            <h2 style="margin-top:20px;">6. 물약 분석 리포트</h2>
            <div style="background:white; border-radius:10px; margin-top:10px; text-align:center;"><canvas id="chartCanvas" width="300" height="150"></canvas></div>`;
        foot.innerHTML = `<button class="game-btn" style="width:100%; padding:15px; margin-top:20px;" onclick="saveAll()">기록 완료!</button>`;
        setTimeout(drawChart, 100);
    }
}

// 진짜 이모지 합성 로직
function selectEmoji(e) {
    if(user.selectedEmojis.length < 2) user.selectedEmojis.push(e);
    else user.selectedEmojis = [e]; // 꽉 차면 리셋하고 다시 선택
    renderEmotion(2);
}

function combineEmojis(e1, e2) {
    const pair = [e1, e2].sort().join('+'); // 순서 상관없이 조합
    const map = {
        '😊+😊': '🥰', '😊+😢': '🥲', '😊+😡': '😈', '😊+😱': '🤪', '😊+😌': '😇',
        '😢+😢': '😭', '😡+😢': '😿', '😱+😢': '🥶', '😌+😢': '🥀',
        '😡+😡': '🤬', '😡+😱': '🤯', '😡+😌': '😤',
        '😱+😱': '👻', '😱+😌': '🫠',
        '😌+😌': '🧘'
    };
    user.finalEmoji = map[pair] || '✨';
    return user.finalEmoji;
}

function drawChart() {
    new Chart(document.getElementById('chartCanvas'), { type: 'radar', data: { labels: Object.keys(user.potionVals), datasets: [{ data: Object.values(user.potionVals), backgroundColor: 'rgba(76, 175, 80, 0.5)' }] }, options: { scales: { r: { min: 0, max: 10 } } } });
}

function saveAll() {
    user.diary = document.getElementById('diary-in').value;
    document.getElementById('card-emoji').innerText = user.finalEmoji;
    document.getElementById('card-tags').innerText = user.tags;
    document.getElementById('card-diary').innerText = user.diary;
    closeModal();
    document.getElementById('bot-msg').innerText = "기록 멋지다! 퀘스트도 받아볼래?";
}

/* ===== 2. 퀘스트 기능 ===== */
function renderQuest() {
    document.getElementById('modal-body').innerHTML = `<h2>📜 오늘의 추천 퀘스트</h2>
        <div style="background:white; padding:30px; text-align:center; border-radius:15px; margin-top:20px; font-size:1.8rem;">
            "짝꿍에게 따뜻한 칭찬 한마디 건네기"
        </div>`;
    document.getElementById('modal-footer').innerHTML = `<button class="game-btn" style="width:100%; padding:15px; margin-top:20px;" onclick="acceptQuest()">수락하기</button>`;
}
function acceptQuest() {
    document.getElementById('quest-text').innerText = "진행중: 짝꿍에게 칭찬 한마디 건네기";
    document.getElementById('done-btn').style.display = 'inline-block';
    closeModal();
}
function completeQuest() {
    alert("선생님께 완료 요청을 보냈어! 승인되면 포인트가 들어와.");
    document.getElementById('done-btn').style.display = 'none';
    document.getElementById('quest-text').innerText = "선생님 승인 대기 중...";
}

/* ===== 3. 원예 상점 기능 ===== */
function renderShop() {
    document.getElementById('modal-body').innerHTML = `<h2>🏪 원예 상점 (내 돈: ${user.points}G)</h2>
        <div class="grid-btns">
            <button class="game-btn" onclick="buyItem('비료', 10)">💩 비료 (10G)</button>
            <button class="game-btn" onclick="buyItem('물약', 15)">💊 식물 영양제 (15G)</button>
        </div>`;
    document.getElementById('modal-footer').innerHTML = "";
}
function buyItem(name, price) {
    if(user.points >= price) { user.points -= price; alert(`${name} 구매 완료!`); document.getElementById('ui-points').innerText = user.points; closeModal(); }
    else { alert("포인트가 부족해! 퀘스트를 완료해봐."); }
}
