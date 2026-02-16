import { useRef, useState } from "react";

const PanZoom = ({ children }) => {
  const containerRef = useRef(null);

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const scaleRef = useRef(1);

// useEffect(() => {
//   const el = containerRef.current;
//   if (!el) return;

//   el.addEventListener("wheel", handleWheel, { passive: false });

//   return () => {
//     el.removeEventListener("wheel", handleWheel);
//   };
// }, []);






  const handleWheel = (e) => {
  if (e.ctrlKey) {
    e.preventDefault(); // stop browser zoom
  }

  const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
  scaleRef.current = Math.min(
    Math.max(scaleRef.current * zoomFactor, 0.5),
    5
  );
  setScale(scaleRef.current);
};


 
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };


  const handleMouseMove = (e) => {
    if (!isDragging) return;

    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };


  const handleMouseUp = () => setIsDragging(false);


  const reset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden relative cursor-grab select-none no-browser-zoom"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}

      style={{touchAction:"none"}}
    >
      
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

      
      <div
        className="w-full h-full flex justify-center items-center"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transition: isDragging ? "none" : "transform 0.15s ease-out",
          touchAction:"none",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PanZoom;
