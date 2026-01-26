import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, ChevronDown, ChevronUp } from "lucide-react";

interface Garage {
  id: string;
  name: string;
  locationName: string;
  capacity: number;
  createdAt: string;
}

interface GarageCardProps {
  garage: Garage;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onReject: (id: string) => void;
  onApprove: (id: string) => void;
  formatDate: (date: string) => string;
}

export const GarageCard = ({
  garage,
  isExpanded,
  onToggleExpand,
  onReject,
  onApprove,
  formatDate,
}: GarageCardProps) => {
  return (
    <Card className="border-border shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden rounded-2xl">
      <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 text-orange-600 font-bold text-lg">
            {garage.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">{garage.name}</h3>
            <div className="flex items-center text-sm text-muted-foreground mt-1 gap-3">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {garage.locationName}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => onToggleExpand(`g-${garage.id}`)}
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
            onClick={() => onReject(garage.id)}
          >
            Reject
          </Button>
          <Button
            className="bg-primary text-secondary-foreground hover:bg-primary/90 shadow-sm font-medium"
            onClick={() => onApprove(garage.id)}
          >
            Approve
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="px-6 pb-6 pt-0 animate-in slide-in-from-top-2">
          <div className="bg-muted rounded-xl p-4 border border-border grid md:grid-cols-2 gap-4 text-sm">
            <div className="md:col-span-2">
              <p className="text-muted-foreground mb-1">capacity</p>
              <p className="font-medium text-foreground">
                {garage.capacity || "No description provided."}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Request Date</p>
              <p className="font-medium text-foreground">
                {formatDate(garage.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Location Details</p>
              <p className="font-medium text-foreground">
                {garage.locationName}
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
