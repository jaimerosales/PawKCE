import { useState, useEffect } from "react";

function App() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const justLoggedIn = params.get("auth") === "success";

    if (justLoggedIn) {
      console.log("Just logged in! Fetching profile...");
      fetchProfile();

      // Clean up URL
      const newUrl = window.location.origin;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  // Starts the PKCE login flow via backend
  const handleLogin = () => {
    window.location.href = "http://localhost:3001/login";
  };

  // Fetches the profile from your backend's stored token
  const fetchProfile = async () => {
    const res = await fetch("http://localhost:3001/profile");
    if (res.ok) {
      const data = await res.json();
      setProfile(data);
    } else {
      alert("You must log in first!");
    }
  };

  // Logs out (clears state + hits backend)
  const handleLogout = () => {
    setProfile(null);
    window.location.href = "http://localhost:3001/logout";
  };

  return (
    <div
      className="min-h-screen w-full bg-center bg-cover bg-no-repeat flex items-center justify-center px-4"
      style={{
        backgroundImage: "url('/pawkce-bg.png')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <div className="bg-white/90 p-8 md:p-10 rounded-2xl shadow-xl w-full max-w-lg text-center space-y-6">
        {/* Logo with tagline inside card */}
        <img
          src="/pawkce-logo-tagline.png"
          alt="PawKCE Logo"
          className="mx-auto drop-shadow"
        />

        {/* Description */}
        <p className="text-sm text-gray-700 max-w-sm mx-auto leading-relaxed">
          This React app uses a backend PKCE Auth0 flow so you can log in, fetch
          your profile, and log out. It’s simple, secure, and dog friendly.
        </p>

        {/* Login / Profile actions */}
        {!profile ? (
          <button
            onClick={handleLogin}
            className="bg-[var(--auth0-orange)] hover:bg-[var(--auth0-blue)] text-white px-6 py-2 rounded font-medium shadow"
          >
            Login
          </button>
        ) : (
          <>
            <div className="text-center space-y-2">
              {profile.picture && (
                <img
                  src={profile.picture}
                  alt={`${profile.name}'s profile`}
                  className="w-20 h-20 rounded-full mx-auto shadow"
                />
              )}
              <p className="text-lg font-semibold">👋 Hello, {profile.name}</p>
              <p className="text-sm text-gray-500">{profile.email}</p>
            </div>

            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={fetchProfile}
                className="bg-[var(--auth0-blue)] hover:bg-blue-700 text-white px-5 py-2 rounded-md font-medium shadow"
              >
                Refresh Profile
              </button>
              <button
                onClick={handleLogout}
                className="bg-[var(--auth0-orange)] hover:bg-orange-600 text-white px-5 py-2 rounded-md font-medium shadow"
              >
                Logout
              </button>
            </div>
          </>
        )}

        {/* Tagline outside the card */}
        <p className="text-xs text-gray-500 mt-4">
          🐶 This demo was paw-reviewed by Ozzy.
        </p>
      </div>
    </div>
  );
}

export default App;
