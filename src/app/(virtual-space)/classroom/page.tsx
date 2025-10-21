"use client";
import VirtualSpace from '@/components/canvas/VirtualSpace';

export default function ClassroomPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">教室空間（MVP）</h2>
      <p className="text-sm text-gray-600">WASD/矢印キーで仮想空間内のプレースホルダーを移動（今後拡張）。</p>
      <div className="border rounded">
        <VirtualSpace />
      </div>
    </div>
  );
}
