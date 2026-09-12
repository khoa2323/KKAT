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
      pattern: '^(https?:\\/\\/).+\\.(jpg|jpeg|png|gif|webp)$',
      message: 'Vui lòng nhập một URL ảnh hợp lệ (jpg, png, gif, webp).'
    },
    help: 'URL công khai; nếu muốn upload file, dùng tính năng upload.'
  }
];
