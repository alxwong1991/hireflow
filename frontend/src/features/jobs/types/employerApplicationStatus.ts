import type ApplicationStatus from "./applicationStatus";

type EmployerApplicationStatus = Exclude<ApplicationStatus, "WITHDRAWN">;

export type { EmployerApplicationStatus as default };
