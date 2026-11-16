/* ==========================================================================
   ГРАММ — інтерактивність
   Розділи: хедер при скролі, мобільне меню, дозатор (фірмовий елемент),
   поява блоків при скролі, меню та бронювання у вікнах, форма.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initHeaderScroll();
  initMobileNav();
  initDoser();
  initRevealOnScroll();
  initMenu();
  initHits();
  initCart();
  initModals();
  initContactLinks();
  initContactForm();
  initMinDateForBooking();
});

/* --- Хедер: фон з'являється при прокрутці ------------------------------- */
function initHeaderScroll() {
  const header = document.getElementById("header");
  if (!header) return;
  const update = () => header.classList.toggle("is-scrolled", window.scrollY > 20);
  update();
  window.addEventListener("scroll", update, { passive: true });
}

/* --- Мобільне меню -------------------------------------------------------- */
function initMobileNav() {
  const burger = document.getElementById("burger");
  const navMobile = document.getElementById("navMobile");
  if (!burger || !navMobile) return;

  burger.addEventListener("click", () => {
    const isOpen = navMobile.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(isOpen));
  });

  navMobile.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navMobile.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    });
  });
}

/* --- Дозатор: фірмовий елемент ---------------------------------------------
   Показує, як "зважується" ідеальна доза еспресо (0.0 г → 18.5 г) у міру
   прокрутки сторінки від hero до футера. */
function initDoser() {
  const fill = document.querySelector(".doser__fill");
  const valueEl = document.getElementById("doseValue");
  if (!fill || !valueEl) return;

  const MAX_DOSE = 18.5;

  const update = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min(Math.max(scrollTop / docHeight, 0), 1) : 0;
    fill.style.height = `${progress * 100}%`;
    const dose = (MAX_DOSE * progress).toFixed(1);
    valueEl.textContent = dose;
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
}

/* --- Поява блоків при прокрутці -------------------------------------------- */
function initRevealOnScroll() {
  const targets = document.querySelectorAll(".reveal");
  if (!targets.length) return;

  if (!("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          const delay = Math.min(index * 60, 300);
          setTimeout(() => entry.target.classList.add("is-visible"), delay);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );

  targets.forEach((el) => observer.observe(el));
}

/* --- Не дозволяємо обирати дату бронювання у минулому ---------------------- */
function initMinDateForBooking() {
  const dateField = document.querySelector('#contactForm [name="date"]');
  if (!dateField) return;
  const today = new Date().toISOString().split("T")[0];
  dateField.setAttribute("min", today);
  if (!dateField.value) dateField.value = today;
}

/* --- Форма бронювання: валідація + підтвердження ---------------------------
   За замовчуванням сайт НЕ надсилає лист нікуди — це звичайний HTML/JS без
   сервера, як і просилося. Після успішної валідації форма показує гостю
   повідомлення "заявку надіслано" і скидає поля.

   Якщо захочете, щоб заявки реально приходили вам на пошту — підключіть
   безкоштовний EmailJS (без бекенду, без ключів у коді репозиторію):
   інструкція в README.md, розділ "Підключення реальної відправки на пошту".
   ============================================================================ */
function initContactForm() {
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");
  if (!form || !status) return;

  const nameField = form.querySelector('[name="name"]');
  const phoneField = form.querySelector('[name="phone"]');
  const dateField = form.querySelector('[name="date"]');
  const timeField = form.querySelector('[name="time"]');
  const honeypot = form.querySelector('[name="website"]');

  const phonePattern = /^[+]?[\d\s()-]{10,}$/;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    // Бот заповнив приховане поле — тихо ігноруємо відправку.
    if (honeypot && honeypot.value) return;

    let isValid = true;
    isValid = validateField(nameField, nameField.value.trim().length > 1) && isValid;
    isValid = validateField(phoneField, phonePattern.test(phoneField.value.trim())) && isValid;
    isValid = validateField(dateField, !!dateField.value) && isValid;
    isValid = validateField(timeField, !!timeField.value) && isValid;

    if (!isValid) {
      status.textContent = "";
      status.classList.remove("is-error", "is-success");
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Надсилаємо…";
    submitBtn.disabled = true;
    status.textContent = "";
    status.classList.remove("is-error", "is-success");

    const guestsField = form.querySelector('[name="guests"]');
    const bookingSummary = `${dateField.value} о ${timeField.value}, ${guestsField.value} гостей`;

    // Імітація відправки (0.7с) — без сервера. Замінити на реальний EmailJS-виклик
    // можна тут-таки, за інструкцією в README.
    setTimeout(() => {
      document.getElementById("bookingDoneTitle").textContent = `Дякуємо, ${nameField.value.trim()}!`;
      document.getElementById("bookingDoneText").textContent = `Заявку на ${bookingSummary} прийнято. Ми зателефонуємо вам протягом години, щоб підтвердити столик.`;
      form.hidden = true;
      document.getElementById("bookingDone").hidden = false;
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      form.reset();
      initMinDateForBooking();
    }, 700);
  });

  // Кожне нове відкриття вікна починається з порожньої форми
  document.addEventListener("click", (e) => {
    if (!e.target.closest('[data-open="booking"]')) return;
    form.hidden = false;
    document.getElementById("bookingDone").hidden = true;
  });

  [nameField, phoneField, dateField, timeField].forEach((field) => {
    field.addEventListener("input", () => field.closest(".field").classList.remove("has-error"));
  });
}

function validateField(field, condition) {
  const wrapper = field.closest(".field");
  wrapper.classList.toggle("has-error", !condition);
  return condition;
}


/* --- Дані меню ---------------------------------------------------------------
   Щоб додати позицію — скопіюйте будь-який рядок у потрібній категорії.
   img — шлях до фото (необов'язково: без фото картка буде текстовою). */
const MENU = [
  { id: "filter", title: "Фільтр", items: [
    { name: "Ефіопія Іргачефе", desc: "Жасмин, бергамот, тростинний цукор · 18 г / 300 мл", price: 180, img: "images/menu/filter-ethiopia.jpg" },
    { name: "Кенія Ньєрі AA", desc: "Чорна смородина, томат, виноградна кислинка · 18 г / 300 мл", price: 190, img: "images/menu/filter-kenya.jpg" },
    { name: "Колумбія Уїла", desc: "Карамель, червоне яблуко, м'який фініш · 18 г / 300 мл", price: 170, img: "images/menu/filter-colombia.jpg" },
  ]},
  { id: "espresso", title: "Еспресо", items: [
    { name: "Еспресо", desc: "Купаж трьох сортів · доза 18.5 г, вихід 36 г, 27 сек", price: 90, img: "images/menu/closeup-classic-fresh-espresso-served-dark-surface.jpg" },
    { name: "Допіо", desc: "Подвійна порція · доза 18.5 г, вихід 55 г, 30 сек", price: 120, img: "images/menu/espresso-doppio.jpg" },
    { name: "Ристрето", desc: "Коротка екстракція · доза 18.5 г, вихід 22 г, 20 сек", price: 100, img: "images/menu/espresso-ristretto.jpg" },
  ]},
  { id: "milk", title: "З молоком", items: [
    { name: "Флет вайт", desc: "Подвійний еспресо, мікропіна · 150 мл", price: 140, img: "images/menu/flat-white.jpg" },
    { name: "Капучино", desc: "Класична пропорція 1:1:1 · какао на вибір", price: 130, img: "images/menu/cappuccino.jpg" },
    { name: "Раф на кокосовому молоці", desc: "Ванільний сироп, збиті вершки зверху", price: 160, img: "images/menu/raf-coconut.jpg" },
  ]},
  { id: "food", title: "Сніданки", items: [
    { name: "Тост з авокадо", desc: "Житній хліб, авокадо, яйце пашот, мікрозелень", price: 190 },
    { name: "Омлет із зеленню", desc: "Три яйця, вершки, сезонна зелень, тост", price: 150 },
    { name: "Гранола з йогуртом", desc: "Домашня гранола, натуральний йогурт, сезонні ягоди", price: 130 },
    { name: "Сендвіч з індичкою", desc: "Чіабата, запечена індичка, сир, в'ялені томати", price: 170 },
  ]},
  { id: "dessert", title: "Десерти", items: [
    { name: "Чізкейк Сан-Себастьян", desc: "Кремовий, з карамелізованою скоринкою", price: 150 },
    { name: "Мигдальний круасан", desc: "Випікається щоранку, мигдальний крем", price: 95 },
    { name: "Брауні", desc: "Темний шоколад, волоський горіх", price: 110 },
    { name: "Сирники з ягодами", desc: "Сметана, ягідний соус", price: 140 },
  ]},
];

/* --- Меню: вкладки, пошук, картки -------------------------------------------- */
function initMenu() {
  const tabsWrap = document.getElementById("menuTabs");
  const body = document.getElementById("menuBody");
  const search = document.getElementById("menuSearch");
  if (!tabsWrap || !body) return;

  const norm = (t) => t.toLowerCase().replace(/[’`ʼ]/g, "'");
  const card = (i) => `
    <article class="menu-card">
      ${i.img ? `<img class="menu-card__photo" src="${i.img}" alt="${i.name}" loading="lazy">` : ""}
      <div class="menu-card__body">
        <div class="menu-card__top"><h3>${i.name}</h3><span class="menu-card__price">${i.price} ₴</span></div>
        <p>${i.desc}</p>
        <button class="menu-card__add" data-add="${i.name}">У кошик</button>
      </div>
    </article>`;
  const draw = (items) => {
    body.innerHTML = items.length
      ? `<div class="menu__grid">${items.map(card).join("")}</div>`
      : `<p class="menu__empty">Нічого не знайшли. Спробуйте інше слово.</p>`;
    body.scrollTop = 0;
  };

  let activeId = MENU[0].id;
  const markTab = (id) => tabsWrap.querySelectorAll(".menu__tab").forEach((t) => {
    const on = t.dataset.tab === id;
    t.classList.toggle("is-active", on);
    t.setAttribute("aria-selected", String(on));
  });
  const show = (id) => {
    activeId = id;
    markTab(id);
    draw(MENU.find((c) => c.id === id).items);
  };

  tabsWrap.innerHTML = MENU.map((c) => `<button class="menu__tab" role="tab" data-tab="${c.id}">${c.title}</button>`).join("");
  tabsWrap.addEventListener("click", (e) => {
    const tab = e.target.closest(".menu__tab");
    if (!tab) return;
    if (search) search.value = "";
    show(tab.dataset.tab);
  });

  if (search) {
    search.addEventListener("input", () => {
      const q = norm(search.value.trim());
      if (!q) return show(activeId);
      markTab(null);
      draw(MENU.flatMap((c) => c.items).filter((i) => norm(i.name + " " + i.desc).includes(q)));
    });
  }
  show(activeId);
}

/* --- Вікна: відкриття/закриття ---------------------------------------------- */
function initModals() {
  let current = null;
  let lastFocus = null;

  const open = (name) => {
    const modal = document.getElementById(`modal-${name}`);
    if (!modal) return;
    if (current) close();
    lastFocus = document.activeElement;
    current = modal;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    const touch = window.matchMedia("(pointer: coarse)").matches;
    const first = (!touch && modal.querySelector("input")) || modal.querySelector("[data-close]");
    if (first) setTimeout(() => first.focus({ preventScroll: true }), 50);
  };

  const close = () => {
    if (!current) return;
    current.classList.remove("is-open");
    current.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    current = null;
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  };

  document.querySelectorAll("[data-open]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      open(el.dataset.open);
    });
  });

  document.querySelectorAll(".modal").forEach((m) => {
    m.addEventListener("click", (e) => {
      if (e.target === m || e.target.closest("[data-close]")) close();
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}


/* --- Телефон і пошта: на комп'ютері копіюємо замість "відкрити програму" ----
   На телефоні tel: працює як зазвичай (дзвінок). */
function initContactLinks() {
  if (window.matchMedia("(pointer: coarse)").matches) return;

  let toast = null;
  const showToast = (text) => {
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      document.body.appendChild(toast);
    }
    toast.textContent = text;
    toast.classList.add("is-visible");
    clearTimeout(showToast.t);
    showToast.t = setTimeout(() => toast.classList.remove("is-visible"), 2000);
  };

  const copy = (text) => {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    ta.remove();
  };

  document.querySelectorAll('a[href^="tel:"], a[href^="mailto:"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      copy(link.textContent.trim());
      showToast("Скопійовано");
    });
  });
}


/* --- Блок "З чого почати" на головній: добірка з меню ----------------------- */
function initHits() {
  const grid = document.getElementById("hitsGrid");
  if (!grid) return;
  const picks = ["Ефіопія Іргачефе", "Флет вайт", "Раф на кокосовому молоці"];
  const items = MENU.flatMap((c) => c.items).filter((i) => picks.includes(i.name));
  grid.innerHTML = items.map((i) => `
    <article class="menu-card reveal">
      <img class="menu-card__photo" src="${i.img}" alt="${i.name}" loading="lazy">
      <div class="menu-card__body">
        <div class="menu-card__top"><h3>${i.name}</h3><span class="menu-card__price">${i.price} ₴</span></div>
        <p>${i.desc}</p>
          <button class="menu-card__add" data-add="${i.name}">У кошик</button>
      </div>
    </article>`).join("");
  grid.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
}


/* --- Кошик ---------------------------------------------------------------
   Зберігається в браузері (localStorage). Замовлення нікуди не відправляється:
   щоб приймати справжні, підключіть форму так само, як бронювання. */
function initCart() {
  const root = document.getElementById("cart");
  if (!root) return;
  const listEl = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");
  const countEl = document.getElementById("cartCount");
  const form = document.getElementById("cartForm");
  const status = document.getElementById("cartStatus");
  const all = MENU.flatMap((c) => c.items);

  let cart = {};
  let doneName = "";
  try { cart = JSON.parse(localStorage.getItem("gramm-cart")) || {}; } catch (e) {}
  const save = () => { try { localStorage.setItem("gramm-cart", JSON.stringify(cart)); } catch (e) {} };

  const render = () => {
    const rows = Object.entries(cart).filter(([n]) => all.some((i) => i.name === n));
    const count = rows.reduce((s, [, q]) => s + q, 0);
    const total = rows.reduce((s, [n, q]) => s + all.find((i) => i.name === n).price * q, 0);
    countEl.textContent = count;
    countEl.hidden = !count;
    totalEl.textContent = `${total} ₴`;
    form.hidden = !count && !status.textContent;
    listEl.innerHTML = rows.length ? rows.map(([n, q]) => {
      const it = all.find((i) => i.name === n);
      return `<div class="cart-row">
        <div class="cart-row__info"><span class="cart-row__name">${n}</span><span class="cart-row__price">${it.price} ₴</span></div>
        <div class="cart-row__qty">
          <button data-dec="${n}" aria-label="Менше">−</button><span>${q}</span><button data-inc="${n}" aria-label="Більше">+</button>
        </div>
      </div>`;
    }).join("") : (doneName ? `<div class="done">
        <div class="done__icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>
        <h3>Дякуємо, ${doneName}!</h3>
        <p>Замовлення прийнято. Ми зателефонуємо для підтвердження.</p>
        <button type="button" class="btn btn--cream" data-cart-close>Готово</button>
      </div>` : `<div class="done">
        <p>Кошик порожній.<br>Додайте щось із меню.</p>
        <button type="button" class="btn btn--cream" data-goto-menu>Перейти до меню</button>
      </div>`);
    listEl.classList.toggle("is-center", !rows.length);
    form.querySelectorAll("input, button").forEach((el) => { el.hidden = !count; });
    form.querySelector(".cart__total").hidden = !count;
  };

  const setOpen = (on) => {
    root.classList.toggle("is-open", on);
    root.setAttribute("aria-hidden", String(!on));
    document.body.classList.toggle("modal-open", on || !!document.querySelector(".modal.is-open"));
  };

  document.addEventListener("click", (e) => {
    const t = e.target;
    const add = t.closest("[data-add]");
    if (add) {
      const n = add.dataset.add;
      cart[n] = (cart[n] || 0) + 1;
      doneName = ""; save(); status.textContent = ""; render();
      add.textContent = "Додано ✓";
      setTimeout(() => { add.textContent = "У кошик"; }, 1100);
      return;
    }
    const inc = t.closest("[data-inc]"), dec = t.closest("[data-dec]");
    if (inc) cart[inc.dataset.inc]++;
    if (dec && --cart[dec.dataset.dec] <= 0) delete cart[dec.dataset.dec];
    if (inc || dec) { save(); render(); return; }
    if (t.closest("[data-goto-menu]")) {
      setOpen(false);
      const m = document.querySelector('[data-open="menu"]');
      if (m) m.click();
    }
    if (t.closest("[data-cart-open]")) setOpen(true);
    if (t.closest("[data-cart-close]")) setOpen(false);
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = form.cartName.value.trim();
    const phone = form.cartPhone.value.trim();
    if (!name || phone.replace(/\D/g, "").length < 9) {
      status.textContent = "Вкажіть ім'я та телефон, щоб ми могли підтвердити замовлення.";
      status.className = "cart__status is-error";
      return;
    }
    cart = {}; save();
    doneName = name;
    status.textContent = "";
    status.className = "cart__status";
    form.reset();
    render();
  });

  render();
}
