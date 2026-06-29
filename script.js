const PP_MAKE_WEBHOOK_URL = "https://hook.eu1.make.com/4gp8psvihyalvi9xpr6u1scl6hosg5mr";

let ppState = {};

function ppFormatKr(amount) {
  return Number(amount).toLocaleString("da-DK") + " kr.";
}

function getEl(id) {
  return document.getElementById(id);
}

function show(id) {
  const el = getEl(id);
  if (el) el.classList.remove("hidden");
}

function hide(id) {
  const el = getEl(id);
  if (el) el.classList.add("hidden");
}

function showError(message) {
  const error = getEl("pp-errorMessage");
  if (!error) return;
  error.textContent = message;
  error.classList.remove("hidden");
}

function hideError() {
  const error = getEl("pp-errorMessage");
  if (!error) return;
  error.textContent = "";
  error.classList.add("hidden");
}

function calculatePrice() {
  hideError();

  const menu = getEl("pp-menu");
  const personsInput = getEl("pp-persons");
  const delivery = getEl("pp-delivery");

  const persons = parseInt(personsInput.value || "0", 10);
  const menuPrice = parseInt(menu.value, 10);
  const menuName = menu.options[menu.selectedIndex].dataset.name;
  const deliveryPrice = parseInt(delivery.value, 10);
  const deliveryLabel = delivery.options[delivery.selectedIndex].dataset.label;

  if (!persons || persons < 30) {
    alert("Minimum er 30 personer.");
    personsInput.value = 30;
    return;
  }

  if (deliveryPrice === 1000 && persons < 40) {
    alert("Ved levering udenfor Esbjerg er minimum 40 personer.");
    personsInput.value = 40;
    return;
  }

  const foodPrice = persons * menuPrice;
  const total = foodPrice + deliveryPrice;

  ppState = {
    persons,
    menuPrice,
    menuName,
    deliveryPrice,
    deliveryLabel,
    foodPrice,
    total,
    totalFormatted: ppFormatKr(total)
  };

  getEl("pp-totalPrice").textContent = ppFormatKr(total);
  getEl("pp-priceDetails").textContent = `${persons} personer · ${menuName} · ${deliveryLabel}`;

  show("pp-priceBox");
  show("pp-leadSection");
  hide("pp-confirmationSection");

  getEl("pp-leadSection").scrollIntoView({ behavior: "smooth", block: "start" });
}

async function sendOffer() {
  hideError();

  if (!ppState.total) {
    alert("Beregn prisen først.");
    return;
  }

  const name = getEl("pp-name").value.trim();
  const phone = getEl("pp-phone").value.trim();
  const email = getEl("pp-email").value.trim();
  const date = getEl("pp-date").value;
  const eventType = getEl("pp-eventType").value;
  const city = getEl("pp-city").value.trim();
  const time = getEl("pp-time").value;
  const address = getEl("pp-address").value.trim();
  const notes = getEl("pp-notes").value.trim();

  if (!name || !phone || !email || !date) {
    showError("Udfyld venligst navn, telefon, email og dato.");
    return;
  }

  if (!email.includes("@") || !email.includes(".")) {
    showError("Indtast venligst en gyldig email.");
    return;
  }

  const payload = {
    name,
    phone,
    email,
    eventDate: date,
    eventType,
    city: city || "Ikke angivet",
    preferredTime: time || "Ikke angivet",
    address: address || "Ikke angivet",
    notes: notes || "Ingen særlige ønsker angivet.",
    persons: ppState.persons,
    menuName: ppState.menuName,
    menuPrice: ppState.menuPrice,
    foodPrice: ppState.foodPrice,
    deliveryLabel: ppState.deliveryLabel,
    deliveryPrice: ppState.deliveryPrice,
    total: ppState.total,
    totalFormatted: ppState.totalFormatted,
    source: "PattePerfekt hjemmeside",
    submittedAt: new Date().toISOString()
  };

  const sendButton = getEl("sendBtn");
  sendButton.disabled = true;
  sendButton.textContent = "Sender...";

  try {
    if (PP_MAKE_WEBHOOK_URL === "INDSAET_MAKE_WEBHOOK_URL_HER") {
      console.log("Make.com payload klar til test:", payload);
      throw new Error("Make.com webhook URL mangler i script.js");
    }

    const response = await fetch(PP_MAKE_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error("Webhook svarede ikke korrekt.");

    getEl("pp-thankYouText").textContent =
      `Dit tilbud er sendt til ${email}. PattePerfekt har også modtaget din forespørgsel.`;
    getEl("pp-confirmationPrice").textContent = ppState.totalFormatted;
    show("pp-confirmationSection");
    getEl("pp-confirmationSection").scrollIntoView({ behavior: "smooth", block: "center" });
  } catch (error) {
    console.error(error);
    showError("Noget gik galt. Prøv igen, eller kontakt PattePerfekt direkte på telefon eller mail.");
  } finally {
    sendButton.disabled = false;
    sendButton.textContent = "Send min forespørgsel";
  }
}

function setupNavigation() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (!toggle || !links) return;

  toggle.addEventListener("click", () => {
    const isOpen = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  links.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      links.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  getEl("calculateBtn")?.addEventListener("click", calculatePrice);
  getEl("sendBtn")?.addEventListener("click", sendOffer);
});function calculatePrice() {
  hideError();

  const menu = getEl("pp-menu");
  const personsInput = getEl("pp-persons");
  const delivery = getEl("pp-delivery");

  const selectedMenu = menu.options[menu.selectedIndex];
  const persons = parseInt(personsInput.value || "0", 10);
  const menuPrice = parseInt(menu.value, 10);
  const menuName = selectedMenu.dataset.name;
  const minPersons = parseInt(selectedMenu.dataset.min || "30", 10);
  const outsideMinPersons = parseInt(selectedMenu.dataset.outsideMin || "40", 10);
  const areaRule = selectedMenu.dataset.area || "all";
  const deliveryPrice = parseInt(delivery.value, 10);
  const deliveryLabel = delivery.options[delivery.selectedIndex].dataset.label;

  if (!persons || persons < minPersons) {
    alert(`${menuName} har minimum ${minPersons} personer.`);
    personsInput.value = minPersons;
    return;
  }

  if (areaRule === "esbjerg-only" && deliveryPrice === 1000) {
    alert("Denne menu er lavet til små selskaber indenfor Esbjerg. Vælg levering i Esbjerg eller afhentning/aftales nærmere.");
    delivery.value = "500";
    return;
  }

  if (deliveryPrice === 1000 && persons < outsideMinPersons) {
    alert(`Ved levering udenfor Esbjerg er minimum ${outsideMinPersons} personer.`);
    personsInput.value = outsideMinPersons;
    return;
  }

  const foodPrice = persons * menuPrice;
  const total = foodPrice + deliveryPrice;

  ppState = {
    persons,
    menuPrice,
    menuName,
    minPersons,
    deliveryPrice,
    deliveryLabel,
    foodPrice,
    total,
    totalFormatted: ppFormatKr(total)
  };

  getEl("pp-totalPrice").textContent = ppFormatKr(total);
  getEl("pp-priceDetails").textContent = `${persons} personer · ${menuName} · ${deliveryLabel}`;

  show("pp-priceBox");
  show("pp-leadSection");
  hide("pp-confirmationSection");

  getEl("pp-leadSection").scrollIntoView({ behavior: "smooth", block: "start" });
}

async function sendOffer() {
  hideError();

  if (!ppState.total) {
    alert("Beregn prisen først.");
    return;
  }

  const name = getEl("pp-name").value.trim();
  const phone = getEl("pp-phone").value.trim();
  const email = getEl("pp-email").value.trim();
  const date = getEl("pp-date").value;
  const eventType = getEl("pp-eventType").value;
  const city = getEl("pp-city").value.trim();
  const time = getEl("pp-time").value;
  const address = getEl("pp-address").value.trim();
  const notes = getEl("pp-notes").value.trim();

  if (!name || !phone || !email || !date) {
    showError("Udfyld venligst navn, telefon, email og dato.");
    return;
  }

  if (!email.includes("@") || !email.includes(".")) {
    showError("Indtast venligst en gyldig email.");
    return;
  }

  const payload = {
    name,
    phone,
    email,
    eventDate: date,
    eventType,
    city: city || "Ikke angivet",
    preferredTime: time || "Ikke angivet",
    address: address || "Ikke angivet",
    notes: notes || "Ingen særlige ønsker angivet.",
    persons: ppState.persons,
    menuName: ppState.menuName,
    menuPrice: ppState.menuPrice,
    foodPrice: ppState.foodPrice,
    deliveryLabel: ppState.deliveryLabel,
    deliveryPrice: ppState.deliveryPrice,
    total: ppState.total,
    totalFormatted: ppState.totalFormatted,
    source: "PattePerfekt hjemmeside",
    submittedAt: new Date().toISOString()
  };

  const sendButton = getEl("sendBtn");
  sendButton.disabled = true;
  sendButton.textContent = "Sender...";

  try {
    if (PP_MAKE_WEBHOOK_URL === "INDSAET_MAKE_WEBHOOK_URL_HER") {
      console.log("Make.com payload klar til test:", payload);
      throw new Error("Make.com webhook URL mangler i script.js");
    }

    const response = await fetch(PP_MAKE_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error("Webhook svarede ikke korrekt.");

    getEl("pp-thankYouText").textContent =
      `Dit tilbud er sendt til ${email}. PattePerfekt har også modtaget din forespørgsel.`;
    getEl("pp-confirmationPrice").textContent = ppState.totalFormatted;
    show("pp-confirmationSection");
    getEl("pp-confirmationSection").scrollIntoView({ behavior: "smooth", block: "center" });
  } catch (error) {
    console.error(error);
    showError("Noget gik galt. Prøv igen, eller kontakt PattePerfekt direkte på telefon eller mail.");
  } finally {
    sendButton.disabled = false;
    sendButton.textContent = "Send min forespørgsel";
  }
}

function setupNavigation() {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (!toggle || !links) return;

  toggle.addEventListener("click", () => {
    const isOpen = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  links.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      links.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

function setupMenuMinHelper() {
  const menu = getEl("pp-menu");
  const personsInput = getEl("pp-persons");
  if (!menu || !personsInput) return;

  const syncMin = () => {
    const selectedMenu = menu.options[menu.selectedIndex];
    const minPersons = parseInt(selectedMenu.dataset.min || "30", 10);
    personsInput.min = String(minPersons);
    if (parseInt(personsInput.value || "0", 10) < minPersons) {
      personsInput.value = String(minPersons);
    }
  };

  menu.addEventListener("change", syncMin);
  syncMin();
}

document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  setupMenuMinHelper();
  getEl("calculateBtn")?.addEventListener("click", calculatePrice);
  getEl("sendBtn")?.addEventListener("click", sendOffer);
});
