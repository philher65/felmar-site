document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("ffs-contact-form");
  if (!form) return;

  var GENERAL = "info@felmarfederalsolutions.us";
  var RFQ = "contracts@felmarfederalsolutions.us";

  var types = {
    general: { label: "General Question", to: GENERAL, subject: "General Inquiry" },
    rfq: { label: "RFQ or Solicitation", to: RFQ, subject: "RFQ/Solicitation" },
    vendor: { label: "Vendor or Supplier Inquiry", to: GENERAL, subject: "Vendor Inquiry" },
    other: { label: "Other", to: GENERAL, subject: "Website Inquiry" }
  };

  var el = function (id) { return document.getElementById(id); };
  var typeField = el("inquiry-type");
  var nameField = el("name");
  var orgField = el("org");
  var emailField = el("email");
  var phoneField = el("phone");
  var solField = el("solicitation");
  var msgField = el("message");
  var routeNote = el("route-note");
  var status = el("form-status");

  typeField.addEventListener("change", function () {
    var t = types[typeField.value];
    routeNote.textContent = t
      ? "This email will be addressed to " + t.to + "."
      : "Your email will be addressed to the inbox that matches your inquiry type.";
  });

  function showError(field, id, message) {
    var p = el(id);
    p.textContent = "Error: " + message;
    p.hidden = false;
    field.setAttribute("aria-invalid", "true");
  }

  function clearError(field, id) {
    var p = el(id);
    p.hidden = true;
    p.textContent = "";
    field.removeAttribute("aria-invalid");
  }

  [[typeField, "err-inquiry-type"], [nameField, "err-name"], [emailField, "err-email"], [msgField, "err-message"]]
    .forEach(function (pair) {
      var evt = pair[0].tagName === "SELECT" ? "change" : "input";
      pair[0].addEventListener(evt, function () { clearError(pair[0], pair[1]); });
    });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    status.hidden = true;
    clearError(typeField, "err-inquiry-type");
    clearError(nameField, "err-name");
    clearError(emailField, "err-email");
    clearError(msgField, "err-message");

    var firstBad = null;
    function fail(field, id, message) {
      showError(field, id, message);
      if (!firstBad) firstBad = field;
    }

    if (!types[typeField.value]) {
      fail(typeField, "err-inquiry-type", "Select an inquiry type so your message goes to the right inbox.");
    }
    if (!nameField.value.trim()) {
      fail(nameField, "err-name", "Enter your name.");
    }
    var email = emailField.value.trim();
    if (!email) {
      fail(emailField, "err-email", "Enter your email address so we can reply.");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      fail(emailField, "err-email", "Enter a valid email address, such as name@agency.gov.");
    }
    if (!msgField.value.trim()) {
      fail(msgField, "err-message", "Enter a message so we know how to help.");
    }

    if (firstBad) {
      firstBad.focus();
      return;
    }

    var t = types[typeField.value];
    var org = orgField.value.trim();
    var sol = solField.value.trim();

    var subject = t.subject;
    if (typeField.value === "rfq" && sol) subject += " " + sol;
    if (org) subject += ": " + org;

    var body = [
      "Inquiry Type: " + t.label,
      "Name: " + nameField.value.trim(),
      "Organization or Agency: " + (org || "N/A"),
      "Email: " + email,
      "Phone: " + (phoneField.value.trim() || "N/A"),
      "Solicitation or RFQ Number: " + (sol || "N/A"),
      "",
      msgField.value.trim()
    ].join("\n");

    status.textContent = "Your email draft should now be open in your email application, addressed to " + t.to +
      ". Nothing has been sent from this website. Review the draft, attach any documents, and send it from your email application. If no email window opened, write to " + t.to + " directly.";
    status.hidden = false;

    window.location.href = "mailto:" + t.to +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);
  });
});
