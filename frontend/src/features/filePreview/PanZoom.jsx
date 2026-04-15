import { useRef, useState } from "react";

const PanZoom = ({ children }) => {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Refs for tracking pinch distance
  const lastTouchDistance = useRef(0);

  // --- MOBILE TOUCH LOGIC ---
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      // Single finger drag
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    } else if (e.touches.length === 2) {
      // Two finger pinch start
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      lastTouchDistance.current = distance;
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1 && isDragging) {
      // Dragging logic
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    } else if (e.touches.length === 2) {
      // Pinch to zoom logic
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );

      const delta = distance - lastTouchDistance.current;
      const zoomFactor = delta > 0 ? 1.05 : 0.95; // Speed of zoom

      setScale((s) => Math.min(Math.max(s * zoomFactor, 0.5), 4));
      lastTouchDistance.current = distance;
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    lastTouchDistance.current = 0;
  };

  // --- DESKTOP LOGIC (Keep your existing) ---
  const handleWheel = (e) => {
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setScale((s) => Math.min(Math.max(s * zoomFactor, 0.5), 4));
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  
const reset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden relative cursor-grab select-none"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
      // Add these touch handlers:
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: "none" }} 
    >
      {/* Zoom Buttons Header... (Keep your existing) */}
      
      <div
        className="w-full h-full flex justify-center items-center"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transition: isDragging ? "none" : "transform 0.15s ease-out",
        }}
      >
        {children}
        
      </div>
      <div className="absolute bottom-4 left-[48%] z-60 flex gap-2">
        <button
          onClick={() => setScale((s) => Math.min(s + 0.2, 4))}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          +
        </button>
        <button
          onClick={() => setScale((s) => Math.max(s - 0.2, 0.5))}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          −
        </button>
        <button
          onClick={reset}
          className="px-3 py-1 bg-gray-700 text-white rounded"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default PanZoom;






