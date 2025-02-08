import { Paper } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import React from "react";
import { useStoreDataAccounts } from "../../middleware/hooks";

const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 70 },
  {
    field: "created_at",
    headerName: "Creation date",
    type: "dateTime",
    width: 130,
  },
  { field: "email", headerName: "E-mail", width: 130 },
  {
    field: "name",
    headerName: "Name",
    width: 90,
  },
  {
    field: "password",
    headerName: "Password",
    sortable: false,
    width: 160,
  },
];

export default function PageUsers() {
  const [data, store] = useStoreDataAccounts();
  return (
    <Paper sx={{ height: 400, width: "100%" }}>
      <DataGrid
        rows={data!}
        columns={columns}
        pageSizeOptions={[5, 10, 20]}
        checkboxSelection
        sx={{ border: 0 }}
      />
    </Paper>
  );
}
