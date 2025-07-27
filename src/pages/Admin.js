import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Table, TableHead, TableRow,
  TableCell, TableBody, Select, MenuItem,
} from '@mui/material';
import OrderStatusBadge from '../components/OrderStatusBadge';
import api from '../api/axios';
import io from 'socket.io-client';

const socket = io('http://localhost:8080');

export default function Admin() {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    const res = await api.get('/orders');
    setOrders(res.data);
  };

  const updateStatus = async (id, status) => {
    await api.patch(`/orders/${id}/status`, { status });
  };

  useEffect(() => {
    fetchOrders();
    socket.on('order-updated', fetchOrders);
    return () => socket.off('order-updated');
  }, []);

  return (
    <Container>
      <Typography variant="h5" gutterBottom>All Orders</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Customer</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Update</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map(order => (
            <TableRow key={order._id}>
              <TableCell>{order._id}</TableCell>
              <TableCell>{order.customer?.name}</TableCell>
              <TableCell><OrderStatusBadge status={order.status} /></TableCell>
              <TableCell>
                <Select
                  value={order.status}
                  onChange={(e) => updateStatus(order._id, e.target.value)}
                  size="small"
                >
                  {['PENDING', 'PAID', 'FULFILLED', 'CANCELLED'].map(status => (
                    <MenuItem value={status} key={status}>{status}</MenuItem>
                  ))}
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
}
