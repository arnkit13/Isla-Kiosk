import * as XLSX from 'xlsx';

/**
 * Export daily sales data to a formatted Excel (.xlsx) workbook
 */
export function exportDailySalesToExcel(dailyData, selectedDate) {
  if (!dailyData) return;

  const workbook = XLSX.utils.book_new();

  // 1. Summary Sheet
  const summaryRows = [
    ['ISLA DEL CAFE - DAILY SALES REPORT'],
    ['Branch', 'Carcar, Cebu'],
    ['Date', selectedDate],
    ['Generated At', new Date().toLocaleString()],
    [],
    ['KEY PERFORMANCE METRICS', ''],
    ['Total Gross Sales (PHP)', Number(dailyData.totalSales || 0).toFixed(2)],
    ['Total Completed Orders', dailyData.totalOrders || 0],
    ['Total Items Sold', dailyData.totalItemsSold || 0],
    ['Average Order Value (PHP)', dailyData.totalOrders > 0 ? (dailyData.totalSales / dailyData.totalOrders).toFixed(2) : '0.00'],
    [],
    ['PAYMENT METHOD BREAKDOWN', ''],
    ['Cash Sales (PHP)', Number(dailyData.paymentBreakdown?.Cash || 0).toFixed(2)],
    ['GCash Sales (PHP)', Number(dailyData.paymentBreakdown?.GCash || 0).toFixed(2)],
    ['Card Sales (PHP)', Number(dailyData.paymentBreakdown?.Card || 0).toFixed(2)],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);
  summarySheet['!cols'] = [{ wch: 30 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Daily Summary');

  // 2. Orders Transactions Sheet
  if (dailyData.orders && dailyData.orders.length > 0) {
    const orderHeaders = [
      'Order Number',
      'Time',
      'Customer Name',
      'Items Ordered',
      'Payment Method',
      'Total Amount (PHP)',
      'Status',
    ];

    const orderRows = dailyData.orders.map((o) => {
      const itemsList = (o.items || [])
        .map((i) => `${i.quantity}x ${i.name}`)
        .join(', ');

      const timeStr = o.createdAt
        ? new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '-';

      return [
        o.orderNumber || '-',
        timeStr,
        o.customerName || 'Walk-in',
        itemsList || '-',
        o.paymentMethod || 'Cash',
        Number(o.totalAmount || 0).toFixed(2),
        o.status || 'COMPLETED',
      ];
    });

    const ordersSheet = XLSX.utils.aoa_to_sheet([orderHeaders, ...orderRows]);
    ordersSheet['!cols'] = [
      { wch: 15 },
      { wch: 12 },
      { wch: 22 },
      { wch: 45 },
      { wch: 16 },
      { wch: 20 },
      { wch: 15 },
    ];
    XLSX.utils.book_append_sheet(workbook, ordersSheet, 'Transactions');
  }

  // 3. Category Breakdown Sheet
  if (dailyData.categoryBreakdown) {
    const catHeaders = ['Beverage Series', 'Sales Revenue (PHP)'];
    const catRows = Object.entries(dailyData.categoryBreakdown).map(([cat, rev]) => [
      cat,
      Number(rev).toFixed(2),
    ]);

    const catSheet = XLSX.utils.aoa_to_sheet([catHeaders, ...catRows]);
    catSheet['!cols'] = [{ wch: 25 }, { wch: 22 }];
    XLSX.utils.book_append_sheet(workbook, catSheet, 'Series Breakdown');
  }

  // Write and trigger download
  const fileName = `ISLA_DEL_CAFE_Daily_Sales_${selectedDate}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

/**
 * Export monthly sales data to a formatted Excel (.xlsx) workbook
 */
export function exportMonthlySalesToExcel(monthlyData, selectedYear, selectedMonth) {
  if (!monthlyData) return;

  const workbook = XLSX.utils.book_new();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthName = monthNames[Number(selectedMonth) - 1] || `Month ${selectedMonth}`;

  // 1. Monthly Summary Sheet
  const summaryRows = [
    ['ISLA DEL CAFE - MONTHLY SALES REPORT'],
    ['Branch', 'Carcar, Cebu'],
    ['Period', `${monthName} ${selectedYear}`],
    ['Generated At', new Date().toLocaleString()],
    [],
    ['MONTHLY TOTALS', ''],
    ['Total Monthly Revenue (PHP)', Number(monthlyData.totalSales || 0).toFixed(2)],
    ['Total Orders Placed', monthlyData.totalOrders || 0],
    ['Total Beverages Served', monthlyData.totalItemsSold || 0],
    ['Average Daily Revenue (PHP)', Number(monthlyData.averageDailySales || 0).toFixed(2)],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);
  summarySheet['!cols'] = [{ wch: 30 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Monthly Summary');

  // 2. Daily Sales Breakdown Sheet
  if (monthlyData.dailySales && monthlyData.dailySales.length > 0) {
    const dailyHeaders = ['Date', 'Day of Month', 'Orders Count', 'Gross Sales (PHP)'];
    const dailyRows = monthlyData.dailySales.map((d) => [
      d.date,
      d.day,
      d.orders || 0,
      Number(d.sales || 0).toFixed(2),
    ]);

    const dailySheet = XLSX.utils.aoa_to_sheet([dailyHeaders, ...dailyRows]);
    dailySheet['!cols'] = [{ wch: 16 }, { wch: 15 }, { wch: 15 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(workbook, dailySheet, 'Daily Breakdown');
  }

  // 3. Top Best Sellers Sheet
  if (monthlyData.topDrinks && monthlyData.topDrinks.length > 0) {
    const topHeaders = ['Rank', 'Drink Name', 'Category', 'Quantity Sold', 'Gross Revenue (PHP)'];
    const topRows = monthlyData.topDrinks.map((t, idx) => [
      idx + 1,
      t.name,
      t.category || '-',
      t.quantity || 0,
      Number(t.revenue || 0).toFixed(2),
    ]);

    const topSheet = XLSX.utils.aoa_to_sheet([topHeaders, ...topRows]);
    topSheet['!cols'] = [{ wch: 8 }, { wch: 28 }, { wch: 20 }, { wch: 16 }, { wch: 22 }];
    XLSX.utils.book_append_sheet(workbook, topSheet, 'Best Sellers');
  }

  // Write and trigger download
  const fileName = `ISLA_DEL_CAFE_Monthly_Sales_${selectedYear}_${String(selectedMonth).padStart(2, '0')}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
