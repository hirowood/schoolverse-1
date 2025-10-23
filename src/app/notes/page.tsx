"use client";
import AuthGuard from '@/components/auth/AuthGuard';
import NotebookWorkspace from '@/components/features/notes/NotebookWorkspace';

export default function NotesPage() {
  return (
    <AuthGuard>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">デジタルノート</h1>
          <p className="text-sm text-gray-500">
            fabric.js を用いたキャンバスでノートを作成・編集し、保存できます。
          </p>
        </div>
        <NotebookWorkspace />
      </div>
    </AuthGuard>
  );
}
