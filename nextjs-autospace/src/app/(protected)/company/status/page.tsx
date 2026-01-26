export default function CompanyStatusPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-semibold">Company Under Review</h1>
        <p className="text-muted-foreground">
          Your company has been registered successfully. Our team is reviewing
          it. You will gain access once approved.
        </p>
      </div>
    </div>
  );
}
