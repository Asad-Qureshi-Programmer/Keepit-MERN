import { useState, useEffect, canvas } from "react";
import { FaPlay } from "react-icons/fa";
import { MdAudiotrack } from "react-icons/md";
import { FaFileDownload } from "react-icons/fa";
import { TiDownload } from "react-icons/ti";
import { IoIosCloudDownload } from "react-icons/io";
import {Link} from "react-router-dom"

const FilePreview = ({ filepath }) => {
  const [data, setData] = useState("");
  const [thumb, setThumb] = useState("");


//   useEffect(() => {
//   let mounted = true;

//   generateImageThumbnail(filepath, 1920, 1080)
//     .then((url) => {
//       if (mounted) setThumb(url);
//     });

//   return () => (mounted = false);
// }, [filepath]);

  useEffect(() => {
    if (/\.(txt|csv|json)/i.test(filepath)) {
      fetch(filepath)
        .then((res) => res.text())
        .then((data) => setData(data));
    }
  }, [filepath]);

  //   const openPDF = (link) => {
  //   window.open(`${link}`, "_blank");
  // };

  const handleOpenFile= (link)=>{
    window.open(`${link}`)
  }
  const stopOpening = (e)=>{
    e.stopPropagation()
  }




  const jsonTable = () => {
    try {
      if (!data || !data.trim()) {
        return <p className="text-white">Empty JSON file</p>;
      }
      const json = JSON.parse(data);

      if (Array.isArray(json[Object.keys(json)[0]])) {
        const arraykeys = Object.keys(json);

        return (
          <div className="flex flex-col items-start gap-10 bg-white p-1">
            {arraykeys.map((key, i) => (
              <table key={i} className=" w-3 h-3 border border-white">
                <thead>
                  <tr>
                    {Object.keys(json[key][0]).map((key, i) => (
                      <th className="p-1 border text-sm" key={i}>
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {json[key].map((obj, i) => (
                    <tr key={i}>
                      {Object.values(obj).map((value, i) => (
                        <td className="p-1 border text-sm" key={i}>
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
          <table className="w-3 h-3 border border-white bg-white p-1 text-sm">
            <thead>
              <tr>
                {keys.map((key, i) => (
                  <th className="p-1 border" key={i}>
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {values.map((value, i) => (
                  <td className="p-1 border" key={i}>
                    {typeof value === "object" ? JSON.stringify(value) : value}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        );
      }
    } catch (error) {
      //console.log("Text file error: ", error);
    }
  };

  const csvTable = () => {
    if (!data || !data.trim()) {
      return <p className="text-white">Empty CSV file</p>;
    }

    const rows = data.split("\n").filter((row) => row.trim() !== "");
    //console.log("Rows : ", rows);

    const heading = rows[0].split(",");
    // //console.log('Row  are : ',rows)
    return (
      <table className="text-sm ">
        <thead>
          <tr>
            {heading.map((key, i) => (
              <th key={i} className="p-1 border ">
                {key}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.slice(1).map((row, i) => (
            <tr key={i}>
              {row.split(",").map((value, i) => (
                <td className="p-1 border " key={i}>
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  if (
    filepath.endsWith("jpg") ||
    filepath.endsWith("jpeg") ||
    filepath.endsWith("png") ||
    filepath.endsWith("webp") ||
    filepath.endsWith("avif")
  ) {
    return (
      <>
          <img
          src={filepath}
          alt="image"
          className="w-full h-full object-cover"
        />  
         
      </>
    );
  } else if (filepath.endsWith("pdf")) {
    return (
      <>
        {/* <h2
          className="cursor-pointer bg-blue-400"
          // onClick={() => openPDF(filepath)}
        >
          {" "}
          open{" "}
        </h2> */}
        <div className="h-full w-full" >
          
          <iframe
           
            src={filepath+"#toolbar=0&navpanes=0&scrollbar=0"}
            className="pointer-events-none overflow-hidden scale-125 "
            width="110%"
            height="100%"
            title="PDF Viewer"
          />
        </div>
      </>
    );
  } else if (/\.(pptx|ppt)$/i.test(filepath)) {
    return (
      <div className="h-full">
        <iframe
        className="pointer-events-none overflow-hidden -ml-11 "
          src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
            filepath
          )}`}
          height="120%"
          width="130%"
        />
      </div>
    );
  } else if (/\.(docx|doc)$/i.test(filepath)) {
    return (
      <div className="h-full w-full">
        <iframe
        className="pointer-events-none overflow-hidden -ml-20 -mt-12 "
          src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
            filepath
          )}`}
          height="150%"
          width="150%"
        />
      </div>
    );
  }
  else if (/\.(xlsx|xls)$/i.test(filepath)) {
    return (
      <div className="h-full">
        <iframe
        className="pointer-events-none overflow-hidden -ml-11 "
          src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
            filepath
          )}`}
          height="200%"
          width="120%"
        />
      </div>
    );
  }
  else if (/\.(mp4|webm)$/i.test(filepath)) {
    return <div className="relative w-full">
      <div className=" absolute top-0 bottom-0 right-0 left-0 flex items-center justify-center" >
        <div className=" cursor-pointer text-black text-xl font-semibold p-3 bg-white opacity-70 rounded-full " > <FaPlay/> </div>
      </div>
      <video className="pointer-events-none"  src={filepath} height="100%" ></video>;
    </div>
  } else if (/\.(mp3|wav)$/i.test(filepath)) {
    return <>
    <div className="h-full flex flex-col gap-0 relative items-center justify-end">

      <div className=" absolute top-0 bottom-0 right-0 left-0 bg-gray-800 rounded-full  flex items-center justify-center pb-10">
        <MdAudiotrack color="white" size="70%" />
      </div>

    <audio className=" border-4 border-gray-800 rounded-full" src={filepath} controls></audio>
    </div>
    </> 
  } else if (/\.(txt)$/i.test(filepath)) {
    return <pre className="bg-white p-4" >{data}</pre>;
  } else if (/\.(csv)$/i.test(filepath)) {
    return csvTable()
    // return null;
  } else if (/\.(json)$/i.test(filepath)) {
    return jsonTable();
  }

  return <div onClick={(e)=>{stopOpening(e)}} className="w-full h-full flex flex-col justify-center font-semibold text-gray-600 ">
    <div>Can't Open? Download instead</div>
    <a className="h-[80%] flex items-center justify-center"  href={filepath}  ><IoIosCloudDownload size="70%" onMouseOver={({target})=>target.style.color="blue"}
    onMouseOut={({target})=>target.style.color="gray"} /></a>
  </div>
};

export default FilePreview