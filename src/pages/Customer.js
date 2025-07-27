import React, { useState } from 'react';
import {
  Container, Typography, TextField, Button, Card, CardContent,
} from '@mui/material';
import api from '../api/axios';
import OrderStatusBadge from '../components/OrderStatusBadge';

export default function Customer() {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);

  const fetchOrder = async () => {
    try {
      const res = await api.get('/orders');
      const found = res.data.find(o => o._id === orderId);
      setOrder(found || null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Container>
      <Typography variant="h5" gutterBottom>Track Your Order</Typography>
      <TextField
        label="Order ID"
        value={orderId}
        onChange={(e) => setOrderId(e.target.value)}
        fullWidth
      />
      <Button onClick={fetchOrder} variant="contained" sx={{ mt: 2 }}>Search</Button>

      {order && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6">Order Status:</Typography>
            <OrderStatusBadge status={order.status} />
            <Typography variant="body1" mt={2}>
              Payment Received: {order.paymentReceived ? 'Yes' : 'No'}
            </Typography>
            <Typography variant="body2" mt={1}>
              Items:
              <ul>
                {order.items.map((item) => (
                  <li key={item.product._id}>
                    {item.product.name} × {item.quantity}
                  </li>
                ))}
              </ul>
            </Typography>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}
