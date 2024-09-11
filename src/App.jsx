import { useState, useCallback, useEffect } from "react";
import { Upload } from "lucide-react";
import WheelComponent from "react-wheel-of-prizes";

const App = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [error, setError] = useState(null);
  const [wheelKey, setWheelKey] = useState(0);

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
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
                department,
                learningChannel,
              ] = line.split(",").map((item) => item.trim());
              if (!timestamp || !firstname || !employeeId || !department) {
                throw new Error("Invalid CSV format");
              }
              return {
                timestamp,
                firstname,
                employeeId,
                department,
                learningChannel: learningChannel || "N/A",
              };
            })
            .filter((employee) => employee.employeeId);

          if (parsedEmployees.length === 0) {
            throw new Error("No valid employees found in CSV");
          }

          setEmployees(parsedEmployees);
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
  };

  useEffect(() => {
    setWheelKey((prevKey) => prevKey + 1);
  }, [employees]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-8">สุ่มกาช่าผู้โชคดี</h1>
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl">
        <div className="mb-6">
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
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
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
        </div>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
      </div>

      {employees.length > 0 && (
        <div className="flex flex-row items-center justify-center min-h-screen">
          <WheelComponent
            key={wheelKey}
            segments={employees.map((emp) => emp.employeeId)}
            segColors={segColors.map ((color) => color)}
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
          {selectedEmployee && (
            <div className="mt-6 text-center">
              <h2 className="text-2xl font-semibold mb-4">
                🎉 ผู้โชคดี: {selectedEmployee.employeeId} 🎉
              </h2>
              <p>รหัสพนักงาน : {selectedEmployee.department}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;

