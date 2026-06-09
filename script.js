// --- Spēles Stāvoklis ---
const MAX_PLAYER_HP_CAP = 100;

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

let gameLevel = 1;
let zombiesKilled = 0;

let enemy = {
    name: "Zombijs",
    hp: 100,
    maxHp: 100,
    damage: 8
};

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
const zombieHpBar = document.getElementById('zombie-hp-bar');
const zombieHpText = document.getElementById('zombie-hp-text');
const zombieLevelText = document.getElementById('zombie-level');
const killCountText = document.getElementById('kill-count');

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

// --- Pamatfunkcijas ---

function logMsg(msg, color = "#e0d8c0") {
    const p = document.createElement('p');
    p.style.color = color;
    p.style.margin = "3px 0";
    p.innerHTML = msg;
    gameLog.appendChild(p);
    gameLog.scrollTop = gameLog.scrollHeight;
}

function updateUI() {
    let playerHpPercent = Math.max(0, (player.hp / player.maxHp) * 100);
    playerHpBar.style.width = playerHpPercent + '%';
    playerHpText.innerText = `Veselība: ${player.hp}/${player.maxHp}`;

    let zombieHpPercent = Math.max(0, (enemy.hp / enemy.maxHp) * 100);
    zombieHpBar.style.width = zombieHpPercent + '%';
    zombieHpText.innerText = `HP: ${enemy.hp}/${enemy.maxHp}`;
    zombieLevelText.innerText = gameLevel;
    killCountText.innerText = zombiesKilled;

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

// Gudrāka viltus atbilžu ģenerēšana
function generateFakeAnswers(correct) {
    let fakes = new Set();
    while (fakes.size < 2) {
        let variance = Math.max(3, Math.ceil(Math.abs(correct) * 0.3)); // 30% novirze vai vismaz 3
        let offset = Math.floor(Math.random() * (variance * 2 + 1)) - variance;
        if (offset === 0) offset = 1; 

        let fake = correct + offset;
        
        // Pievienojam tipiskas cilvēciskas kļūdas
        if (Math.random() > 0.8) fake = correct + 10;
        if (Math.random() > 0.8) fake = correct - 10;
        if (Math.random() > 0.9 && correct > 0) fake = correct * 2;

        // Ja pareizā atbilde nav negatīva, neļaujam viltus atbildēm būt tādām
        if (correct >= 0 && fake < 0) fake = Math.abs(fake);

        if (fake !== correct) {
            fakes.add(fake);
        }
    }
    return Array.from(fakes);
}

function factorial(n) {
    if (n === 0 || n === 1) return 1;
    return n * factorial(n - 1);
}

// --- Matemātikas Viktorīnas Loģika (Līdz 12. klasei) ---

function generateMathQuestion() {
    if (isGameOver) return;
    
    const statKeys = Object.keys(player.stats);
    currentRewardStat = statKeys[Math.floor(Math.random() * statKeys.length)];
    
    let questionStr = "";
    
    // Grūtības un tēmu sadalījums pa līmeņiem
    let mathCategory = "pamatskola";
    if (gameLevel >= 4) mathCategory = ["pamatskola", "algebra"].sort(() => 0.5 - Math.random())[0];
    if (gameLevel >= 8) mathCategory = ["algebra", "logaritmi", "kvadratiska"].sort(() => 0.5 - Math.random())[0];
    if (gameLevel >= 12) mathCategory = ["logaritmi", "atvasinajumi", "kombinatorika"].sort(() => 0.5 - Math.random())[0];

    // 1.-6. klase: Bāzes aritmētika
    if (mathCategory === "pamatskola") {
        let ops = ['+', '-', '*'];
        if (gameLevel > 2) ops.push('/');
        const op = ops[Math.floor(Math.random() * ops.length)];
        let multiplier = 1 + (gameLevel * 0.3);

        if (op === '+') {
            let num1 = Math.floor((Math.random() * 50 + 10) * multiplier);
            let num2 = Math.floor((Math.random() * 50 + 10) * multiplier);
            currentAnswer = num1 + num2;
            questionStr = `${num1} + ${num2} = ?`;
        } else if (op === '-') {
            let num1 = Math.floor((Math.random() * 50 + 50) * multiplier);
            let num2 = Math.floor((Math.random() * 49 + 1) * multiplier);
            if (num2 > num1) [num1, num2] = [num2, num1];
            currentAnswer = num1 - num2;
            questionStr = `${num1} - ${num2} = ?`;
        } else if (op === '*') {
            let num1 = Math.floor(Math.random() * (5 + Math.floor(gameLevel/2))) + 2;
            let num2 = Math.floor(Math.random() * (5 + Math.floor(gameLevel/2))) + 2;
            currentAnswer = num1 * num2;
            questionStr = `${num1} &times; ${num2} = ?`;
        } else if (op === '/') {
            let num2 = Math.floor(Math.random() * 10) + 2;
            currentAnswer = Math.floor(Math.random() * (10 + gameLevel)) + 2;
            let num1 = currentAnswer * num2;
            questionStr = `${num1} &divide; ${num2} = ?`;
        }
    } 
    // 7.-9. klase: Algebra un Vienādojumi
    else if (mathCategory === "algebra") {
        if (Math.random() > 0.5) {
            // Lineārs vienādojums: ax + b = c
            let a = Math.floor(Math.random() * 5) + 2;
            currentAnswer = Math.floor(Math.random() * 10) + 2; // x
            let b = Math.floor(Math.random() * 20) + 1;
            let c = (a * currentAnswer) + b;
            questionStr = `Atrisini <i>x</i>: ${a}x + ${b} = ${c}`;
        } else {
            // Saknes un pakāpes
            currentAnswer = Math.floor(Math.random() * 12) + 2;
            let val = currentAnswer * currentAnswer;
            questionStr = `&radic;${val} = ?`;
        }
    }
    // 9.-10. klase: Kvadrātvienādojumu pamati un augstākas pakāpes
    else if (mathCategory === "kvadratiska") {
        let base = Math.floor(Math.random() * 4) + 2; // 2, 3, 4, 5
        let exp = Math.floor(Math.random() * 3) + 2; // 2, 3, 4
        currentAnswer = Math.pow(base, exp);
        questionStr = `${base}<sup>${exp}</sup> = ?`;
    }
    // 10.-11. klase: Logaritmi
    else if (mathCategory === "logaritmi") {
        let base = Math.floor(Math.random() * 3) + 2; // bāze 2, 3, vai 4
        currentAnswer = Math.floor(Math.random() * 4) + 2; // pakāpe (atbilde)
        let val = Math.pow(base, currentAnswer);
        questionStr = `log<sub>${base}</sub>(${val}) = ?`;
    }
    // 12. klase: Atvasinājumi
    else if (mathCategory === "atvasinajumi") {
        // Funkcija f(x) = a*x^2. Atvasinājums f'(x) = 2*a*x
        let a = Math.floor(Math.random() * 3) + 1;
        let x = Math.floor(Math.random() * 4) + 1;
        currentAnswer = 2 * a * x;
        let aStr = a === 1 ? "" : a;
        questionStr = `Ja f(x) = ${aStr}x<sup>2</sup>, cik ir f'(${x})?`;
    }
    // 12. klase: Kombinatorika / Faktoriāli
    else if (mathCategory === "kombinatorika") {
        let n = Math.floor(Math.random() * 4) + 3; // 3, 4, 5, 6
        currentAnswer = factorial(n);
        questionStr = `${n}! (Faktoriāls) = ?`;
    }

    questionText.innerHTML = questionStr;
    rewardText.innerHTML = `Balva par pareizu atbildi: +2 <b>${currentRewardStat}</b>`;
    rewardText.style.color = "#4da6ff";
    
    // Ģenerē un sajauc atbildes
    let fakes = generateFakeAnswers(currentAnswer);
    let allAnswers = [currentAnswer, fakes[0], fakes[1]];
    allAnswers = shuffleArray(allAnswers);

    // Piešķir pogām atbildes
    for (let i = 0; i < 3; i++) {
        choiceBtns[i].innerHTML = allAnswers[i];
        choiceBtns[i].dataset.answer = allAnswers[i]; 
    }
    
    quizSection.classList.remove('hidden');
    logMsg("Tu izsauc sena skolotāja garu, lai iegūtu zināšanas...", "#4da6ff");
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

        logMsg(`Genialitāte! Tavs <b>${currentRewardStat}</b> palielinās par 2.`, "#228b22");
    } else {
        const penaltyDamage = 10 + Math.floor(gameLevel * 2);
        player.hp -= penaltyDamage;
        logMsg(`Kļūda aprēķinos! Pareizā atbilde bija ${currentAnswer}. Matemātikas lāsts tev nodara ${penaltyDamage} bojājumus!`, "red");
        checkDeath();
    }
    
    quizSection.classList.add('hidden');
    updateUI();
}

// --- Cīņas un Progresijas Loģika ---

function attack() {
    if (isGameOver) return;
    quizSection.classList.add('hidden'); 

    let damage = Math.floor(player.stats.Spēks * 1.5) + Math.floor(Math.random() * 5);
    enemy.hp -= damage;
    logMsg(`Tu ietriec savu ieroci zombijā, nodarot <b>${damage}</b> bojājumus!`, "orange");

    if (enemy.hp <= 0) {
        enemy.hp = 0;
        zombieDefeated();
        return;
    }

    zombieTurn();
}

function zombieTurn() {
    let dodgeChance = player.stats.Veiklība * 1.5;
    if (dodgeChance > 60) dodgeChance = 60;

    let roll = Math.random() * 100;

    if (roll < dodgeChance) {
        logMsg("Zombijs metas tev virsū, bet tu eleganti <b>izvairies</b>!", "#00bfff");
    } else {
        let reduction = Math.floor(player.stats.Konstitūcija / 3);
        let finalDamage = Math.max(1, enemy.damage - reduction);
        player.hp -= finalDamage;
        logMsg(`Zombijs sašķeļ tavu aizsardzību, nodarot <b>${finalDamage}</b> bojājumus!`, "red");
    }
    
    updateUI();
    checkDeath();
}

function zombieDefeated() {
    zombiesKilled++;
    gameLevel++;
    
    logMsg(`<b>Zombijs pārvēršas putekļos!</b> Tavs prāts ir ass kā nazis.`, "#ffff00");
    
    player.hp = player.maxHp;
    logMsg(`Pēc cīņas tu atvelc elpu un tava veselība atjaunojas uz <b>${player.hp} HP</b>.`, "#228b22");

    enemy.maxHp = 100 + (gameLevel * 25);
    enemy.hp = enemy.maxHp;
    enemy.damage = 8 + Math.floor(gameLevel * 3);
    
    logMsg(`No ēnām izkāpj jauns radījums. (Zombija Līmenis ${gameLevel})`, "#ff4444");
    
    updateUI();
}

function runAway() {
    if (isGameOver) return;
    
    logMsg(`Tu nespēj izturēt šo kognitīvo un fizisko spriedzi. Tu pieveici ${zombiesKilled} zombijus un aizbēgi kā gļēvulis.`, "#aaa");
    endGame();
}

// --- Spēles Beigu Stāvokļi ---

function checkDeath() {
    if (player.hp <= 0) {
        player.hp = 0;
        updateUI();
        logMsg(`Tavs ķermenis un prāts lūzt. <b>Zombijs tevi ir saplosījis.</b> Tu izdzīvoji līdz ${gameLevel}. līmenim.`, "red");
        endGame();
    }
}

function endGame() {
    isGameOver = true;
    btnQuiz.classList.add('hidden');
    btnAttack.classList.add('hidden');
    btnRun.classList.add('hidden');
    btnRestart.classList.remove('hidden');
    quizSection.classList.add('hidden');
}

function restartGame() {
    player.maxHp = 50;
    player.hp = 50;
    player.stats = { Spēks: 5, Veiklība: 5, Konstitūcija: 5, Intelekts: 5, Gudrība: 5, Harizma: 5 };
    
    gameLevel = 1;
    zombiesKilled = 0;

    enemy.maxHp = 100;
    enemy.hp = 100;
    enemy.damage = 8;
    
    isGameOver = false;

    gameLog.innerHTML = "Atkal katakombās. Tavā priekšā stāv izsalcis Zombijs!";
    
    btnQuiz.classList.remove('hidden');
    btnAttack.classList.remove('hidden');
    btnRun.classList.remove('hidden');
    btnRestart.classList.add('hidden');

    updateUI();
}

// --- Klausītāji (Event Listeners) ---
btnQuiz.addEventListener('click', generateMathQuestion);
btnAttack.addEventListener('click', attack);
btnRun.addEventListener('click', runAway);
btnRestart.addEventListener('click', restartGame);

choiceBtns.forEach(btn => {
    btn.addEventListener('click', handleChoiceClick);
});

// Sākotnējā UI iestatīšana
updateUI();
