import { bookingStatusLabel, type BookingStatus } from "@/types/booking";
import { cn } from "@/lib/utils";

const styles: Record<BookingStatus, string> = {
  PENDING: "bg-[#f3e6cf] text-[#7a5a1e]",
  CONFIRMED: "bg-[#dfe9df] text-[#3f6b4a]",
  CANCELLED: "bg-[#f1dcd7] text-[#8a3b2e]",
  COMPLETED: "bg-surface-dark text-primary-dark",
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.08em]", styles[status])}>
      {bookingStatusLabel[status]}
    </span>
  );
}
