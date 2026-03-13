const state = {
  money: 120,
  eggs: 0,
  crates: 0,
  stack: 0,
  chickens: 2,
  productionRate: 1,
  chickenCost: 80,
  upgradeCost: 150,
  customerQueue: 0,
};

const refs = {
  money: document.getElementById("money"),
  eggs: document.getElementById("eggs"),
  crates: document.getElementById("crates"),
  chickens: document.getElementById("chickens"),
  productionRate: document.getElementById("productionRate"),
  chickenCost: document.getElementById("chickenCost"),
  upgradeCost: document.getElementById("upgradeCost"),
  queuedCustomers: document.getElementById("queuedCustomers"),
  stackCount: document.getElementById("stackCount"),
  stackVisual: document.getElementById("stackVisual"),
  log: document.getElementById("log"),
  buyChickenBtn: document.getElementById("buyChickenBtn"),
  upgradeChickenBtn: document.getElementById("upgradeChickenBtn"),
  packBtn: document.getElementById("packBtn"),
  sellBtn: document.getElementById("sellBtn"),
};

function addLog(message) {
  const li = document.createElement("li");
  li.textContent = `[${new Date().toLocaleTimeString("de-DE")}] ${message}`;
  refs.log.prepend(li);

  while (refs.log.children.length > 8) {
    refs.log.lastChild.remove();
  }
}

function renderStack() {
  refs.stackVisual.innerHTML = "";
  for (let i = 0; i < state.stack; i += 1) {
    const crateEl = document.createElement("div");
    crateEl.className = "crate";
    refs.stackVisual.append(crateEl);
  }
}

function updateUI() {
  refs.money.textContent = Math.floor(state.money).toString();
  refs.eggs.textContent = Math.floor(state.eggs).toString();
  refs.crates.textContent = state.crates.toString();
  refs.chickens.textContent = state.chickens.toString();
  refs.productionRate.textContent = state.productionRate.toFixed(1);
  refs.chickenCost.textContent = state.chickenCost.toString();
  refs.upgradeCost.textContent = state.upgradeCost.toString();
  refs.queuedCustomers.textContent = state.customerQueue.toString();
  refs.stackCount.textContent = `${state.stack}`;

  refs.buyChickenBtn.disabled = state.money < state.chickenCost;
  refs.upgradeChickenBtn.disabled = state.money < state.upgradeCost;
  refs.packBtn.disabled = state.eggs < 6;
  refs.sellBtn.disabled = state.crates < 1;

  renderStack();
}

function produceEggs() {
  state.eggs += state.chickens * state.productionRate;
  updateUI();
}

function queueCustomers() {
  state.customerQueue += 1;
  addLog("Ein Kunde wartet am Stand.");
  updateUI();
}

refs.buyChickenBtn.addEventListener("click", () => {
  if (state.money < state.chickenCost) {
    return;
  }

  state.money -= state.chickenCost;
  state.chickens += 1;
  state.chickenCost = Math.floor(state.chickenCost * 1.3);
  addLog("Neues Huhn gekauft.");
  updateUI();
});

refs.upgradeChickenBtn.addEventListener("click", () => {
  if (state.money < state.upgradeCost) {
    return;
  }

  state.money -= state.upgradeCost;
  state.productionRate += 0.3;
  state.upgradeCost = Math.floor(state.upgradeCost * 1.5);
  addLog("Wiese verbessert: schnellere Eier-Produktion.");
  updateUI();
});

refs.packBtn.addEventListener("click", () => {
  if (state.eggs < 6) {
    return;
  }

  state.eggs -= 6;
  state.crates += 1;
  state.stack += 1;
  addLog("6 Eier verpackt: +1 Kiste auf dem Stapel.");

  if (state.stack >= 10) {
    state.money += 120;
    state.stack = 0;
    addLog("Perfekter 10er-Stapel! Bonus +120$.");
  }

  updateUI();
});

refs.sellBtn.addEventListener("click", () => {
  if (state.crates < 1) {
    return;
  }

  const hasCustomer = state.customerQueue > 0;
  state.crates -= 1;
  state.money += hasCustomer ? 55 : 45;

  if (hasCustomer) {
    state.customerQueue -= 1;
    addLog("Kiste direkt an wartenden Kunden verkauft (+55$).");
  } else {
    addLog("Kiste am Markt verkauft (+45$).");
  }

  updateUI();
});

setInterval(produceEggs, 1000);
setInterval(queueCustomers, 12000);

addLog("Farm gestartet. Produziere Eier und baue hohe Stapel!");
updateUI();
