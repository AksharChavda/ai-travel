import React, { useEffect, useState, useCallback } from "react";
import { Button } from "../ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import axios from "axios";

function Header() {
  const [user, setUser] = useState(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        console.log("User loaded:", parsedUser);
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
      }
    }
  }, []);

  // --- GOOGLE LOGIN LOGIC ---
  const fetchProfile = useCallback(async (tokenResponse) => {
    try {
      const res = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
          Authorization: `Bearer ${tokenResponse.access_token}`,
          Accept: "application/json",
        },
      });

      console.log("User Data:", res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
      setUser(res.data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      alert("Login failed. Could not retrieve user profile.");
    }
  }, []);

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      console.log("Login Success:", tokenResponse);
      fetchProfile(tokenResponse);
    },
    onError: (errorResponse) => {
      console.error("Login Failed:", errorResponse);
      alert("Google login failed. Please try again.");
    },
  });

  // --- LOGOUT LOGIC ---
  const handleLogout = () => {
    googleLogout();
    localStorage.clear();
    setUser(null);
  };

  // --- RENDER ---
  return (
    <div className="p-3 h-20 shadow-sm flex justify-between items-center px-5">
      <img src="/logo.svg" className="w-52 h-auto" alt="Logo" />
      
      <div>
        {user ? (
          <div className="flex items-center gap-3">
           <a href="/my-trips"> <Button variant="outline">My Trips</Button></a>

            <Popover>
              <PopoverTrigger>
                <img
                  src={user.picture}
                  alt={user.name || "User"}
                  className="h-[35px] w-[35px] rounded-full object-cover cursor-pointer"
                />
              </PopoverTrigger>
              <PopoverContent className="w-48">
                <div className="flex flex-col items-center gap-2 text-center">
                  <img
                    src={user.picture}
                    alt={user.name || "User"}
                    className="h-[40px] w-[40px] rounded-full object-cover"
                  />
                  <p className="font-semibold text-sm">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>

                  <Button
                    variant="destructive"
                    className="mt-2 w-full"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        ) : (
          <Button onClick={() => login()}>Sign In</Button>
        )}
      </div>
    </div>
  );
}

export default Header;
