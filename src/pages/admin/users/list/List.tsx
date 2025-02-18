import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TablePagination,
  TableSortLabel,
  Typography,
  TextField,
  Box,
  Button,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CardContent,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person'; // Non-admin icon

import Warning from '@mui/icons-material/Warning';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import moment from 'moment';
import './List.css';
import { CountData, Department, User } from '../../../../models/interface';
import apiClient from '../../../../utils/api';
import { NavLink } from 'react-router-dom';
import { useLoader } from '../../../../context/LoaderContext';

const List: React.FC = () => {
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [orderBy, setOrderBy] = useState<keyof User>('createdAt');
  const [users, setUsers] = useState<Array<User>>([]);
  const [search, setSearch] = useState('');
  const [jumpPage, setJumpPage] = useState(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState<User | null>(null);
  const [countData, setCountData] = useState<Array<CountData>>([]);
  const [selectedFilters, setSelectedFilters] = useState<{
    [key: string]: boolean;
  }>({});
  const [selectedBatches, setSelectedBatches] = useState<
    Array<{
      department: Department;
      batch: string;
    }>
  >([]);
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const { setLoading } = useLoader();

  const columns: Array<{
    id: keyof User | 'actions';
    label: string;
    sortable: boolean;
  }> = [
    { id: 'regNumber', label: 'Registration Number', sortable: true },
    { id: 'name', label: 'Name', sortable: true },
    { id: 'email', label: 'Email', sortable: true },
    { id: 'mobileNumber', label: 'Mobile Number', sortable: true },
    { id: 'batch', label: 'Batch', sortable: true },
    { id: 'department', label: 'Department', sortable: true },
    { id: 'certificateImage', label: 'Certificate', sortable: false },
    { id: 'userImage', label: 'Profile Pic', sortable: false },
    { id: 'isAdmin', label: 'Admin', sortable: false },
    { id: 'createdAt', label: 'Created Date', sortable: true },
    { id: 'updatedAt', label: 'Updated Date', sortable: true },
    { id: 'status', label: 'Status', sortable: true },
    { id: 'actions', label: 'Actions', sortable: true },
  ];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const payload = {
        selectedBatches,
        page,
        limit: rowsPerPage,
        search,
        order,
        sortBy: orderBy,
      };
      const response = await apiClient.post(`/admin/users`, payload);
      setLoading(false);
      return {
        users: response.data?.data?.users || [],
        totalCount: response.data?.data?.totalCount || 0,
        countData: response.data?.data?.countData,
      };
    } catch (error) {
      setLoading(false);
      console.error('Error fetching users', error);
      return { users: [], totalCount: 0, countData: [] };
    }
  };

  const handleJumpPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (/^\d*$/.test(value)) {
      setJumpPage(Number(value));
    }
  };

  const handleJumpPageSubmit = () => {
    const newPage = Math.min(Math.max(0, Number(jumpPage) - 1), totalPages - 1);
    setPage(newPage);
    setJumpPage(0);
  };

  const reloadData = () => {
    fetchUsers().then((data) => {
      setUsers(data.users);
      setTotalCount(data.totalCount);
      setTotalPages(Math.ceil(data.totalCount / rowsPerPage));
      setCountData(data?.countData);
    });
  };

  useEffect(() => {
    reloadData();
  }, [page, rowsPerPage, order, orderBy, selectedBatches]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      setLoading(true);
      const payload = {
        _id: id,
        status: status == 'Inactive' ? 'Active' : 'Inactive',
      };
      const statusChangeResp = await apiClient.patch(
        '/admin/change-status',
        payload,
      );
      const updatedusers = users.map((userData) => {
        if (userData._id == id) {
          userData = statusChangeResp.data.data.user;
        }
        return userData;
      });
      setUsers(updatedusers);
    } catch (error) {
      console.log('\n change-status error...', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminChange = async (id: string, admin: boolean) => {
    try {
      setLoading(true);
      const payload = {
        _id: id,
        isAdmin: admin,
      };
      const adminChangeResp = await apiClient.patch(
        '/admin/make-admin',
        payload,
      );
      const updatedusers = users.map((userData) => {
        if (userData._id == id) {
          userData = adminChangeResp.data.data.user;
        }
        return userData;
      });
      setUsers(updatedusers);
    } catch (error) {
      console.log('\n make-admin error...', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      const deleteResp = await apiClient.delete(
        '/admin/delete-user?userId=' + id,
      );
      console.log('\n deleteResp..', deleteResp);

      const updatedusers = users.filter((userData) => userData._id !== id);
      setUsers(updatedusers);
    } catch (error) {
      console.log('\n delete-user error...', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (property: keyof User) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleClickOpenDialog = (rowData: User) => {
    setSelectedRow(rowData); // Store the selected row ID
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRow(null);
  };

  const handleConfirmDelete = () => {
    if (selectedRow) {
      handleDelete(selectedRow._id);
      handleCloseDialog();
    }
  };

  const handleFilterClick = (
    batch: string,
    department: 'CSE' | 'ECE' | 'EEE' | 'CIVIL' | 'MECH',
  ) => {
    const key = `${batch}-${department}`;
    setSelectedBatches((prevFilters) => {
      const isSelected = prevFilters.some(
        (item) => item.batch === batch && item.department === department,
      );

      if (isSelected) {
        return prevFilters.filter(
          (item) => !(item.batch === batch && item.department === department),
        );
      } else {
        return [...prevFilters, { batch, department }];
      }
    });
    setSelectedFilters((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleAccordionToggle = (batch: string) => {
    setExpanded((prev) => ({
      ...prev,
      [batch]: !prev[batch],
    }));
  };

  const EnhancedTableHead = () => {
    return (
      <TableHead>
        <TableRow>
          {columns.map((column) => (
            <TableCell key={column.id}>
              {column.sortable ? (
                <TableSortLabel
                  active={orderBy === column.id}
                  direction={orderBy === column.id ? order : 'asc'}
                  onClick={() => handleSort(column.id as keyof User)}
                >
                  {column.label}
                </TableSortLabel>
              ) : (
                column.label
              )}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
    );
  };

  const RenderRow: React.FC<{ column: keyof User; row: User }> = ({
    column,
    row,
  }) => {
    switch (column) {
      case 'createdAt':
        return <>{moment(row.createdAt).format('DD-MM-YYYY HH:mm:ss')}</>;
      case 'updatedAt':
        return <>{moment(row.updatedAt).format('DD-MM-YYYY HH:mm:ss')}</>;
      case 'isAdmin':
        return <>{row.isAdmin ? 'Yes' : 'No'}</>;
      case 'status':
        return (
          <Chip
            label={row.status || 'Active'}
            color={row.status === 'Inactive' ? 'secondary' : 'primary'}
            size="small"
          />
        );
      case 'certificateImage':
        return row.certificateImage ? (
          <iframe
            src={row.certificateImage}
            width="100%"
            title="Preview"
          ></iframe>
        ) : (
          '-'
        );
      case 'userImage':
        return row.userImage ? (
          <img
            src={row.userImage}
            alt={row.regNumber + '-profile'}
            width="100%"
          ></img>
        ) : (
          '-'
        );
      default:
        return <>{row[column] || '-'} </>;
    }
  };

  const CountAccordion = () => {
    return (
      <>
        <Box
          sx={{
            width: '100%',
            mb: 2,
            textAlign: 'center',
            p: 2,
            bgcolor: '#f5f5f5',
            borderRadius: 2,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Total Users:{' '}
            {countData.reduce((acc, batch) => acc + batch.total, 0)}
          </Typography>
        </Box>
        {countData.map((yearData) => (
          <Accordion
            key={yearData.batch}
            sx={{
              width: '100%',
              bgcolor: '#f0f8ff',
              borderRadius: 2,
              boxShadow: 1,
              marginBottom: '10px',
            }}
            expanded={expanded[yearData.batch] ?? false} // Control expansion manually
            onChange={() => handleAccordionToggle(yearData.batch)}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="h6" sx={{ flex: 1, fontWeight: 'bold' }}>
                Batch: {yearData.batch}
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontWeight: 'bold', color: 'gray' }}
              >
                Total: {yearData.total}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                {yearData.counts.map((countData) => {
                  const key = `${yearData.batch}-${countData.department}`;
                  const isSelected = !!selectedFilters[key];

                  return (
                    <Card
                      key={key}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleFilterClick(yearData.batch, countData.department);
                      }}
                      sx={{
                        flex: 1,
                        textAlign: 'center',
                        minWidth: 120,
                        p: 2,
                        cursor: 'pointer',
                        borderRadius: 2,
                        boxShadow: isSelected
                          ? '0px 0px 10px rgba(0, 0, 255, 0.5)'
                          : 'none',
                        bgcolor: isSelected ? '#b3e5fc' : 'none', // Light blue if selected
                        transition: '0.2s',
                      }}
                    >
                      <CardContent>
                        <Typography variant="body1" fontWeight="bold">
                          {countData.department}
                        </Typography>
                        <Typography variant="h6">{countData.count}</Typography>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </>
    );
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', padding: 2 }}>
      <Box
        sx={{
          width: '100%',
          paddingBottom: '20px',
        }}
      >
        <CountAccordion />
      </Box>
      {/* Search Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
        <TextField
          label="Type to search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          variant="outlined"
          size="small"
          sx={{ marginRight: 2, flex: 1 }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              reloadData();
            }
          }}
        />
        <Button variant="contained" color="primary" onClick={reloadData}>
          Search
        </Button>
      </Box>

      {/* Table Section */}
      <TableContainer sx={{ maxHeight: 400 }}>
        <Table>
          <EnhancedTableHead />
          <TableBody>
            {users.map((row) => (
              <TableRow key={row._id}>
                {columns.map((column) => {
                  if (column.id === 'actions') {
                    return (
                      <TableCell key={row._id} align="right">
                        <Box
                          display="flex"
                          flexDirection="column"
                          alignItems="flex-end"
                        >
                          <Box display="flex" mb={1} justifyContent="flex-end">
                            <NavLink to={'/admin/users/view/' + row._id}>
                              <Tooltip title="View" placement="top">
                                <IconButton color="default">
                                  <VisibilityIcon color="info" />
                                </IconButton>
                              </Tooltip>
                            </NavLink>

                            <NavLink to={'/admin/users/edit/' + row._id}>
                              <Tooltip title="Edit" placement="top">
                                <IconButton color="primary">
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                            </NavLink>
                          </Box>

                          <Box display="flex" justifyContent="flex-end">
                            <Tooltip title="Delete" placement="top">
                              <IconButton
                                color="error"
                                onClick={() => handleClickOpenDialog(row)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>

                            <Tooltip
                              title={
                                'Make ' +
                                (row.status === 'Inactive'
                                  ? 'Active'
                                  : 'Inactive')
                              }
                              placement="top"
                            >
                              <IconButton
                                color="primary"
                                onClick={() =>
                                  handleStatusChange(row._id, row.status || '')
                                }
                              >
                                <SwapHorizIcon />
                              </IconButton>
                            </Tooltip>

                            <Tooltip
                              title={
                                !row.isAdmin
                                  ? 'Make as admin'
                                  : 'Remove from admin'
                              }
                              placement="top"
                            >
                              <IconButton
                                color="primary"
                                onClick={() =>
                                  handleAdminChange(row._id, !row.isAdmin)
                                }
                              >
                                {!row.isAdmin ? (
                                  <AdminPanelSettingsIcon />
                                ) : (
                                  <PersonIcon />
                                )}
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      </TableCell>
                    );
                  }
                  return (
                    <TableCell key={column.id} size="small">
                      <RenderRow column={column.id} row={row} />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Jump Page Section */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
          <Typography variant="body2">Jump to page:</Typography>
          <TextField
            type="number"
            value={jumpPage}
            onChange={handleJumpPageChange}
            onBlur={handleJumpPageSubmit} // Submit when losing focus
            label="Page Number"
            variant="outlined"
            size="small"
            style={{ marginLeft: '10px', width: '80px' }}
            slotProps={{
              input: {
                inputMode: 'numeric', // Ensure numeric input
              },
              htmlInput: {
                // Apply input attributes using htmlInput
                min: 1,
                max: totalPages,
                step: 1,
              },
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleJumpPageSubmit}
            sx={{ marginLeft: 2 }}
          >
            Go
          </Button>
        </Box>
      )}

      {/* Pagination Controls */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 20]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0); // Reset page when changing rows per page
        }}
        sx={{ marginTop: 2 }}
      />
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle>
          <IconButton color="warning">
            <Warning />
          </IconButton>
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <div>
            Are you sure you want to delete
            <strong>
              {' ' + selectedRow?.name} ({selectedRow?.regNumber})
            </strong>
            ?
          </div>
          <div>This action cannot be undone.</div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default List;
