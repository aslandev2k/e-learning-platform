import { useLocation, useMatches } from '@tanstack/react-router';
import type { RouteId } from '@/@type/tanstack-route';

export const PAGE_NAME: Record<RouteId, string> = {
  // Error
  '/app/error': 'Lỗi',
  '/app/error/': 'Lỗi',
  '/app/error/403': 'Không có quyền truy cập',
  '/app/error/404': 'Không tìm thấy trang',
  '/app/error/gone': 'Không tìm thấy tài nguyên',
  '/error/503': 'Dịch vụ không khả dụng',

  // Root
  __root__: 'Trang chủ',
  '/': 'Trang chủ',

  // App
  '/app': 'Tổng quan',
  '/app/': 'Tổng quan',

  // Auth
  '/auth': 'Xác thực',
  '/auth/sign-in': 'Đăng nhập',
  '/auth/sign-up': 'Đăng ký',
  '/auth/sign-out': 'Đăng xuất',
  '/auth/change-password': 'Đổi mật khẩu',
  '/auth/verify-email': 'Xác thực email',
  '/auth/forgot-password': 'Quên mật khẩu',
  '/auth/reset-password': 'Đặt lại mật khẩu',

  // Profile
  '/app/profile/': 'Thông tin cá nhân',

  // Admin
  '/app/admin': 'Quản trị',
  '/app/admin/users/': 'Quản lý người dùng',
  '/app/admin/users/$userId': 'Chi tiết người dùng',

  // Rooms
  '/app/rooms/': 'Danh sách phòng học',
  '/app/rooms/create': 'Tạo phòng học',
  '/app/rooms/$roomId': 'Chi tiết phòng học',
  '/app/rooms/$roomId/': 'Chi tiết phòng học',
  '/app/rooms/$roomId/edit': 'Cập nhật phòng học',
  '/app/rooms/$roomId/members': 'Thành viên phòng học',
  '/app/rooms/$roomId/contests/': 'Danh sách kỳ thi',
  '/app/rooms/$roomId/contests/create': 'Tạo kỳ thi',
  '/app/rooms/$roomId/problems/': 'Danh sách bài tập',
  '/app/rooms/$roomId/problems/create': 'Tạo bài tập',
  '/app/rooms/$roomId/submissions': 'Bài nộp trong phòng',

  // Contests
  '/app/contests/$contestId': 'Chi tiết kỳ thi',
  '/app/contests/$contestId/': 'Chi tiết kỳ thi',
  '/app/contests/$contestId/edit': 'Cập nhật kỳ thi',
  '/app/contests/$contestId/problems': 'Bài tập trong kỳ thi',
  '/app/contests/$contestId/leaderboard': 'Bảng xếp hạng',

  // Problems
  '/app/problems/$problemId': 'Chi tiết bài tập',
  '/app/problems/$problemId/': 'Chi tiết bài tập',
  '/app/problems/$problemId/edit': 'Cập nhật bài tập',
  '/app/problems/$problemId/testcases': 'Quản lý test case',

  // Submissions
  '/app/submissions/': 'Bài nộp của tôi',
  '/app/submissions/$submissionId': 'Chi tiết bài nộp',
};

export function usePageName() {
  const location = useLocation();
  const matches = useMatches();

  // Page name dựa trên masked location (error pages redirect với mask)
  let maskedPageName: string | undefined;
  let maskedPath = location.maskedLocation?.pathname;
  if (maskedPath) {
    if (!maskedPath.endsWith('/') && !maskedPath.includes('$')) {
      maskedPath = `${maskedPath}/`;
    }
    maskedPageName = PAGE_NAME[maskedPath as keyof typeof PAGE_NAME];
  }

  // Page name dựa trên routeId của route hiện tại
  const { routeId } = matches[matches.length - 1];
  const locationPageName = PAGE_NAME[routeId as keyof typeof PAGE_NAME];

  return { maskedPageName, locationPageName };
}
