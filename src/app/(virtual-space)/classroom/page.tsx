"use client";
import VirtualSpace from '@/components/canvas/VirtualSpace';
import AuthGuard from '@/components/auth/AuthGuard';

export default function ClassroomPage() {
  return (
    <AuthGuard>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">教室空間（MVP）</h2>
        <p className="text-sm text-gray-600">
          WASD/矢印キーで仮想空間内を移動できます。
        </p>
        <div className="border rounded">
          <VirtualSpace />
        </div>
      </div>
    </AuthGuard>
  );
}
