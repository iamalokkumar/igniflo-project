import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Divider,
  Box,
} from '@mui/material';
import api from '../api/axios';
import OrderStatusBadge from '../components/OrderStatusBadge';
import OrderForm from '../components/OrderForm';

export default function Customer() {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);

  const fetchOrder = async () => {
    try {
      const res = await api.get('/orders');
      const found = res.data.find(o => o._id === orderId.trim());
      setOrder(found || null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      {/* Order Placement */}
      <Typography variant="h4" gutterBottom>
        Place a New Order
      </Typography>
      <OrderForm />

      <Divider sx={{ my: 6 }} />

      {/* Order Tracking */}
      <Typography variant="h4" gutterBottom>
        Track Your Order
      </Typography>
      <TextField
        label="Order ID"
        value={orderId}
        onChange={(e) => setOrderId(e.target.value)}
        fullWidth
        variant="outlined"
        sx={{ mt: 2 }}
      />
      <Button onClick={fetchOrder} variant="contained" sx={{ mt: 2 }}>
        Search
      </Button>

      {order && (
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h6">Order Status:</Typography>
            <OrderStatusBadge status={order.status} />

            <Typography variant="body1" mt={2}>
              Payment Received: {order.paymentReceived ? 'Yes' : 'No'}
            </Typography>

            <Typography variant="body2" mt={2}>
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
