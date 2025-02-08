import { Paper, Button, Box, Fab } from "@mui/material";
import { DataGrid, GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";
import { Delete } from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import {
  useRedirectToLogin,
  useStoreDataAccounts,
} from "../../middleware/hooks";
import { useMiddlewareContext } from "../../middleware/context";
import { Account } from "../../types";
import { validateEmail } from "../../tools";

const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 70 },
  { field: "email", headerName: "E-mail", width: 200, editable: true },
  { field: "name", headerName: "Name", width: 200, editable: true },
];

export default function PageUsers() {
  useRedirectToLogin();
  const { setUser } = useMiddlewareContext();
  const [data, store] = useStoreDataAccounts();
  const [rows, setRows] = useState<Account[]>([]);
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>([]);

  useEffect(() => {
    if (data) {
      setRows(data);
    }
  }, [data]);

  const handleUpdate = async (updatedRow) => {
    if (validateEmail(updatedRow.email)) {
      if (data?.some((user) => user.id === updatedRow.id)) {
        await store.update({
          id: updatedRow.id,
          name: updatedRow.name,
          email: updatedRow.email,
        });
      } else {
        await store.add({
          id: updatedRow.id,
          name: updatedRow.name,
          email: updatedRow.email,
        });
      }
    } else {
      console.error("Email : " + updatedRow.email + " is invalid");
    }
    return updatedRow;
  };

  const handleAddUser = () => {
    const newId = rows.length ? Math.max(...rows.map((r) => r.id)) + 1 : 1;
    setRows([...rows, { id: newId, name: "", email: "" }]);
  };

  const handleDeleteSelected = async () => {
    await Promise.all(selectedRows.map((id) => store.delete(Number(id))));
    setRows(rows.filter((row) => !selectedRows.includes(row.id)));
    setSelectedRows([]);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <Box>
      <Button
        variant="contained"
        onClick={handleAddUser}
        sx={{ mb: 2, mx: 2 }}
        style={{
          margin: "20px",
        }}
        color="secondary"
      >
        Add a user
      </Button>
      <Paper sx={{ height: 400, width: "97%", margin: "20px" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          editMode="row"
          pageSizeOptions={[5, 10, 20]}
          checkboxSelection
          onRowSelectionModelChange={(newSelection) =>
            setSelectedRows(newSelection)
          }
          processRowUpdate={handleUpdate}
        />
      </Paper>
      <Fab
        color="secondary"
        sx={{ position: "fixed", bottom: 20, right: 20 }}
        onClick={handleDeleteSelected}
        disabled={selectedRows.length === 0}
      >
        <Delete />
      </Fab>
      <Button
        variant="contained"
        onClick={handleLogout}
        sx={{ mb: 2 }}
        color="secondary"
        style={{
          margin: "20px",
        }}
      >
        Logout
      </Button>
    </Box>
  );
}
