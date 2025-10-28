import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { doc, getDoc } from "firebase/firestore";

import { db } from '../../service/firebaseConfig.jsx';
import InfoSection from '../components/infoSection.jsx';
import Hotels from '../components/hotels.jsx';
import PlacesToVisit from '../components/placeToVisit.jsx';
import Footer from '../components/footer.jsx';


function viewTrip() {

  const [tripData, setTripData] = useState([]);

  const {tripId} = useParams();

  useEffect(() => {
    tripId && getTripData(tripId);
  }, [tripId])
  

  const getTripData = async (tripId) => {

    const docRef = doc(db, "trips", tripId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setTripData(docSnap.data());
      console.log(docSnap.data())
    } else {
      console.log("No such document!");
    }

  }
  return (
    <div className='p-10 md:px-20 lg:px-44 xl:px-56'>
      {/* info section */}
      
      <InfoSection trip={tripData}/>
      {/* recommend hotel */}
      <Hotels trip={tripData}/>
      

      {/* daily plan */}
      <PlacesToVisit trip={tripData}/>
      

      {/* footer  */}
      <Footer trip={tripData}/>

      
    </div>
  )
}

export default viewTrip