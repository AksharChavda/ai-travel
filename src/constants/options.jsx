export const SelectTravelesList=[
    {
        id:1,
        title:'Just Me',
        desc:'A sole traveles in exploration',
        icon:'🧘',
        people:'1'
    },
    {
        id:2,
        title:'A Couple',
        desc:'Two traveles in tandem',
        icon:'🧑‍🤝‍🧑',
        people:'2 People'
    },
    {
        id:3,
        title:'Family',
        desc:'A group of fun loving adv',
        icon:'🏡',
        people:'3 to 5 People'
    },
    {
        id:4,
        title:'Friends',
        desc:'A bunch of thrill-seekes',
        icon:'⚠️',
        people:'5 to 10 People'
    },
]

export const SelectBudgetOptions=[
    {
        id:1,
        title:'Cheap',
        desc:'Stay conscious of costs',
        icon:'💰',
    },
    {
        id:2,
        title:'Moderate',
        desc:'Keep cost on the average side',
        icon:'💲',
    },
    {
        id:3,
        title:'Luxury',
        desc:'Dont worry about cost',
        icon:'👑',
    },
]

export const AI_PROMPT = "Generate a detailed and unique Travel Plan for Location : {location}, for {days} Days for {traveler} with a {budget} budget. Give me a Hotels options list with HotelName, Hotel address, PriceRange, hotel image url, geo coordinates (latitude and longitude), rating (1-5), and descriptions. Then suggest a detailed itinerary with placeName, Place Details, Place Image url, Geo Coordinates (latitude and longitude), ticket Pricing, rating (1-5), and Time travel (estimated duration to visit each spot) for 3 days with each day having a plan and best time to visit in JSON format." 