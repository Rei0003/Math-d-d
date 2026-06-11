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

let gameLevel = 1;
let zombiesKilled = 0;

let enemy = {
    name: "Zombijs",
    hp: 100,
    maxHp: 100,
    damage: 10
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

// Viltus atbilžu ģenerēšana, ņemot vērā, ka atbildes var būt arī negatīvas un nulle
function generateFakeAnswers(correct) {
    let fakes = new Set();
    while (fakes.size < 2) {
        let offset = Math.floor(Math.random() * 9) - 4; // no -4 līdz 4
        if (offset === 0) offset = 2; 

        let fake = correct + offset;
        
        // Pievienojam tipiskas skolēnu kļūdas
        if (Math.random() > 0.6) fake = correct * -1; // Zīmes kļūda (ļoti bieži algebrā)
        if (Math.random() > 0.8 && correct !== 0) fake = correct * 2; // Pareizināts netīšām ar 2
        if (Math.random() > 0.9) fake = correct + 10; // Uzmanības kļūda desmitos

        // Neliela aizsardzība pret `NaN` un dublikātiem, kā arī zīmes zudumiem
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
    
    // Tēmas no kurām izvēlēties - vairs nekādas pamatskolas
    const categories = ["statistika", "kvadratfunkcijas", "logaritmi", "atvasinajumi", "kombinatorika"];
    const mathCategory = categories[Math.floor(Math.random() * categories.length)];

    if (mathCategory === "statistika") {
        if (Math.random() > 0.5) {
            // Vidējais aritmētiskais
            let a = Math.floor(Math.random() * 10) + 1;
            let b = Math.floor(Math.random() * 10) + 1;
            let c = Math.floor(Math.random() * 10) + 1;
            let d = Math.floor(Math.random() * 10) + 1;
            let rem = (a + b + c + d) % 4;
            d += (4 - rem) % 4; // Nodrošina bezatlikuma dalīšanu ar 4
            currentAnswer = (a + b + c + d) / 4;
            questionStr = `Kāds ir datu kopas {${a}, ${b}, ${c}, ${d}} vidējais aritmētiskais?`;
        } else {
            // Mediāna
            let arr = [
                Math.floor(Math.random() * 20),
                Math.floor(Math.random() * 20),
                Math.floor(Math.random() * 20),
                Math.floor(Math.random() * 20),
                Math.floor(Math.random() * 20)
            ];
            let sorted = [...arr].sort((x, y) => x - y);
            currentAnswer = sorted[2];
            questionStr = `Kāda ir datu kopas {${arr.join(', ')}} mediāna?`;
        }
    } 
    else if (mathCategory === "kvadratfunkcijas") {
        if (Math.random() > 0.5) {
            // Parabolas virsotne (x koordināta = -b/2a)
            let a = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);
            let xv = Math.floor(Math.random() * 10) - 5; // xv no -5 līdz 5
            let b = -2 * a * xv;
            let c = Math.floor(Math.random() * 10) - 5;
            
            currentAnswer = xv;
            
            let bStr = b === 0 ? "" : (b > 0 ? `+ ${b}x` : `- ${Math.abs(b)}x`);
            let cStr = c === 0 ? "" : (c > 0 ? `+ ${c}` : `- ${Math.abs(c)}`);
            let aStr = a === 1 ? "" : (a === -1 ? "-" : a);
            questionStr = `Kāda ir parabolas y = ${aStr}x<sup>2</sup> ${bStr} ${cStr} virsotnes <i>x</i> koordināta?`;
        } else {
            // Vjeta teorēma (sakņu summa x1 + x2 = -p)
            let x1 = Math.floor(Math.random() * 10) - 5;
            let x2 = Math.floor(Math.random() * 10) - 5;
            let p = -(x1 + x2);
            let q = x1 * x2;
            
            currentAnswer = x1 + x2; // Kas ir tas pats, kas -p
            
            let pStr = p === 0 ? "" : (p > 0 ? `+ ${p}x` : `- ${Math.abs(p)}x`);
            let qStr = q === 0 ? "" : (q > 0 ? `+ ${q}` : `- ${Math.abs(q)}`);
            questionStr = `Kāda ir kvadrātvienādojuma x<sup>2</sup> ${pStr} ${qStr} = 0 sakņu summa?`;
        }
    }
    else if (mathCategory === "logaritmi") {
        let base = Math.floor(Math.random() * 4) + 2; // Bāze 2, 3, 4, 5
        currentAnswer = Math.floor(Math.random() * 4) + 1; // Pakāpe 1, 2, 3, 4
        let val = Math.pow(base, currentAnswer);
        questionStr = `Aprēķini: log<sub>${base}</sub>(${val})`;
    }
    else if (mathCategory === "atvasinajumi") {
        // Funkcijas f(x) = ax^3 + bx^2 atvasinājums f'(1)
        let a = Math.floor(Math.random() * 4) + 1;
        let b = Math.floor(Math.random() * 4) + 1;
        currentAnswer = 3 * a + 2 * b;
        questionStr = `Ja f(x) = ${a}x<sup>3</sup> + ${b}x<sup>2</sup>, aprēķini atvasinājuma vērtību punktā f'(1).`;
    }
    else if (mathCategory === "kombinatorika") {
        if (Math.random() > 0.5) {
            // Faktoriāls
            let n = Math.floor(Math.random() * 4) + 4; // 4!, 5!, 6!, 7!
            currentAnswer = factorial(n);
            questionStr = `Aprēķini: ${n}! (faktoriāls)`;
        } else {
            // Kombinācijas: C_n^2 = n(n-1)/2
            let n = Math.floor(Math.random() * 6) + 4; // no 4 līdz 9
            currentAnswer = (n * (n - 1)) / 2;
            questionStr = `Cik dažādos veidos no ${n} elementiem var izvēlēties kombinācijas pa 2? (C<sub>${n}</sub><sup>2</sup>)`;
        }
    }

    questionText.innerHTML = questionStr;
    rewardText.innerHTML = `Balva par pareizu atbildi: +2 <b>${currentRewardStat}</b>`;
    rewardText.style.color = "#4da6ff";
    
    // Ģenerē un sajauc atbildes
    let fakes = generateFakeAnswers(currentAnswer);
    let allAnswers = [currentAnswer, fakes[0], fakes[1]];
    allAnswers = shuffleArray(allAnswers);

    for (let i = 0; i < 3; i++) {
        choiceBtns[i].innerHTML = allAnswers[i];
        choiceBtns[i].dataset.answer = allAnswers[i]; 
    }
    
    quizSection.classList.remove('hidden');
    logMsg("Tu raksti formulas gaisā ar pirkstu...", "#4da6ff");
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

// --- Cīņas un Progresijas Loģika ---

function attack() {
    if (isGameOver) return;
    quizSection.classList.add('hidden'); 

    let damage = Math.floor(player.stats.Spēks * 1.5) + Math.floor(Math.random() * 5);
    enemy.hp -= damage;
    logMsg(`Tu cērt zombijam ar sava intelekta un spēka apvienojumu, nodarot <b>${damage}</b> bojājumus!`, "orange");

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
        logMsg("Zombijs uzbrūk, bet tu pareģo trajektoriju un <b>izvairies</b>!", "#00bfff");
    } else {
        let reduction = Math.floor(player.stats.Konstitūcija / 3);
        let finalDamage = Math.max(1, enemy.damage - reduction);
        player.hp -= finalDamage;
        logMsg(`Zombijs triecas tevī, nodarot <b>${finalDamage}</b> bojājumus!`, "red");
    }
    
    updateUI();
    checkDeath();
}

function zombieDefeated() {
    zombiesKilled++;
    
    if (gameLevel === MAX_LEVEL) {
        gameWon();
        return;
    }

    gameLevel++;
    
    logMsg(`<b>Zombijs sasists druskās!</b> Tu atgūsti veselību un kāp tālāk katakombās.`, "#ffff00");
    
    player.hp = player.maxHp;

    // Fiksēta progresija līdz 10. līmenim
    enemy.maxHp = 100 + (gameLevel * 20); // HP no 120 līdz 300
    enemy.hp = enemy.maxHp;
    enemy.damage = 10 + (gameLevel * 3);  // Dmg no 13 līdz 40
    
    logMsg(`Priekšā parādās jauns, draudīgs Zombijs! (Līmenis ${gameLevel}/${MAX_LEVEL})`, "#ff4444");
    
    updateUI();
}

function runAway() {
    if (isGameOver) return;
    
    logMsg(`Eksāmens izrādījās pārāk smags. Tu aizbēgi, paliekot ${gameLevel}. līmenī.`, "#aaa");
    endGame();
}

// --- Spēles Beigu Stāvokļi ---

function checkDeath() {
    if (player.hp <= 0) {
        player.hp = 0;
        updateUI();
        logMsg(`Akadēmiskā un fiziskā slodze tevi iznīcināja. <b>Zombijs uzvarēja.</b>`, "red");
        endGame();
    }
}

function gameWon() {
    isGameOver = true;
    player.hp = player.maxHp;
    updateUI();
    logMsg(`<b>EPISKA UZVARA!</b> Tu esi pieveicis visus 10 zombijus un pierādījis, ka esi izcilākais matemātikas un cīņas meistars Eiropā!`, "gold");
    endGame();
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
    enemy.damage = 10;
    
    isGameOver = false;

    gameLog.innerHTML = "Tu stāvi katakombu ieejā. Tavā priekšā stāv pirmais Zombijs! (Līmenis 1/10)";
    
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
