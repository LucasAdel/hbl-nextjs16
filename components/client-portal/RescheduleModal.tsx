"use client";

import { useState } from "react";
import { X, Calendar, Clock, AlertTriangle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, addDays, isBefore, isWeekend } from "date-fns";

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    id: string;
    client_name: string;
    client_email: string;
    event_type_name: string;
    start_time: string;
  };
  email: string;
  onSuccess: () => void;
}

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30",
];

export function RescheduleModal({ isOpen, onClose, booking, email, onSuccess }: RescheduleModalProps) {
  const [action, setAction] = useState<"reschedule" | "cancel">("reschedule");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/client-portal/reschedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          email,
          action,
          newDate: action === "reschedule" ? selectedDate : undefined,
          newTime: action === "reschedule" ? selectedTime : undefined,
          reason: action === "cancel" ? reason : undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.error || "Failed to process request");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Generate available dates (next 30 days, excluding weekends)
  const availableDates = Array.from({ length: 30 }, (_, i) => addDays(new Date(), i + 1))
    .filter((date) => !isWeekend(date) && !isBefore(date, new Date()));

  const minDate = format(addDays(new Date(), 1), "yyyy-MM-dd");

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">Manage Booking</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Booking Info */}
              <div className="p-6 bg-gray-50 border-b">
                <p className="font-medium text-gray-900">{booking.event_type_name}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {format(new Date(booking.start_time), "EEEE, MMMM d, yyyy")} at{" "}
                  {format(new Date(booking.start_time), "h:mm a")}
                </p>
              </div>

              {/* Action Tabs */}
              <div className="flex border-b">
                <button
                  onClick={() => setAction("reschedule")}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    action === "reschedule"
                      ? "text-tiffany border-b-2 border-tiffany"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Reschedule
                </button>
                <button
                  onClick={() => setAction("cancel")}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    action === "cancel"
                      ? "text-red-600 border-b-2 border-red-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Cancel Booking
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {action === "reschedule" ? (
                  <>
                    {/* Date Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="h-4 w-4 inline mr-2" />
                        New Date
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={minDate}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-tiffany focus:border-transparent"
                      />
                    </div>

                    {/* Time Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Clock className="h-4 w-4 inline mr-2" />
                        New Time
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {timeSlots.map((time) => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setSelectedTime(time)}
                            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                              selectedTime === time
                                ? "bg-tiffany text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Cancellation Warning */}
                    <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl">
                      <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-800">Are you sure?</p>
                        <p className="text-sm text-red-700 mt-1">
                          This action cannot be undone. You may need to book a new appointment.
                        </p>
                      </div>
                    </div>

                    {/* Cancellation Reason */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason for cancellation (optional)
                      </label>
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={3}
                        placeholder="Let us know why you're cancelling..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-tiffany focus:border-transparent resize-none"
                      />
                    </div>
                  </>
                )}

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || (action === "reschedule" && (!selectedDate || !selectedTime))}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    action === "cancel"
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-tiffany text-white hover:bg-tiffany-dark"
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : action === "cancel" ? (
                    "Cancel Booking"
                  ) : (
                    "Confirm Reschedule"
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
