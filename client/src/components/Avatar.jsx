import { useEffect } from 'react';

export default function Avatar({ url, size = 10, online = false, user }) {
  useEffect(() => {
    if (user?.username) {
      console.log("User avatar for:", user.username);
    }
  }, [user?.username]); 

  return (
    <div className="relative inline-block">
      <img 
        src={url || `https://api.dicebear.com/9.x/initials/svg?seed=?`} 
        alt="User avatar"   
        className="rounded-full object-cover" 
        style={{ width: size * 4, height: size * 4 }} 
        onError={(e) => {
          console.error("Image failed to load:", url);
          e.target.src = `https://api.dicebear.com/9.x/initials/svg?seed=?`;
        }}
      />
      {online && (
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
      )}
    </div>
  );
}