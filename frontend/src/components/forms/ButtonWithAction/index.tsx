import { Send } from "@mui/icons-material";
import { Box, Button, ButtonProps, CircularProgress } from "@mui/material";
import "./styles.css";
import React, { JSX, useState } from "react";

type IProps = ButtonProps & {
  text: JSX.Element | string;
  onClick: () => void | Promise<void>;
  icon?: JSX.Element;
  iconPosition?: "start" | "end";
};

export default function ButtonWithAction({
  text,
  onClick,
  icon,
  iconPosition = "start",
  ...props
}: IProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleClick = async () => {
    setIsLoading(true);
    if (onClick) {
      await onClick();
    }
    setIsLoading(false);
  };

  const getIcon = () => {
    if (isLoading) {
      return <CircularProgress size={"1rem"} />;
    }
    if (icon) {
      return <Box>{icon}</Box>;
    } else {
      return <Send />;
    }
  };

  return (
    <Button
      variant="contained"
      onClick={handleClick}
      disabled={isLoading || props.disabled}
      className="button__action"
      endIcon={iconPosition === "end" && getIcon()}
      startIcon={iconPosition === "start" && getIcon()}
    >
      {text}
    </Button>
  );
}
