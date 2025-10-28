import React from "react";
import PlaceCardItem from "./PlaceCardItem";

function PlacesToVisit({ trip }) {
  const itinerary = trip?.tripData?.itinerary || [];

  return (
    <div className="mt-5">
      <h2 className="font-bold text-2xl mb-4">Places to Visit</h2>

      {itinerary.map((day, index) => (
        <div key={index} className="mb-8">
          <h3 className="font-semibold text-xl mb-2">Day {day.day}: {day.theme}</h3>

          {day.plan?.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {day.plan.map((place, idx) => (
                <PlaceCardItem key={idx} place={place} />
              ))}
            </div>
          ) : (
            <p>No places found for this day.</p>
          )}
        </div>
      ))}
    </div>
  );
}

export default PlacesToVisit;
