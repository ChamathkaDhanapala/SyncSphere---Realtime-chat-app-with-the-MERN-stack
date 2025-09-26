import { useState, useEffect } from "react";

export default function Avatar({ url, size = 10, online = false, user }) {
  const [imageError, setImageError] = useState(false);

  const getAbsoluteUrl = (url) => {
    if (!url) return null;

    let avatarUrl = url || user?.avatarUrl;
    if (!avatarUrl) return null;

    if (!avatarUrl.startsWith("http")) {
      avatarUrl = `http://localhost:5000${
        avatarUrl.startsWith("/") ? "" : "/"
      }${avatarUrl}`;
    }

    return avatarUrl;
  };

  const absoluteUrl = getAbsoluteUrl(url);

  useEffect(() => {
    setImageError(false);
  }, [url, user?.avatarUrl]);

  const avatarSize = size * 4;

  return (
    <div className="relative inline-block">
      {absoluteUrl && !imageError ? (
        <img
          src={absoluteUrl}
          alt={user?.username || "User avatar"}
          className="rounded-full object-cover"
          style={{ width: avatarSize, height: avatarSize }}
          onError={(e) => {
            console.error("Image failed to load:", absoluteUrl);
            setImageError(true);
            e.target.src = `https://api.dicebear.com/9.x/initials/svg?seed=${
              user?.username || "User"
            }`;
          }}
        />
      ) : (
        <div
          className="rounded-full flex items-center justify-center text-white font-bold"
          style={{
            width: avatarSize,
            height: avatarSize,
            backgroundColor: "#4b5563",
            fontSize: avatarSize * 0.4,
          }}
        >
          {user?.username?.charAt(0)?.toUpperCase() || "U"}
        </div>
      )}
      {online && (
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
      )}
    </div>
  );
}
