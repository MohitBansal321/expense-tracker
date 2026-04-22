import React, { useMemo } from "react";
import dayjs from "dayjs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from "recharts";

// TransactionChart component that renders a grouped bar chart for income vs expense
export default function TransactionChart({ data }) {
  // Process transaction data to separate income and expense per month
  const chartData = useMemo(() => {
    const monthlyData = {};

    (data || []).forEach((item) => {
      const key = `${item._id.month}-${item._id.year}`;
      const monthYear = `${dayjs().month(item._id.month - 1).format("MMM")} ${item._id.year}`;

      if (!monthlyData[key]) {
        monthlyData[key] = {
          monthYear,
          month: item._id.month,
          year: item._id.year,
          Income: 0,
          Expense: 0,
        };
      }

      // Sum up transactions by type
      item.transactions?.forEach((tx) => {
        if (tx.type === "income") {
          monthlyData[key].Income += tx.amount || 0;
        } else {
          monthlyData[key].Expense += tx.amount || 0;
        }
      });
    });

    // Convert to array and sort by year and month
    return Object.values(monthlyData)
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      })
      .reverse();
  }, [data]);

  // Calculate totals
  const totals = useMemo(() => {
    return chartData.reduce(
      (acc, item) => ({
        income: acc.income + item.Income,
        expense: acc.expense + item.Expense,
      }),
      { income: 0, expense: 0 }
    );
  }, [chartData]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 rounded-lg shadow-xl">
          <p className="font-bold text-gray-900 dark:text-white mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: entry.color }} 
              />
              <span className="text-gray-500 dark:text-gray-400">{entry.name}:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                ${entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 mt-8 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Income vs Expense Trend
        </h3>
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]" />
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold leading-none mb-1">Income</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white leading-none">
                ${totals.income.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]" />
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold leading-none mb-1">Expense</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white leading-none">
                ${totals.expense.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="h-[300px] w-full">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              barGap={8}
            >
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0.3}/>
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0.3}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false} 
                stroke="#374151" 
                opacity={0.1} 
              />
              <XAxis 
                dataKey="monthYear" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
              <Bar 
                dataKey="Income" 
                name="Income" 
                fill="url(#incomeGradient)" 
                radius={[4, 4, 0, 0]} 
                barSize={20}
              />
              <Bar 
                dataKey="Expense" 
                name="Expense" 
                fill="url(#expenseGradient)" 
                radius={[4, 4, 0, 0]} 
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
              No transaction data available yet. Add some transactions to see your spending trends.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

