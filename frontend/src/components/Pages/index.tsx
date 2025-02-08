import React from "react";
import { Box } from "@mui/material";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PATH_LOGIN, PATH_USERS } from "../../middleware/paths";
import PageLogin from "../PageLogin";
import PageUsers from "../PageUsers";

export default function Pages() {
  return (
    <Box id="container__root">
      <BrowserRouter>
        <Routes>
          <Route path={PATH_LOGIN} Component={PageLogin} />
          <Route path={PATH_USERS} Component={PageUsers} />
        </Routes>
      </BrowserRouter>
    </Box>
  );
}
