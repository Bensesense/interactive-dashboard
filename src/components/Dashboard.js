import React, { useState, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Alert, AlertDescription } from '../components/ui/alert';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const Dashboard = () => {
  const [selectedView, setSelectedView] = useState('category');
  const [data, setData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [fileName, setFileName] = useState('');

  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target.result;
      const lines = content.split('\n');
      
      const newData = [];
      const newMonthlyData = [];
      const monthTotals = {};

      lines.forEach((line, index) => {
        if (index > 2) { // Skip header lines
          const columns = line.split(',');
          if (columns.length >= 14) {
            const month = columns[0].trim();
            const category = columns[4].trim() || columns[5].trim() || columns[6].trim() || columns[7].trim() || columns[8].trim() || columns[9].trim();
            const amount = parseFloat(columns[columns.length - 1].replace('€', '').trim()) || 0;

            if (month && category && amount) {
              // Update category data
              const existingCategory = newData.find(item => item.category === category);
              if (existingCategory) {
                existingCategory.amount += amount;
              } else {
                newData.push({ category, amount });
              }

              // Update monthly data
              if (!monthTotals[month]) {
                monthTotals[month] = 0;
              }
              monthTotals[month] += amount;
            }
          }
        }
      });

      // Convert monthTotals to array format
      Object.entries(monthTotals).forEach(([month, amount]) => {
        newMonthlyData.push({ month, amount });
      });

      setData(newData);
      setMonthlyData(newMonthlyData);
      setFileName(file.name);
    };

    reader.readAsText(file);
  }, []);

  const renderChart = () => {
    if (data.length === 0 && monthlyData.length === 0) {
      return (
        <Alert>
          <AlertDescription>
            No data available. Please upload a CSV file to view the dashboard.
          </AlertDescription>
        </Alert>
      );
    }

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
              dataKey="amount"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="amount" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      );
    }
  };

  const totalExpense = data.reduce((sum, item) => sum + item.amount, 0);
  const largestExpenseCategory = data.length > 0 ? data.reduce((max, item) => max.amount > item.amount ? max : item).category : 'N/A';

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Sales Dashboard 2024</h1>
      <Card className="mb-4">
        <CardHeader>Upload Data</CardHeader>
        <CardContent>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-violet-50 file:text-violet-700
              hover:file:bg-violet-100"
          />
          {fileName && <p className="mt-2">Current file: {fileName}</p>}
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Card>
          <CardHeader>Total Expenses</CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalExpense > 0 ? `€${totalExpense.toFixed(2)}` : 'N/A'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>Largest Expense Category</CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{largestExpenseCategory}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>View</CardHeader>
          <CardContent>
            <Select onValueChange={setSelectedView} defaultValue={selectedView}>
              <SelectTrigger>
                <SelectValue placeholder="Select view" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="category">By Category</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>{selectedView === 'category' ? 'Expenses by Category' : 'Monthly Expenses'}</CardHeader>
        <CardContent>
          {renderChart()}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;