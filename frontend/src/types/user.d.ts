// frontend/src/types/user.d.ts

/**
 * Định nghĩa cấu trúc dữ liệu đầy đủ của một User
 * nhận được từ API backend (ví dụ từ /api/user/me).
 */
export interface User {
    id: number;
    username: string;
    email: string;
    full_name: string;
    phone: string;
    avatar: string | null;
    role: 'user' | 'author' | 'admin'; 
    gender: 'male' | 'female' | 'other'; 
    created_at: string; 
    status: 'active' | 'blocked'; 
    ban_until: string | null;
}

/**
 * Payload khi cập nhật thông tin người dùng.
 * Tất cả các trường là optional vì người dùng có thể chỉ cập nhật một phần.
 */
export interface UpdateUserPayload {
    full_name?: string;
    email?: string;
    phone?: string;
    gender?: 'male' | 'female' | 'other';
    avatar?: File | string | null; 
}

/**
 * Payload khi thay đổi mật khẩu.
 */
export interface ChangePasswordPayload {
    old_password: string;
    new_password: string;
}

/**
 * Định nghĩa cấu trúc phản hồi khi lấy danh sách người dùng cho Admin (có phân trang).
 */
export interface UserPaginationResponse {
    message: string;
    data: User[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    stats?: {
        totalUsers: number;
        activeUsers: number;
        blockedUsers: number;
        authorUsers: number;
    };
}