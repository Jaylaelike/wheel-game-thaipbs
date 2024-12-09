import { useState, useCallback, useEffect } from "react";

import WheelComponent from "react-wheel-of-prizes";
import { useWindowSize } from "@uidotdev/usehooks";
import Confetti from "react-confetti";
import { Upload, Download } from "lucide-react"; // Add Download icon

import LayoutGridPosts from "./joy-treasury/layout-grid-posts/LayoutGridPosts";

const App = () => {
  const [employees, setEmployees] = useState([]);
  // const [employeesWithEpoch, setEmployeesWithEpoch] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [error, setError] = useState(null);
  const [wheelKey, setWheelKey] = useState(0);
  const [spinResults, setSpinResults] = useState([]);
  // const [currentEpoch, setCurrentEpoch] = useState(0);

  const { width, height } = useWindowSize();

  // Add this new function to export spinResults to CSV
  const exportToCSV = () => {
    if (spinResults.length === 0) return;

    const headers = ["ครั้งที่", "ชื่อพนักงาน", "รหัส"];
    const csvContent = [
      headers.join(","),
      ...spinResults.map((result, index) =>
        [index + 1, result.timestamp, result.employeeId].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "spin_results.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const generateRandomColors = (numColors) => {
    const colors = [];
    for (let i = 0; i < numColors; i++) {
      colors.push(getRandomColor());
    }
    return colors;
  };

  const segColors = generateRandomColors(200);

  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csv = e.target.result;
          const lines = csv.split("\n");
          const parsedEmployees = lines
            .slice(1)
            .map((line) => {
              const [
                timestamp,
                firstname,
                employeeId,
                // department,
                // learningChannel,
              ] = line.split(",").map((item) => item.trim());
              if (!timestamp || !firstname || !employeeId) {
                throw new Error("Invalid CSV format");
              }
              return {
                timestamp,
                firstname,
                employeeId,
                // department,
                // learningChannel: learningChannel || "N/A",
              };
            })
            .filter((employee) => employee.employeeId);

          if (parsedEmployees.length === 0) {
            throw new Error("No valid employees found in CSV");
          }

          // Generate random epochs for each employee
          // const employeesWithRandomEpoch = parsedEmployees.map((employee) => ({
          //   ...employee,
          //   randomEpoch: Math.floor(Math.random() * 10000000000), // Random epoch
          // }));

          setEmployees(parsedEmployees);
          // setEmployeesWithEpoch(employeesWithRandomEpoch);
          setError(null);
          setWheelKey((prevKey) => prevKey + 1);
        } catch (err) {
          setError(err.message);
        }
      };
      reader.readAsText(file);
    }
  }, []);

  const onFinished = (winner) => {
    const selectedEmployee = employees.find((emp) => emp.employeeId === winner);
    setSelectedEmployee(selectedEmployee);
    setSpinResults((prevResults) => [...prevResults, selectedEmployee]);
    // setCurrentEpoch(prevEpoch => prevEpoch + 1);
  };

  useEffect(() => {
    setWheelKey((prevKey) => prevKey + 1);
  }, [employees]);

  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 10000); // 10 seconds

    return () => clearTimeout(timer); // Cleanup the timer on component unmount
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-8">สุ่มกาช่าผู้โชคดี</h1>

      {selectedEmployee && (
        <div className=" text-center">
          <Confetti width={width} height={height} recycle={showConfetti} />
          <h2 className="text-2xl font-semibold mb-4">
            🎉 ผู้โชคดี: {selectedEmployee.employeeId} 🎉
          </h2>
          <p>ชื่อพนักงาน : {selectedEmployee.employeeId}</p>

          <p>รหัส : {selectedEmployee.department}</p>
        </div>
      )}

      <LayoutGridPosts>
        {employees.length > 0 && (
          <div className="grid grid-cols-1 items-center justify-center">
            <WheelComponent
              key={wheelKey}
              segments={employees.map((emp) => emp.employeeId)}
              segColors={segColors.map((color) => color)}
              onFinished={(winner) => onFinished(winner)}
              primaryColor="black"
              contrastColor="white"
              buttonText="หมุน"
              isOnlyOnce={false}
              size={290}
              upDuration={50}
              downDuration={600}
              fontFamily="Arial"
            />
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-4 max-w-2xl">
          <label
            htmlFor="csv-upload"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            อัพโหลดไฟล์ CSV
          </label>
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="csv-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex flex-col items-center justify-center">
                <Upload className="w-8 h-8 mb-2 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  คลิกเพื่ออัพโหลดหรือลากและวาง
                </p>
                <p className="text-xs text-gray-500">
                  ไฟล์ CSV (ข้อมูลพนักงาน)
                </p>
              </div>
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>

          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
          {employees.length > 0 && (
            <>
              <h2 className="text-xl font-semibold mb-4">จำนวนผู้เข้าร่วม</h2>
              <ul className="mb-4">{employees.length} คน</ul>
            </>
          )}
        </div>

        {spinResults.length > 0 && (
          <div className="w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">ผลการสุ่ม</h2>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="px-4 py-2 bg-gray-100">ครั้งที่</th>
                  <th className="px-4 py-2 bg-gray-100">ชื่อพนักงาน</th>

                  <th className="px-4 py-2 bg-gray-100">รหัส</th>
                </tr>
              </thead>
              <tbody>
                {spinResults.map((result, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2">{result.timestamp}</td>

                    <td className="px-4 py-2">{result.employeeId}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {spinResults.length > 0 && (
              <div className="w-full max-w-2xl">
                <div className="gird grid-cols-1 justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">ส่งออกผลการสุ่ม</h2>
                  <button
                    onClick={exportToCSV}
                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export to CSV
                  </button>
                </div>
                <table className="w-full text-left border-collapse">
                  {/* ... existing table content ... */}
                </table>
              </div>
            )}
          </div>
        )}

        <div></div>

        {/* Remove the employeesWithEpoch table */}
      </LayoutGridPosts>
    </div>
  );
};

export default App;
