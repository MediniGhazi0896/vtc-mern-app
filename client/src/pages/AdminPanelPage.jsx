import { useState } from 'react';
import { Paper, Tabs, Tab, Box } from '@mui/material';
import UsersPage from './UsersPage';
import AuditLogsPage from './AuditLogsPage';

const AdminPanelPage = () => {
    const [tabIndex, setTabIndex] = useState(0);

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    return (
        <Box>
            <Paper sx={{ mb: 2 }}>
                <Tabs value={tabIndex} onChange={handleTabChange} centered>
                    <Tab label="Users" />
                    <Tab label="Audit Logs" />
                </Tabs>
            </Paper>

            {tabIndex === 0 && <UsersPage />}
            {tabIndex === 1 && <AuditLogsPage />}
        </Box>
    );
};

export default AdminPanelPage;
