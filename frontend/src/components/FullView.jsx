import { useState, useEffect } from "react";
import PanZoom from "../features/filePreview/PanZoom";
import { IoIosCloudDownload, IoIosArrowForward } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { CgSpinner } from "react-icons/cg";

const FullView = ({ files, filepath, filename, setShowFullView }) => {
  const [currentFileIndex, setCurrentFileIndex] = useState(
    files.findIndex((file) => file.path === filepath)
  );
  const [fileName, setFileName] = useState("");
  const [filePath, setFilePath] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRendered, setIsRendered] = useState(false);

  // 1. Initial mounting animation
  useEffect(() => {
    const timer = setTimeout(() => setIsRendered(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // 2. Update local file data whenever the index changes
  useEffect(() => {
    const currentFile = files[currentFileIndex];
    if (currentFile) {
      setIsLoading(true);
      setFileName(currentFile.originalname);
      setFilePath(currentFile.path);
    }
  }, [currentFileIndex, files]);

  // Navigation handlers (Function-based instead of Effect-based)
  const handleNext = () => {
    setCurrentFileIndex((prev) => (prev + 1) % files.length);
  };

  const handlePrev = () => {
    setCurrentFileIndex((prev) => (prev - 1 + files.length) % files.length);
  };

  const handleClose = () => {
    setIsRendered(false);
    setTimeout(() => {
      // Use the specific original filepath passed in props to close
      setShowFullView((prev) => ({ ...prev, [filepath]: false }));
    }, 300);
  };

  return (
    <div 
      className={`fixed inset-0 z-[100] w-full h-full flex flex-col bg-black transition-all duration-300 ease-in-out ${
        isRendered ? "opacity-100 scale-100" : "opacity-0 scale-95"
      }`}
      style={{ touchAction: "none" }}
    >
      {/* 1. HEADER */}
      <div className="relative w-full h-16 flex justify-between items-center px-4 md:px-16 z-[120] bg-black/60 shadow-xl">
        <h2 className="text-white text-base md:text-lg font-medium truncate max-w-[60%]">
          {fileName}{filePath ? `.${filePath.split('.').pop()}` : ""}
        </h2>
        <button onClick={handleClose} className="p-2 text-white hover:bg-white/20 rounded-full transition-colors">
          <RxCross2 size={28} />
        </button>
      </div>

      {/* 2. NAVIGATION ARROWS */}
      <div className="absolute inset-0 z-[110] pointer-events-none flex items-center justify-between px-2 md:px-10">
        <button
          onClick={handlePrev}
          className="pointer-events-auto p-4 text-white/50 hover:text-white transition-colors"
        >
          <IoIosArrowForward size={45} className="rotate-180" />
        </button>
        <button
          onClick={handleNext}
          className="pointer-events-auto p-4 text-white/50 hover:text-white transition-colors"
        >
          <IoIosArrowForward size={45} />
        </button>
      </div>

      {/* 3. MAIN CONTENT STAGE */}
      <div className="flex-1 w-full flex items-center justify-center p-4 md:p-12 overflow-hidden z-[100]">
        {isLoading && (
          <div className="absolute inset-0 z-[130] flex items-center justify-center bg-black/40">
            <CgSpinner size={50} className="text-white animate-spin" />
          </div>
        )}

        <div className="w-full h-full flex items-center justify-center" key={filePath}>
          {
            /\.(png|jpg|jpeg|avif|webp)$/i.test(filePath) ? (
              <PanZoom>
                <img
                  src={filePath}
                  alt={fileName}
                  className={`max-w-full max-h-full object-contain pointer-events-none shadow-2xl transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                  draggable={false}
                  onLoad={() => setIsLoading(false)}
                />
              </PanZoom>
            ) : /\.(pdf)$/i.test(filePath) ? (
              <iframe
    // Use Google Docs viewer to proxy the PDF for mobile compatibility
    src={`https://docs.google.com/viewer?url=${encodeURIComponent(filePath)}&embedded=true`}
    frameBorder="0"
    title="Pdf"
    className="w-full h-full max-w-4xl bg-white rounded-lg shadow-2xl"
    onLoad={() => setIsLoading(false)}
  />
            ) : /\.(xlsx|docx|pptx|doc|ppt|xls)$/i.test(filePath) ? (
              <div className="w-full h-full max-w-5xl overflow-hidden rounded-lg shadow-2xl bg-white">
                <iframe
                  src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(filePath)}&mode=Edit`}
                  className="w-full h-full"
                  onLoad={() => setIsLoading(false)}
                />
              </div>
            ) : /\.(mp4|webm)$/i.test(filePath) ? (
              <video controls src={filePath} className="max-w-full max-h-full rounded-lg" onCanPlay={() => setIsLoading(false)} />
            ) : /\.(mp3|wav|m4a)$/i.test(filePath) ? (
              <div className="bg-white/10 p-10 rounded-2xl backdrop-blur-md">
                 <audio controls src={filePath} className="w-64 md:w-96" onCanPlay={() => setIsLoading(false)} />
              </div>
            ) : /\.(txt|csv|json)$/i.test(filePath) ? (
              <PanZoom>
                <div className="bg-white text-black p-6 md:p-10 rounded-lg shadow-2xl max-h-[80vh] overflow-auto">
                  {/\.(txt)$/i.test(filePath) && <pre className="whitespace-pre-wrap">{data}</pre>}
                  {/\.(csv)$/i.test(filePath) && csvTable()}
                  {/\.(json)$/i.test(filePath) && jsonTable()}
                </div>
              </PanZoom>
            ) : (
              <div ref={()=>setIsLoading(false)} className="flex flex-col items-center gap-6">
                <div className="text-center text-white text-2xl md:text-3xl font-light">Preview not available</div>
                <a href={filePath} className="p-6 bg-white/10 hover:bg-white/20 rounded-full text-white">
                  <IoIosCloudDownload size={80} />
                </a>
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
};

export default FullView;