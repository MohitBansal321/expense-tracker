import { scaleBand } from "@devexpress/dx-chart-core";
import { Animation, ArgumentScale, EventTracker, Stack } from "@devexpress/dx-react-chart";
import {
  ArgumentAxis,
  BarSeries,
  Chart,
  Legend,
  Tooltip,
  ValueAxis,
} from "@devexpress/dx-react-chart-material-ui";

import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import dayjs from "dayjs";
import * as React from "react";

// TransactionChart component that renders a grouped bar chart for income vs expense
export default function TransactionChart({ data }) {
  // Process transaction data to separate income and expense per month
  const chartData = React.useMemo(() => {
    const monthlyData = {};

    data.forEach((item) => {
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
    return Object.values(monthlyData).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    }).reverse();
  }, [data]);

  // Calculate totals
  const totals = React.useMemo(() => {
    return chartData.reduce(
      (acc, item) => ({
        income: acc.income + item.Income,
        expense: acc.expense + item.Expense,
      }),
      { income: 0, expense: 0 }
    );
  }, [chartData]);

  return (
    <Paper sx={{ marginTop: 5, p: 2 }}>
      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, mb: 2, gap: { xs: 2, sm: 0 } }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Income vs Expense Trend
        </Typography>
        <Box sx={{ display: "flex", gap: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#4CAF50" }} />
            <Typography variant="body2" color="text.secondary">
              Income: ${totals.income.toLocaleString()}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#f44336" }} />
            <Typography variant="body2" color="text.secondary">
              Expense: ${totals.expense.toLocaleString()}
            </Typography>
          </Box>
        </Box>
      </Box>

      {chartData.length > 0 ? (
        <Chart data={chartData} height={300}>
          <ArgumentScale factory={scaleBand} />
          <ArgumentAxis />
          <ValueAxis />

          <BarSeries
            name="Income"
            valueField="Income"
            argumentField="monthYear"
            color="#4CAF50"
          />
          <BarSeries
            name="Expense"
            valueField="Expense"
            argumentField="monthYear"
            color="#f44336"
          />

          <Stack />
          <Animation />
          <Legend position="bottom" />
          <EventTracker />
          <Tooltip />
        </Chart>
      ) : (
        <Box sx={{ py: 4, textAlign: "center" }}>
          <Typography color="text.secondary">
            No transaction data available. Add some transactions to see the chart.
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

