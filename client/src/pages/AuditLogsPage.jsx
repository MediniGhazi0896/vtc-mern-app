import { useEffect, useState } from 'react';
import {
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  Chip,
  Pagination,
  Box,
  CircularProgress
} from '@mui/material';
import API from '../services/api';

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/admin/audit/logs?page=${page}&limit=6`);
      setLogs(res.data.logs);
      setPages(res.data.pages);
    } catch {
      alert('❌ Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        📜 Audit Logs
      </Typography>

      {loading ? (
        <Box sx={{ textAlign: 'center', mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Action</TableCell>
                <TableCell>Actor</TableCell>
                <TableCell>Target</TableCell>
                <TableCell>Details</TableCell>
                <TableCell>Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log._id}>
                  <TableCell>
                    <Chip
                      label={log.action}
                      color={
                        log.action === 'delete'
                          ? 'error'
                          : log.action === 'deactivate'
                          ? 'warning'
                          : 'info'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{log.actor?.name || '—'}</TableCell>
                  <TableCell>{log.target?.name || '—'}</TableCell>
                  <TableCell>{log.details}</TableCell>
                  <TableCell>{formatDate(log.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Pagination
              count={pages}
              page={page}
              onChange={(_, value) => setPage(value)}
            />
          </Box>
        </>
      )}
    </Paper>
  );
};

export default AuditLogsPage;
