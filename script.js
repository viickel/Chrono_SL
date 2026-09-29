const timers = {
    totalPrestation: {
        time: 0,
        interval: null,
        isRunning: false,
        display: document.getElementById('totalPrestation')
    },
    tempsOpposition: {
        time: 0,
        interval: null,
        isRunning: false,
        display: document.getElementById('tempsOpposition')
    },
};

// Mode d'affichage actuel : 'mmss' (MM:SS:ms) ou 'seconds' (secondes totales)
let currentDisplayMode = 'mmss';

// Fonction pour formater le temps selon le mode choisi
function formatTime(ms) {
    const totalSecondsNum = ms / 1000;

    if (currentDisplayMode === 'seconds') {
        // Format secondes avec 2 décimales pour les centisecondes/millisecondes
        return totalSecondsNum.toFixed(2) + 's';
    } else {
        // Format classique MM:SS:ms
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const milliseconds = ms % 1000;

        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(Math.floor(milliseconds / 10)).padStart(2, '0')}`;
    }
}

// Fonction pour mettre à jour l'affichage du temps
function updateDisplay(timerName) {
    const timer = timers[timerName];
    timer.display.textContent = formatTime(timer.time);
}

// Mettre à jour l'affichage de tous les chronos (utile lors du changement de format)
function updateAllDisplays() {
    for (const name in timers) {
        updateDisplay(name);
    }
}

// Fonction pour arrêter tous les autres chronos
function stopOtherTimers(exceptTimerName) {
    for (const name in timers) {
        if (name !== exceptTimerName && timers[name].isRunning) {
            clearInterval(timers[name].interval);
            timers[name].isRunning = false;
            const buttonIcon = document.querySelector(`.play-pause[data-target="${name}"] i`);
            if (buttonIcon) {
                buttonIcon.classList.remove('fa-pause');
                buttonIcon.classList.add('fa-play');
            }
        }
    }
}

// Fonction pour démarrer ou mettre en pause un chronomètre
function toggleTimer(timerName) {
    const timer = timers[timerName];
    const buttonIcon = document.querySelector(`.play-pause[data-target="${timerName}"] i`);

    if (timer.isRunning) {
        clearInterval(timer.interval);
        if (buttonIcon) {
            buttonIcon.classList.remove('fa-pause');
            buttonIcon.classList.add('fa-play');
        }
        if (timerName === 'totalPrestation') {
            stopOtherTimers('totalPrestation');
        }
    } else {
        const startTime = Date.now() - timer.time;
        timer.interval = setInterval(() => {
            timer.time = Date.now() - startTime;
            updateDisplay(timerName);
            updatePercentages();
        }, 10);
        if (buttonIcon) {
            buttonIcon.classList.remove('fa-play');
            buttonIcon.classList.add('fa-pause');
        }
    }
    timer.isRunning = !timer.isRunning;
}

// Fonction pour remettre à zéro un chronomètre
function resetTimer(timerName) {
    const timer = timers[timerName];
    if (timer.isRunning) {
        toggleTimer(timerName);
    }
    timer.time = 0;
    updateDisplay(timerName);
    updatePercentages();
}

// Fonction pour réinitialiser tous les chronos
function resetAllTimers() {
    for (const timerName in timers) {
        resetTimer(timerName);
    }
}

// Fonction pour mettre à jour les pourcentages
function updatePercentages() {
    const totalPrestation = timers.totalPrestation.time;
    const tempsOpposition = timers.tempsOpposition.time;
    
    if (totalPrestation > 0) {
        const percentageOpposition = ((tempsOpposition / totalPrestation) * 100).toFixed(2);
        document.getElementById('pourcentageOpposition').textContent = `(${percentageOpposition} % d'oposition)`;
    } else {
        document.getElementById('pourcentageOpposition').textContent = '';
    }
}

// Fonction pour la saisie manuelle (gère MM:SS:ms et le format secondes ex: 180 ou 180s)
function setManualTime(timerName, inputId) {
    const rawInput = document.getElementById(inputId).value.trim();
    let ms = 0;

    // Vérifier si c'est un format en secondes direct (ex: "180", "180s", "45.5")
    if (!rawInput.includes(':')) {
        const cleanInput = rawInput.toLowerCase().replace('s', '').replace(',', '.');
        const secondsValue = parseFloat(cleanInput);
        
        if (isNaN(secondsValue)) {
            alert("Format invalide. Utilisez MM:SS:ms ou un nombre de secondes (ex: 180 ou 180s).");
            return;
        }
        ms = Math.round(secondsValue * 1000);
    } else {
        // Format classique MM:SS:ms ou MM:SS
        const parts = rawInput.split(':');
        if (parts.length === 3) {
            const minutes = parseInt(parts[0], 10) || 0;
            const seconds = parseInt(parts[1], 10) || 0;
            const milliseconds = parseInt(parts[2], 10) || 0;
            ms = (minutes * 60 * 1000) + (seconds * 1000) + milliseconds * 10;
        } else if (parts.length === 2) {
            const minutes = parseInt(parts[0], 10) || 0;
            const seconds = parseInt(parts[1], 10) || 0;
            ms = (minutes * 60 * 1000) + (seconds * 1000);
        } else {
            alert("Format invalide. Utilisez MM:SS:ms ou un nombre de secondes.");
            return;
        }
    }

    const timer = timers[timerName];
    if (timer.isRunning) {
        toggleTimer(timerName);
    }
    timer.time = ms;
    updateDisplay(timerName);
    updatePercentages();
}

// Écouteurs d'événements pour les boutons individuels
document.querySelectorAll('.play-pause, .reset').forEach(button => {
    button.addEventListener('click', (e) => {
        const target = e.currentTarget.dataset.target;
        if (e.currentTarget.classList.contains('play-pause')) {
            toggleTimer(target);
        } else if (e.currentTarget.classList.contains('reset')) {
            resetTimer(target);
        }
    });
});

document.querySelectorAll('.set-time').forEach(button => {
    // S'assurer qu'on ne cible que le bouton "Ok" des cartes
    if(button.dataset.target) {
        button.addEventListener('click', (e) => {
            const target = e.target.dataset.target;
            const inputId = 'input' + target.charAt(0).toUpperCase() + target.slice(1);
            setManualTime(target, inputId);
        });
    }
});

// Bouton de réinitialisation globale
document.getElementById('resetAll').addEventListener('click', resetAllTimers);

// Bouton de basculement de la saisie manuelle
document.getElementById('toggleManualInput').addEventListener('click', () => {
    const cards = document.querySelectorAll('.chrono-card');
    cards.forEach(card => {
        card.classList.toggle('show-manual-input');
    });
});

// Bouton de basculement du format d'affichage (MM:SS <-> Secondes)
const toggleFormatBtn = document.getElementById('toggleFormat');
toggleFormatBtn.addEventListener('click', () => {
    const inputTotal = document.getElementById('inputTotalPrestation');
    const inputOpposition = document.getElementById('inputTempsOpposition');

    if (currentDisplayMode === 'mmss') {
        currentDisplayMode = 'seconds';
        toggleFormatBtn.innerHTML = '<i class="fa-solid fa-stopwatch"></i> Format : Secondes';
        
        // Mettre à jour les placeholders pour indiquer qu'on attend des secondes
        inputTotal.placeholder = "SSS.ms";
        inputOpposition.placeholder = "SSS.ms";
    } else {
        currentDisplayMode = 'mmss';
        toggleFormatBtn.innerHTML = '<i class="fa-solid fa-stopwatch"></i> Format : MM:SS';
        
        // Remettre les placeholders au format classique
        inputTotal.placeholder = "MM:SS:ms";
        inputOpposition.placeholder = "MM:SS:ms";
    }
    updateAllDisplays();
});