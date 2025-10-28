import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function UserTripCard({ trip }) {
  const [imageUrl, setImageUrl] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const res = await fetch(
          `https://api.pexels.com/v1/search?query=${encodeURIComponent(
            trip?.userSelection?.location?.name || "travel destination"
          )}&per_page=1`,
          {
            headers: {
              Authorization: import.meta.env.VITE_PEXELS_API_KEY,
            },
          }
        );
        const data = await res.json();
        if (data.photos && data.photos.length > 0) {
          setImageUrl(data.photos[0].src.large);
        } else {
          setImageUrl("https://via.placeholder.com/400x300?text=Trip+Image");
        }
      } catch (err) {
        console.error("Error fetching image:", err);
        setImageUrl("https://via.placeholder.com/400x300?text=Trip+Image");
      }
    };

    fetchImage();
  }, [trip]);

  const handleCardClick = () => {
    navigate(`/view-trip/${trip.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative rounded-xl overflow-hidden bg-white shadow-md 
      transition-all duration-300 cursor-pointer hover:shadow-xl hover:-translate-y-1"
    >
      {/* Image section */}
      <div className="overflow-hidden h-52">
        <img
          src={imageUrl}
          alt={trip?.userSelection?.location?.name}
          className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Subtle overlay on hover */}
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Info section */}
      <div className="p-3 relative z-10">
        <h2 className="font-semibold text-lg text-gray-800 group-hover:text-indigo-600 transition-colors duration-300 truncate">
          {trip?.userSelection?.location?.name || "Unknown Location"}
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          {trip?.userSelection?.days} Days trip with{" "}
          {trip?.userSelection?.budget?.title || "Moderate"} Budget
        </p>
      </div>
    </div>
  );
}

export default UserTripCard;
