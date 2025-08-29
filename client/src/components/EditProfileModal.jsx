import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function EditProfileModal({ open, onClose }) {
  const { user, updateProfile } = useAuth();
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [file, setFile] = useState(null);
  if (!open) return null;

  const onSave = async () => {
    const fd = new FormData();
    fd.append("username", username);
    fd.append("bio", bio);
    if (file) fd.append("avatar", file);
    await updateProfile(fd);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 grid place-items-center p-4">
      <div className="card w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
        <div className="space-y-3">
          <input value={username} onChange={e=>setUsername(e.target.value)} className="w-full p-3 rounded-xl" placeholder="Display name" />
          <textarea value={bio} onChange={e=>setBio(e.target.value)} rows="3" className="w-full p-3 rounded-xl" placeholder="Bio"></textarea>
          <input type="file" accept="image/*" onChange={e=>setFile(e.target.files[0])} />
          <div className="flex gap-2 justify-end pt-2">
            <button onClick={onClose} className="px-4 py-2 rounded-xl border border-slate-700">Cancel</button>
            <button onClick={onSave} className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}
