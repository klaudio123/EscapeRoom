let indiziDisponibili = 3;
const maxIndiziPerEnigma = 3;
const indiziUsati = {1: 0, 2: 0, 3: 0};
const enigmaStato = {1: false, 2: false, 3: false};
// Sistema di navigazione tra stanze
const totalRooms = 7;
let currentRoom = 2;
let seconds = 0;
let timerInterval;

// Inizializzazione
$(document).ready(function() {
    // Determina la stanza corrente dal percorso
    const pathParts = window.location.pathname.split('/');
    const roomPart = pathParts[pathParts.length - 2]; // room1, room2, etc.
    if (roomPart && roomPart.startsWith('room')) {
        currentRoom = parseInt(roomPart.replace('room', ''));
        console.log("currentRoom"+currentRoom)
    }
    
    // Carica i progressi salvati
    loadProgress();
    
    // Verifica che l'utente abbia accesso a questa stanza
  /*  if (currentRoom > parseInt(localStorage.getItem('escapeRoomProgress'))) {
        alert("Non hai ancora accesso a questa stanza! Completa le stanze precedenti.");
        window.location.href = '../../index.html';
        return;
    }*/
    
    // Inizializza il timer
    startTimer();
    
    // Gestione indizi
    $("#hint-btn").click(usaIndizio);
   
});

// Verifica completamento e passaggio alla stanza successiva
function checkAndProceed() {
    
    // Mostra messaggio di successo
    $(".success-message").fadeIn();
    // Salva il progresso alla stanza successiva
    saveProgress(Math.max(currentRoom + 1, localStorage.getItem('escapeRoomProgress')));

    // Naviga alla prossima stanza o alla vittoria
    if (currentRoom < totalRooms) {
           setTimeout(function() {
            window.location.href = '../room' + (currentRoom + 1) + '/index.html';
        }, 3000);
    } else {
    // Calcola e salva le statistiche
    const startTime = localStorage.getItem('escapeRoomStartTime');
    const elapsedTime = startTime ? Math.floor((Date.now() - startTime) / 1000) : seconds;
    localStorage.setItem('escapeRoomCompletionTime', elapsedTime);
            
    // Vai alla pagina di vittoria
    setTimeout(function() {
        window.location.href = '../../victory.html';
    }, 3000);
    }
}

// Funzioni per salvare/caricare progressi
function saveProgress(roomNumber) {
    localStorage.setItem('escapeRoomProgress', roomNumber);
}

function loadProgress() {
    // Se non esiste un progresso, inizializza a 1
   if (!localStorage.getItem('escapeRoomProgress')) {
        localStorage.setItem('escapeRoomProgress', 1);
    }
}

// Sistema timer
function startTimer() {
    // Carica il tempo totale dall'inizio
    const startTime = localStorage.getItem('escapeRoomStartTime');
    if (startTime) {
        seconds = Math.floor((Date.now() - parseInt(startTime)) / 1000);
    }
    
    // Aggiorna il timer ogni secondo
    timerInterval = setInterval(function() {
        seconds++;
        updateTimerDisplay();
    }, 1000);
    
    // Aggiorna il display immediatamente
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    const timeString = 
        (hours > 0 ? (hours < 10 ? '0' : '') + hours + ':' : '') +
        (minutes < 10 ? '0' : '') + minutes + ':' +
        (remainingSeconds < 10 ? '0' : '') + remainingSeconds;
    
    $("#timer").text(timeString);
}

function mostraIndizio(enigma) {
    if (indiziDisponibili > 0 && indiziUsati[enigma] < maxIndiziPerEnigma) {
        const indizioId = 'indizio' + ((enigma - 1) * 3 + indiziUsati[enigma] + 1);
        document.getElementById(indizioId).classList.remove('hidden');
        indiziUsati[enigma]++;
        indiziDisponibili--;
        document.getElementById('indizi-globali').textContent = indiziDisponibili;
    }
}

// ENIGMA 1: Ordina i livelli OSI
function controllaEnigma1() {
    const lista = Array.from(document.querySelectorAll('#lista-osi li')).map(function(li) {
        return li.textContent;
    });
    const corretta = ["Applicazione", "Presentazione", "Sessione", "Trasporto", "Rete", "Collegamento Dati", "Fisico"];
    if (JSON.stringify(lista) === JSON.stringify(corretta)) {
        document.getElementById("feedback1").textContent = "Corretto!";
        document.getElementById("feedback1").className = "correct";
        enigmaStato[1] = true;
    } else {
        document.getElementById("feedback1").textContent = "Ordine errato.";
        document.getElementById("feedback1").className = "wrong";
    }
    checkCompletion();
}

// ENIGMA 2: Protocol Cipher
function controllaEnigma2() {
    let corretto = true;
    const mappaRisultati = {
        "Applicazione": "Dati utente",
        "Trasporto": "Segmento",
        "Internet": "Pacchetto",
        "Accesso Rete": "Frame"
    };

    document.querySelectorAll('.dropzone').forEach(function(drop) {
        const atteso = drop.getAttribute("data-gruppo");
        const inserito = drop.textContent.trim();
        if (mappaRisultati[atteso] !== inserito) {
            corretto = false;
        }
    });

    if (corretto) {
        document.getElementById("feedback2").textContent = "Corretto!";
        document.getElementById("feedback2").className = "correct";
        enigmaStato[2] = true;
    } else {
        document.getElementById("feedback2").textContent = "Distribuzione errata.";
        document.getElementById("feedback2").className = "wrong";
    }
    checkCompletion();
}

// ENIGMA 3: PDU (senza tentativi)
const parolePDU = ["pacchetto", "segmento", "frame", "datagramma", "bit", "payload"];
let parolaSegreta = "";
let parolaVisualizzata = [];

function inizializzaImpiccato() {
    parolaSegreta = parolePDU[Math.floor(Math.random() * parolePDU.length)].toLowerCase();
    parolaVisualizzata = Array(parolaSegreta.length).fill("_");
    document.getElementById("wordDisplay").textContent = parolaVisualizzata.join(" ");
    document.getElementById("feedback3").textContent = "";
    document.getElementById("guessInput").disabled = false;
    document.getElementById("usaIndizio").disabled = false;
}

function controllaEnigma3() {
    const input = document.getElementById("guessInput");
    const lettera = input.value.toLowerCase();
    input.value = "";

    if (lettera.length !== 1 || !/[a-zàèéìòù]/.test(lettera)) return;

    let letteraCorrettamenteTrovata = false;
    for (let i = 0; i < parolaSegreta.length; i++) {
        if (parolaSegreta[i] === lettera && parolaVisualizzata[i] === "_") {
            parolaVisualizzata[i] = lettera;
            letteraCorrettamenteTrovata = true;
        }
    }

    if (letteraCorrettamenteTrovata) {
        document.getElementById("wordDisplay").textContent = parolaVisualizzata.join(" ");
        controllaFineGioco();
    } else {
        document.getElementById("feedback3").textContent = "Lettera " + lettera.toUpperCase() + " sbagliata.";
        document.getElementById("feedback3").className = "wrong";
    }
}

function usaIndizio() {
    if (indiziDisponibili > 0 && indiziUsati[3] < maxIndiziPerEnigma) {
        let indiciNascosti = [];
        for (let i = 0; i < parolaVisualizzata.length; i++) {
            if (parolaVisualizzata[i] === "_") {
                indiciNascosti.push(i);
            }
        }

        if (indiciNascosti.length === 0) return;

        const indiceCasuale = indiciNascosti[Math.floor(Math.random() * indiciNascosti.length)];
        const lettera = parolaSegreta[indiceCasuale];

        for (let i = 0; i < parolaSegreta.length; i++) {
            if (parolaSegreta[i] === lettera && parolaVisualizzata[i] === "_") {
                parolaVisualizzata[i] = lettera;
            }
        }

        indiziDisponibili--;
        indiziUsati[3]++;
        document.getElementById("indizi-globali").textContent = indiziDisponibili;
        document.getElementById("wordDisplay").textContent = parolaVisualizzata.join(" ");

        // 🔒 Disattiva il pulsante se non ci sono più indizi globali
        if (indiziDisponibili <= 0) {
            document.getElementById("usaIndizio").disabled = true;
        }

        controllaFineGioco();
    }
}

function controllaFineGioco() {
    if (parolaVisualizzata.join("") === parolaSegreta) {
        document.getElementById("feedback3").textContent = "Corretto!";
        document.getElementById("feedback3").className = "correct";
        enigmaStato[3] = true;
        disabilitaGioco();
        checkCompletion(); // Chiamata per verificare il completamento
    }
}

function disabilitaGioco() {
    document.getElementById("guessInput").disabled = true;
    document.getElementById("usaIndizio").disabled = true;
}

document.addEventListener("DOMContentLoaded", inizializzaImpiccato);

// Verifica se tutti gli enigmi sono stati completati
function checkCompletion() {
    if (Object.values(enigmaStato).every(function(v) { return v; })) {
        const endTime = Date.now();
        const startTime = localStorage.getItem('escapeRoomStartTime');
        const duration = Math.floor((endTime - startTime) / 1000);
        localStorage.setItem("tempoStanza2", duration.toString());
        setInterval(function() {
            window.location.href = "Completato.html"; // Reindirizza alla pagina di completamento
        },2000)
    }
}

// Drag and drop
$(document).ready(function() {
    const draggables = document.querySelectorAll('.draggable');
    const dropzones = document.querySelectorAll('.dropzone');

    draggables.forEach(function(elem) {
        elem.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('text/plain', e.target.textContent.trim());
        });
    });

    dropzones.forEach(function(zone) {
        zone.addEventListener('dragover', function(e) {
            e.preventDefault();
        });
        zone.addEventListener('drop', function(e) {
            e.preventDefault();
            const data = e.dataTransfer.getData('text/plain');
            zone.textContent = data;
        });
    });

    const lis = document.querySelectorAll("#lista-osi li");
    let dragSrcEl = null;

    lis.forEach(function(li) {
        li.addEventListener('dragstart', function(e) {
            dragSrcEl = this;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', this.innerHTML);
        });

        li.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });

        li.addEventListener('drop', function(e) {
            e.stopPropagation();
            if (dragSrcEl !== this) {
                let temp = this.innerHTML;
                this.innerHTML = dragSrcEl.innerHTML;
                dragSrcEl.innerHTML = temp;
            }
            return false;
        });
    });
});