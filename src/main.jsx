import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter } from 'react-router-dom'
import { RouterProvider } from 'react-router'
import Header from './components/custom/header'
import CreateTrips from './create-trips/index.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'
import ViewTrip from './view-trip/[tripId]/index.jsx'
import MyTrips from './my-trips'

const router = createBrowserRouter([{
  path: '/',
  element: <App />,
},
{
  path: '/create-trip',
  element: <CreateTrips />,
},
{
  path: '/view-trip/:tripId',
  element: <ViewTrip />,
},
{
  path: '/my-trips',
  element: <MyTrips />,
}

])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID}>
    <Header />
    <RouterProvider router={router}/>
    </GoogleOAuthProvider>
  </StrictMode>,
)
