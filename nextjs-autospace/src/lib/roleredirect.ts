export const redirectByRole = (role: string) => {
  switch (role) {
    case "admin":
      window.location.href = "/admin/dashboard";
      return;
    case "owner":
      window.location.href = "/company/dashboard";
      return;
    case "manager":
      window.location.href = "/garage/dashboard";
      return;
    case "valet":
      window.location.href = "/valet/dashboard";
      return;
    default:
      window.location.href = "/customer/dashboard";
  }
};
