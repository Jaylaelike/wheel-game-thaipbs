import { useState, useCallback, useEffect } from "react";

import WheelComponent from "react-wheel-of-prizes";
import { useWindowSize } from "@uidotdev/usehooks";
import Confetti from "react-confetti";
import { Upload, Download } from "lucide-react";

import LayoutGridPosts from "./joy-treasury/layout-grid-posts/LayoutGridPosts";

const App = () => {
  const [employees, setEmployees] = useState([]);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [error, setError] = useState(null);
  const [wheelKey, setWheelKey] = useState(0);
  const [spinResults, setSpinResults] = useState([]);

  const { width, height } = useWindowSize();

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
              ] = line.split(",").map((item) => item.trim());
              if (!timestamp || !firstname || !employeeId) {
                throw new Error("Invalid CSV format");
              }
              return {
                timestamp,
                firstname,
                employeeId,
              };
            })
            .filter((employee) => employee.employeeId);

          if (parsedEmployees.length === 0) {
            throw new Error("No valid employees found in CSV");
          }

          setEmployees(parsedEmployees);
          setAvailableEmployees(parsedEmployees);
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
    // Find the selected employee
    const selectedEmployee = availableEmployees.find((emp) => emp.employeeId === winner);
    
    if (selectedEmployee) {
      // Update selected employee and spin results
      setSelectedEmployee(selectedEmployee);
      setSpinResults((prevResults) => [...prevResults, selectedEmployee]);

      // Remove the selected employee from available employees
      setAvailableEmployees((prevEmployees) => 
        prevEmployees.filter((emp) => emp.employeeId !== winner)
      );

      // Regenerate wheel key to force re-render
      setWheelKey((prevKey) => prevKey + 1);
    }
  };

  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 10000); // 10 seconds

    return () => clearTimeout(timer);
  }, []);

  // Generate colors based on available employees
  const segColors = generateRandomColors(availableEmployees.length);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-8">สุ่มกาช่าผู้โชคดี</h1>

      {selectedEmployee && (
        <div className="text-center">
          <Confetti width={width} height={height} recycle={showConfetti} />
          <h2 className="text-2xl font-semibold mb-4">
            🎉 ผู้โชคดี: {selectedEmployee.employeeId} 🎉
          </h2>
          <p>ชื่อพนักงาน : {selectedEmployee.timestamp}</p>
          <p>รหัส : {selectedEmployee.employeeId}</p>
        </div>
      )}

      <LayoutGridPosts>
        {availableEmployees.length > 0 && (
          <div className="grid grid-cols-1 items-center justify-center">
            <WheelComponent
              key={wheelKey}
              segments={availableEmployees.map((emp) => emp.employeeId)}
              segColors={segColors}
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
            <p className="text-center mt-2">
              เหลือผู้เข้าร่วม: {availableEmployees.length} คน
            </p>
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
                <div className="grid grid-cols-1 justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">ส่งออกผลการสุ่ม</h2>
                  <button
                    onClick={exportToCSV}
                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export to CSV
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </LayoutGridPosts>
    </div>
  );
};

export default App;