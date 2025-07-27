import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Typography,
  Checkbox,
  FormControlLabel,
  Snackbar,
  Alert,
} from '@mui/material';
import axios from 'axios';

const API = process.env.REACT_APP_API_BASE;

const OrderForm = () => {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    customer: '',
    items: [],
    paymentReceived: false,
  });
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch customers and products on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [custRes, prodRes] = await Promise.all([
          axios.get(`${API}/customers`),
          axios.get(`${API}/products`),
        ]);
        setCustomers(custRes.data);
        setProducts(prodRes.data);
      } catch (error) {
        setErrorMsg('Failed to load customers/products');
      }
    }
    fetchData();
  }, []);

  const handleItemChange = (productId, quantity) => {
    const updatedItems = [...formData.items];
    const index = updatedItems.findIndex((item) => item.product === productId);
    if (index > -1) {
      updatedItems[index].quantity = quantity;
    } else {
      updatedItems.push({ product: productId, quantity });
    }
    setFormData({ ...formData, items: updatedItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/orders`, formData);
      setSuccessMsg('✅ Order placed successfully!');
      setFormData({ customer: '', items: [], paymentReceived: false });
    } catch (error) {
      setErrorMsg('❌ Failed to place order');
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom>
        Place a New Order
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          select
          fullWidth
          label="Customer"
          value={formData.customer}
          onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
          required
          margin="normal"
        >
          {customers.map((cust) => (
            <MenuItem key={cust._id} value={cust._id}>
              {cust.name} ({cust.email})
            </MenuItem>
          ))}
        </TextField>

        <Typography variant="subtitle1" sx={{ mt: 2 }}>
          Select Products & Quantity:
        </Typography>
        {products.map((prod) => (
          <Box key={prod._id} sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 1 }}>
            <Typography>{prod.name}</Typography>
            <TextField
              type="number"
              label="Qty"
              inputProps={{ min: 0 }}
              onChange={(e) => handleItemChange(prod._id, Number(e.target.value))}
              size="small"
            />
          </Box>
        ))}

        <FormControlLabel
          control={
            <Checkbox
              checked={formData.paymentReceived}
              onChange={(e) => setFormData({ ...formData, paymentReceived: e.target.checked })}
            />
          }
          label="Payment Received"
          sx={{ mt: 2 }}
        />

        <Button variant="contained" color="primary" type="submit" sx={{ mt: 2 }}>
          Submit Order
        </Button>
      </form>

      <Snackbar open={!!successMsg} autoHideDuration={4000} onClose={() => setSuccessMsg('')}>
        <Alert onClose={() => setSuccessMsg('')} severity="success">{successMsg}</Alert>
      </Snackbar>
      <Snackbar open={!!errorMsg} autoHideDuration={4000} onClose={() => setErrorMsg('')}>
        <Alert onClose={() => setErrorMsg('')} severity="error">{errorMsg}</Alert>
      </Snackbar>
    </Box>
  );
};

export default OrderForm;
