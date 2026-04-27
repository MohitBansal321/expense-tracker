import React, { useState } from "react";
import Cookies from "js-cookie";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Trash2, Edit2, FolderOpen } from "lucide-react";
import CategoryForm from "../components/CategoryForm.jsx";
import { setUser } from "@/store/auth.js";
import { deleteCategory } from "../../../services/category.service";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";

export default function Category() {
  const token = Cookies.get("token");
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  const [editCategory, setEditCategory] = useState({});
  const [open, setOpen] = useState(false);

  function handleOpen(category = {}) {
    setEditCategory(category);
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
    setEditCategory({});
  }

  async function remove(id) {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      await deleteCategory(id);
      const _user = {
        ...user,
        categories: (user?.categories || []).filter((cat) => cat._id !== id),
      };
      dispatch(setUser({ user: _user }));
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4 relative min-h-[80vh]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Manage Categories
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Customize your expense categories with icons.
        </p>
      </div>

      {(user?.categories || []).length === 0 ? (
        <div className="bg-white dark:bg-gray-900 p-12 text-center rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
          <div className="flex justify-center mb-4 text-gray-400 dark:text-gray-600">
            <FolderOpen className="w-20 h-20" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            No categories yet
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
            Categories help you organize and track your spending. Create your first one to get started!
          </p>
          <Button onClick={() => handleOpen()} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 py-6 h-auto text-base">
            <Plus className="mr-2 w-5 h-5" />
            Add Your First Category
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 pb-24">
          {(user?.categories || []).map((row) => (
            <div
              key={row._id}
              className="group relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 text-center transition-all duration-300 hover:border-primary dark:hover:border-primary hover:shadow-xl hover:-translate-y-1"
            >
              <div className="text-5xl mb-3">{row.icon}</div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                {row.label}
              </h3>

              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-1 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => handleOpen(row)}
                  className="p-1.5 text-primary hover:bg-primary/10 rounded-md transition-colors"
                  title="Edit Category"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => remove(row._id)}
                  className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
                  title="Delete Category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => handleOpen()}
        className="fixed bottom-20 md:bottom-8 right-6 md:right-8 bg-primary hover:bg-primary/90 text-primary-foreground p-4 rounded-full shadow-lg hover:shadow-primary/30 transition-all hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary/20 z-40"
        aria-label="Add new category"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Modal Dialog for Category Form */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editCategory._id ? "Edit Category" : "New Category"}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[80vh] overflow-y-auto">
            <CategoryForm editCategory={editCategory} onClose={handleClose} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
