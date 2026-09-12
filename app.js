// renderForm(configArray, containerId)
// - configArray: array of field definitions (window.APP_CONFIG)
// - containerId: id of element to mount the form
// Behavior:
//  - Render label, input/textarea per type, add id/aria attributes
//  - Attach client-side validation on submit and input events
//  - Display errors in element with role="alert" and aria-live="assertive"

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
      // map 'url' to input type url, fallback to text
      const type = (field.type === 'url') ? 'url' : (field.type || 'text');
      input = document.createElement('input');
      input.type = type;
    }

    input.id = id;
    input.name = field.key || id;
    if (field.placeholder) input.placeholder = field.placeholder;
    if (field.maxLength) input.maxLength = field.maxLength;
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

  // On submit: validate all fields
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const isValid = validateForm(form);
    if (!isValid) return;
    // Collect form data and proceed (example: console.log or send)
    const data = {};
    const elements = Array.from(form.elements).filter(el => el.name);
    elements.forEach(el => data[el.name] = el.value);
    // Example success handler: replace this with actual submit logic
    console.log('Form valid. Payload:', data);
    // show a simple success message
    alert('Dữ liệu hợp lệ — kiểm tra console để xem payload.');
  });
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
