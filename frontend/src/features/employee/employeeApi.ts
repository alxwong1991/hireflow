import apiClient from "../../lib/apiClient";
import type EmployeeProfileResponse from "./types/employeeProfileResponse";
import type EmployeeProfileRequest from "./types/employeeProfileRequest";

export async function getEmployeeProfile(
): Promise<EmployeeProfileResponse> {
    const response = await apiClient.get<EmployeeProfileResponse>(
        "/employee/profile"
    );
    return response.data;
}

export async function updateEmployeeProfile(
    profileData: EmployeeProfileRequest
): Promise<EmployeeProfileResponse> {
    const response = await apiClient.post<EmployeeProfileResponse>(
        "/employee/profile",
        profileData
    );
    return response.data;
}

export async function amendEmployeeProfile(
    profileData: Partial<EmployeeProfileRequest>
): Promise<EmployeeProfileResponse> {
    const response = await apiClient.patch<EmployeeProfileResponse>(
        "/employee/profile",
        profileData
    );
    return response.data;
}