// Remove the dynamic key or use a stable identifier
export default function Avatar({ url, size=10, online=false }) {
  return (
    <div className="relative inline-block">
      <img 
        src={url || `https://api.dicebear.com/9.x/initials/svg?seed=?`} 
        alt="User avatar"   
        className="rounded-full object-cover" 
        style={{ width: size*4, height: size*4 }} 
        onError={(e) => {
          console.error("Image failed to load:", url);
          e.target.src = `https://api.dicebear.com/9.x/initials/svg?seed=?`;
        }}
      />
      {/* ... */}
    </div>
  );
}