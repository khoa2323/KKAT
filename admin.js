// ===== ADMIN PAGE LOGIC =====
(function() {
  'use strict';

  var SUPABASE_URL = 'https://rkrmfyicbexyvuudltou.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrcm1meWljYmV4eXZ1dWRsdG91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyNzk2OTQsImV4cCI6MjEwNDg1NTY5NH0.Sxge6X8_OQmaprLLQEDjcdxAynJzXtpzTMIkE1hD0I4';
  var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  var loadingState = document.getElementById('loading-state');
  var errorState = document.getElementById('error-state');
  var errorTitle = document.getElementById('error-title');
  var errorMessage = document.getElementById('error-message');
  var emptyState = document.getElementById('empty-state');
  var cardsContainer = document.getElementById('cards-container');
  var cardsTbody = document.getElementById('cards-tbody');
  var cardsCount = document.getElementById('cards-count');
  var deleteModal = document.getElementById('delete-modal');
  var btnCancelDelete = document.getElementById('btn-cancel-delete');
  var btnConfirmDelete = document.getElementById('btn-confirm-delete');
  var btnRetry = document.getElementById('btn-retry');
  var toast = document.getElementById('toast');
  var toastMessage = document.getElementById('toast-message');

  var cards = [];
  var cardToDelete = null;
  var isLoading = false;

  function formatDate(dateString) {
    try {
      var date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (e) { return ''; }
  }

  function escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function truncate(text, max) {
    if (!text) return '';
    return text.length <= max ? text : text.substring(0, max) + '...';
  }

  function showError(title, message) {
    loadingState.style.display = 'none';
    emptyState.style.display = 'none';
    cardsContainer.style.display = 'none';
    errorTitle.textContent = title;
    errorMessage.textContent = message;
    errorState.style.display = 'block';
  }

  function showToast(message, isError) {
    toastMessage.textContent = message;
    toast.style.display = 'block';
    toast.className = 'toast toast-' + (isError ? 'error' : 'success');
    setTimeout(function() { toast.style.display = 'none'; }, 3000);
  }

  function openDeleteModal(cardId) {
    cardToDelete = cardId;
    deleteModal.style.display = 'flex';
  }

  function closeDeleteModal() {
    cardToDelete = null;
    deleteModal.style.display = 'none';
  }

  async function deleteCard(cardId) {
    if (isLoading) return;
    isLoading = true;
    btnConfirmDelete.disabled = true;
    btnConfirmDelete.textContent = 'Đang xóa...';
    try {
      var { error } = await supabase.from('cards').delete().eq('id', cardId);
      if (error) throw error;
      showToast('✓ Đã xóa thiệp thành công');
      closeDeleteModal();
      loadCards();
    } catch (err) {
      showToast('✗ Xóa thất bại: ' + (err.message || 'Lỗi'), true);
    } finally {
      isLoading = false;
      btnConfirmDelete.disabled = false;
      btnConfirmDelete.textContent = 'Xóa';
    }
  }

  function renderCards() {
    cardsTbody.innerHTML = '';
    if (!cards || cards.length === 0) {
      loadingState.style.display = 'none';
      errorState.style.display = 'none';
      cardsContainer.style.display = 'none';
      emptyState.style.display = 'block';
      return;
    }
    cards.forEach(function(card) {
      var row = document.createElement('tr');
      row.className = 'card-row';
      var viewUrl = 'view.html?id=' + encodeURIComponent(card.id);
      row.innerHTML =
        '<td class="cell-recipient">' + escapeHtml(truncate(card.recipient, 30)) + '</td>' +
        '<td class="cell-message">' + escapeHtml(truncate(card.message, 50)) + '</td>' +
        '<td class="cell-date">' + formatDate(card.created_at) + '</td>' +
        '<td class="cell-link"><a href="' + viewUrl + '" target="_blank" class="btn-view">Xem</a></td>' +
        '<td class="cell-action"><button class="btn-delete" data-id="' + card.id + '">Xóa</button></td>';
      cardsTbody.appendChild(row);
    });
    var deleteButtons = cardsTbody.querySelectorAll('.btn-delete');
    deleteButtons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        openDeleteModal(this.getAttribute('data-id'));
      });
    });
    loadingState.style.display = 'none';
    errorState.style.display = 'none';
    emptyState.style.display = 'none';
    cardsContainer.style.display = 'block';
    cardsCount.textContent = cards.length + ' thiệp';
  }

  async function loadCards() {
    loadingState.style.display = 'block';
    errorState.style.display = 'none';
    emptyState.style.display = 'none';
    cardsContainer.style.display = 'none';
    try {
      var { data, error } = await supabase
        .from('cards').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      cards = data || [];
      renderCards();
    } catch (err) {
      showError('Lỗi tải dữ liệu', 'Không thể tải danh sách. ' + (err.message || ''));
    }
  }

  btnCancelDelete.addEventListener('click', closeDeleteModal);
  btnConfirmDelete.addEventListener('click', function() {
    if (cardToDelete) deleteCard(cardToDelete);
  });
  btnRetry.addEventListener('click', loadCards);
  deleteModal.addEventListener('click', function(e) {
    if (e.target === deleteModal) closeDeleteModal();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && deleteModal.style.display === 'flex') closeDeleteModal();
  });

  loadCards();
})();
