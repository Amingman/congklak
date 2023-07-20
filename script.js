let gameBoard = document.querySelector(`.game-board`)
let p1Lumbung = document.querySelector(`.p1-lumbung .lumbung`)
let p2Lumbung = document.querySelector(`.p2-lumbung .lumbung`)
let p1Sawah = document.querySelectorAll(`.p1-sawah .sawah`)
let p2Sawah = document.querySelectorAll(`.p2-sawah .sawah`)
let allSawah = document.querySelectorAll(`.sawah`)

let messages = document.querySelector(`.messages`)
let resetBtn = document.querySelector(`.resetBtn`)

let currentPlayer = 1
let activeRow = 1

let gameScore = {
  p1: {
    0: { player: 1, score: 0, id: `10` },
    1: { player: 1, score: 0, id: `11` },
    2: { player: 1, score: 0, id: `12` },
    3: { player: 1, score: 0, id: `13` },
    4: { player: 1, score: 0, id: `14` },
    5: { player: 1, score: 0, id: `15` },
    6: { player: 1, score: 0, id: `16` },
    L: { player: 1, score: 0, id: `1L` },
  },

  p2: {
    0: { player: 2, score: 0, id: `20` },
    1: { player: 2, score: 0, id: `21` },
    2: { player: 2, score: 0, id: `22` },
    3: { player: 2, score: 0, id: `23` },
    4: { player: 2, score: 0, id: `24` },
    5: { player: 2, score: 0, id: `25` },
    6: { player: 2, score: 0, id: `26` },
    L: { player: 2, score: 0, id: `2L` },
  },
}

// ========================= Initialising =========================

lockAllID(1)
lockAllID(2)

let startingRice = 7

function handleReset() {
  console.log(`============= START =============`)
  lockAllID(1)
  lockAllID(2)
  p1Lumbung.textContent = 0
  gameScore.p1.L.score = 0
  p2Lumbung.textContent = 0
  gameScore.p2.L.score = 0
  for (let i = 0; i < p1Sawah.length; i++) {
    p1Sawah[i].textContent = startingRice
    gameScore.p1[i].score = startingRice
  }
  for (let i = 0; i < p2Sawah.length; i++) {
    p2Sawah[i].textContent = startingRice
    gameScore.p2[i].score = startingRice
  }

  activeRow = Math.floor(Math.random() * 2) + 1
  currentPlayer = activeRow
  changeMessage(`Player ${currentPlayer}`)
  unlockAllID(currentPlayer)
  highlightAllPossible()
}
resetBtn.addEventListener(`click`, handleReset)

// ========================= Move Handlers =========================
for (let i = 0; i < p1Sawah.length; i++) {
  p1Sawah[i].addEventListener(`click`, handleMove)
  p2Sawah[i].addEventListener(`click`, handleMove)
}

function switchActive() {
  if (activeRow == 1) {
    activeRow = 2
  } else {
    activeRow = 1
  }
  console.log(`Switching Row`)
}

function addRice(id) {
  if (id == "L") {
    if (activeRow == 1) {
      p1Lumbung.textContent = Number(p1Lumbung.textContent) + 1
      gameScore.p1[`L`].score += 1
    } else {
      p2Lumbung.textContent = Number(p2Lumbung.textContent) + 1
      gameScore.p2[`L`].score += 1
    }
  } else if (activeRow == 1) {
    p1Sawah[6 - id].textContent = Number(p1Sawah[6 - id].textContent) + 1
    gameScore.p1[6 - id].score += 1
  } else {
    p2Sawah[id].textContent = Number(p2Sawah[id].textContent) + 1
    gameScore.p2[id].score += 1
  }
}

function emptyRice(playerID, sawahID) {
  if (playerID == 1) {
    gameScore.p1[sawahID].score = 0
    p1Sawah[sawahID].textContent = 0
  } else if (playerID == 2) {
    gameScore.p2[sawahID].score = 0
    p2Sawah[sawahID].textContent = 0
  }
}

function handleMove(event) {
  let currentID = event.target.id
  let playerRow = currentID.charAt(0)
  let sawahID = currentID.charAt(1)
  let amount = event.target.textContent
  let available = amount

  event.target.textContent = 0
  console.log(`Player Row ${playerRow}`)
  console.log(`sawahID ${sawahID}`)
  if (Number(playerRow) == 1) {
    emptyRice(playerRow, 6 - Number(sawahID))
  } else {
    emptyRice(playerRow, sawahID)
  }
  //   emptyRice(playerRow, sawahID)

  let accum = 1
  let id
  console.log(`Selected ${currentID}`)

  for (let i = available; i > 0; i--) {
    id = Number(sawahID) + accum
    if (id <= 6) {
      console.log(`adding to ${activeRow}${id}`)
      addRice(id)
    }
    accum++
    if (id > 6) {
      if (activeRow == currentPlayer) {
        console.log(`adding to ${activeRow}L`)
        addRice(`L`)
        switchActive()
        sawahID = 0
        accum = 0
      } else {
        switchActive()
        sawahID = 0
        accum = 0
        id = Number(sawahID) + accum
        addRice(id)
        accum++
      }
    }
  }

  lockAllID(1)
  lockAllID(2)

  let moveCheck = checkEndOfMove(id)
  console.log(moveCheck)
  if (moveCheck == `finish`) {
    changeMessage(processEndGame())
  } else if (moveCheck == `end`) {
    switchPlayer()
    highlightAllPossible()
  } else {
    if (moveCheck == `continue`) {
      if (activeRow == 1) {
        unlockSawah(activeRow, 6 - Number(id))
      }
      if (activeRow == 2) {
        unlockSawah(activeRow, id)
      }
    }
    if (moveCheck == `free`) {
      if (checkPossibleFreeMove(currentPlayer)) {
        unlockAllID(currentPlayer)
        switchActive()
      } else {
        switchPlayer()
      }
    }
    if (moveCheck == `capture`) {
      console.log(`capturing`)
      let capturedID = 6 - Number(id)
      let capturedRice
      if (currentPlayer == 1) {
        capturedRice = gameScore.p2[capturedID].score
        gameScore.p1[`L`].score += capturedRice
        p1Lumbung.textContent = Number(p1Lumbung.textContent) + capturedRice
        emptyRice(2, capturedID)
      }
      if (currentPlayer == 2) {
        capturedRice = gameScore.p1[6 - capturedID].score
        gameScore.p2[`L`].score += capturedRice
        p2Lumbung.textContent = Number(p2Lumbung.textContent) + capturedRice
        emptyRice(1, 6 - capturedID)
      }
      switchPlayer()
    }
  }
  highlightAllPossible()
  console.log(`==========`)
}

// ========================= Move Checkers =========================

function switchPlayer() {
  if (currentPlayer == 1) {
    currentPlayer = 2
    unlockAllID(2)
    lockAllID(1)
  } else {
    currentPlayer = 1
    lockAllID(2)
    unlockAllID(1)
  }

  // Reset active row
  if (currentPlayer != activeRow) {
    switchActive()
  }

  // Check if new player has possible move
  if (checkPossibleFreeMove(currentPlayer)) {
    console.log(`Switching Player`)
    changeMessage(`Player ${currentPlayer}'s turn`)
  } else {
    changeMessage(
      `Player ${currentPlayer} has no valid move. Switching back to Player ${
        2 - currentPlayer
      }`
    )
    switchPlayer()
  }
  //   changeMessage(checkPossibleMove())
  //   changeMessage(`Player ${currentPlayer}`)
}

function checkPossibleMove() {
  if (currentPlayer == 1) {
    for (sawah of p1Sawah) {
      if (Number(sawah.textContent) != 0) {
        return true
      }
    }

    return false
  }
  if (currentPlayer == 2) {
    for (sawah of p2Sawah) {
      if (Number(sawah.textContent) != 0) {
        return true
      }
    }
    return false
  }
}

function checkEndOfMove(id) {
  //   console.log(id)
  //   console.log(activeRow)
  //   console.log(currentPlayer)
  //   console.log(gameScore.p1[id].score)
  //   console.log(gameScore.p2[id].score)

  if (checkEndOfGame()) {
    return `finish`
  } else if (activeRow == currentPlayer) {
    // console.log(`Same Player`)
    if (activeRow == 1) {
      if (gameScore.p1[6 - id].score > 1) {
        return `continue`
      } else if (gameScore.p1[6 - id].score == 1) {
        return `capture`
      }
    } else if (activeRow == 2) {
      if (gameScore.p2[id].score > 1) {
        return `continue`
      } else if (gameScore.p2[id].score == 1) {
        return `capture`
      }
    }
  } else if (activeRow != currentPlayer) {
    // console.log(`Different Player`)

    // The L check is here instead at Same Player condition because at handleMove, the activeRow has been switched
    if (id == 7) {
      return `free`
    } else if (currentPlayer == 2) {
      //   console.log(`Check P1`)
      if (gameScore.p1[6 - id].score > 1) {
        return `continue`
      } else if (gameScore.p1[6 - id].score == 1) {
        return `end`
      }
    } else if (currentPlayer == 1) {
      //   console.log(`Check P2`)
      if (gameScore.p2[id].score > 1) {
        return `continue`
      } else if (gameScore.p2[id].score == 1) {
        return `end`
      }
    }
  }
  return `unique`
}

function checkPossibleFreeMove(playerID) {
  if (playerID == 1) {
    for (let i = 0; i < p1Sawah.length; i++) {
      if (p1Sawah[i].textContent != `0`) {
        return true
      }
    }
    return false
  }
  if (playerID == 2) {
    for (let i = 0; i < p2Sawah.length; i++) {
      if (p2Sawah[i].textContent != `0`) {
        return true
      }
    }
    return false
  }
}

function checkEndOfGame() {
  for (let i = 0; i < allSawah.length; i++) {
    if (allSawah[i].textContent != `0`) {
      return false
    }
  }
  return true
}

// ========================= Lock and Unlocks ======================
function lockAllID(targetID) {
  if (targetID == 1) {
    for (i of p1Sawah) {
      i.style.pointerEvents = `none`
    }
  } else if (targetID == 2) {
    for (i of p2Sawah) {
      i.style.pointerEvents = `none`
    }
  }
}

function unlockAllID(targetID) {
  if (targetID == 1) {
    for (i of p1Sawah) {
      i.style.pointerEvents = `auto`
    }
  } else if (targetID == 2) {
    for (i of p2Sawah) {
      i.style.pointerEvents = `auto`
    }
  }
}

function lockSawah(playerID, sawahID) {
  if (playerID == 1) {
    p1Sawah[sawahID].style.pointerEvents = `none`
  } else if (playerID == 2) {
    p2Sawah[sawahID].style.pointerEvents = `none`
  }
}

function unlockSawah(playerID, sawahID) {
  if (playerID == 1) {
    p1Sawah[sawahID].style.pointerEvents = `auto`
  } else if (playerID == 2) {
    p2Sawah[sawahID].style.pointerEvents = `auto`
  }
}

// ========================= UI =========================
function changeMessage(newMessage) {
  messages.textContent = newMessage
}

function highlightAllPossible() {
  for (sawah of allSawah) {
    let possibility = sawah.style.pointerEvents
    if (possibility == `auto` && sawah.textContent != `0`) {
      sawah.classList.add(`available`)
    } else {
      sawah.classList.remove(`available`)
    }
  }
}

function processEndGame() {
  lockAllID(1)
  lockAllID(2)
  let score1 = gameScore.p1.L.score
  let score2 = gameScore.p2.L.score
  if (score1 > score2) {
    return `Player 1 Wins! ${score1} vs ${score2}`
  } else if (score2 > score1) {
    return `Player 2 Wins! ${score1} vs ${score2}`
  } else {
    return `It's A Tie! ${score1} vs ${score2}`
  }
}
