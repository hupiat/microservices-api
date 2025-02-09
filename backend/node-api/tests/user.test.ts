import request from "supertest";
import app from "../src/index";

describe("User API", () => {
  let token: string;

  test("should register a user", async () => {
    const res = await request(app).post("/api/users").send({
      name: "Test User",
      email: "test@example.fr",
      password: "Password123",
    });
    console.log(res.body);
    expect(res.statusCode).toBe(201);
    expect(res.body.email).toBe("test@example.fr");
  });

  test("should login a user", async () => {
    const res = await request(app).post("/api/users/login").send({
      email: "test@example.fr",
      password: "Password123",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  test("should get all users", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test("should get single user", async () => {
    const users = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`);
    const userId = users.body[0].id;

    const res = await request(app)
      .get(`/api/users/${userId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(userId);
  });

  test("should update a user", async () => {
    const users = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`);
    const userId = users.body[0].id;

    const res = await request(app)
      .put(`/api/users/${userId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ id: userId, name: "Updated Name", email: "test@example.com" });

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe("Updated Name");
  });

  test("should delete a user", async () => {
    const users = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`);
    const userId = users.body[0].id;

    const res = await request(app)
      .delete(`/api/users/${userId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
  });
});
