import React, { useState, useEffect } from 'react';
import {
  DataGrid,
  GridToolbar,
  GridActionsCellItem,
  GridRowModes,
  GridRowEditStopReasons
} from '@mui/x-data-grid';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  Avatar,
  Card,
  CardHeader,
  CardContent,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Close,
  Save,
  Search,
  Fastfood,
  LocalBar,
  FreeBreakfast,
  LunchDining,
  DinnerDining,
  Image
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import API from '../../api/axios';
import { toast } from "react-toastify";

const ItemPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[4],
    transform: 'translateY(-2px)'
  }
}));

const CategoryIcon = ({ category }) => {
  switch(category) {
    case 'Breakfast': return <FreeBreakfast color="primary" />;
    case 'Lunch': return <LunchDining color="primary" />;
    case 'Dinner': return <DinnerDining color="primary" />;
    case 'Beverages': return <LocalBar color="primary" />;
    default: return <Fastfood color="primary" />;
  }
};

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const res = await API.get('/menu');
      setMenuItems(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch menu items:', err);
      toast.error('Failed to fetch menu items. Please try again.');
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const price = parseFloat(formData.get('price'));
    if (isNaN(price) || price <= 0) {
      toast.error('Price must be a positive number');
      return;
    }

    const itemData = new FormData();
    itemData.append('name', formData.get('name'));
    itemData.append('category', formData.get('category'));
    itemData.append('price', price);
    itemData.append('available', formData.get('available') === 'true');
    if (e.target.image.files[0]) {
      itemData.append('image', e.target.image.files[0]); // Append the image file
    }

    try {
      if (currentItem) {
        await API.put(`/menu/${currentItem.id}`, itemData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Menu item updated successfully');
      } else {
        await API.post('/menu', itemData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Menu item added successfully');
      }
      setOpenDialog(false);
      setImagePreview(null);
      fetchMenuItems();
    } catch (err) {
      console.error('Failed to save item:', err);
      toast.error('Failed to save menu item. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/menu/${id}`);
      toast.success('Menu item deleted successfully');
      fetchMenuItems();
    } catch (err) {
      console.error('Failed to delete item:', err);
      toast.error('Failed to delete menu item. Please try again.');
    }
  };

  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchText.toLowerCase()) ||
    item.category.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    { 
      field: 'image_url', 
      headerName: '', 
      width: 80,
      renderCell: (params) => (
        <Avatar 
          src={params.value || '/default-food.png'} 
          sx={{ width: 56, height: 56 }}
          variant="rounded"
        >
          <Fastfood />
        </Avatar>
      ),
      sortable: false,
      filterable: false
    },
    { 
      field: 'name', 
      headerName: 'Item Name', 
      width: 200,
      renderCell: (params) => (
        <Typography variant="body1" fontWeight="medium">
          {params.value}
        </Typography>
      )
    },
    { 
      field: 'category', 
      headerName: 'Category', 
      width: 150,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <CategoryIcon category={params.value} />
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      )
    },
    { 
      field: 'price', 
      headerName: 'Price', 
      width: 120,
      renderCell: (params) => {
        const price = parseFloat(params.value); // Ensure the value is a number
        return (
          <Typography variant="body1" color="primary.main">
            ₹{!isNaN(price) ? price.toFixed(2) : 'N/A'}
          </Typography>
        );
      }
    },
    { 
      field: 'available', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value ? 'Available' : 'Out of Stock'} 
          color={params.value ? 'success' : 'error'} 
          size="small"
        />
      )
    },
    {
      field: 'actions',
      type: 'actions',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Edit color="primary" />}
          label="Edit"
          onClick={() => {
            setCurrentItem(params.row);
            setOpenDialog(true);
          }}
        />,
        <GridActionsCellItem
          icon={<Delete color="error" />}
          label="Delete"
          onClick={() => handleDelete(params.id)}
        />,
      ],
    },
  ];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title="Menu Management"
          subheader="Manage your canteen's menu items"
          action={
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                setCurrentItem(null);
                setOpenDialog(true);
              }}
            >
              Add New Item
            </Button>
          }
        />
        <Divider />
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search menu items..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 300 }}
            />
            <Stack direction="row" spacing={1}>
              <Chip 
                icon={<Fastfood />} 
                label={`Total: ${menuItems.length}`} 
                variant="outlined" 
              />
              <Chip 
                icon={<Fastfood color="success" />} 
                label={`Available: ${menuItems.filter(i => i.available).length}`} 
                variant="outlined" 
              />
            </Stack>
          </Box>
          
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={filteredItems}
              columns={columns}
              loading={loading}
              components={{ Toolbar: GridToolbar }}
              componentsProps={{
                toolbar: {
                  showQuickFilter: true,
                  quickFilterProps: { debounceMs: 500 },
                },
              }}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              disableSelectionOnClick
              sx={{
                '& .MuiDataGrid-cell:focus': {
                  outline: 'none'
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: 'background.paper',
                }
              }}
            />
          </Box>
        </CardContent>
      </Card>

      <Dialog 
        open={openDialog} 
        onClose={() => {
          setOpenDialog(false);
          setImagePreview(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            {currentItem ? 'Edit Menu Item' : 'Add New Menu Item'}
            <IconButton onClick={() => {
              setOpenDialog(false);
              setImagePreview(null);
            }}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
              <Box sx={{ flex: 1 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="Item Name"
                  name="name"
                  defaultValue={currentItem?.name || ''}
                />
                <Select
                  margin="normal"
                  required
                  fullWidth
                  id="category"
                  label="Category"
                  name="category"
                  defaultValue={currentItem?.category || 'Snacks'}
                >
                  <MenuItem value="Breakfast">Breakfast</MenuItem>
                  <MenuItem value="Lunch">Lunch</MenuItem>
                  <MenuItem value="Dinner">Dinner</MenuItem>
                  <MenuItem value="Snacks">Snacks</MenuItem>
                  <MenuItem value="Beverages">Beverages</MenuItem>
                </Select>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="price"
                  label="Price (₹)"
                  name="price"
                  type="number"
                  inputProps={{ step: "0.01", min: "0" }}
                  defaultValue={currentItem?.price || ''}
                />
                <Select
                  margin="normal"
                  required
                  fullWidth
                  id="available"
                  label="Availability"
                  name="available"
                  defaultValue={currentItem?.available ? 'true' : 'false'}
                >
                  <MenuItem value="true">Available</MenuItem>
                  <MenuItem value="false">Out of Stock</MenuItem>
                </Select>
              </Box>
              <Box sx={{ width: 200 }}>
                <ItemPaper sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Avatar 
                    src={imagePreview || currentItem?.image_url || '/default-food.png'} 
                    sx={{ width: 120, height: 120, mb: 2 }}
                    variant="rounded"
                  >
                    <Fastfood fontSize="large" />
                  </Avatar>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<Image />}
                    fullWidth
                  >
                    Upload Image
                    <input
                      type="file"
                      name="image"
                      hidden
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </Button>
                </ItemPaper>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="contained"
                type="submit"
                startIcon={<Save />}
                sx={{ minWidth: 120 }}
              >
                Save
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default MenuManagement;