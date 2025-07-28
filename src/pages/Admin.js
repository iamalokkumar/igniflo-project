import React, { useEffect, useState, useRef } from 'react';
import {
  Container, Typography, Card, CardContent, MenuItem,
  Select, FormControl, InputLabel, Snackbar, Alert,
  Grid, Box, TextField, Button, CircularProgress
} from '@mui/material';
import api from '../api/axios';
import OrderStatusBadge from '../components/OrderStatusBadge';
import socket from '../socket';

export default function Admin() {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const observerRef = useRef();

  // Fetch orders on page change
  useEffect(() => {
    loadOrders(page);
  }, [page]);

  // Listen for WebSocket updates
  useEffect(() => {
    socket.on('order-updated', resetAndReload);
    socket.on('order-created', resetAndReload);
    return () => {
      socket.off('order-updated', resetAndReload);
      socket.off('order-created', resetAndReload);
    };
  }, []);

  const loadOrders = async (pageNum) => {
    if (loading) return;
    if (!hasMore && pageNum !== 1) return;

    setLoading(true);
    try {
      const res = await api.get(`/orders?page=${pageNum}&limit=5`);
      const newOrders = res.data.orders || res.data;
      setOrders(prev => (pageNum === 1 ? newOrders : [...prev, ...newOrders]));
      if (newOrders.length < 5) setHasMore(false);
    } catch (err) {
      setSnackbar({ open: true, message: 'Error loading orders', severity: 'error' });
    }
    setLoading(false);
  };

  const resetAndReload = async () => {
    setOrders([]);
    setPage(1);
    setHasMore(true);
    await loadOrders(1); // Reload page 1 orders
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      setSnackbar({ open: true, message: 'Status updated', severity: 'success' });
      resetAndReload();
    } catch (err) {
      setSnackbar({ open: true, message: 'Update failed', severity: 'error' });
    }
  };

  const exportCSV = () => {
    const header = ['Order ID', 'Order Name', 'Customer Name', 'Status', 'Payment', 'Items'];
    const rows = orders.map(order => {
      const items = order.items.map(item => `${item.product?.name} x ${item.quantity}`).join('; ');
      return [
        order._id,
        order.orderName || '',
        order.customer?.name || '',
        order.status,
        order.paymentReceived ? 'Yes' : 'No',
        items,
      ];
    });
    const csv = [header, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'orders.csv';
    link.click();
  };

  const filtered = orders.filter(order => {
    const nameMatch = order.customer?.name?.toLowerCase().includes(nameFilter.toLowerCase());
    const statusMatch = statusFilter ? order.status === statusFilter : true;
    return nameMatch && statusMatch;
  });

  const lastOrderRef = (node) => {
    if (loading) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    });
    if (node) observerRef.current.observe(node);
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>🧑‍💼 Admin Order Dashboard</Typography>

      <Box display="flex" flexWrap="wrap" gap={2} mt={2}>
        <TextField
          label="Search Customer"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          size="small"
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {['PENDING', 'PAID', 'FULFILLED', 'CANCELLED'].map(status => (
              <MenuItem key={status} value={status}>{status}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="outlined" onClick={exportCSV}>📤 Export CSV</Button>
      </Box>

      <Grid container spacing={2} mt={2}>
        {filtered.map((order, index) => (
          <Grid
            item xs={12} md={6}
            key={order._id}
            ref={index === filtered.length - 1 ? lastOrderRef : null}
          >
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6">Order ID: {order._id}</Typography>
                {order.orderName && (
                  <Typography variant="subtitle1">Order Name: {order.orderName}</Typography>
                )}
                <Typography variant="body2">Customer: {order.customer?.name} ({order.customer?.email})</Typography>
                <Box mt={1}>
                  <Typography variant="body2">Status: <OrderStatusBadge status={order.status} /></Typography>
                  <FormControl size="small" fullWidth sx={{ mt: 1 }}>
                    <InputLabel>Update Status</InputLabel>
                    <Select
                      label="Update Status"
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    >
                      {['PENDING', 'PAID', 'FULFILLED', 'CANCELLED'].map(status => (
                        <MenuItem key={status} value={status}>{status}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Items:
                  <ul>
                    {order.items.map(item => (
                      <li key={item.product?._id}>
                        {item.product?.name} × {item.quantity}
                      </li>
                    ))}
                  </ul>
                </Typography>
                <Typography variant="body2">
                  Payment: {order.paymentReceived ? '✅ Received' : '❌ Not Received'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {loading && <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
}
