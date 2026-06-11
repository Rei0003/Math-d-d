// --- Spēles Stāvoklis ---
const MAX_PLAYER_HP_CAP = 100;
const MAX_LEVEL = 10;

let player = {
    hp: 50,
    maxHp: 50,
    stats: {
        Spēks: 5,
        Veiklība: 5,
        Konstitūcija: 5,
        Intelekts: 5,
        Gudrība: 5,
        Harizma: 5
    }
};

let potions = 0;

const enemyList = [
    { name: "Sapuvis Zombijs", hp: 120, damage: 13 },
    { name: "Klabošs Skelets", hp: 140, damage: 16 },
    { name: "Alu Goblins", hp: 160, damage: 19 },
    { name: "Orku Karavīrs", hp: 180, damage: 22 },
    { name: "Asinskārs Vampīrs", hp: 200, damage: 25 },
    { name: "Tumsas Vilkatis", hp: 220, damage: 28 },
    { name: "Pazemes Dēmons", hp: 240, damage: 31 },
    { name: "Nešķīsts Lihs", hp: 260, damage: 34 },
    { name: "Melnais Pūķis", hp: 280, damage: 37 },
    { name: "Haosa Lords", hp: 350, damage: 45 }
];

let gameLevel = 1;
let enemiesKilled = 0;
let enemy = { ...enemyList[0], maxHp: enemyList[0].hp };

let currentAnswer = null;
let currentRewardStat = null;
let isGameOver = false;

// --- DOM Elementi ---
const uiStats = {
    Spēks: document.getElementById('stat-speks'),
    Veiklība: document.getElementById('stat-veikliba'),
    Konstitūcija: document.getElementById('stat-konstitucija'),
    Intelekts: document.getElementById('stat-intelekts'),
    Gudrība: document.getElementById('stat-gudriba'),
    Harizma: document.getElementById('stat-harizma')
};

const playerHpBar = document.getElementById('player-hp-bar');
const playerHpText = document.getElementById('player-hp-text');
const enemyHpBar = document.getElementById('zombie-hp-bar');
const enemyHpText = document.getElementById('zombie-hp-text');
const killCountText = document.getElementById('kill-count');
const enemyNameHeading = document.querySelector('#enemy-section h2');

const gameLog = document.getElementById('game-log');
const quizSection = document.getElementById('quiz-section');
const questionText = document.getElementById('question-text');
const choiceBtns = [
    document.getElementById('choice-0'),
    document.getElementById('choice-1'),
    document.getElementById('choice-2')
];
const rewardText = document.getElementById('reward-text');

const btnQuiz = document.getElementById('btn-quiz');
const btnAttack = document.getElementById('btn-attack');
const btnRun = document.getElementById('btn-run');
const btnRestart = document.getElementById('btn-restart');

// Dinamiska Eliksīra pogas izveide
const btnPotion = document.createElement('button');
btnPotion.id = 'btn-potion';
if (btnRun) {
    btnPotion.className = btnRun.className; 
    btnRun.parentNode.insertBefore(btnPotion, btnRestart);
}

// --- Pamatfunkcijas ---

function logMsg(msg, color = "#e0d8c0") {
    const p = document.createElement('p');
    p.style.color = color;
    p.style.margin = "3px 0";
    p.innerHTML = msg;
    gameLog.appendChild(p);
    
    setTimeout(() => {
        gameLog.scrollTop = gameLog.scrollHeight;
    }, 10);
}

function updateUI() {
    let playerHpPercent = Math.max(0, (player.hp / player.maxHp) * 100);
    playerHpBar.style.width = playerHpPercent + '%';
    playerHpText.innerText = `Veselība: ${player.hp}/${player.maxHp}`;

    let enemyHpPercent = Math.max(0, (enemy.hp / enemy.maxHp) * 100);
    enemyHpBar.style.width = enemyHpPercent + '%';
    enemyHpText.innerText = `HP: ${enemy.hp}/${enemy.maxHp}`;
    killCountText.innerText = enemiesKilled;

    enemyNameHeading.innerHTML = `Pretinieks: ${enemy.name} <span class="level-badge">Līmenis <span id="zombie-level">${gameLevel}</span></span>`;
    btnPotion.innerText = `Malkot eliksīru (${potions})`;

    for (let stat in uiStats) {
        uiStats[stat].innerText = player.stats[stat];
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function generateFakeAnswers(correct) {
    let fakes = new Set();
    while (fakes.size < 2) {
        let offset = Math.floor(Math.random() * 9) - 4; 
        if (offset === 0) offset = 2; 

        let fake = correct + offset;
        
        if (Math.random() > 0.6) fake = correct * -1; 
        if (Math.random() > 0.8 && correct !== 0) fake = correct * 2; 
        if (Math.random() > 0.9) fake = correct + 10; 

        if (fake !== correct && !isNaN(fake)) {
            fakes.add(fake === -0 ? 0 : fake);
        }
    }
    return Array.from(fakes);
}

function factorial(n) {
    if (n === 0 || n === 1) return 1;
    return n * factorial(n - 1);
}

// --- Eiropas Vidusskolas Matemātikas Loģika ---

function generateMathQuestion() {
    if (isGameOver) return;
    
    const statKeys = Object.keys(player.stats);
    currentRewardStat = statKeys[Math.floor(Math.random() * statKeys.length)];
    
    let questionStr = "";
    
    // Tikai tīras un ne-konfuzējošas tēmas
    const categories = ["statistika", "logaritmi", "kombinatorika"];
    const mathCategory = categories[Math.floor(Math.random() * categories.length)];

    if (mathCategory === "statistika") {
        if (Math.random() > 0.5) {
            let a = Math.floor(Math.random() * 10) + 1;
            let b = Math.floor(Math.random() * 10) + 1;
            let c = Math.floor(Math.random() * 10) + 1;
            let d = Math.floor(Math.random() * 10) + 1;
            let rem = (a + b + c + d) % 4;
            d += (4 - rem) % 4; 
            
            let nums = [a, b, c, d].sort((x, y) => x - y);
            currentAnswer = (nums[0] + nums[1] + nums[2] + nums[3]) / 4;
            questionStr = `Kāds ir datu kopas {${nums.join(', ')}} vidējais aritmētiskais?`;
        } else {
            let arr = [
                Math.floor(Math.random() * 20),
                Math.floor(Math.random() * 20),
                Math.floor(Math.random() * 20),
                Math.floor(Math.random() * 20),
                Math.floor(Math.random() * 20)
            ];
            arr.sort((x, y) => x - y);
            currentAnswer = arr[2];
            questionStr = `Kāda ir datu kopas {${arr.join(', ')}} mediāna?`;
        }
    } 
    else if (mathCategory === "logaritmi") {
        let base = Math.floor(Math.random() * 4) + 2; 
        currentAnswer = Math.floor(Math.random() * 4) + 1; 
        let val = Math.pow(base, currentAnswer);
        questionStr = `Aprēķini: log<sub>${base}</sub>(${val})`;
    }
    else if (mathCategory === "kombinatorika") {
        if (Math.random() > 0.5) {
            let n = Math.floor(Math.random() * 4) + 4; 
            currentAnswer = factorial(n);
            questionStr = `Aprēķini: ${n}! (faktoriāls)`;
        } else {
            let n = Math.floor(Math.random() * 6) + 4; 
            currentAnswer = (n * (n - 1)) / 2;
            questionStr = `Cik dažādos veidos no ${n} elementiem var izvēlēties kombinācijas pa 2? (C<sub>${n}</sub><sup>2</sup>)`;
        }
    }

    questionText.innerHTML = questionStr;
    rewardText.innerHTML = `Balva par pareizu atbildi: +2 <b>${currentRewardStat}</b>`;
    rewardText.style.color = "#4da6ff";
    
    let fakes = generateFakeAnswers(currentAnswer);
    let allAnswers = [currentAnswer, fakes[0], fakes[1]];
    allAnswers = shuffleArray(allAnswers);

    for (let i = 0; i < 3; i++) {
        choiceBtns[i].innerHTML = allAnswers[i];
        choiceBtns[i].dataset.answer = allAnswers[i]; 
    }
    
    quizSection.classList.remove('hidden');
    logMsg("Tu koncentrējies un analizē formulas...", "#4da6ff");
}

function handleChoiceClick(e) {
    const userAnswer = parseInt(e.target.dataset.answer);
    
    if (userAnswer === currentAnswer) {
        player.stats[currentRewardStat] += 2;
        
        if (currentRewardStat === 'Konstitūcija') {
            player.maxHp += 5;
            if (player.maxHp > MAX_PLAYER_HP_CAP) player.maxHp = MAX_PLAYER_HP_CAP;
            player.hp += 5;
            if (player.hp > player.maxHp) player.hp = player.maxHp;
        }

        logMsg(`Briljanti! Tavs <b>${currentRewardStat}</b> palielinās par 2.`, "#228b22");
    } else {
        const penaltyDamage = 10 + Math.floor(gameLevel * 2);
        player.hp -= penaltyDamage;
        logMsg(`Kļūda! Pareizā atbilde bija ${currentAnswer}. Tu zaudē fokusu un saņem ${penaltyDamage} bojājumus!`, "red");
        checkDeath();
    }
    
    quizSection.classList.add('hidden');
    updateUI();
}

// --- Eliksīra Lietošanas Loģika ---
function drinkPotion() {
    if (isGameOver) return;
    
    if (potions <= 0) {
        logMsg("Tev nav neviena veselības eliksīra!", "#aaa");
        return;
    }
    
    if (player.hp >= player.maxHp) {
        logMsg("Tava veselība jau ir maksimāla!", "#aaa");
        return;
    }
    
    potions--;
    let healAmount = 35; 
    player.hp = Math.min(player.maxHp, player.hp + healAmount);
    
    logMsg(`Tu izdzer sarkanu, burbuļojošu eliksīru un atgūsti <b>${healAmount} HP</b>!`, "#00ffcc");
    updateUI();
}

// --- Cīņas un Progresijas Loģika ---

function attack() {
    if (isGameOver) return;
    quizSection.classList.add('hidden'); 

    let damage = Math.floor(player.stats.Spēks * 1.5) + Math.floor(Math.random() * 5);
    enemy.hp -= damage;
    logMsg(`Tu uzbrūc! <b>${enemy.name}</b> saņem <b>${damage}</b> bojājumus!`, "orange");

    if (enemy.hp <= 0) {
        enemy.hp = 0;
        enemyDefeated();
        return;
    }

    enemyTurn();
}

function enemyTurn() {
    let dodgeChance = player.stats.Veiklība * 1.5;
    if (dodgeChance > 60) dodgeChance = 60;

    let roll = Math.random() * 100;

    if (roll < dodgeChance) {
        logMsg(`<b>${enemy.name}</b> mēģina tev trāpīt, bet tu eleganti <b>izvairies</b>!`, "#00bfff");
    } else {
        let reduction = Math.floor(player.stats.Konstitūcija / 3);
        let finalDamage = Math.max(1, enemy.damage - reduction);
        player.hp -= finalDamage;
        logMsg(`<b>${enemy.name}</b> rauj tev ar nagiem, nodarot <b>${finalDamage}</b> bojājumus!`, "red");
    }
    
    updateUI();
    checkDeath();
}

function enemyDefeated() {
    enemiesKilled++;
    
    logMsg(`<b>${enemy.name} ir pieveikts!</b>`, "#ffff00");

    if (Math.random() < 0.80) {
        potions++;
        logMsg(`🎉 No pretinieka pīšļiem izkrīt <b>Veselības Eliksīrs</b>! Tu to iebāz somā.`, "#00ffcc");
    }
    
    if (gameLevel === MAX_LEVEL) {
        gameWon();
        return;
    }

    gameLevel++;
    
    let restHeal = Math.floor(player.maxHp * 0.2);
    player.hp = Math.min(player.maxHp, player.hp + restHeal);
    logMsg(`Tu mirkli uzelpo un atgūsti ${restHeal} HP pirms nākamā stāva.`, "#228b22");

    let nextEnemyData = enemyList[gameLevel - 1];
    enemy = { ...nextEnemyData, maxHp: nextEnemyData.hp };
    
    logMsg(`Tu nokāp dziļāk... Tev pretī stājas: <b>${enemy.name}</b>! (Līmenis ${gameLevel}/${MAX_LEVEL})`, "#ff4444");
    
    updateUI();
}

function runAway() {
    if (isGameOver) return;
    
    logMsg(`Spiediens bija pārāk liels. Tu meties bēgt un paliec ${gameLevel}. līmenī.`, "#aaa");
    endGame();
}

// --- Spēles Beigu Stāvokļi ---

function checkDeath() {
    if (player.hp <= 0) {
        player.hp = 0;
        updateUI();
        logMsg(`Tavs prāts un spēki ir izsmelti. <b>${enemy.name} svin uzvaru.</b> Spēle beigusies.`, "red");
        endGame();
    }
}

function gameWon() {
    isGameOver = true;
    player.hp = player.maxHp;
    updateUI();
    logMsg(`<b>EPISKA UZVARA!</b> Tu esi pieveicis Haosa Lordu un izgājis visus 10 līmeņus. Tavs intelekts un disciplīna ir nepārspējami!`, "gold");
    endGame();
}

function endGame() {
    isGameOver = true;
    btnQuiz.classList.add('hidden');
    btnAttack.classList.add('hidden');
    btnRun.classList.add('hidden');
    btnPotion.classList.add('hidden'); 
    btnRestart.classList.remove('hidden');
    quizSection.classList.add('hidden');
}

function restartGame() {
    player.maxHp = 50;
    player.hp = 50;
    player.stats = { Spēks: 5, Veiklība: 5, Konstitūcija: 5, Intelekts: 5, Gudrība: 5, Harizma: 5 };
    
    gameLevel = 1;
    enemiesKilled = 0;
    potions = 0; 

    let firstEnemyData = enemyList[0];
    enemy = { ...firstEnemyData, maxHp: firstEnemyData.hp };
    
    isGameOver = false;

    gameLog.innerHTML = `Tu stāvi katakombu ieejā. Tavā priekšā stāv ${enemy.name}! (Līmenis 1/10)`;
    
    btnQuiz.classList.remove('hidden');
    btnAttack.classList.remove('hidden');
    btnRun.classList.remove('hidden');
    btnPotion.classList.remove('hidden'); 
    btnRestart.classList.add('hidden');

    updateUI();
}

// --- Klausītāji (Event Listeners) ---
btnQuiz.addEventListener('click', generateMathQuestion);
btnAttack.addEventListener('click', attack);
btnRun.addEventListener('click', runAway);
btnRestart.addEventListener('click', restartGame);
btnPotion.addEventListener('click', drinkPotion); 

choiceBtns.forEach(btn => {
    btn.addEventListener('click', handleChoiceClick);
});

updateUI();
