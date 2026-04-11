import { useState, useEffect } from "react";
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";
import PanZoom from "../features/filePreview/PanZoom";

import { IoIosCloudDownload } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { IoIosArrowForward } from "react-icons/io";

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 4;

const FullView = ({ files, filepath, filename, setShowFullView }) => {
  const [buttonClicked, setButtonClicked] = useState({
    right: false,
    left: false,
  });

  const [currentFileIndex, setCurrentFileIndex] = useState(
    files.findIndex((file) => file.path === filepath)
  );
  const [fileName, setFileName] = useState("");
  const [filePath, setFilePath] = useState("");
  const [data, setData] = useState("");
  
  const [zoom, setZoom] = useState(1);

  console.log("Current file index: ", currentFileIndex);




  useEffect(() => {
    if (buttonClicked.right === true) {
      setCurrentFileIndex((prev) => (prev + 1) % files.length);
    } else if (buttonClicked.left === true) {
      setCurrentFileIndex((prev) => (prev - 1 + files.length) % files.length);
    } else {
      null;
    }
  }, [buttonClicked]) +
    useEffect(() => {
      let file_name = files[currentFileIndex]?.originalname;
      let file_path = files[currentFileIndex]?.path;
      console.log("File name: ", file_name);
      console.log("File path: ", file_path);

      setFileName(file_name);
      setFilePath(file_path);
    }, [currentFileIndex]);

  // text, csv, json

  useEffect(() => {
    if (/\.(txt|csv|json)/i.test(filePath)) {
      fetch(filePath)
        .then((res) => res.text())
        .then((data) => setData(data));
    }
  }, [filePath]);

  const jsonTable = () => {
    try {
      if (!data || !data.trim()) {
        return <p className="text-white">Empty JSON file</p>;
      }
      const json = JSON.parse(data);

      if (Array.isArray(json[Object.keys(json)[0]])) {
        const arraykeys = Object.keys(json);

        return (
          <div className="flex flex-col items-center gap-10 ">
            {arraykeys.map((key, i) => (
              <table key={i} className="w-5 h-5 border border-white">
                <thead>
                  <tr>
                    {Object.keys(json[key][0]).map((key, i) => (
                      <th className="p-2 border" key={i}>
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {json[key].map((obj, i) => (
                    <tr key={i}>
                      {Object.values(obj).map((value, i) => (
                        <td className="p-10 border" key={i}>
                          {typeof value === "object"
                            ? JSON.stringify(value)
                            : value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ))}
          </div>
        );
      } else {
        const keys = Object.keys(json);
        const values = Object.values(json);

        return (
          <table className="w-5 h-5 border border-white">
            <thead>
              <tr>
                {keys.map((key, i) => (
                  <th className="p-2 border" key={i}>
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {values.map((value, i) => (
                  <td className="p-10 border" key={i}>
                    {typeof value === "object" ? JSON.stringify(value) : value}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        );
      }
    } catch (error) {
      console.log("Text file error: ", error);
    }
  };

  const csvTable = () => {
    if (!data || !data.trim()) {
      return <p className="text-white">Empty CSV file</p>;
    }

    const rows = data.split("\n").filter((row) => row.trim() !== "");
    console.log("Rows : ", rows);

    const heading = rows[0].split(",");
    // console.log('Row  are : ',rows)
    return (
      <table >
        <thead>
          <tr>
            {heading.map((key, i) => (
              <th key={i} className="p-2 border ">
                {key}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.slice(1).map((row, i) => (
            <tr key={i}>
              {row.split(",").map((value, i) => (
                <td className="p-10 border " key={i}>
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

 return (
    <>
      <div className="fixed z-[100] top-0 left-0 right-0 bottom-0 w-full h-full flex flex-col bg-black/95 backdrop-blur-xl">
        
        {/* --- 1. HEADER AREA (Filename + Close) --- */}
        <div className="w-full h-20 flex justify-between items-center px-6 md:px-16 z-[70] bg-black/40">
          <h2 className="text-white text-lg md:text-xl font-medium truncate max-w-[70%]">
            {fileName + "." + filePath.split('.').pop()}
          </h2>
          <button
            onClick={() => setShowFullView((prev) => ({ ...prev, [filepath]: false }))}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
          >
            <RxCross2 size={32} />
          </button>
        </div>

        {/* --- 2. NAVIGATION BUTTONS (Z-index adjusted) --- */}
        <button
          onClick={() => setButtonClicked({ right: true, left: false })}
          className="fixed top-1/2 -translate-y-1/2 right-4 md:right-10 text-white p-3 rounded-full hover:bg-white/10 z-[80] transition-all"
        >
          <IoIosArrowForward size={45}/>
        </button>
        <button
          onClick={() => setButtonClicked({ right: false, left: true })}
          className="fixed top-1/2 -translate-y-1/2 left-4 md:left-10 text-white p-3 rounded-full hover:bg-white/10 z-[80] transition-all"
        >
          <IoIosArrowForward size={45} className="rotate-180"/>
        </button>

        {/* --- 3. MAIN CONTENT STAGE (With Padding) --- */}
        <div className="flex-1 w-full flex items-center justify-center p-6 md:p-12 lg:p-20 overflow-hidden z-20">
          <div className="w-full h-full flex items-center justify-center">
            {
              /\.(png|jpg|jpeg|avif|webp)$/i.test(filePath) ? (
                <PanZoom>
                  <img
                    src={filePath}
                    alt={fileName}
                    className="max-w-full max-h-full object-contain pointer-events-none no-browser-zoom shadow-2xl"
                    draggable={false}
                  />
                </PanZoom>
              ) : /\.(pdf)$/i.test(filePath) ? (
                <iframe
                  src={filePath}
                  frameBorder="0"
                  title="Pdf"
                  className="w-full h-full max-w-4xl bg-white rounded-lg shadow-2xl"
                />
              ) : /\.(xlsx|docx|pptx|doc|ppt|xls)$/i.test(filePath) ? (
                <div className="w-full h-full max-w-5xl overflow-hidden rounded-lg shadow-2xl bg-white">
                  <iframe
                    src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(filePath)}&mode=Edit`}
                    className="w-full h-full"
                  />
                </div>
              ) : /\.(mp4|webm)$/i.test(filePath) ? (
                <video controls src={filePath} className="max-w-full max-h-full rounded-lg" />
              ) : /\.(mp3|wav)$/i.test(filePath) ? (
                <div className="bg-white/10 p-10 rounded-2xl backdrop-blur-md">
                   <audio controls src={filePath} className="w-64 md:w-96" />
                </div>
              ) : /\.(txt|csv|json)$/i.test(filePath) ? (
                <PanZoom>
                  <div className="bg-white text-black p-6 md:p-10 rounded-lg shadow-2xl max-h-[80vh] overflow-auto">
                    {/\.(txt)$/i.test(filePath) && <pre>{data}</pre>}
                    {/\.(csv)$/i.test(filePath) && csvTable()}
                    {/\.(json)$/i.test(filePath) && jsonTable()}
                  </div>
                </PanZoom>
              ) : (
                <div className="flex flex-col items-center gap-6">
                  <div className="text-center text-white text-2xl md:text-3xl font-light">
                    Preview not available for this format
                  </div>
                  <a 
                    href={filePath} 
                    className="p-6 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white"
                  >
                    <IoIosCloudDownload size={80} />
                  </a>
                </div>
              )
            }
          </div>
        </div>
      </div>
    </>
  );
};

export default FullView