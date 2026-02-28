"use client";

import { ReservationData } from "@/lib/constants";
import { MapPin, Calendar, Home } from "lucide-react";

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getNights(arrival: string, departure: string) {
  const a = new Date(arrival);
  const d = new Date(departure);
  return Math.round((d.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export default function ReservationHeader({
  reservation,
}: {
  reservation: ReservationData;
}) {
  const nights = getNights(reservation.arrivalDate, reservation.departureDate);

  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">
            Upcoming Trip
          </p>
          <h2 className="text-2xl font-bold mt-1">{reservation.memberName}</h2>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>{reservation.destination}</span>
          </div>
          <div className="flex items-center gap-2">
            <Home className="w-4 h-4 text-amber-400" />
            <span>{reservation.villa}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>
              {formatDate(reservation.arrivalDate)} –{" "}
              {formatDate(reservation.departureDate)}
            </span>
          </div>
          <div className="bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full text-xs font-semibold">
            {nights} nights
          </div>
        </div>
      </div>
    </div>
  );
}
