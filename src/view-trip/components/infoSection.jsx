import { Button } from '@/components/ui/button';
import React, { useEffect, useState } from 'react';
import { IoIosSend } from 'react-icons/io';

/**
 * Displays key trip info with a dynamic location image
 * @param {object} props.trip - The full trip data object from Firestore.
 */
function InfoSection({ trip }) {
  const [imgSrc, setImgSrc] = useState('/placeholder.jpg');

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const locationName = trip?.userSelection?.location?.name;
        if (!locationName) return;

        const apiKey = import.meta.env.VITE_PEXELS_API_KEY;
        const res = await fetch(
          `https://api.pexels.com/v1/search?query=${encodeURIComponent(locationName)}&per_page=1`,
          {
            headers: { Authorization: apiKey },
          }
        );

        const data = await res.json();
        if (data.photos && data.photos.length > 0) {
          setImgSrc(data.photos[0].src.landscape || data.photos[0].src.medium);
        } else {
          setImgSrc('/placeholder.jpg');
        }
      } catch (err) {
        console.error('Error fetching image:', err);
        setImgSrc('/placeholder.jpg');
      }
    };

    fetchImage();
  }, [trip?.userSelection?.location?.name]);

  return (
    <div>
      {/* Dynamic location image */}
      <img
        src={imgSrc}
        alt={trip?.userSelection?.location?.name || 'Destination Image'}
        className="h-[300px] w-full object-cover rounded-xl"
        onError={() => setImgSrc('/placeholder.jpg')}
      />

      <div className="flex justify-between items-center">
        <div className="my-5 flex flex-col gap-2">
          <h2 className="font-bold text-2xl">
            {trip?.userSelection?.location?.name}
          </h2>

          <div className="flex flex-wrap gap-3">
            <h2 className="p-1 px-3 bg-gray-200 rounded-full text-gray-500 text-xs md:text-md">
              🗓️ {trip.userSelection?.days} Day
            </h2>
            <h2 className="p-1 px-3 bg-gray-200 rounded-full text-gray-500 text-xs md:text-md">
              🍷 No. of travelers: {trip.userSelection?.traveler?.people}
            </h2>
            <h2 className="p-1 px-3 bg-gray-200 rounded-full text-gray-500 text-xs md:text-md">
              💰 {trip.userSelection?.budget?.title} Budget
            </h2>
          </div>
        </div>

        <Button>
          <IoIosSend />
        </Button>
      </div>
    </div>
  );
}

export default InfoSection;
