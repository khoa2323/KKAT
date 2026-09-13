// renderForm(configArray, containerId)
// - configArray: array of field definitions (window.APP_CONFIG)
// - containerId: id of element to mount the form
// Behavior:
//  - Render label, input/textarea per type, add id/aria attributes
//  - Attach client-side validation on submit and input events
//  - Display errors in element with role="alert" and aria-live="assertive"

// ===== SUPABASE INITIALIZATION =====
const SUPABASE_URL = 'https://rkrmfyicbexyvuudltou.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrcm1meWljYmV4eXZ1dWRsdG91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyNzk2OTQsImV4cCI6MjEwNDg1NTY5NH0.Sxge6X8_OQmaprLLQEDjcdxAynJzXtpzTMIkE1hD0I4';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function renderForm(configArray, containerId) {
  const container = document.getElementById(containerId);
  if (!container) throw new Error('Container not found: ' + containerId);

  const form = document.createElement('form');
  form.setAttribute('novalidate', 'novalidate');

  configArray.forEach(field => {
    const wrapper = document.createElement('div');
    wrapper.className = 'field';

    // Ensure id exists
    const id = field.id || `field-${field.key}`;

    // Label
    const label = document.createElement('label');
    label.setAttribute('for', id);
    label.textContent = field.label || field.key || '';
    wrapper.appendChild(label);

    // Input or textarea
    let input;
    if (field.type === 'textarea') {
      input = document.createElement('textarea');
      // rows handling
      if (field.rows) input.rows = field.rows;
    } else {
      // Use 'text' type for all inputs to prevent browser sanitization
      // (e.g., input[type="url"] sanitizes invalid URLs to empty string)
      // Validation is handled by JavaScript in validateField()
      const type = 'text';
      input = document.createElement('input');
      input.type = type;
    }

    input.id = id;
    input.name = field.key || id;
    if (field.placeholder) input.placeholder = field.placeholder;
    // Note: We don't set HTML maxlength attribute because it truncates
    // the input value, preventing JS maxLength validation from triggering.
    // maxLength validation is handled in validateField() instead.
    if (field.required) input.required = true;

    // Accessibility attributes
    if (field.ariaLabel) input.setAttribute('aria-label', field.ariaLabel);
    const helpId = `${id}-help`;
    if (field.ariaDescribedBy) {
      input.setAttribute('aria-describedby', field.ariaDescribedBy);
    } else {
      // if help text exists, set aria-describedby automatically
      input.setAttribute('aria-describedby', helpId);
    }

    // Add example/help text
    if (field.example || field.help) {
      const help = document.createElement('small');
      help.className = 'help';
      help.id = helpId;
      help.textContent = field.example ? `${field.example}` : field.help;
      wrapper.appendChild(help);
    }

    // Error area
    const err = document.createElement('div');
    err.className = 'error';
    err.id = `${id}-error`;
    err.setAttribute('role', 'alert'); // screen readers announce
    err.setAttribute('aria-live', 'assertive');
    err.style.display = 'none';
    wrapper.appendChild(input);
    wrapper.appendChild(err);

    // attach metadata to DOM element for validation reference
    input.dataset.fieldMeta = JSON.stringify(field);

    form.appendChild(wrapper);
  });

  // Submit button row
  const btnRow = document.createElement('div');
  btnRow.className = 'button-row';
  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.textContent = 'Gửi';
  btnRow.appendChild(submitBtn);
  form.appendChild(btnRow);

  // attach event handlers
  attachValidationHandlers(form, configArray);

  // mount
  container.innerHTML = '';
  container.appendChild(form);
}

// Attach validation handlers to form
function attachValidationHandlers(form, configArray) {
  // On input: clear error for that field
  form.addEventListener('input', (ev) => {
    const target = ev.target;
    if (!target || !target.dataset || !target.dataset.fieldMeta) return;
    clearFieldError(target);
  });
  // On submit: validate all fields and save to Supabase
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const isValid = validateForm(form);
    if (!isValid) return;

    // Disable submit button to prevent double-submit
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Äang lÆ°u...';
    }

    // Collect form data
    const data = {};
    const elements = Array.from(form.elements).filter(el => el.name);
    elements.forEach(el => data[el.name] = el.value);
    console.log('Form valid. Payload:', data);

    try {
      // Save to Supabase
      const { data: inserted, error } = await supabase
        .from('cards')
        .insert({
          recipient: data['nguoi_nhan'] || null,
          message: data['loi_chuc'] || null,
          image_url: data['anh_nen'] || null
        })
        .select('id')
        .single();

      if (error) throw error;

      const cardId = inserted.id;
      console.log('Card saved to Supabase. ID:', cardId);

      // Redirect to view page
      window.location.href = `view.html?id=${cardId}`;
    } catch (err) {
      console.error('Supabase save error:', err);
      alert('LÆ°u thiá»‡p tháº¥t báº¡i: ' + (err.message || 'Lá»—i khÃ´ng xÃ¡c Ä‘á»‹nh'));
      // Re-enable submit button
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Gá»­i';
      }
    }
  });

  // Attach live preview listeners
  attachPreviewListeners(form);

  // Prefill from URL params if present
  prefillFromURL(form);
}

// Validate entire form; returns true if all valid
function validateForm(form) {
  let valid = true;
  const elements = Array.from(form.elements).filter(el => el.name);
  for (const el of elements) {
    const ok = validateField(el);
    if (!ok && valid) {
      // focus first invalid
      el.focus();
    }
    valid = valid && ok;
  }
  return valid;
}

// Validate a single field element; returns true if passes
function validateField(el) {
  const meta = safeParse(el.dataset.fieldMeta);
  const value = (el.value || '').trim();

  // if not required and empty => valid
  if (!meta) return true;

  if (!meta.required && value === '') {
    clearFieldError(el);
    el.removeAttribute('aria-invalid');
    return true;
  }

  // required check
  if (meta.required && value === '') {
    showFieldError(el, meta.validation && meta.validation.message ? meta.validation.message : 'Trường này là bắt buộc.');
    el.setAttribute('aria-invalid', 'true');
    return false;
  }

  // maxLength
  if (meta.maxLength && value.length > meta.maxLength) {
    showFieldError(el, meta.validation && meta.validation.message ? meta.validation.message : `Không được vượt quá ${meta.maxLength} ký tự.`);
    el.setAttribute('aria-invalid', 'true');
    return false;
  }

  // pattern
  if (meta.validation && meta.validation.pattern) {
    let re;
    try {
      re = new RegExp(meta.validation.pattern);
    } catch (e) {
      // invalid pattern: skip
      re = null;
      console.warn('Invalid pattern for field', meta.key, meta.validation.pattern);
    }
    if (re && !re.test(value)) {
      showFieldError(el, meta.validation.message || 'Giá trị không đúng định dạng.');
      el.setAttribute('aria-invalid', 'true');
      return false;
    }
  }

  // type-specific: url
  if (meta.type === 'url' && value !== '') {
    if (!isValidImageUrl(value)) {
      showFieldError(el, meta.validation && meta.validation.message ? meta.validation.message : 'Vui lòng nhập URL ảnh hợp lệ (jpg|png|gif).');
      el.setAttribute('aria-invalid', 'true');
      return false;
    }
  }

  // If passes all checks
  clearFieldError(el);
  el.removeAttribute('aria-invalid');
  return true;
}

function showFieldError(el, message) {
  const id = el.id || el.name;
  const err = document.getElementById(`${id}-error`);
  if (err) {
    err.style.display = 'block';
    err.textContent = message;
  }
}

function clearFieldError(el) {
  const id = el.id || el.name;
  const err = document.getElementById(`${id}-error`);
  if (err) {
    err.style.display = 'none';
    err.textContent = '';
  }
}

// helper: parse JSON safely
function safeParse(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
}

// helper: validate image url (basic)
function isValidImageUrl(urlStr) {
  try {
    const u = new URL(urlStr);
    const ext = u.pathname.split('.').pop().toLowerCase();
    return ['jpg','jpeg','png','gif','webp'].includes(ext);
  } catch (e) {
    return false;
  }
}

// ===== LIVE PREVIEW =====

/**
 * Attach input listeners to form fields to update live preview
 */
function attachPreviewListeners(form) {
  // Listen for input events on all form fields
  const fields = form.querySelectorAll('[name]');
  fields.forEach(field => {
    field.addEventListener('input', () => updatePreview());
    field.addEventListener('change', () => updatePreview());
  });

  // Initial preview
  updatePreview();

  // Copy share link button
  const copyBtn = document.getElementById('btn-copy-share');
  const feedback = document.getElementById('share-feedback');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const url = buildShareURL();
      copyToClipboard(url, feedback);
    });
  }
}

/**
 * Update the preview card based on current form values
 */
function updatePreview() {
  const recipient = document.getElementById('preview-recipient');
  const message = document.getElementById('preview-message');
  const imageWrap = document.getElementById('preview-image-wrap');
  const placeholder = document.getElementById('preview-image-placeholder');

  // Gather current form values by name
  const getVal = (key) => {
    const el = document.querySelector(`[name="${key}"]`);
    return el ? (el.value || '').trim() : '';
  };

  const recipientVal = getVal('nguoi_nhan');
  const messageVal = getVal('loi_chuc');
  const imageVal = getVal('anh_nen');

  // Update recipient
  if (recipient) {
    recipient.textContent = recipientVal || '_____';
    recipient.style.opacity = recipientVal ? '1' : '0.5';
  }

  // Update message
  if (message) {
    if (messageVal) {
      message.textContent = messageVal;
      message.classList.add('preview-message-filled');
    } else {
      message.textContent = 'Lời chúc của bạn sẽ xuất hiện ở đây...';
      message.classList.remove('preview-message-filled');
    }
  }

  // Update background image
  if (imageWrap && placeholder) {
    if (imageVal && isValidImageUrl(imageVal)) {
      // Set background image
      imageWrap.style.backgroundImage = `url('${imageVal}')`;
      placeholder.style.display = 'none';
    } else {
      imageWrap.style.backgroundImage = '';
      placeholder.style.display = '';
    }
  }
}

// ===== URL SHARE =====

/**
 * Build a share URL with form data encoded as query params
 * @returns {string} Full URL with params
 */
function buildShareURL() {
  const form = document.querySelector('form');
  if (!form) return window.location.href;

  const params = new URLSearchParams();
  const fields = form.querySelectorAll('[name]');
  fields.forEach(field => {
    const val = (field.value || '').trim();
    if (val) {
      params.set(field.name, val);
    }
  });

  const base = window.location.origin + window.location.pathname;
  const queryString = params.toString();
  return queryString ? `${base}?${queryString}` : base;
}

/**
 * Copy text to clipboard with fallback
 */
function copyToClipboard(text, feedbackEl) {
  const showFeedback = (msg, isError) => {
    if (!feedbackEl) return;
    feedbackEl.textContent = msg;
    feedbackEl.style.color = isError ? 'var(--error-color)' : 'var(--primary)';
    setTimeout(() => { feedbackEl.textContent = ''; }, 2500);
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(
      () => showFeedback('✓ Đã sao chép!', false),
      () => {
        // Fallback
        fallbackCopy(text, showFeedback);
      }
    );
  } else {
    fallbackCopy(text, showFeedback);
  }
}

function fallbackCopy(text, cb) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    cb('✓ Đã sao chép!', false);
  } catch (e) {
    cb('✗ Sao chép thất bại', true);
  }
  document.body.removeChild(ta);
}

/**
 * Prefill form fields from URL query parameters
 */
function prefillFromURL(form) {
  const params = new URLSearchParams(window.location.search);
  if (!params.toString()) return;

  params.forEach((value, key) => {
    const el = form.querySelector(`[name="${key}"]`);
    if (el) {
      el.value = value;
    }
  });

  // Trigger preview update after prefill
  updatePreview();
}
