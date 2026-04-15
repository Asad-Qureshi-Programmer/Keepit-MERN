import { CgSpinner } from "react-icons/cg";

export const SpinningRay = ({ size = 40, color = "text-blue-500" }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <CgSpinner 
        size={size} 
        className={`animate-spin ${color}`} 
      />
      {/* <span className="text-white text-sm font-light tracking-wide animate-pulse">
        Processing...
      </span> */}
    </div>
  );
};