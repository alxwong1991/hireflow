export default interface Chat {
  applicationId: number;
  jobId: number;
  jobTitle: string;
  companyName: string;
  employeeName: string;
  status: string;
  jobClosed: boolean;
  canSendMessages: boolean;
}
