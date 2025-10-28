import React from 'react'
import { Button } from '../ui/button'
import { Link } from 'react-router-dom'

function Hero() {
  return (
    <div className='flex flex-col items-center mx-56 gap-9'>
      <h1 className='font-extrabold text-[50px] text-center mt-8'>
        <span className='text-[#f56551]'>Discover Your Next Adventure with AI:</span><br />Personalized Itinerary Planning at Your Fingertips!
        <p className='text-xl text-gray-500 text-center'>Your personal trip planner and travel curator, creating custom itineraries tailored to your interest and budget.</p>
      </h1>
      <Link to={'/create-trip'}>
      <Button>Get Started!!!</Button>
      </Link>

      <img src="/landing_image.png" alt="" />
    </div>
  )
}

export default Hero