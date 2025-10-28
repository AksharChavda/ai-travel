import { Button } from "@/components/ui/button";
import React, { useState, useEffect } from "react";
import { FaMapLocationDot } from "react-icons/fa6";

function PlaceCardItem({ place }) {
  const [imgSrc, setImgSrc] = useState("/placeholder.jpg");

  useEffect(() => {
    const fetchImage = async () => {
      try {
        if (place.PlaceImageURL) {
          setImgSrc(place.PlaceImageURL);
          return;
        }

        const query = place.placeName || "travel";
        const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`, {
          headers: {
            Authorization: import.meta.env.VITE_PEXELS_API_KEY,
          },
        });

        const data = await res.json();
        if (data.photos && data.photos.length > 0) {
          setImgSrc(data.photos[0].src.medium);
        } else {
          setImgSrc("/placeholder.jpg");
        }
      } catch (err) {
        console.error("Image fetch error:", err);
        setImgSrc("/placeholder.jpg");
      }
    };

    fetchImage();
  }, [place.placeName, place.PlaceImageURL]);

  const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${place.placeName} ${place.geo_coordinates?.latitude || ""},${place.geo_coordinates?.longitude || ""}`
  )}`;

  return (
    <a
      href={mapLink}
      target="_blank"
      rel="noopener noreferrer"
      className="flex gap-4 p-4 mt-3 rounded-2xl shadow-sm border transition-all bg-white hover:shadow-lg hover:scale-[1.02] duration-200"
    >
      <div className="relative h-[130px] w-[130px] shrink-0 overflow-hidden rounded-xl bg-gray-100">
        <img
          src={imgSrc}
          alt={place.placeName || "Place Image"}
          className="h-[130px] w-[130px] object-cover rounded-xl shrink-0"
          onError={() => setImgSrc("/placeholder.jpg")}
        />
      </div>

      <div className="flex flex-col justify-between w-full">
        <div>
          <h2 className="font-semibold text-lg">{place.placeName}</h2>

          {place.timeTravel && (
            <p className="text-sm text-blue-600 mt-1 font-medium">
              🕒 {place.timeTravel}
            </p>
          )}

          <p className="text-sm text-gray-600 mt-1 line-clamp-3">
            💬 {place.placeDetails}
          </p>
        </div>

        <div className="flex justify-between items-center mt-2 text-sm">
          <div>
            <span className="font-medium">⭐ {place.rating}</span>
            {place.ticketPricing && (
              <span className="ml-3 text-gray-500">
                🎟️ {place.ticketPricing}
              </span>
            )}
          </div>

          <Button size="sm" className="flex items-center gap-1 text-sm">
            <FaMapLocationDot className="text-lg" />
            View Map
          </Button>
        </div>
      </div>
    </a>
  );
}

export default PlaceCardItem;
