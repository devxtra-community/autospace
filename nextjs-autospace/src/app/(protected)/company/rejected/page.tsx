export default function CompanyRejectedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md text-center space-y-4 bg-card border rounded-xl p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-destructive">
          Company Rejected
        </h1>
        <p className="text-muted-foreground">
          Unfortunately, your company was rejected.
          <br />
          Please contact support or reapply with correct details.
        </p>
      </div>
    </div>
  );
}
