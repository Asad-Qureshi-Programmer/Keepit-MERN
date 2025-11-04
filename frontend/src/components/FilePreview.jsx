import { useState, useEffect } from "react";

const FilePreview = ({ filepath }) => {
  const [data, setData] = useState("");

  useEffect(() => {
    if (/\.(txt|csv|json)/i.test(filepath)) {
      fetch(filepath)
        .then((res) => res.text())
        .then((data) => setData(data));
    }
  }, [filepath]);

    const openPDF = (link) => {
    window.open(`${link}`, "_blank");
  };

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
      <table>
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

  if (
    filepath.endsWith("jpg") ||
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
        <h2
          className="cursor-pointer bg-blue-400"
          onClick={() => openPDF(filepath)}
        >
          {" "}
          open{" "}
        </h2>
        <div>
          <iframe
            src={filepath}
            // width="400px"
            height="400px"
            title="PDF Viewer"
          />
        </div>
      </>
    );
  } else if (/\.(xlsx|docx|pptx)$/i.test(filepath)) {
    return (
      <div>
        <iframe
          src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
            filepath
          )}`}
          height="400px"
        ></iframe>
      </div>
    );
  } else if (/\.(mp4|webm)$/i.test(filepath)) {
    return <video controls src={filepath} width="400" />;
  } else if (/\.(mp3|wav)$/i.test(filepath)) {
    return <audio controls src={filepath} />;
  } else if (/\.(txt)$/i.test(filepath)) {
    return <pre>{data}</pre>;
  } else if (/\.(csv)$/i.test(filepath)) {
    // return csvTable()
    return null;
  } else if (/\.(json)$/i.test(filepath)) {
    return jsonTable();
  }

  return <p>{filepath}</p>;
};

export default FilePreview