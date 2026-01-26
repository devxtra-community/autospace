import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, Phone, ChevronDown, ChevronUp } from "lucide-react";

interface Company {
  id: number;
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  businessLocation: string;
  createdAt: string;
}

interface CompanyCardProps {
  company: Company;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onReject: (id: number) => void;
  onApprove: (id: number) => void;
  formatDate: (date: string) => string;
}

export const CompanyCard = ({
  company,
  isExpanded,
  onToggleExpand,
  onReject,
  onApprove,
  formatDate,
}: CompanyCardProps) => {
  return (
    <Card className="border-border shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden rounded-2xl">
      <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 text-secondary font-bold text-lg">
            {company.companyName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">
              {company.companyName}
            </h3>
            <div className="flex items-center text-sm text-muted-foreground mt-1 gap-3">
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" /> {company.contactEmail}
              </span>
              <span className="hidden md:inline text-border">|</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {company.businessLocation}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => onToggleExpand(`c-${company.id}`)}
          >
            {isExpanded ? "Hide Details" : "View Details"}
            {isExpanded ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : (
              <ChevronDown className="ml-2 h-4 w-4" />
            )}
          </Button>
          <Button
            className="bg-card border-destructive/10 text-destructive hover:bg-destructive/10 hover:border-destructive/20 shadow-sm border"
            onClick={() => onReject(company.id)}
          >
            Reject
          </Button>
          <Button
            className="bg-primary text-secondary-foreground hover:bg-primary/90 shadow-sm font-medium"
            onClick={() => onApprove(company.id)}
          >
            Approve
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="px-6 pb-6 pt-0 animate-in slide-in-from-top-2">
          <div className="bg-muted rounded-xl p-4 border border-border grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Contact Phone</p>
              <p className="font-medium text-foreground flex items-center gap-2">
                <Phone className="h-3 w-3" /> {company.contactPhone}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Registration Date</p>
              <p className="font-medium text-foreground">
                {formatDate(company.createdAt)}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-muted-foreground mb-1">
                Full Location Address
              </p>
              <p className="font-medium text-foreground">
                {company.businessLocation}
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
