import { Badge } from "@/components/ui/badge";

const bookings = [
  {
    id: "BK-101",
    garage: "East Coast",
    date: "18-12-25",
    status: "Completed",
  },
];

export function BookingsTable() {
  return (
    <div className="bg-card rounded-xl border shadow-sm overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-secondary text-black">
          <tr>
            <th className="p-4 text-left">Sl.No</th>
            <th className="p-4 text-left">Booking ID</th>
            <th className="p-4 text-left">Garage</th>
            <th className="p-4 text-left">Date</th>
            <th className="p-4 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b, idx) => (
            <tr key={b.id} className="border-b hover:bg-muted transition">
              <td className="p-4">{idx + 1}</td>
              <td className="p-4 font-medium">{b.id}</td>
              <td className="p-4">{b.garage}</td>
              <td className="p-4">{b.date}</td>
              <td className="p-4">
                <Badge className="bg-green-500 text-black">{b.status}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
