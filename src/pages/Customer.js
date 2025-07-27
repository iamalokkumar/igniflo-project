import React, { useState } from 'react';
import {
  Container, Typography, TextField, Button, Box,
  Checkbox, FormControlLabel, Card, CardContent, Snackbar, Alert
} from '@mui/material';
import api from '../api/axios';
import OrderStatusBadge from '../components/OrderStatusBadge';

export default function Customer() {
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '' });
  const [items, setItems] = useState([{ name: '', quantity: 1 }]);
  const [paymentReceived, setPaymentReceived] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, { name: '', quantity: 1 }]);
  };

  const handleSubmit = async () => {
    if (!customer.name || !customer.email || !customer.phone) {
      setSnackbar({ open: true, message: 'Fill all customer details', severity: 'warning' });
      return;
    }

    const validItems = items.filter(item => item.name.trim() !== '' && item.quantity > 0);
    if (validItems.length === 0) {
      setSnackbar({ open: true, message: 'Add at least one product with valid quantity', severity: 'warning' });
      return;
    }

    try {
      const custRes = await api.post('/customers', customer);

      const orderItems = validItems.map(item => ({
        product: item.name.trim(), // assuming backend can accept product name or map it
        quantity: Number(item.quantity),
      }));

      const orderRes = await api.post('/orders', {
        customer: custRes.data._id,
        items: orderItems,
        paymentReceived,
      });

      setOrderId(orderRes.data._id);
      setOrder(null);
      setSnackbar({ open: true, message: '✅ Order placed successfully!', severity: 'success' });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Order submission failed', severity: 'error' });
    }
  };

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
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>🛒 Place Your Order</Typography>

      <TextField
        label="Full Name"
        fullWidth
        value={customer.name}
        onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
        margin="normal"
      />
      <TextField
        label="Email"
        fullWidth
        value={customer.email}
        onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
        margin="normal"
      />
      <TextField
        label="Phone"
        fullWidth
        value={customer.phone}
        onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
        margin="normal"
      />

      <Typography variant="h6" sx={{ mt: 3 }}>Product Items</Typography>
      {items.map((item, index) => (
        <Box key={index} display="flex" gap={2} sx={{ mt: 1 }}>
          <TextField
            label="Product Name"
            value={item.name}
            onChange={(e) => handleItemChange(index, 'name', e.target.value)}
            fullWidth
          />
          <TextField
            label="Quantity"
            type="number"
            value={item.quantity}
            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
            sx={{ width: 120 }}
          />
        </Box>
      ))}

      <Button onClick={addItem} variant="outlined" sx={{ mt: 2 }}>
        ➕ Add Another Item
      </Button>

      <FormControlLabel
        control={
          <Checkbox
            checked={paymentReceived}
            onChange={(e) => setPaymentReceived(e.target.checked)}
          />
        }
        label="Payment Received"
        sx={{ display: 'block', mt: 2 }}
      />

      <Button variant="contained" onClick={handleSubmit} sx={{ mt: 2 }}>
        Submit Order
      </Button>

      {orderId && (
        <>
          <Typography variant="h6" sx={{ mt: 3 }}>
            ✅ Your Order ID: <strong>{orderId}</strong>
          </Typography>
          <Button variant="outlined" onClick={fetchOrder} sx={{ mt: 1 }}>
            Track This Order
          </Button>
        </>
      )}

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
                {order.items.map((item, index) => (
                  <li key={index}>
                    {item.product.name} × {item.quantity}
                  </li>
                ))}
              </ul>
            </Typography>
          </CardContent>
        </Card>
      )}

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
