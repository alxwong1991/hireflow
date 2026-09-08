import apiClient from "../../lib/apiClient";
import type EmployeeProfileResponse from "./types/employeeProfileResponse";
import type EmployeeProfileRequest from "./types/employeeProfileRequest";

export async function getEmployeeProfile(
    employeeProfileId: number
): Promise<EmployeeProfileResponse> {
    const response = await apiClient.get<EmployeeProfileResponse>(
        `/employee/profile/${employeeProfileId}`
    );
    return response.data;
}

export async function updateEmployeeProfile(
    employeeProfileId: number,
    profileData: EmployeeProfileRequest
): Promise<EmployeeProfileResponse> {
    const response = await apiClient.post<EmployeeProfileResponse>(
        `/employee/profile/${employeeProfileId}/update`,
        profileData
    );
    return response.data;
}

export async function amendEmployeeProfile(
    employeeProfileId: number,
    profileData: Partial<EmployeeProfileRequest>
): Promise<EmployeeProfileResponse> {
    const response = await apiClient.patch<EmployeeProfileResponse>(
        `/employee/profile/${employeeProfileId}/amend`,
        profileData
    );
    return response.data;
}