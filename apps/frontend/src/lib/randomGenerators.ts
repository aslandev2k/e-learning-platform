export const generateRandomPassword = (length: number = 16): string => {
  const charsets = [
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ', // letters
    'abcdefghijklmnopqrstuvwxyz', // letters
    '0123456789', // numbers
    '!@#$%^&*', // symbols
  ];

  const passwordChars: string[] = [];

  for (let i = 0; i < length; i++) {
    const idx = i % charsets.length;
    const charset = charsets[idx];
    const randomChar = charset[Math.floor(Math.random() * charset.length)];
    passwordChars.push(randomChar);
  }

  // Shuffle (Fisher–Yates)
  for (let i = passwordChars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
  }

  return passwordChars.join('');
};

const FIRST_NAMES = [
  'Dat',
  'An',
  'Anh',
  'Bao',
  'Binh',
  'Cuong',
  'Duc',
  'Dung',
  'Giang',
  'Hai',
  'Hieu',
  'Hoa',
  'Hoang',
  'Hung',
  'Huy',
  'Khanh',
  'Khoa',
  'Linh',
  'Long',
  'Mai',
  'Minh',
  'My',
  'Nam',
  'Ngoc',
  'Nhi',
  'Phong',
  'Phuc',
  'Quang',
  'Son',
  'Tam',
  'Thao',
  'Thien',
  'Thinh',
  'Trang',
  'Trung',
  'Tuan',
  'Vy',
  'Anh',
  'Bich',
  'Canh',
  'Diem',
  'Giao',
  'Hong',
  'Huong',
  'Kien',
  'Lang',
  'Lien',
  'Loan',
  'Loc',
  'Ly',
  'Man',
  'Manh',
  'Mien',
  'Minh',
  'Nghia',
  'Nghiep',
  'Nhan',
  'Nhuong',
  'Niem',
  'Nien',
  'Phat',
  'Phuong',
  'Phuoc',
  'Quynh',
  'Sanh',
  'Sinh',
  'Tai',
  'Tanh',
  'Thai',
  'Thanh',
  'Thang',
  'That',
  'Thau',
  'Thay',
  'Them',
  'Theo',
  'Thieu',
  'Thing',
  'Tho',
  'Thu',
  'Thuc',
  'Thue',
  'Thung',
  'Tiem',
  'Tieu',
  'Toan',
  'Toi',
  'Tong',
  'Trac',
  'Tram',
  'Tran',
  'Tre',
  'Tri',
  'Triem',
  'Trinh',
  'Tron',
  'Trou',
  'Tru',
  'Truc',
  'True',
  'Trung',
  'Trut',
  'Tu',
  'Tuan',
  'Tuong',
  'Tuy',
  'Tuy',
  'Tuyen',
  'Ung',
  'Uyen',
  'Van',
  'Vang',
  'Vanh',
  'Ve',
  'Vein',
  'Vien',
  'Viet',
  'Vo',
  'Vu',
  'Xuan',
  'Yen',
  'Yen',
  'Yeu',
];
const LAST_NAMES = [
  'Nguyen',
  'Tran',
  'Le',
  'Pham',
  'Hoang',
  'Huynh',
  'Phan',
  'Vu',
  'Vo',
  'Dang',
  'Bui',
  'Do',
  'Ho',
  'Ngo',
  'Duong',
  'Ly',
];
type RandomNameType = 'username' | 'fullName';
export const randomName = (type: RandomNameType): string => {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  if (type === 'fullName') {
    return `${lastName} ${firstName}`;
  }

  // username
  return `${firstName.toLowerCase()}`;
};

export const pickRandomItemFromArray = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

export const randomDateInRange = (start: Date, end: Date) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
