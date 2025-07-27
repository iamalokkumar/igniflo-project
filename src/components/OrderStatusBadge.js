import { Chip } from '@mui/material';

export default function OrderStatusBadge({ status }) {
  const colorMap = {
    PENDING: 'default',
    PAID: 'primary',
    FULFILLED: 'success',
    CANCELLED: 'error',
  };

  return <Chip label={status} color={colorMap[status]} />;
}
