import { Card, Container } from "@mui/material";
import React, { useEffect, useState } from "react";
import "./styles.css";
import { Face4, Visibility } from "@mui/icons-material";
import InputFormStandard from "../forms/InputFormStandard";
import ButtonWithAction from "../forms/ButtonWithAction";
import { useMiddlewareContext } from "../../middleware/context";
import { Account } from "../../types";
import { validateEmail, validatePassword } from "../../tools";
import { useNavigate } from "react-router-dom";
import { PATH_USERS } from "../../middleware/paths";

export default function PageLogin() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { user, setUser } = useMiddlewareContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(PATH_USERS);
    }
  }, [user, navigate]);

  const validateSchema = (): boolean => {
    return validateEmail(email) && validatePassword(password);
  };

  const handleClick = async () => {
    await setUser({
      email,
      password,
    } as Account);
  };

  return (
    <Container id="card__login__container">
      <Card id="card__login">
        <h1>Log you in</h1>
        <InputFormStandard
          icon={<Face4 />}
          label="Email"
          type="email"
          containerClassName="card__login__input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <InputFormStandard
          icon={<Visibility />}
          label="Password"
          type="password"
          containerClassName="card__login__input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <ButtonWithAction
          text={"Login"}
          disabled={!validateSchema()}
          iconPosition="end"
          onClick={handleClick}
        />
      </Card>
    </Container>
  );
}
