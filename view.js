// ===== VIEW PAGE LOGIC =====
// Loads a card from Supabase by ID from URL parameter

(function() {
  'use strict';

  // Initialize Supabase client
  const SUPABASE_URL = 'https://rkrmfyicbexyvuudltou.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrcm1meWljYmV4eXZ1dWRsdG91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyNzk2OTQsImV4cCI6MjEwNDg1NTY5NH0.Sxge6X8_OQmaprLLQEDjcdxAynJzXtpzTMIkE1hD0I4';
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // DOM elements
  const loadingState = document.getElementById('loading-state');
  const errorState = document.getElementById('error-state');
  const errorTitle = document.getElementById('error-title');
  const errorMessage = document.getElementById('error-message');
  const cardDisplay = document.getElementById('card-display');
  const cardImage = document.getElementById('card-image');
  const cardRecipient = document.getElementById('card-recipient');
  const cardMessage = document.getElementById('card-message');
  const cardDate = document.getElementById('card-date');

  function getURLParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  function formatDate(dateString) {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return '';
    }
  }

  function isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (e) {
      return false;
    }
  }

  function showError(title, message) {
    loadingState.style.display = 'none';
    cardDisplay.style.display = 'none';
    errorTitle.textContent = title;
    errorMessage.textContent = message;
    errorState.style.display = 'block';
  }

  function displayCard(card) {
    cardRecipient.textContent = card.recipient || '_____';
    cardMessage.textContent = card.message || '';

    if (card.created_at) {
      cardDate.textContent = 'Tạo ngày: ' + formatDate(card.created_at);
    }

    if (card.image_url && isValidUrl(card.image_url)) {
      cardImage.style.backgroundImage = "url('" + card.image_url + "')";
      cardImage.classList.remove('no-image');
    } else {
      cardImage.style.backgroundImage = '';
      cardImage.classList.add('no-image');
    }

    loadingState.style.display = 'none';
    errorState.style.display = 'none';
    cardDisplay.style.display = 'block';
  }

  async function loadCard() {
    const cardId = getURLParam('id');

    if (!cardId) {
      showError('Thiếu mã thiệp', 'Vui lòng cung cấp mã thiệp trong URL. Ví dụ: view.html?id=abc-123');
      return;
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(cardId)) {
      showError('Mã thiệp không hợp lệ', 'Mã thiệp phải có định dạng UUID hợp lệ.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('id', cardId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          showError('Không tìm thấy thiệp', 'Thiệp bạn đang tìm không tồn tại hoặc đã bị xóa.');
        } else {
          showError('Lỗi tải dữ liệu', 'Không thể tải thiệp. Vui lòng thử lại sau.');
          console.error('Supabase error:', error);
        }
        return;
      }

      if (!data) {
        showError('Không tìm thấy thiệp', 'Thiệp bạn đang tìm không tồn tại hoặc đã bị xóa.');
        return;
      }

      displayCard(data);

    } catch (err) {
      showError('Lỗi kết nối', 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng và thử lại.');
      console.error('Network error:', err);
    }
  }

  // Load card on page load
  loadCard();
})();
