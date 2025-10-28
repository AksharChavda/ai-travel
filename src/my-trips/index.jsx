import React from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/service/firebaseConfig'
import UserTripCard from './components/UserTripCard'

function MyTrips() {
  const navigate = useNavigate()
  const [trips, setTrips] = React.useState([])

  React.useEffect(() => {
    GetUserTrips()
  }, [])

  const GetUserTrips = async () => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (!user) {
      navigate('/')
      return
    }
    setTrips([])

    const q = query(collection(db, "trips"), where("userEmail", "==", user.email))
    const querySnapshot = await getDocs(q)
    const allTrips = []
    querySnapshot.forEach((doc) => {
      allTrips.push({ id: doc.id, ...doc.data() })
    })
    setTrips(allTrips)
  }

  return (
    <div className="sm:px-10 md:px-32 lg:px-56 xl:px-10 px-5 mt-10">
      <h2 className="font-bold text-3xl">My Trips</h2>

      {trips.length === 0 ? (
        <p className="text-gray-500 mt-10">You haven’t planned any trips yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-10">
          {trips.map((trip, index) => (
            <UserTripCard key={trip.id || index} trip={trip} />
          ))}
        </div>
      )}
    </div>
  )
}

export default MyTrips
