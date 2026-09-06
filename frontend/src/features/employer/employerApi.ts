import { apiClient } from "../../lib/apiClient";

export type EmployerProfileResponse = {
    companyName: string;
    companyDescription: string | null;
    website: string | null;
    location: string | null;
};

export async function getEmployerProfile(
    employerProfileId: number
): Promise<EmployerProfileResponse> {
    const response = await apiClient.get<EmployerProfileResponse>(
        `/employer/profile/${employerProfileId}`
    );
    return response.data;
}