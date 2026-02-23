import z, { type ZodObject } from 'zod';

export const SCHEMA_DESCRIPTION = {
  NEW_PASSWORD: 'NEW_PASSWORD',
  UPLOAD_FILES: 'UPLOAD_FILES',
  PREVIEW_FILES: 'PREVIEW_FILES',
  DATETIME: 'DATETIME',
  TEXTAREA: 'TEXTAREA',
} as const;
export type SCHEMA_DESCRIPTION = (typeof SCHEMA_DESCRIPTION)[keyof typeof SCHEMA_DESCRIPTION];

const entityId = z
  .int()
  .min(1)
  .max(10000000)
  .meta({ examples: [1, 42, 1001] });

const attachmentZod = z.object({
  id: entityId,
  fileName: z.string(),
  fileSize: z.number().int().positive(),
  contentType: z.string(),
  downloadUrl: z.url(),
});

export type Attachment = z.infer<typeof attachmentZod>;

const pathId = z.coerce.number().int().positive();

const MAX_FILE_SIZE = 10_000_000;
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
] as const;

export const commonZod = {
  entityId,
  pathId,
  datetime: z
    .union([z.iso.datetime(), z.date()], 'Ngày giờ không hợp lệ!')
    .transform((val) => new Date(val))
    .meta({ examples: ['2024-01-15T08:30:00Z', '2024-06-20T14:45:00Z'] })
    .describe(SCHEMA_DESCRIPTION.DATETIME),
  email: z
    .email('Email không hợp lệ!')
    .meta({ examples: ['aslandev2k@gmail.com', 'user@gmail.com'] }),
  fullName: z
    .string('Vui lòng nhập họ tên')
    .min(2, 'Họ tên phải có ít nhất 2 ký tự')
    .max(100, 'Họ tên quá dài')
    .refine((val) => /^[\p{L}\s]+$/u.test(val), 'Họ tên chỉ được chứa chữ cái và khoảng trắng')
    .refine((val) => /^\p{L}/u.test(val), 'Họ tên phải bắt đầu bằng chữ cái')
    .refine((val) => /\p{L}$/u.test(val), 'Họ tên phải kết thúc bằng chữ cái')
    .refine((val) => !val.includes('  '), 'Họ tên không được có 2 khoảng trắng liên tiếp')
    .meta({ examples: ['Nguyễn Văn An', 'Trần Thị Bình'] }),
  username: z
    .string('Vui lòng nhập tài khoản')
    .min(4, 'Tài khoản phải có ít nhất 4 ký tự')
    .max(32, 'Tài khoản quá dài')
    .refine(
      (val) => /^[a-z0-9_]+$/.test(val),
      'Tài khoản chỉ được chứa chữ cái thường không dấu, số và dấu gạch dưới',
    )
    .refine((val) => /^[a-z]/.test(val), 'Tài khoản phải bắt đầu bằng chữ cái thường')
    .meta({ examples: ['nguyenvana', 'admin_user01'] }),
  password: z
    .string('Vui lòng nhập mật khẩu')
    .nonempty('Vui lòng nhập mật khẩu')
    .meta({ examples: ['********', '••••••••'] }),
  newPassword: z
    .string('Vui lòng nhập mật khẩu')
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .max(64, 'Mật khẩu quá dài')
    .refine((val) => /^[\x20-\x7E]+$/.test(val), 'Mật khẩu chỉ được chứa ký tự ASCII')
    .refine((val) => /[A-Z]/.test(val), 'Mật khẩu phải có ít nhất 1 chữ hoa')
    .refine((val) => /[a-z]/.test(val), 'Mật khẩu phải có ít nhất 1 chữ thường')
    .refine((val) => /[0-9]/.test(val), 'Mật khẩu phải có ít nhất 1 chữ số')
    .refine(
      (val) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(val),
      'Mật khẩu phải có ít nhất 1 ký tự đặc biệt',
    )
    .meta({ examples: ['SecureP@ss1!', 'MyStr0ng#Pass'] })
    .describe(SCHEMA_DESCRIPTION.NEW_PASSWORD),
  file: z
    .file()
    .max(MAX_FILE_SIZE, 'File không được vượt quá 10MB')
    .mime([...ALLOWED_MIME_TYPES], 'Định dạng file không được hỗ trợ'),
  uploadFiles: z
    .array(
      z
        .file()
        .min(1, 'Tập tin không có dữ liệu')
        .max(MAX_FILE_SIZE, 'Kích thước tập tin không được vượt quá 10MB')
        .mime([...ALLOWED_MIME_TYPES], 'Chỉ cho phép tải lên ảnh (jpeg,png), pdf, word và excel.'),
    )
    .describe(SCHEMA_DESCRIPTION.UPLOAD_FILES),
  previewFiles: z
    .array(attachmentZod)
    .optional()
    .default([])
    .describe(SCHEMA_DESCRIPTION.PREVIEW_FILES),
  textarea: z
    .string('Vui lòng nhập thông tin')
    .max(1000, 'Bạn chỉ được phép nhập tối đa 1000 ký tự')
    .describe(SCHEMA_DESCRIPTION.TEXTAREA),
  attachment: attachmentZod,
  version: z.number().int('Phải là số nguyên').nonnegative('Phải là số không âm'),
  unitName: z
    .string('Vui lòng nhập tên đơn vị')
    .min(5, 'Tên đơn vị phải có ít nhất 5 ký tự')
    .max(64, 'Tên đơn vị quá dài')
    .refine((val) => !val.includes('  '), 'Tên đơn vị không được có 2 khoảng trắng liên tiếp')
    .refine(
      (val) => /^[\p{L}\s0-9]+$/u.test(val),
      'Tên đơn vị chỉ được chứa chữ cái, số và khoảng trắng',
    )
    .refine((val) => /[\p{L}]/u.test(val), 'Tên đơn vị phải chứa ít nhất một chữ cái')
    .meta({
      examples: [
        'Xã Mỹ Đức',
        'Phường Bến Thành',
        'Thị trấn Chợ Mới',
        'Quận 1',
        'Huyện Mỹ Đức',
        'Hà Nội',
        'TP Hồ Chí Minh',
      ],
    }),
  applicantName: z
    .string('Vui lòng nhập tên người/tập thể')
    .nonempty('Vui lòng nhập tên người/tập thể')
    .min(2, 'Tên phải có ít nhất 2 ký tự')
    .max(128, 'Tên quá dài, tối đa 128 ký tự!')
    .meta({ examples: ['Nguyễn Văn An', 'Chi bộ Đảng xã An Nhơn'] }),
};

export const searchOptionsSchema = z.object({
  query: z
    .string()
    .transform((v) => v.replace(/[^\p{L}\p{N}\s]/gu, '').trim())
    .pipe(z.string().min(1))
    .optional()
    .catch(undefined)
    .meta({ examples: ['Nguyễn Văn', 'thi đua 2024'] }),
  pageIndex: z.coerce
    .number()
    .int()
    .min(0)
    .max(100000)
    .optional()
    .default(0)
    .catch(0)
    .meta({ examples: [0, 1, 5] }),
  pageSize: z.coerce
    .number()
    .int()
    .min(10)
    .max(100)
    .optional()
    .default(10)
    .catch(10)
    .meta({ examples: [10, 20, 50] }),
  sortOrder: z.enum(['asc', 'desc']).optional().catch(undefined),
});

export type SortOrder = 'asc' | 'desc';
export const searchResultsSchema = <T extends ZodObject>(itemSchema: T) =>
  searchOptionsSchema
    .pick({ pageSize: true, pageIndex: true })
    .required()
    .extend({
      total: z.number().meta({ examples: [10, 20] }),
      items: itemSchema.array(),
    });
