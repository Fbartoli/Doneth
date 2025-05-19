export default function FullPageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
      <div className="relative h-16 w-16">
        <span className="absolute inset-0 rounded-full border-4 border-green-500 opacity-25" />
        <span className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-green-500" />
      </div>
    </div>
  );
} 