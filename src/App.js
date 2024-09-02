import React, { useState, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './App.css';


const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];


function App() {
  const [selectedView, setSelectedView] = useState('category');
  const [data, setData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [fileName, setFileName] = useState('');
  const [totalExpense, setTotalExpense] = useState(0);
  const [largestExpenseCategory, setLargestExpenseCategory] = useState('N/A');

  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
  
    reader.onload = (e) => {
      const content = e.target.result;
      const lines = content.split('\n');
  
      const categoryData = {};
      const monthlyData = {};
      let totalExp = 0;
  
      lines.forEach((line, index) => {
        if (index > 4) { // Skip header lines
          const columns = line.split(',');
          if (columns.length >= 12) {
            const month = columns[0].trim();
            let lineTotal = 0;
  
            for (let i = 4; i < 11; i++) {
              if (columns[i] && !isNaN(parseFloat(columns[i]))) {
                const category = lines[4].split(',')[i].trim(); // Get category name from header
                const amount = parseFloat(columns[i]);
                categoryData[category] = (categoryData[category] || 0) + amount;
                lineTotal += amount;
              }
            }
  
            if (month && lineTotal > 0) {
              monthlyData[month] = (monthlyData[month] || 0) + lineTotal;
              totalExp += lineTotal;
            }
          }
        }
      });
  
      const newCategoryData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));
      const newMonthlyData = Object.entries(monthlyData).map(([name, value]) => ({ name, value }));
  
      // Find largest expense category
      const largestExp = newCategoryData.reduce((max, item) => max.value > item.value ? max : item);
  
      setData(newCategoryData);
      setMonthlyData(newMonthlyData);
      setFileName(file.name);
      setTotalExpense(totalExp);
      setLargestExpenseCategory(largestExp.name);
  
      console.log("Updated state:", { 
        categoryData: newCategoryData, 
        monthlyData: newMonthlyData,
        totalExpense: totalExp,
        largestExpenseCategory: largestExp.name
      });
    };
  
    reader.readAsText(file);
  }, []);

  const renderChart = () => {
  if (selectedView === 'category') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(2)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  } else {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={monthlyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    );
  }
};

return (
  <div className="dashboard">
    <h1 className="text-4xl font-bold">Dashboard for csv files</h1>
    
    <div className="upload-section">
      <h2 className="text-xl font-semibold mb-2">Upload Data</h2>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="w-full"
      />
      {fileName && <p className="mt-2 text-sm">Current file: {fileName}</p>}
    </div>
    
    <div className="stats-grid">
      <div className="stat-card">
        <h2 className="text-lg font-semibold mb-2">Total Expenses</h2>
        <p className="text-3xl font-bold text-blue-600">{totalExpense > 0 ? `€${totalExpense.toFixed(2)}` : 'N/A'}</p>
      </div>
      <div className="stat-card">
        <h2 className="text-lg font-semibold mb-2">Largest Expense Category</h2>
        <p className="text-3xl font-bold text-green-600">{largestExpenseCategory}</p>
      </div>
      <div className="stat-card">
        <h2 className="text-lg font-semibold mb-2">View</h2>
        <select
          value={selectedView}
          onChange={(e) => setSelectedView(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="category">By Category</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>
    </div>
    
    <div className="chart-container">
      <h2 className="text-2xl font-semibold">
        {selectedView === 'category' ? 'Expenses by Category' : 'Monthly Expenses'}
      </h2>
      <div style={{ height: '400px' }}>
        {renderChart()}
      </div>
    </div>
  </div>
);
}

export default App;