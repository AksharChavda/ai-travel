import React, { useEffect, useState } from "react";

function Hotels({ trip }) {
  const hotelList = trip?.tripData?.HotelOptions || [];
  const [images, setImages] = useState({});

  useEffect(() => {
    const fetchImages = async () => {
      const apiKey = import.meta.env.VITE_PEXELS_API_KEY;
      const promises = hotelList.map(async (hotel) => {
        const query = encodeURIComponent(hotel.HotelName || "hotel");
        try {
          const res = await fetch(
            `https://api.pexels.com/v1/search?query=${query}&per_page=1`,
            { headers: { Authorization: apiKey } }
          );
          const data = await res.json();
          if (data.photos && data.photos.length > 0) {
            return { [hotel.HotelName]: data.photos[0].src.medium };
          }
        } catch (err) {
          console.error("Error fetching image for", hotel.HotelName, err);
        }
        return { [hotel.HotelName]: "https://via.placeholder.com/400x300?text=No+Image" };
      });

      const results = await Promise.all(promises);
      const merged = Object.assign({}, ...results);
      setImages(merged);
    };

    if (hotelList.length > 0) fetchImages();
  }, [hotelList]);

  return (
    <div>
      <h2 className="font-bold text-xl mt-5">Recommended Hotels</h2>

      {hotelList.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 mt-5">
          {hotelList.map((hotel, i) => {
            const img =
              images[hotel.HotelName] ||
              hotel.ImageURL ||
              "https://via.placeholder.com/400x300?text=Loading...";

            const mapQuery = encodeURIComponent(
              `${hotel.HotelName} ${hotel.Address || ""}`
            );
            const mapLink = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

            return (
              <a
                key={i}
                href={mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl overflow-hidden bg-white shadow-sm border hover:shadow-md transition-transform hover:scale-[1.01]"
              >
                <div className="h-44 w-full bg-gray-100 overflow-hidden">
                  <img
                    src={img}
                    alt={hotel.HotelName || "Hotel Image"}
                    loading="lazy"
                    onError={(e) =>
                      (e.currentTarget.src =
                        "https://via.placeholder.com/400x300?text=Image+Not+Found")
                    }
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-3">
                  <h3 className="font-medium">{hotel.HotelName}</h3>
                  <p className="text-xs text-gray-500 mt-1">📍 {hotel.Address}</p>
                  <div className="flex items-center justify-between mt-2 text-sm">
                    <span>⭐ {hotel.Rating}</span>
                    <span className="text-gray-600">{hotel.PriceRange}</span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      ) : (
        <p>No hotels found.</p>
      )}
    </div>
  );
}

export default Hotels;
