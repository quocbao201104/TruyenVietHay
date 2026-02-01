// frontend/src/modules/user/user.api.ts
import axios from "@/utils/axios";
import type {
    User,
    UpdateUserPayload,
    ChangePasswordPayload,
    UserPaginationResponse,
} from "@/types/user";


/**
 * Lấy thông tin chi tiết của người dùng hiện tại.
 * Endpoint: GET /api/user/me
 * @returns Promise<User> Thông tin người dùng.
 */
export async function getMeApi(): Promise<{ user: User }> {
    const response = await axios.get<{ user: User }>("/api/user/me");
    return response.data;
}

/**
 * Cập nhật thông tin của người dùng hiện tại.
 * Endpoint: PUT /api/user/me
 * @param data Dữ liệu cập nhật (full_name, email, phone, gender, avatar).
 * @returns Promise<any> Phản hồi từ server.
 */
export async function updateMeApi(data: UpdateUserPayload): Promise<any> {
    const formData = new FormData();

    if (data.full_name !== undefined)
        formData.append("full_name", data.full_name);
    if (data.email !== undefined) formData.append("email", data.email);
    if (data.phone !== undefined) formData.append("phone", data.phone);
    if (data.gender !== undefined) formData.append("gender", data.gender);

    if (data.avatar instanceof File) {
        formData.append("avatar", data.avatar);
    } else if (data.avatar === null) {
        formData.append("avatar", "null");
    }

    formData.append("_method", "PUT");

    const response = await axios.post("/api/user/me", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return response.data;
}

/**
 * Thay đổi mật khẩu của người dùng hiện tại.
 * Endpoint: PUT /api/user/change-password
 * @param data old_password và new_password.
 * @returns Promise<any> Phản hồi từ server.
 */
export async function changePasswordApi(
    data: ChangePasswordPayload
): Promise<any> {
    const response = await axios.put("/api/user/change-password", data);
    return response.data;
}

// ===============================================
// API cho Admin quản lý người dùng
// ===============================================

interface GetUsersParams {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
}

/**
 * Lấy danh sách người dùng cho Admin.
 * Endpoint: GET /api/admin/users
 * @param params Các tham số truy vấn: page, limit, search, role.
 * @returns Promise<UserPaginationResponse> Danh sách người dùng và thông tin phân trang.
 */
export async function getUsersApi(params: GetUsersParams = {}): Promise<UserPaginationResponse> {
    const response = await axios.get<UserPaginationResponse>("/api/admin/users", { params });
    return response.data;
}

/**
 * Cấm một người dùng.
 * Endpoint: PUT /api/admin/users/:id/ban
 * @param userId ID của người dùng cần cấm.
 * @param durationDays Số ngày cấm (null hoặc 0 nếu cấm vĩnh viễn).
 * @returns Promise<any> Phản hồi từ server.
 */
export async function banUserApi(userId: number, durationDays: number | null): Promise<any> {
    const response = await axios.put(`/api/admin/users/${userId}/ban`, { duration_days: durationDays });
    return response.data;
}

/**
 * Bỏ cấm một người dùng.
 * Endpoint: PUT /api/admin/users/:id/unban
 * @param userId ID của người dùng cần bỏ cấm.
 * @returns Promise<any> Phản hồi từ server.
 */
export async function unbanUserApi(userId: number): Promise<any> {
    const response = await axios.put(`/api/admin/users/${userId}/unban`);
    return response.data;
}

/**
 * Xóa một người dùng.
 * Endpoint: DELETE /api/admin/users/:id
 * @param userId ID của người dùng cần xóa.
 * @returns Promise<any> Phản hồi từ server.
 */
export async function deleteUserApi(userId: number): Promise<any> {
    const response = await axios.delete(`/api/admin/users/${userId}`);
    return response.data;
}

/**
 * Cập nhật vai trò (role) của một người dùng.
 * Endpoint: PUT /api/admin/users/:id/role
 * @param userId ID của người dùng cần cập nhật.
 * @param newRole Vai trò mới ('user', 'author', 'admin').
 * @returns Promise<any> Phản hồi từ server.
 */
export async function updateUserRoleApi(userId: number, newRole: 'user' | 'author' | 'admin'): Promise<any> {
    const response = await axios.put(`/api/admin/users/${userId}/role`, { newRole });
    return response.data;
}