"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPost, updatePost } from "@/app/actions/post";

interface PostEditorProps {
  post?: {
    id: string;
    title: string;
    content: string;
    imageUrl: string | null;
  };
}

export default function PostEditor({ post }: PostEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");
  const [imageUrl, setImageUrl] = useState(post?.imageUrl || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", e.target.files[0]);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) setImageUrl(data.url);
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (post) {
        await updatePost(post.id, { title, content, imageUrl });
      } else {
        await createPost({ title, content, imageUrl });
      }
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to save post", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-1 text-slate-300">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 bg-slate-800 rounded border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-slate-300">Cover Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
        />
        {uploading && <p className="text-sm text-indigo-400 mt-2">Uploading...</p>}
        {imageUrl && (
          <img src={imageUrl} alt="Cover Preview" className="mt-4 h-48 w-full object-cover rounded-lg border border-slate-700" />
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-slate-300">Content (Markdown)</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={15}
          className="w-full p-4 bg-slate-800 rounded border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono text-sm"
          required
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded transition-colors"
      >
        {saving ? "Saving..." : "Save Post"}
      </button>
    </form>
  );
}
