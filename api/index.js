import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load initial menu data
let menuData = { menuItems: [], addOns: [] };
try {
  const menuPath = path.join(__dirname, 'data', 'menu.json');
  menuData = JSON.parse(fs.readFileSync(menuPath, 'utf8'));
} catch (err) {
  console.warn('Could not read menu.json:', err);
}

// In-memory orders store
let seedOrders = [];
try {
  const ordersPath = path.join(__dirname, 'data', 'orders_data.json');
  if (fs.existsSync(ordersPath)) {
    seedOrders = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
  }
} catch (err) {
  console.warn('Could not read orders_data.json:', err);
}

// Global in-memory state across warm serverless invocations
let orders = [...seedOrders];
let sequenceCounter = 250;
if (orders.length > 0) {
  for (const o of orders) {
    if (o.orderNumber) {
      const n = parseInt(o.orderNumber.replace(/[^0-9]/g, ''), 10);
      if (!isNaN(n) && n > sequenceCounter) sequenceCounter = n;
    }
  }
}

function parseJsonBody(req) {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === 'object') {
      return resolve(req.body);
    }
    if (typeof req.body === 'string') {
      try {
        return resolve(JSON.parse(req.body));
      } catch (e) {
        return resolve({});
      }
    }
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.end(JSON.stringify(data));
}

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.end();
  }

  // Parse path and query
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = parsedUrl.pathname.replace(/\/$/, '');
  const searchParams = parsedUrl.searchParams;

  // Normalize /api prefix
  if (pathname.startsWith('/api')) {
    pathname = pathname.substring(4);
  }
  if (!pathname) pathname = '/';

  // 1. MENU ENDPOINTS
  if (pathname === '/menu' && req.method === 'GET') {
    return sendJson(res, 200, menuData.menuItems);
  }

  if (pathname === '/menu/addons' && req.method === 'GET') {
    return sendJson(res, 200, menuData.addOns);
  }

  if (pathname.startsWith('/menu/') && req.method === 'GET') {
    const id = pathname.substring(6);
    const item = menuData.menuItems.find((i) => i.id.toLowerCase() === id.toLowerCase());
    if (item) return sendJson(res, 200, item);
    return sendJson(res, 404, { error: 'Menu item not found' });
  }

  // 2. ORDERS ENDPOINTS
  if (pathname === '/orders' && req.method === 'GET') {
    const statusQuery = searchParams.get('status');
    let list = [...orders];
    if (statusQuery) {
      list = list.filter((o) => (o.status || '').toUpperCase() === statusQuery.toUpperCase());
    }
    list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return sendJson(res, 200, list);
  }

  if (pathname === '/orders/waiting-list' && req.method === 'GET') {
    const activeStatuses = ['PENDING', 'PREPARING', 'READY'];
    const waiting = orders
      .filter((o) => activeStatuses.includes((o.status || '').toUpperCase()))
      .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    return sendJson(res, 200, waiting);
  }

  if (pathname === '/orders' && req.method === 'POST') {
    const body = await parseJsonBody(req);
    sequenceCounter += 1;
    const nowIso = new Date().toISOString().replace('Z', '').split('.')[0];
    const randHex = Math.random().toString(16).substring(2, 10).toUpperCase();

    const newOrder = {
      id: body.id || `ORD-${randHex}`,
      orderNumber: body.orderNumber || `#${sequenceCounter}`,
      customerName: body.customerName?.trim() || 'Guest Customer',
      items: body.items || [],
      totalAmount: body.totalAmount || 0,
      paymentMethod: body.paymentMethod || 'Cash',
      amountPaid: body.amountPaid || body.totalAmount || 0,
      changeAmount: body.changeAmount || 0,
      status: 'PENDING',
      createdAt: body.createdAt || nowIso,
      updatedAt: nowIso,
      completedAt: null,
      notes: body.notes || null,
    };

    orders.unshift(newOrder);
    return sendJson(res, 201, newOrder);
  }

  // Order status update: PATCH /orders/:id/status
  const statusMatch = pathname.match(/^\/orders\/([^/]+)\/status$/);
  if (statusMatch && req.method === 'PATCH') {
    const id = statusMatch[1];
    const body = await parseJsonBody(req);
    const order = orders.find((o) => o.id === id);
    if (!order) return sendJson(res, 404, { error: 'Order not found' });

    order.status = (body.status || order.status).toUpperCase();
    order.updatedAt = new Date().toISOString().replace('Z', '').split('.')[0];
    if (order.status === 'COMPLETED') {
      order.completedAt = order.updatedAt;
    }
    return sendJson(res, 200, order);
  }

  // Single order GET /orders/:id
  const orderIdMatch = pathname.match(/^\/orders\/([^/]+)$/);
  if (orderIdMatch && req.method === 'GET') {
    const id = orderIdMatch[1];
    const order = orders.find((o) => o.id === id);
    if (order) return sendJson(res, 200, order);
    return sendJson(res, 404, { error: 'Order not found' });
  }

  // Cancel order DELETE /orders/:id
  if (orderIdMatch && req.method === 'DELETE') {
    const id = orderIdMatch[1];
    const order = orders.find((o) => o.id === id);
    if (order) {
      order.status = 'CANCELLED';
      order.updatedAt = new Date().toISOString().replace('Z', '').split('.')[0];
      res.statusCode = 204;
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.end();
    }
    return sendJson(res, 404, { error: 'Order not found' });
  }

  // 3. SALES ENDPOINTS
  if (pathname === '/sales/daily' && req.method === 'GET') {
    const dateStr = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const validOrders = orders.filter((o) => {
      if (o.status === 'CANCELLED') return false;
      const orderDate = (o.createdAt || '').split('T')[0];
      return orderDate === dateStr;
    });

    let totalRevenue = 0;
    let totalDrinks = 0;
    const paymentBreakdown = {};
    const categoryBreakdown = {};
    const itemQuantityMap = {};
    const itemRevenueMap = {};
    const hourlySalesMap = {};
    const hourlyOrdersMap = {};

    for (let h = 7; h <= 22; h++) {
      hourlySalesMap[h] = 0;
      hourlyOrdersMap[h] = 0;
    }

    for (const o of validOrders) {
      totalRevenue += o.totalAmount || 0;
      const method = o.paymentMethod || 'Cash';
      paymentBreakdown[method] = (paymentBreakdown[method] || 0) + (o.totalAmount || 0);

      const hour = o.createdAt ? new Date(o.createdAt).getHours() : 12;
      if (hourlySalesMap[hour] !== undefined) {
        hourlySalesMap[hour] += o.totalAmount || 0;
        hourlyOrdersMap[hour] += 1;
      }

      if (Array.isArray(o.items)) {
        for (const item of o.items) {
          totalDrinks += item.quantity || 1;
          const cat = item.category || 'Other';
          categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + (item.itemTotal || 0);
          itemQuantityMap[item.name] = (itemQuantityMap[item.name] || 0) + (item.quantity || 1);
          itemRevenueMap[item.name] = (itemRevenueMap[item.name] || 0) + (item.itemTotal || 0);
        }
      }
    }

    const topSellingItems = Object.entries(itemQuantityMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, quantity]) => ({
        name,
        quantity,
        revenue: itemRevenueMap[name] || 0,
      }));

    const hourlySales = Object.keys(hourlySalesMap).map((hStr) => {
      const h = parseInt(hStr, 10);
      const label = h > 12 ? `${h - 12} PM` : h === 12 ? '12 PM' : `${h} AM`;
      return {
        hour: h,
        label,
        sales: hourlySalesMap[h],
        orders: hourlyOrdersMap[h],
      };
    });

    return sendJson(res, 200, {
      date: dateStr,
      totalRevenue,
      totalOrders: validOrders.length,
      totalDrinks,
      averageOrderValue: validOrders.length > 0 ? totalRevenue / validOrders.length : 0,
      paymentBreakdown,
      categoryBreakdown,
      topSellingItems,
      hourlySales,
      orders: validOrders,
    });
  }

  if (pathname === '/sales/monthly' && req.method === 'GET') {
    const today = new Date();
    const year = parseInt(searchParams.get('year') || today.getFullYear(), 10);
    const month = parseInt(searchParams.get('month') || (today.getMonth() + 1), 10);
    const daysInMonth = new Date(year, month, 0).getDate();

    const monthStr = String(month).padStart(2, '0');
    const prefix = `${year}-${monthStr}`;

    const validOrders = orders.filter((o) => {
      if (o.status === 'CANCELLED') return false;
      return (o.createdAt || '').startsWith(prefix);
    });

    let totalRevenue = 0;
    let totalDrinks = 0;
    const dailyRevenue = {};
    const dailyOrdersCount = {};
    const categoryBreakdown = {};
    const itemQuantityMap = {};
    const itemRevenueMap = {};

    for (let d = 1; d <= daysInMonth; d++) {
      dailyRevenue[d] = 0;
      dailyOrdersCount[d] = 0;
    }

    for (const o of validOrders) {
      totalRevenue += o.totalAmount || 0;
      const day = o.createdAt ? new Date(o.createdAt).getDate() : 1;
      if (dailyRevenue[day] !== undefined) {
        dailyRevenue[day] += o.totalAmount || 0;
        dailyOrdersCount[day] += 1;
      }

      if (Array.isArray(o.items)) {
        for (const item of o.items) {
          totalDrinks += item.quantity || 1;
          const cat = item.category || 'Other';
          categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + (item.itemTotal || 0);
          itemQuantityMap[item.name] = (itemQuantityMap[item.name] || 0) + (item.quantity || 1);
          itemRevenueMap[item.name] = (itemRevenueMap[item.name] || 0) + (item.itemTotal || 0);
        }
      }
    }

    const dailySales = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dStr = String(d).padStart(2, '0');
      dailySales.push({
        day: d,
        date: `${year}-${monthStr}-${dStr}`,
        sales: dailyRevenue[d],
        orders: dailyOrdersCount[d],
      });
    }

    const topSellingItems = Object.entries(itemQuantityMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, quantity]) => ({
        name,
        quantity,
        revenue: itemRevenueMap[name] || 0,
      }));

    const monthNames = [
      'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
      'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
    ];

    return sendJson(res, 200, {
      year,
      month,
      monthName: monthNames[month - 1] || 'OCTOBER',
      totalRevenue,
      totalOrders: validOrders.length,
      totalDrinks,
      averageDailyRevenue: daysInMonth > 0 ? totalRevenue / daysInMonth : 0,
      categoryBreakdown,
      topSellingItems,
      dailySales,
    });
  }

  if (pathname === '/sales/summary' && req.method === 'GET') {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    let todayRevenue = 0;
    let todayOrders = 0;
    let yesterdayRevenue = 0;
    let yesterdayOrders = 0;
    let monthRevenue = 0;
    let monthOrders = 0;

    for (const o of orders) {
      if (o.status === 'CANCELLED') continue;
      const cDate = (o.createdAt || '').split('T')[0];
      if (cDate === todayStr) {
        todayRevenue += o.totalAmount || 0;
        todayOrders += 1;
      } else if (cDate === yesterdayStr) {
        yesterdayRevenue += o.totalAmount || 0;
        yesterdayOrders += 1;
      }
      if ((o.createdAt || '').startsWith(monthStr)) {
        monthRevenue += o.totalAmount || 0;
        monthOrders += 1;
      }
    }

    const monthNames = [
      'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
      'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
    ];

    return sendJson(res, 200, {
      todayRevenue,
      todayOrders,
      yesterdayRevenue,
      yesterdayOrders,
      monthRevenue,
      monthOrders,
      monthName: monthNames[today.getMonth()] || 'OCTOBER',
    });
  }

  if (pathname === '/sales/reset-demo' && req.method === 'POST') {
    orders = [...seedOrders];
    return sendJson(res, 200, { message: 'Demo data reset successfully' });
  }

  return sendJson(res, 404, { error: 'Not Found', path: pathname });
}
