import { Box, FormControl, TextField, TextFieldProps } from "@mui/material";
import React, { JSX } from "react";

export type InputFormStandardProps = TextFieldProps & {
  icon: JSX.Element;
  containerClassName?: string;
};

export default function InputFormStandard({
  icon,
  containerClassName,
  ...props
}: InputFormStandardProps) {
  return (
    <FormControl className={containerClassName}>
      <Box sx={{ display: "flex", alignItems: "flex-end" }}>
        <Box sx={{ color: "action.active", mr: 1, my: 0.5 }}>{icon}</Box>
        <TextField {...props} variant="standard" />
      </Box>
    </FormControl>
  );
}
