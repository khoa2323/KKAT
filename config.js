window.APP_CONFIG = [
  {
    key: 'nguoi_nhan',
    label: 'Tên người nhận',
    type: 'text',
    placeholder: 'Nhập tên đầy đủ (tối đa 100 ký tự)',
    required: true,
    id: 'input-nguoi-nhan',
    ariaLabel: 'Tên người nhận',
    ariaDescribedBy: 'help-nguoi-nhan',
    maxLength: 100,
    example: 'Ví dụ: Nguyễn Văn A',
    validation: {
      pattern: '^[^\\n]{1,100}$',
      message: 'Vui lòng nhập tên (không xuống dòng, tối đa 100 ký tự).'
    },
    help: 'Tên hiển thị trên thiệp; viết không dấu/viết hoa tuỳ ý.'
  },
  {
    key: 'loi_chuc',
    label: 'Lời chúc',
    type: 'textarea',
    placeholder: 'Nhập lời chúc sinh nhật (tối đa 500 ký tự)',
    required: true,
    id: 'input-loi-chuc',
    ariaLabel: 'Lời chúc sinh nhật',
    ariaDescribedBy: 'help-loi-chuc',
    rows: 4,
    maxLength: 500,
    example: 'Ví dụ: Chúc bạn sinh nhật vui vẻ, nhiều sức khoẻ!',
    validation: {
      pattern: '^[\\s\\S]{1,500}$',
      message: 'Lời chúc phải ít hơn hoặc bằng 500 ký tự.'
    },
    help: 'Hỗ trợ xuống dòng. Tránh ngôn ngữ nhạy cảm.'
  },
  {
    key: 'anh_nen',
    label: 'URL ảnh kỷ niệm',
    type: 'url',
    placeholder: 'Dán link ảnh (https://...jpg/png/gif)',
    required: false,
    id: 'input-anh-nen',
    ariaLabel: 'Link ảnh kỷ niệm',
    ariaDescribedBy: 'help-anh-nen',
    example: 'https://example.com/photo.jpg',
    validation: {
      pattern: '^(https?:\\/\\/).+\\.(jpg|jpeg|png|gif|webp)(\\?.*)?(#.*)?$',
      message: 'Vui lòng nhập một URL ảnh hợp lệ (jpg, png, gif, webp).'
    },
    help: 'URL công khai; nếu muốn upload file, dùng tính năng upload.'
  }
];

// Templates for different page types (bio, event, product)
window.APP_TEMPLATES = {
  bio: {
    key: 'bio',
    label: 'Trang cá nhân',
    fields: [
      { key: 'name', label: 'Họ và tên', type: 'text', required: true },
      { key: 'avatar', label: 'Avatar URL', type: 'url', required: false },
      { key: 'bio', label: 'Tiểu sử', type: 'textarea', required: false },
      { key: 'facebook', label: 'Facebook', type: 'url', required: false },
      { key: 'tiktok', label: 'TikTok', type: 'url', required: false }
    ]
  },
  event: {
    key: 'event',
    label: 'Trang sự kiện',
    fields: [
      { key: 'title', label: 'Tiêu đề', type: 'text', required: true },
      { key: 'time', label: 'Thời gian', type: 'text', required: true },
      { key: 'desc', label: 'Mô tả', type: 'textarea', required: false },
      { key: 'banner', label: 'Banner URL', type: 'url', required: false }
    ]
  },
  product: {
    key: 'product',
    label: 'Trang sản phẩm',
    fields: [
      { key: 'pname', label: 'Tên sản phẩm', type: 'text', required: true },
      { key: 'price', label: 'Giá', type: 'text', required: true },
      { key: 'pdesc', label: 'Mô tả', type: 'textarea', required: false },
      { key: 'pimg', label: 'Ảnh sản phẩm', type: 'url', required: false },
      { key: 'buylink', label: 'Link mua', type: 'url', required: false }
    ]
  }
};

// context version for agents
window.CONFIG_CONTEXT_VERSION = 2;
