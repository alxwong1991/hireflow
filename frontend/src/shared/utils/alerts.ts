import Swal from "sweetalert2";

const alertTheme = {
  background: "#0f172a",
  color: "#e5e7eb",
  confirmButtonColor: "#2563eb",
  customClass: {
    popup: "hireflow-alert",
  },
};

export function showSuccessAlert(message: string, title = "Success") {
  return Swal.fire({
    ...alertTheme,
    icon: "success",
    title,
    text: message,
  });
}

export function showErrorAlert(message: string, title = "Something went wrong") {
  return Swal.fire({
    ...alertTheme,
    icon: "error",
    title,
    text: message,
  });
}

export async function confirmJobDeletion(jobTitle: string): Promise<boolean> {
  const result = await Swal.fire({
    ...alertTheme,
    icon: "warning",
    title: "Delete this closed job?",
    text: `"${jobTitle}" and its applications will be permanently deleted.`,
    showCancelButton: true,
    confirmButtonText: "Delete job",
    cancelButtonText: "Keep job",
    confirmButtonColor: "#dc2626",
  });

  return result.isConfirmed;
}
