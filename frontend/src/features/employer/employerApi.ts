import apiClient from "../../lib/apiClient";
import type EmployerProfileRequest from "./types/employerProfileRequest";
import type EmployerProfileResponse from "./types/employerProfileResponse"

export async function getEmployerProfile(
): Promise<EmployerProfileResponse> {
    const response = await apiClient.get<EmployerProfileResponse>(
        "/employer/profile"
    );
    return response.data;
}

export async function updateEmployerProfile(
    profileData: EmployerProfileRequest
): Promise<EmployerProfileResponse> {
    const response = await apiClient.post<EmployerProfileResponse>(
        "/employer/profile",
        profileData
    );
    return response.data;
}

export async function amendEmployerProfile(
    profileData: Partial<EmployerProfileRequest>
): Promise<EmployerProfileResponse> {
    const response = await apiClient.patch<EmployerProfileResponse>(
        "/employer/profile",
        profileData
    );
    return response.data;
}