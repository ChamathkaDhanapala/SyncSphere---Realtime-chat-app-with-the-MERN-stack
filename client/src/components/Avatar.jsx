export default function Avatar({ url, size=10, online=false }) {
  return (
    <div className="relative inline-block">
      <img 
        src={url || `https://api.dicebear.com/9.x/initials/svg?seed=?`} 
        alt="User avatar"   
        className="rounded-full object-cover" 
        style={{ width: size*4, height: size*4 }} 
      />
      <span 
        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${online ? "bg-emerald-400" : "bg-slate-500"}`}
      ></span>
    </div>
  );
}
