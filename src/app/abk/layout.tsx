export default function abkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="w-full py-8 pt-1">{children}</div>
    </div>
  );
}
