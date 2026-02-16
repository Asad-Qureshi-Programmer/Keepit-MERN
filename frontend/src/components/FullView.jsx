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
      <div
        className="fixed z-20 top-0 left-0 right-0 bottom-0 w-full h-full
       flex flex-col justify-center align-middle items-center "

       
      >
        <div className="absolute top-0 left-0 right-0 bottom-0 w-full h-full bg-black opacity-80 backdrop-blur-2xl "></div>

        <div className="absolute top-5 w-full  text-white flex justify-between px-16 z-60 align-middle">
          <h2 className="text-xl font-medium ">{fileName+"."+filePath.split('.').pop()}</h2>
          <button
            onClick={() =>
              setShowFullView((prev) => ({ ...prev, [filepath]: false }))
            }
            className="px-3 py-1  hover:bg-gray-600 rounded-full"
          >
            <RxCross2 size={30} />
          </button>
        </div>

        <button
          onClick={() => setButtonClicked({ right: true, left: false })}
          className="fixed top-[45%] flex items-center justify-center w-20 h-20  right-10 text-white text-lg  rounded-full  hover:bg-gray-600 z-50 hover:scale-110 transition-transform duration-110 active:scale-105"
        >
          <IoIosArrowForward size={50}/>
        </button>
        <button
          onClick={() => setButtonClicked({ right: false, left: true })}
          className="fixed top-[45%] flex items-center justify-center left-10 text-white w-20 h-20 text-lg rounded-full  hover:bg-gray-600 z-50 hover:scale-110 transition-transform duration-110 active:scale-105 "
        >
          <IoIosArrowForward size={50} className="rotate-180"/>
        </button>

        <div className=" text-white w-[90%] h-[90%]  p-10 pt-0 flex flex-col z-20 justify-center align-middle items-center "
        
        >
          {
            /\.(png|jpg|jpeg|avif|webp)$/i.test(filePath) ? (
              <PanZoom>

                <img
                src={filePath}
                alt=""
                className="w-[60%] h-[70%] object-contain pointer-events-none no-browser-zoom"
                draggable={false}
              />
              </PanZoom>
            ) : /\.(pdf)$/i.test(filePath) ? (
              <iframe
                src={filePath}
                frameborder="0"
                title="Pdf"
                height="90%"
                width="70%"
              />
            ) : /\.(xlsx|docx|pptx|doc|ppt|xls)$/i.test(filePath) ? (
              <div className="overflow-auto ">
                <iframe
                  src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                    filePath
                  )}&mode=Edit`}
                  height="600px"
                  width="1000px"
                ></iframe>
              </div>
            ) : /\.(mp4|webm)$/i.test(filePath) ? (
              <video controls src={filePath} width="100%" />
            ) : /\.(mp3|wav)$/i.test(filePath) ? (
              <audio controls src={filePath} width="200%" />
            ) : /\.(txt)$/i.test(filePath) ? (
              <PanZoom><pre className="bg-white text-black p-5" >{data}</pre></PanZoom>
            ) : /\.(csv)$/i.test(filePath) ? (
              <PanZoom>
              <div className="bg-white text-black p-5" >

               { csvTable()}
              </div> 
              </PanZoom>
            ) : /\.(json)$/i.test(filePath) ? (
              <PanZoom>
              <div className="bg-white text-black p-5 flex items-center max-h-[90%] overflow-auto ">

                {jsonTable()}
              </div>
              </PanZoom>
            ) : <div onClick={(e)=>{stopOpening(e)}} className="w-full h-full flex flex-col justify-center font-semibold text-gray-600 ">
                <div className="text-center text-white text-3xl">Can't Open? Download instead</div>
                <a className="h-[80%] flex items-center justify-center"  href={filepath}  ><IoIosCloudDownload size="70%" color="white" onMouseOver={({target})=>target.style.color="blue"}
                onMouseOut={({target})=>target.style.color="white"} /></a>
              </div>

            /*
                else if (/\.(mp4|webm)$/i.test(filepath)) {
    return <video controls src={filepath} width="400" />;
  } else if (/\.(mp3|wav)$/i.test(filepath)) {
    return <audio controls src={filepath} />;
  } else if (/\.(txt)$/i.test(filepath)) {
    return <pre>{data}</pre>;
  }
  else if (/\.(csv)$/i.test(filepath)){
    return csvTable()
  }
  else if (/\.(json)$/i.test(filepath)){
    return jsonTable()
  }
                */
          }
        </div>

          {/* <div className="fixed top-[90%] text-white text-2xl flex gap-3 z-50" >

        <button
        onClick={() => setZoom((z)=>Math.min(z+0.5,MAX_ZOOM))}
        className=" bg-blue-800 p-5 rounded-full"
        >
          +
        </button>

        <button
        onClick={() => setZoom((z)=>Math.max(z-0.5,MIN_ZOOM))}
        className=" bg-blue-800 px-3 py-3 rounded-full"
        >
          -
        </button>

          </div> */}

      </div>
    </>
  );
};

export default FullView