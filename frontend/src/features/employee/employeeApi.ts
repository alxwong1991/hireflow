import { apiClient } from "../../lib/apiClient";

export type EmployeeProfileResponse = {
    fullName: string;
    phone: string | null;
    location: string | null;
    summary: string | null;
};

export async function getEmployeeProfile(
    employeeProfileId: number
): Promise<EmployeeProfileResponse> {
    const response = await apiClient.get<EmployeeProfileResponse>(
        `/employee/profile/${employeeProfileId}`
    );
    return response.data;
}