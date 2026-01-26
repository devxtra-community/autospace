import { ValetCard, ValetStatus } from "./ValetCard";

const valets: {
  name: string;
  shift: string;
  status: ValetStatus;
}[] = [
  { name: "John Mathew", shift: "9 AM - 5 PM", status: "on-duty" },
  { name: "Sarah Lee", shift: "10 AM - 6 PM", status: "on-break" },
  { name: "Alex Roy", shift: "8 AM - 4 PM", status: "off-duty" },
  { name: "Kevin Park", shift: "12 PM - 8 PM", status: "on-duty" },
  { name: "Nina Brown", shift: "7 AM - 3 PM", status: "off-duty" },
];

export function ValetsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {valets.map((valet, i) => (
        <ValetCard key={i} {...valet} />
      ))}
    </div>
  );
}
