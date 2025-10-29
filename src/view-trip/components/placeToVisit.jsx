import React from "react";
import PlaceCardItem from "./placeCardItem.jsx";

function PlacesToVisit({ trip }) {
  const itinerary = trip?.tripData?.Itinerary || {};

  const days = Object.keys(itinerary); 

  return (
    <div className="mt-5">
      <h2 className="font-bold text-2xl mb-4">Places to Visit</h2>

      {days.length > 0 ? (
        days.map((dayKey, index) => {
          const dayData = itinerary[dayKey];
          const plan = dayData?.Plan || [];

          return (
            <div key={index} className="mb-8">
              <h3 className="font-semibold text-xl mb-2">
                {dayKey.replace("Day", "Day ")}: {dayData?.Theme || "No Theme"}
              </h3>

              {plan.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {plan.map((place, idx) => (
                    <PlaceCardItem key={idx} place={place} />
                  ))}
                </div>
              ) : (
                <p>No places found for this day.</p>
              )}
            </div>
          );
        })
      ) : (
        <p>No itinerary data found.</p>
      )}
    </div>
  );
}

export default PlacesToVisit;
