import React, { useEffect, useState } from 'react';
import {
  Container, Typography, TextField, Button, Card, CardContent,
  MenuItem, Checkbox, FormControlLabel, Grid, Snackbar, Alert,
} from '@mui/material';
import api from '../api/axios';
import OrderStatusBadge from '../components/OrderStatusBadge';

export default function Customer() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedProducts, setSelectedProducts] = useState({});
  const [paymentReceived, setPaymentReceived] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch customers and products
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, prodRes] = await Promise.all([
          api.get('/customers'),
          api.get('/products'),
        ]);
        setCustomers(custRes.data);
        setProducts(prodRes.data);
      } catch (err) {
        console.error(err);
        setSnackbar({ open: true, message: 'Error loading data', severity: 'error' });
      }
    };
    fetchData();
  }, []);

  const handleProductChange = (productId, quantity) => {
    setSelectedProducts(prev => ({
      ...prev,
      [productId]: quantity,
    }));
  };

  const handleSubmit = async () => {
    const items = Object.entries(selectedProducts)
      .filter(([_, qty]) => qty > 0)
      .map(([productId, quantity]) => ({ product: productId, quantity: Number(quantity) }));

    if (!selectedCustomer || items.length === 0) {
      setSnackbar({ open: true, message: 'Select customer and at least one product', severity: 'warning' });
      return;
    }

    try {
      const res = await api.post('/orders', {
        customer: selectedCustomer,
        items,
        paymentReceived,
      });
      setOrderId(res.data._id);
      setSnackbar({ open: true, message: '✅ Order placed successfully!', severity: 'success' });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Failed to place order', severity: 'error' });
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
      <Typography variant="h5" gutterBottom>🛒 Place a New Order</Typography>

      <TextField
        select
        label="Select Customer"
        value={selectedCustomer}
        onChange={(e) => setSelectedCustomer(e.target.value)}
        fullWidth
        margin="normal"
      >
        {customers.map(cust => (
          <MenuItem key={cust._id} value={cust._id}>
            {cust.name} ({cust.email})
          </MenuItem>
        ))}
      </TextField>

      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Select Products:</Typography>
      <Grid container spacing={2}>
        {products.map(product => (
          <Grid item xs={12} sm={6} md={4} key={product._id}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1">{product.name}</Typography>
                <Typography variant="body2">Stock: {product.stock}</Typography>
                <Typography variant="body2">Price: ₹{product.price}</Typography>
                <TextField
                  type="number"
                  label="Quantity"
                  size="small"
                  fullWidth
                  value={selectedProducts[product._id] || ''}
                  onChange={(e) => handleProductChange(product._id, e.target.value)}
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <FormControlLabel
        control={
          <Checkbox
            checked={paymentReceived}
            onChange={(e) => setPaymentReceived(e.target.checked)}
          />
        }
        label="Payment Received"
        sx={{ mt: 2 }}
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
