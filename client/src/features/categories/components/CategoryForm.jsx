// Import necessary modules and components from React
import Cookies from "js-cookie";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@/store/auth.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Initial form state
const InitialForm = {
  label: "",
  icon: "💰",
};

// Curated list of finance-related emojis
const icons = [
  "💰", "💳", "🏦", "💵", "🧾", // Money & Banking
  "🍔", "☕", "🍕", "🛒", "🛍️", // Food & Shopping
  "🚗", "🚌", "✈️", "⛽", "🔧", // Transport
  "🏠", "💡", "💧", "📱", "🌐", // Home & Bills
  "🎮", "🎬", "🎵", "📚", "🏋️‍♂️", // Entertainment & Health
  "🩺", "💊", "🎓", "👶", "🎁", // Health & Family
  "💼", "📈", "🛡️", "🐾", "✂️", // Work & Misc
];

// React component for managing category creation and update
export default function CategoryForm({ editCategory, onClose }) {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const token = Cookies.get("token");
  const [form, setForm] = useState(InitialForm);

  useEffect(() => {
    if (editCategory?._id) {
      setForm(editCategory);
    } else {
      setForm(InitialForm);
    }
  }, [editCategory]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleIconClick(icon) {
    setForm({ ...form, icon });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.label) return toast.warning("Label is required");

    // Check if a category with the same label or icon already exists
    const categoryExists = user?.categories?.some(
      (c) => (c.label === form.label || c.icon === form.icon) && c._id !== editCategory?._id
    );
    if (categoryExists) {
      return toast.warning("Category already exists");
    }

    editCategory?._id ? update() : create();
  }

  function reload(res, _user) {
    if (res.ok) {
      dispatch(setUser({ user: _user }));
      setForm(InitialForm);
      if (onClose) onClose();
    }
  }

  async function create() {
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/category`, {
      method: "POST",
      body: JSON.stringify(form),
      headers: { "content-type": "application/json", Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      reload(res, { ...user, categories: [...(user?.categories || []), data.category] });
    }
  }

  async function update() {
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/category/${editCategory._id}`, {
      method: "PATCH",
      body: JSON.stringify(form),
      headers: { "content-type": "application/json", Authorization: `Bearer ${token}` },
    });
    const _user = {
      ...user,
      categories: (user?.categories || []).map((cat) => cat._id === editCategory._id ? form : cat),
    };
    reload(res, _user);
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Category Name
        </label>
        <Input
          placeholder="e.g. Groceries"
          name="label"
          value={form.label}
          onChange={handleChange}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Select Icon
        </label>
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 max-h-[200px] overflow-y-auto bg-gray-50 dark:bg-gray-900/50">
          <div className="flex flex-wrap gap-2">
            {icons.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => handleIconClick(icon)}
                className={`w-10 h-10 flex items-center justify-center text-2xl cursor-pointer rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${form.icon === icon 
                    ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 shadow-sm" 
                    : "bg-transparent hover:bg-gray-200 dark:hover:bg-gray-800"
                  }`}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
        {onClose && (
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        )}
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
          {editCategory?._id ? "Update Category" : "Add Category"}
        </Button>
      </div>
    </form>
  );
}
