import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AI_PROMPT, SelectBudgetOptions, SelectTravelesList } from "@/constants/options";
import React, { useState, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    // DialogTrigger is removed as we control the dialog with state
} from "@/components/ui/dialog"
import { FcGoogle } from "react-icons/fc";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios"; // ✅ Added axios import
import { doc, setDoc } from "firebase/firestore"; // ✅ Added Firebase imports
import { db } from "@/service/firebaseConfig"; // ✅ Added Firebase db import
import { useNavigate } from "react-router-dom";

// NOTE: Ensure your backend server is running on http://localhost:3001
// And your 'db' object in firebaseConfig is correctly initialized.


function CreateTrips() {
    // --- FORM STATE ---
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [selectedPlace, setSelectedPlace] = useState(null); 
    const [days, setDays] = useState(''); 
    const [selectedBudget, setSelectedBudget] = useState(null); 
    const [selectedTraveler, setSelectedTraveler] = useState(null); 

    const [openDialog, setOpenDialog] = useState(false);

    // --- AI INTERACTION STATE ---
    // chatSession and streamedContent state are not currently used/needed for this logic, but kept for future use
    const [streamedContent, setStreamedContent] = useState(''); 
    const [isLoading, setIsLoading] = useState(false); 
    const navigate = useNavigate();


    // --- LOCATION SEARCH LOGIC ---
    const handleSearch = async (e) => {
        const value = e.target.value;
        setQuery(value);

        if (value.length > 2) {
            try {
                // Assuming proxy setup for Nominatim
                const response = await fetch(`/api/nominatim/search?format=json&q=${value}`); 
                if (!response.ok) {
                    console.error(`API request failed with status: ${response.status}`);
                    setResults([]);
                    return;
                }
                const data = await response.json();
                setResults(data);
            } catch (error) {
                console.error("Error fetching location data:", error);
                setResults([]);
            }
        } else {
            setResults([]);
        }
    };

    const handleSelect = (place) => {
        setQuery(place.display_name);
        setResults([]);
        const locationData = {
            name: place.display_name,
            lat: place.lat,
            lon: place.lon,
            place_id: place.place_id,
        };
        setSelectedPlace(locationData); 
    };

    // --- FORM VALIDATION ---
    const isFormValid = selectedPlace && days > 0 && selectedBudget && selectedTraveler;

    // --- FIREBASE SAVE LOGIC (Corrected) ---
    const saveAitripToFirebase = async (tripData, finalPrompt) => { // ✅ Added finalPrompt
        setIsLoading(true);

        // ✅ 1. Correctly construct the userSelectionsObject (Serializable data)
        const userSelectionsObject = {
            location: selectedPlace,
            days: days,
            budget: selectedBudget,
            traveler: selectedTraveler,
            prompt: finalPrompt,
        };
        
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user) {
                throw new Error("User not logged in or localStorage item missing.");
            }

            const docId = Date.now().toString();
            
            await setDoc(doc(db, "trips", docId),{
                userSelection: userSelectionsObject, // ✅ Correct
                tripData: JSON.parse(tripData),      // NOTE: Assuming tripData is a JSON string, parse it before saving if possible. If not, remove JSON.parse()
                userEmail: user.email,
                id: docId,
                createdAt: new Date(),
            }); 
            navigate('/view-trip/' + docId );
            
            console.log("Trip data saved to Firebase with ID:", docId);
        } catch (error) {
            console.error("Error saving to Firebase:", error);
            // Optionally update streamedContent to inform user of the save error
            setStreamedContent(prev => prev + `\n\n[Firebase Save Error: ${error.message}]`);
        } finally {
            setIsLoading(false);
           
        }
        
    };


    // --- AI GENERATION LOGIC ---
    const onGenerateTrip = useCallback(async () => {

        const user = localStorage.getItem('user');

        if (!user) {
            setOpenDialog(true);
            return;
        }

        if (!isFormValid || isLoading) return;

        setIsLoading(true);
        setStreamedContent('');
        
        // 1. Construct the FINAL PROMPT
        let finalPrompt = AI_PROMPT; 
        finalPrompt = finalPrompt.replace('{location}', selectedPlace.name);
        finalPrompt = finalPrompt.replace(/{days}/g, days);
        finalPrompt = finalPrompt.replace('{traveler}', selectedTraveler.title);
        finalPrompt = finalPrompt.replace('{budget}', selectedBudget.title);

        console.log("FINAL_PROMPT:", finalPrompt); 
        
        // 2. Fetch from the secure backend endpoint
        try {
            const response = await fetch('https://ai-travel-jkwl.onrender.com/api/generate-trip', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ finalPrompt }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            const tripDataString = data.tripPlan.trim();

            // The server returns the raw JSON text from Gemini
            setStreamedContent(tripDataString);

            // 3. Save to Firebase (Now passing the finalPrompt)
            await saveAitripToFirebase(tripDataString, finalPrompt); 

        } catch (error) {
            console.error("Error generating trip plan:", error);
            setStreamedContent(`Error: Could not process trip plan. Ensure your backend server is running on port 3001. Details: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [isFormValid, isLoading, selectedPlace, days, selectedTraveler, selectedBudget, saveAitripToFirebase]); // Added saveAitripToFirebase to dependency array


    // --- GOOGLE AUTH LOGIC (Corrected) ---
    const fetchProfileAndGenerate = useCallback(async (tokenResponse) => {
        try {
            // Use the token to get user info
            const res = await axios.get(
                `https://www.googleapis.com/oauth2/v3/userinfo`,
                {
                    headers: {
                        Authorization: `Bearer ${tokenResponse.access_token}`,
                        Accept: 'application/json'
                    }
                }
            );
            
            console.log("User Data:", res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
            
            // Close the dialog and proceed to trip generation
            setOpenDialog(false);
            onGenerateTrip(); 
            
        } catch (error) {
            console.error("Error fetching user profile:", error);
            // Optionally alert the user
            alert("Login failed. Could not retrieve user profile.");
        }
    }, [onGenerateTrip]); // Depends on onGenerateTrip

    const login = useGoogleLogin({
        onSuccess: (tokenResponse) => {
            console.log("Login Success:", tokenResponse);
            fetchProfileAndGenerate(tokenResponse); 
        },
        onError: errorResponse => console.error("Login Failed:", errorResponse)
    });


    // --- RENDER ---
    return (
        <div className="sm:px-10 md:px-32 lg:px-56 xl:px-10 px-5 mt-10">
            {/* 🛑 DOM Nesting Fix 1: Removed outer <p> */}
            <h2 className="font-bold text-3xl">Tell us your travel preference</h2>
            <div className="mt-3 text-gray-500 text-xl">
                Just provide some basic information, and our trip planner will generate
                a customized itinerary based on your preferences.
            </div>

            <div className="mt-10 flex flex-col gap-3">
                
                {/* 1. Destination */}
                <div>
                    <h2 className="text-xl my-3 font-medium">
                        What is your destination of choice?
                    </h2>
                    <input
                        type="text"
                        value={query}
                        onChange={handleSearch}
                        placeholder="Search destination..."
                        className="w-full border border-gray-400 p-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />

                    {/* 📍 Autocomplete Dropdown */}
                    {results.length > 0 && (
                        <ul className="border border-gray-300 rounded-lg mt-2 overflow-y-auto bg-white shadow-lg absolute z-10 w-[80%] md:w-[60%]">
                            {results.map((place) => (
                                <li
                                    key={place.place_id}
                                    onClick={() => handleSelect(place)}
                                    className="p-3 cursor-pointer hover:bg-gray-100 text-black"
                                >
                                    {place.display_name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* 2. Number of Days */}
                <div>
                    <h2 className="mt-10 text-xl my-3 font-medium ">
                        How many days will your trip be?
                    </h2>
                    <Input
                        placeholder={'Ex. 3'}
                        type="number" 
                        min="1"
                        value={days}
                        onChange={(e) => setDays(e.target.value)}
                        className="gap-3 h-12"
                    />
                </div>

                {/* 3. Traveler Type Selection (No DOM issues here) */}
                <div>
                    <h2 className="text-xl my-3 font-medium mt-10">Who do you plan to travel with?</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-5">
                        {SelectTravelesList.map((item) => (
                            <div 
                                key={item.id} 
                                onClick={() => setSelectedTraveler(item)}
                                className={`p-4 border rounded-lg hover:shadow-lg cursor-pointer transition-all ${selectedTraveler?.id === item.id ? 'shadow-xl border-cyan-500 bg-cyan-50' : 'border-gray-200'}`}
                            >
                                <h2 className="text-4xl ">{item.icon}</h2>
                                <h2 className="font-bold text-lg">{item.title}</h2>
                                <h2 className="text-sm text-gray-500">{item.desc}</h2>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* 4. Budget Selection (No DOM issues here) */}
                <div>
                    <h2 className="text-xl my-3 font-medium mt-10">What is your budget?</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
                        {SelectBudgetOptions.map((item) => (
                            <div 
                                key={item.id} 
                                onClick={() => setSelectedBudget(item)}
                                className={`p-4 border rounded-lg hover:shadow-lg cursor-pointer transition-all ${selectedBudget?.id === item.id ? 'shadow-xl border-cyan-500 bg-cyan-50' : 'border-gray-200'}`}
                            >
                                <h2 className="text-4xl ">{item.icon}</h2>
                                <h2 className="font-bold text-lg">{item.title}</h2>
                                <h2 className="text-sm text-gray-500">{item.desc}</h2>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* 5. Generate Button */}
                <div className="my-10 flex justify-end">
                    <Button 
                        disabled={!isFormValid || isLoading} 
                        className={`p-3 rounded-lg text-white font-medium ${isFormValid && !isLoading ? 'bg-cyan-500 hover:bg-cyan-600' : 'bg-gray-400 cursor-not-allowed'}`}
                        onClick={onGenerateTrip}
                    >
                        {isLoading ? 'Generating...' : 'Generate Trip'}
                    </Button>
                </div>

                {/* 6. Google Login Dialog (DOM Fixes applied inside DialogDescription) */}
                <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Sign In Required</DialogTitle>
                            <DialogDescription asChild> {/* Use asChild to fix nesting warning */}
                                <div> 
                                    <img src="/logo.svg" alt="" />
                                    <h2 className="text-lg font-bold mt-7">Sign in with Google</h2>
                                    <p>You need to be logged in to generate a trip plan.</p>
                                    <Button 
                                        className="w-full mt-5 flex gap-4 items-center"
                                        onClick={() => login()}
                                    >
                                        <FcGoogle className="h-7 w-7"/>
                                        Sign in with Google
                                    </Button>
                                </div>
                            </DialogDescription>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>
                
               
            </div>
        </div>
    );
}

export default CreateTrips;