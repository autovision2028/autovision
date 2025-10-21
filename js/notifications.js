// notifications.js
// ----------------------------------------------------
// EmailJS Credentials
// ----------------------------------------------------
const EMAILJS_SERVICE_ID = "service_81itxvd";
const EMAILJS_CLIENT_TEMPLATE_ID = "template_jpr22ek";
const EMAILJS_ADMIN_TEMPLATE_ID = "template_mbj9m67";
const EMAILJS_PUBLIC_KEY = "4WOek3n6n1clSIhdE";

// ----------------------------------------------------
// Supabase Configuration
// ----------------------------------------------------
const SUPABASE_URL = "https://wyqlmvfduhhaymrwyueh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5cWxtdmZkdWhoYXltcnd5dWVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MzM4ODMsImV4cCI6MjA3NjQwOTg4M30.gdPesoU4_-cO-Wfgn8cC234VBUlDC0daNPO1VkwQyxo";
const SUPABASE_BUCKET = "autovision_uploads";

let supabaseClient = null;
function initSupabase() {
  if (!supabaseClient) {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
}
initSupabase();

// ----------------------------------------------------
// Utility: Normalize WhatsApp Number
// ----------------------------------------------------
function normalizeWhatsApp(rawNumber) {
  if (!rawNumber) return "";
  let s = String(rawNumber).trim();
  s = s.replace(/[\s()-]/g, "");
  if (s.startsWith("+")) s = s.slice(1);
  if (/^0\d+/.test(s)) s = "234" + s.replace(/^0+/, "");
  return s;
}

// ----------------------------------------------------
// Upload File to Supabase
// ----------------------------------------------------
async function uploadToSupabase(file) {
  if (!file) return "";
  try {
    const timestamp = Date.now();
    const safeName = file.name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_.-]/g, "");
    const filePath = `${timestamp}_${safeName}`;

    const { error } = await supabaseClient.storage
      .from(SUPABASE_BUCKET)
      .upload(filePath, file, { upsert: false });

    if (error) {
      console.error("Supabase upload error:", error);
      return "";
    }

    const { data: publicData } = supabaseClient.storage
      .from(SUPABASE_BUCKET)
      .getPublicUrl(filePath);

    const publicUrl = publicData?.publicUrl
      ? publicData.publicUrl
      : `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${filePath}`;

    console.log("Uploaded to Supabase:", publicUrl);
    return publicUrl;
  } catch (err) {
    console.error("uploadToSupabase error:", err);
    return "";
  }
}

// ----------------------------------------------------
// Send Emails (Client + Admin)
// ----------------------------------------------------
async function sendEmails(formData) {
  const cleanWhats = normalizeWhatsApp(formData.whatsapp);

  const clientParams = {
    fullName: formData.fullName,
    email: formData.email,
    location: formData.location || "",
    whatsapp: formData.whatsapp,
    purpose: formData.purpose,
    appointmentType: formData.appointmentType || "",
    visitDate: formData.visitDate || "",
  };

  const adminParams = {
    fullName: formData.fullName,
    email: formData.email,
    location: formData.location || "",
    whatsapp: formData.whatsapp,
    clean_whatsapp: cleanWhats,
    purpose: formData.purpose,
    fileList: formData.fileLink || "",
    appointmentType: formData.appointmentType || "",
    visitDate: formData.visitDate || "",
  };

  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_CLIENT_TEMPLATE_ID, clientParams, EMAILJS_PUBLIC_KEY);
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_ADMIN_TEMPLATE_ID, adminParams, EMAILJS_PUBLIC_KEY);
    return { ok: true };
  } catch (err) {
    console.error("EmailJS error", err);
    return { ok: false, error: err };
  }
}

// ----------------------------------------------------
// Handle Join Form (with File Upload)
// ----------------------------------------------------
// ----------------------------------------------------
// Handle "Join AutoVision" Form Submission (with upload)
// ----------------------------------------------------
async function handleJoinFormSubmit(event) {
  event.preventDefault();
  console.log("Join form submitted");

  const statusEl = document.getElementById("joinStatus");
  statusEl.textContent = "Uploading file & submitting...";

  // Button UX: disable during async and show spinner
  const formEl = event.target;
  const submitBtn = formEl.querySelector('button[type="submit"]');
  let originalBtnHtml = '';
  if (submitBtn) {
    originalBtnHtml = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.setAttribute('aria-busy', 'true');
    submitBtn.innerHTML = '<span class="inline-flex items-center justify-center">' +
      '<svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">' +
      '<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>' +
      '<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>' +
      '</svg>Submitting…</span>';
  }

  const fullName = document.getElementById("join_fullName").value.trim();
  const email = document.getElementById("join_email").value.trim();
  const location = document.getElementById("join_location").value.trim();
  const whatsapp = document.getElementById("join_whatsapp").value.trim();
  const purpose = document.getElementById("join_purpose").value.trim();
  const fileInput = document.getElementById("join_medicalReport");
  const file = fileInput?.files?.[0] || null;

  let fileLink = "";

  try {
    if (file) {
      const allowed = ["image/png", "image/jpeg", "application/pdf"];
      if (!allowed.includes(file.type)) {
        statusEl.textContent = "Only PNG, JPG, or PDF files allowed.";
        if (submitBtn) { submitBtn.disabled = false; submitBtn.removeAttribute('aria-busy'); submitBtn.innerHTML = originalBtnHtml; }
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        statusEl.textContent = "File must be smaller than 10MB.";
        if (submitBtn) { submitBtn.disabled = false; submitBtn.removeAttribute('aria-busy'); submitBtn.innerHTML = originalBtnHtml; }
        return;
      }

      fileLink = await uploadToSupabase(file);
      if (!fileLink || !fileLink.startsWith("http")) {
        console.error("File upload failed or no link returned");
        statusEl.textContent = "File upload failed. Please try again.";
        if (submitBtn) { submitBtn.disabled = false; submitBtn.removeAttribute('aria-busy'); submitBtn.innerHTML = originalBtnHtml; }
        return;
      }
    }
  } catch (err) {
    console.error("Join upload failed:", err);
    statusEl.textContent = "File upload failed. Please try again.";
    if (submitBtn) { submitBtn.disabled = false; submitBtn.removeAttribute('aria-busy'); submitBtn.innerHTML = originalBtnHtml; }
    return;
  }

  // Include location and file link in the data sent to EmailJS
  const formData = {
    fullName,
    email,
    whatsapp,
    purpose,
    location,
    fileLink
  };

  console.log("Join form data being sent:", formData);

  const result = await sendEmails(formData);
  if (result.ok) {
    statusEl.textContent = "Application submitted successfully!";
    document.getElementById("joinForm").reset();
    // Plausible analytics event
    try { if (window.plausible) { window.plausible('Join Form Submitted'); } } catch(_) {}
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.removeAttribute('aria-busy');
      submitBtn.innerHTML = originalBtnHtml;
    }
    // Keep success message visible for a few seconds
    setTimeout(() => { if (statusEl.textContent.startsWith('Application submitted')) statusEl.textContent = ''; }, 6000);
  } else {
    statusEl.textContent = "Submission failed. Please try again.";
    if (submitBtn) { submitBtn.disabled = false; submitBtn.removeAttribute('aria-busy'); submitBtn.innerHTML = originalBtnHtml; }
  }
}


// ----------------------------------------------------
// Handle Provider Form
// ----------------------------------------------------
async function handleProviderFormSubmit(event) {
  event.preventDefault();
  const statusEl = document.getElementById("provStatus");
  statusEl.textContent = "Uploading file & submitting...";

  // Button UX: disable during async and show spinner
  const formEl = event.target;
  const submitBtn = formEl.querySelector('button[type="submit"]');
  let originalBtnHtml = '';
  if (submitBtn) {
    originalBtnHtml = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.setAttribute('aria-busy', 'true');
    submitBtn.innerHTML = '<span class="inline-flex items-center justify-center">' +
      '<svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">' +
      '<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>' +
      '<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>' +
      '</svg>Submitting…</span>';
  }

  const fullName = document.getElementById("prov_fullName").value.trim();
  const email = document.getElementById("prov_email").value.trim();
  const whatsapp = document.getElementById("prov_whatsapp").value.trim();
  const fileInput = document.getElementById("prov_businessDoc");
  const file = fileInput?.files?.[0] || null;

  let fileLink = "";

  try {
    if (file) {
      const allowed = ["image/png", "image/jpeg", "application/pdf"];
      if (!allowed.includes(file.type)) {
        statusEl.textContent = "Only PNG, JPG, or PDF files allowed.";
        if (submitBtn) { submitBtn.disabled = false; submitBtn.removeAttribute('aria-busy'); submitBtn.innerHTML = originalBtnHtml; }
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        statusEl.textContent = "File must be smaller than 10MB.";
        if (submitBtn) { submitBtn.disabled = false; submitBtn.removeAttribute('aria-busy'); submitBtn.innerHTML = originalBtnHtml; }
        return;
      }
      fileLink = await uploadToSupabase(file);
      if (!fileLink || !fileLink.startsWith("http")) {
        statusEl.textContent = "File upload failed.";
        if (submitBtn) { submitBtn.disabled = false; submitBtn.removeAttribute('aria-busy'); submitBtn.innerHTML = originalBtnHtml; }
        return;
      }
    }
  } catch (err) {
    console.error("Provider upload failed:", err);
    statusEl.textContent = "File upload failed.";
    if (submitBtn) { submitBtn.disabled = false; submitBtn.removeAttribute('aria-busy'); submitBtn.innerHTML = originalBtnHtml; }
    return;
  }

  const formData = { fullName, email, whatsapp, purpose: "Provider Application", fileLink };
  const result = await sendEmails(formData);

  if (result.ok) {
    statusEl.textContent = "Provider application submitted successfully.";
    document.getElementById("providerForm").reset();
    // Plausible analytics event
    try { if (window.plausible) { window.plausible('Provider Form Submitted'); } } catch(_) {}
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.removeAttribute('aria-busy');
      submitBtn.innerHTML = originalBtnHtml;
    }
    setTimeout(() => { if (statusEl.textContent.startsWith('Provider application submitted')) statusEl.textContent = ''; }, 6000);
  } else {
    statusEl.textContent = "Submission failed. Please try again.";
    if (submitBtn) { submitBtn.disabled = false; submitBtn.removeAttribute('aria-busy'); submitBtn.innerHTML = originalBtnHtml; }
  }
}

// ----------------------------------------------------
// Handle Appointment Form
// ----------------------------------------------------
async function handleAppointmentFormSubmit(event) {
  event.preventDefault();
  const statusEl = document.getElementById("apmtStatus");
  statusEl.textContent = "Submitting appointment...";

  const formEl = event.target;
  const submitBtn = formEl.querySelector('button[type="submit"]');
  let originalBtnHtml = '';
  if (submitBtn) {
    originalBtnHtml = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.setAttribute('aria-busy', 'true');
    submitBtn.innerHTML = '<span class="inline-flex items-center justify-center">' +
      '<svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">' +
      '<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>' +
      '<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>' +
      '</svg>Submitting…</span>';
  }

  const fullName = document.getElementById("apmt_fullName").value.trim();
  const email = document.getElementById("apmt_email").value.trim();
  const whatsapp = document.getElementById("apmt_whatsapp").value.trim();
  const appointmentType = document.getElementById("apmt_type").value;
  const visitDate = document.getElementById("apmt_date").value;

  const formData = {
    fullName,
    email,
    whatsapp,
    purpose: `${appointmentType} Appointment`,
    appointmentType,
    visitDate,
  };

  const result = await sendEmails(formData);

  if (result.ok) {
    statusEl.textContent = "Appointment request submitted successfully.";
    document.getElementById("appointmentForm").reset();
    try { if (window.plausible) { window.plausible('Appointment Form Submitted'); } } catch(_) {}
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.removeAttribute('aria-busy');
      submitBtn.innerHTML = originalBtnHtml;
    }
    setTimeout(() => { if (statusEl.textContent.startsWith('Appointment request submitted')) statusEl.textContent = ''; }, 6000);
  } else {
    statusEl.textContent = "Submission failed. Please try again.";
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.removeAttribute('aria-busy');
      submitBtn.innerHTML = originalBtnHtml;
    }
  }
}

// ----------------------------------------------------
// Attach Events
// ----------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
  const joinForm = document.getElementById("joinForm");
  if (joinForm) joinForm.addEventListener("submit", handleJoinFormSubmit);

  const providerForm = document.getElementById("providerForm");
  if (providerForm) providerForm.addEventListener("submit", handleProviderFormSubmit);

  const appointmentForm = document.getElementById("appointmentForm");
  if (appointmentForm) appointmentForm.addEventListener("submit", handleAppointmentFormSubmit);
});
