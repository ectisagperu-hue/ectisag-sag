// =====================================================================
// ECTISAG SAC — main.js
// =====================================================================

(function () {
  "use strict";

  var WHATSAPP_NUMBER = "51986312717"; // +51 986 312 717

  var SERVICES = [
    "Plantas Agroindustriales",
    "Resina Epóxica",
    "Paneles Sanitarios",
    "Adecuamiento en Drywall",
    "Construcción de Viviendas",
    "Pinturas Interiores y Exteriores",
    "Cableado Estructurado",
    "Cámaras de Videovigilancia",
    "Jardinería en General",
    "Enchapado de Porcelanato",
    "Instalaciones Eléctricas",
    "Especialista en BIM"
  ];

  var HORARIOS = [
    { id: "manana", label: "Mañana", desc: "8:00 am – 12:00 m" },
    { id: "tarde", label: "Tarde", desc: "12:00 m – 5:00 pm" },
    { id: "cualquiera", label: "Cualquier horario", desc: "Te llamamos en horario de oficina" }
  ];

  // ---------------------------------------------------------------
  // Header scroll state
  // ---------------------------------------------------------------
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (window.scrollY > 30) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---------------------------------------------------------------
  // Mobile nav
  // ---------------------------------------------------------------
  var navToggle = document.querySelector(".nav-toggle");
  var mobileNav = document.querySelector(".mobile-nav");
  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      mobileNav.classList.toggle("open");
    });
    mobileNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { mobileNav.classList.remove("open"); });
    });
  }

  // ---------------------------------------------------------------
  // Build service cards + chips dynamically would be overkill;
  // services are static in HTML. Wizard chips are built here.
  // ---------------------------------------------------------------
  var chipsContainer = document.getElementById("serviceChips");
  if (chipsContainer) {
    SERVICES.forEach(function (s, i) {
      var label = document.createElement("label");
      label.className = "chip";
      label.innerHTML =
        '<input type="checkbox" name="servicio" value="' + s + '" id="svc' + i + '">' +
        '<span class="box"></span><span>' + s + "</span>";
      chipsContainer.appendChild(label);
    });
  }

  var radioContainer = document.getElementById("horarioOptions");
  if (radioContainer) {
    HORARIOS.forEach(function (h, i) {
      var label = document.createElement("label");
      label.className = "radio-opt";
      label.innerHTML =
        '<input type="radio" name="horario" value="' + h.label + '" id="hor' + i + '">' +
        '<span class="dot"></span><span class="txt"><b>' + h.label + "</b><span>" + h.desc + "</span></span>";
      radioContainer.appendChild(label);
    });
  }

  // visual checked state for chips/radios
  document.addEventListener("change", function (e) {
    if (e.target.matches('#serviceChips input[type=checkbox]')) {
      e.target.closest(".chip").classList.toggle("checked", e.target.checked);
    }
    if (e.target.matches('#horarioOptions input[type=radio]')) {
      radioContainer.querySelectorAll(".radio-opt").forEach(function (el) { el.classList.remove("checked"); });
      e.target.closest(".radio-opt").classList.add("checked");
    }
  });

  // ---------------------------------------------------------------
  // Wizard state + navigation
  // ---------------------------------------------------------------
  var overlay = document.getElementById("wizardOverlay");
  var wizard = document.getElementById("wizard");
  var steps = Array.prototype.slice.call(document.querySelectorAll(".step"));
  var progressFill = document.getElementById("progressFill");
  var stepLabel = document.getElementById("stepLabel");
  var btnBack = document.getElementById("wizBack");
  var btnNext = document.getElementById("wizNext");
  var totalSteps = steps.length; // includes final summary step, not success
  var current = 0;

  var state = { nombre: "", telefono: "", servicios: [], otro: "", distrito: "", horario: "" };

  function openWizard(prefillService) {
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
    current = 0;
    state = { nombre: "", telefono: "", servicios: [], otro: "", distrito: "", horario: "" };
    resetForm();
    if (prefillService) {
      state.servicios = [prefillService];
    }
    renderStep();
  }
  function closeWizard() {
    overlay.classList.remove("open");
    document.body.style.overflow = "";
  }
  function resetForm() {
    document.getElementById("inpNombre").value = "";
    document.getElementById("inpTelefono").value = "";
    document.getElementById("inpOtro").value = "";
    document.getElementById("inpDistrito").value = "";
    document.querySelectorAll('#serviceChips input').forEach(function (c) { c.checked = false; c.closest(".chip").classList.remove("checked"); });
    document.querySelectorAll('#horarioOptions input').forEach(function (r) { r.checked = false; r.closest(".radio-opt").classList.remove("checked"); });
    document.querySelectorAll(".field").forEach(function (f) { f.classList.remove("invalid"); });
    document.getElementById("successState").style.display = "none";
    document.querySelector(".wizard-nav").style.display = "";
  }

  document.querySelectorAll("[data-open-wizard]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      openWizard(btn.getAttribute("data-service") || null);
    });
  });
  document.getElementById("wizardClose").addEventListener("click", closeWizard);
  overlay.addEventListener("click", function (e) { if (e.target === overlay) closeWizard(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && overlay.classList.contains("open")) closeWizard(); });

  function renderStep() {
    steps.forEach(function (s, i) { s.classList.toggle("active", i === current); });
    var pct = Math.round(((current + 1) / totalSteps) * 100);
    progressFill.style.width = pct + "%";
    stepLabel.textContent = "Paso " + (current + 1) + " de " + totalSteps;
    btnBack.style.visibility = current === 0 ? "hidden" : "visible";

    // pre-fill service chips if prefilled
    if (current === 2) {
      document.querySelectorAll('#serviceChips input').forEach(function (c) {
        var on = state.servicios.indexOf(c.value) !== -1;
        c.checked = on;
        c.closest(".chip").classList.toggle("checked", on);
      });
    }
    if (current === totalSteps - 1) {
      buildSummary();
      btnNext.textContent = "Enviar por WhatsApp";
    } else {
      btnNext.textContent = "Continuar";
    }
  }

  function validateStep() {
    var field;
    if (current === 0) {
      var nombre = document.getElementById("inpNombre").value.trim();
      field = document.getElementById("inpNombre").closest(".field");
      if (nombre.length < 2) { field.classList.add("invalid"); return false; }
      field.classList.remove("invalid");
      state.nombre = nombre;
      return true;
    }
    if (current === 1) {
      var tel = document.getElementById("inpTelefono").value.trim().replace(/\s+/g, "");
      field = document.getElementById("inpTelefono").closest(".field");
      var ok = /^9\d{8}$/.test(tel);
      if (!ok) { field.classList.add("invalid"); return false; }
      field.classList.remove("invalid");
      state.telefono = tel;
      return true;
    }
    if (current === 2) {
      var checked = Array.prototype.slice.call(document.querySelectorAll('#serviceChips input:checked')).map(function (c) { return c.value; });
      var otro = document.getElementById("inpOtro").value.trim();
      var box = document.getElementById("serviceChips");
      if (checked.length === 0 && otro === "") { box.style.outline = "2px solid var(--danger)"; document.getElementById("svcErr").style.display = "block"; return false; }
      box.style.outline = "none";
      document.getElementById("svcErr").style.display = "none";
      state.servicios = checked;
      state.otro = otro;
      return true;
    }
    if (current === 3) {
      var distrito = document.getElementById("inpDistrito").value.trim();
      field = document.getElementById("inpDistrito").closest(".field");
      if (distrito.length < 2) { field.classList.add("invalid"); return false; }
      field.classList.remove("invalid");
      state.distrito = distrito;
      return true;
    }
    if (current === 4) {
      var hor = document.querySelector('#horarioOptions input:checked');
      var cont = document.getElementById("horarioOptions");
      if (!hor) { cont.style.outline = "2px solid var(--danger)"; document.getElementById("horErr").style.display = "block"; return false; }
      cont.style.outline = "none";
      document.getElementById("horErr").style.display = "none";
      state.horario = hor.value;
      return true;
    }
    return true;
  }

  function buildSummary() {
    var serviciosTxt = state.servicios.join(", ") + (state.otro ? (state.servicios.length ? " · " : "") + state.otro : "");
    document.getElementById("sumNombre").textContent = state.nombre;
    document.getElementById("sumTelefono").textContent = "+51 " + state.telefono;
    document.getElementById("sumServicios").textContent = serviciosTxt;
    document.getElementById("sumDistrito").textContent = state.distrito;
    document.getElementById("sumHorario").textContent = state.horario;
  }

  function buildWhatsAppMessage() {
    var serviciosTxt = state.servicios.join(", ") + (state.otro ? (state.servicios.length ? " + " : "") + state.otro : "");
    var lines = [
      "Hola ECTISAG \uD83D\uDC4B, mi nombre es " + state.nombre + ".",
      "",
      "\uD83D\uDCF1 Celular: +51 " + state.telefono,
      "\uD83D\uDEE0\uFE0F Servicio(s): " + serviciosTxt,
      "\uD83D\uDCCD Distrito: " + state.distrito,
      "\uD83D\uDD52 Horario preferido para la llamada: " + state.horario,
      "",
      "Quisiera solicitar una cotización. ¡Gracias!"
    ];
    return lines.join("\n");
  }

  btnNext.addEventListener("click", function () {
    if (current === totalSteps - 1) {
      // submit
      var msg = buildWhatsAppMessage();
      var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(msg);
      window.open(url, "_blank", "noopener");
      steps.forEach(function (s) { s.classList.remove("active"); });
      document.querySelector(".wizard-nav").style.display = "none";
      document.getElementById("successState").style.display = "block";
      return;
    }
    if (!validateStep()) return;
    current++;
    renderStep();
  });

  btnBack.addEventListener("click", function () {
    if (current === 0) return;
    current--;
    renderStep();
  });

  document.getElementById("wizDone").addEventListener("click", closeWizard);

  // ---------------------------------------------------------------
  // Footer year
  // ---------------------------------------------------------------
  var y = document.getElementById("yearNow");
  if (y) y.textContent = new Date().getFullYear();

})();
