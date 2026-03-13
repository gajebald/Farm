const state = {
  money: 0,
  eggs: 0,
  crates: 0,
  stack: 0,
  chickens: 0,
  level: 1,
  buyCost: 200,
  upgradeCost: 450,
};

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const moneyEl = document.getElementById("money");
const eggsEl = document.getElementById("eggs");
const cratesEl = document.getElementById("crates");
const stackEl = document.getElementById("stack");
const chickensEl = document.getElementById("chickens");
const logEl = document.getElementById("log");
const buyChickenBtn = document.getElementById("buyChicken");
const upgradeFarmBtn = document.getElementById("upgradeFarm");
const resetSaveBtn = document.getElementById("resetSave");

const zones = {
  pen: { x: 690, y: 60, w: 360, h: 260 },
  machine: { x: 450, y: 350, w: 180, h: 120 },
  market: { x: 730, y: 420, w: 280, h: 160 },
  buy: { x: 280, y: 330, w: 150, h: 95 },
};

const player = { x: 280, y: 520, tx: 280, ty: 520, speed: 2.8, load: 0 };
const eggsOnGround = [];
const npcs = [];
let productionTimer = 0;
let customerTimer = 0;
let saveTimer = 0;

function log(msg) {
  const li = document.createElement("li");
  li.textContent = `${new Date().toLocaleTimeString("de-DE")}: ${msg}`;
  logEl.prepend(li);
  while (logEl.children.length > 8) logEl.lastChild.remove();
}

function inRect(p, r) {
  return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
}

function updateStats() {
  moneyEl.textContent = state.money;
  eggsEl.textContent = state.eggs;
  cratesEl.textContent = state.crates;
  stackEl.textContent = state.stack;
  chickensEl.textContent = state.chickens;
  state.buyCost = Math.round(200 + (state.chickens - 6) * 80);
  state.upgradeCost = Math.round(450 * (1 + (state.level - 1) * 0.55));
  buyChickenBtn.textContent = `Huhn kaufen (${state.buyCost}$)`;
  upgradeFarmBtn.textContent = `Farm Upgrade (${state.upgradeCost}$)`;
  buyChickenBtn.disabled = state.money < state.buyCost;
  upgradeFarmBtn.disabled = state.money < state.upgradeCost;
}

function spawnEgg() {
  const x = zones.pen.x + 25 + Math.random() * (zones.pen.w - 50);
  const y = zones.pen.y + 25 + Math.random() * (zones.pen.h - 50);
  eggsOnGround.push({ x, y });
}

function spawnCustomer() {
  if (npcs.length > 6) return;
  npcs.push({
    x: zones.market.x + 25 + Math.random() * (zones.market.w - 50),
    y: zones.market.y + zones.market.h - 30,
    need: 2 + Math.floor(Math.random() * 4),
  });
  log("Neuer Kunde am Verkaufstisch.");
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function movePlayer() {
  const dx = player.tx - player.x;
  const dy = player.ty - player.y;
  const d = Math.hypot(dx, dy);
  if (d < 2) return;
  player.x += (dx / d) * player.speed;
  player.y += (dy / d) * player.speed;
}

function tryCollectEggs() {
  for (let i = eggsOnGround.length - 1; i >= 0; i -= 1) {
    if (distance(player, eggsOnGround[i]) < 24) {
      eggsOnGround.splice(i, 1);
      state.eggs += 1;
    }
  }
}

function processMachine() {
  if (inRect(player, zones.machine) && state.eggs >= 6) {
    const bundles = Math.floor(state.eggs / 6);
    const maxProcess = Math.min(2 + state.level, bundles);
    state.eggs -= maxProcess * 6;
    state.crates += maxProcess;
    state.stack += maxProcess;
    log(`${maxProcess} Kiste(n) produziert.`);

    if (state.stack >= 12) {
      state.money += 220;
      state.stack = 0;
      log("Perfekter 12er-Stapel! +220$ Bonus");
    }
  }
}

function sellCrates() {
  if (!inRect(player, zones.market) || npcs.length === 0 || state.crates === 0) return;

  const customer = npcs[0];
  const amount = Math.min(state.crates, customer.need);
  customer.need -= amount;
  state.crates -= amount;
  state.money += amount * 55;

  if (customer.need <= 0) {
    npcs.shift();
    log("Kunde glücklich bedient.");
  }
}

function drawWorld() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#ead29a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#65b14e";
  ctx.fillRect(zones.pen.x, zones.pen.y, zones.pen.w, zones.pen.h);
  ctx.strokeStyle = "#8c5730";
  ctx.lineWidth = 6;
  ctx.strokeRect(zones.pen.x, zones.pen.y, zones.pen.w, zones.pen.h);

  ctx.fillStyle = "#3778c9";
  ctx.fillRect(zones.machine.x, zones.machine.y, zones.machine.w, zones.machine.h);
  ctx.fillStyle = "#f0f0f0";
  ctx.fillRect(zones.machine.x + 14, zones.machine.y - 24, zones.machine.w - 30, 40);

  ctx.fillStyle = "#8d5b31";
  ctx.fillRect(zones.market.x, zones.market.y, zones.market.w, 26);

  ctx.fillStyle = "rgba(100,70,30,.8)";
  ctx.fillRect(zones.buy.x, zones.buy.y, zones.buy.w, zones.buy.h);
  ctx.fillStyle = "white";
  ctx.font = "bold 22px sans-serif";
  ctx.fillText(`BUY ${state.buyCost}$`, zones.buy.x + 18, zones.buy.y + 55);

  ctx.fillStyle = "#fff";
  eggsOnGround.forEach((egg) => {
    ctx.beginPath();
    ctx.ellipse(egg.x, egg.y, 7, 9, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  for (let i = 0; i < state.chickens; i += 1) {
    const x = zones.pen.x + 34 + (i % 8) * 40;
    const y = zones.pen.y + 36 + Math.floor(i / 8) * 50;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#d73838";
    ctx.fillRect(x - 3, y - 16, 6, 5);
  }

  npcs.forEach((npc) => {
    ctx.fillStyle = "#365";
    ctx.beginPath();
    ctx.arc(npc.x, npc.y, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(50,30,30,.7)";
    ctx.fillRect(npc.x - 16, npc.y - 36, 34, 22);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText(String(npc.need), npc.x - 4, npc.y - 20);
  });

  ctx.fillStyle = "#2969a3";
  ctx.beginPath();
  ctx.arc(player.x, player.y, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f6de98";
  ctx.beginPath();
  ctx.arc(player.x, player.y - 14, 8, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < Math.min(state.crates, 10); i += 1) {
    ctx.fillStyle = "#8a5a2d";
    ctx.fillRect(player.x - 12, player.y - 24 - i * 6, 24, 5);
  }
}

async function loadState() {
  const res = await fetch("index.php?api=load");
  const data = await res.json();
  Object.assign(state, data.state);
  updateStats();
}

async function saveState() {
  await fetch("index.php?api=save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      money: state.money,
      eggs: state.eggs,
      crates: state.crates,
      stack: state.stack,
      chickens: state.chickens,
      level: state.level,
    }),
  });
}

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  player.tx = ((e.clientX - rect.left) / rect.width) * canvas.width;
  player.ty = ((e.clientY - rect.top) / rect.height) * canvas.height;

  if (inRect(player, zones.buy) && state.money >= state.buyCost) {
    state.money -= state.buyCost;
    state.chickens += 1;
    log("Neues Huhn gekauft.");
  }

  updateStats();
});

buyChickenBtn.addEventListener("click", () => {
  if (state.money < state.buyCost) return;
  state.money -= state.buyCost;
  state.chickens += 1;
  log("Huhn gekauft.");
  updateStats();
});

upgradeFarmBtn.addEventListener("click", () => {
  if (state.money < state.upgradeCost) return;
  state.money -= state.upgradeCost;
  state.level += 1;
  state.money += 120;
  log("Farm-Level erhöht: Maschine ist schneller.");
  updateStats();
});

resetSaveBtn.addEventListener("click", async () => {
  await fetch("index.php?api=reset");
  location.reload();
});

function tick() {
  productionTimer += 1;
  customerTimer += 1;
  saveTimer += 1;

  if (productionTimer >= 60) {
    productionTimer = 0;
    const amount = Math.max(1, Math.floor(state.chickens / 3));
    for (let i = 0; i < amount; i += 1) spawnEgg();
  }

  if (customerTimer >= 420) {
    customerTimer = 0;
    spawnCustomer();
  }

  movePlayer();
  tryCollectEggs();
  processMachine();
  sellCrates();

  if (saveTimer >= 300) {
    saveTimer = 0;
    saveState();
  }

  drawWorld();
  updateStats();
  requestAnimationFrame(tick);
}

loadState().then(() => {
  log("Spielstand geladen. Willkommen zurück!");
  tick();
});
