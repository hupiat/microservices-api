# Node API with Lumen Backend, Redis, and JWT

This project is a **Node.js API** that interacts with a **Lumen backend** for user management. It uses **Redis** for caching and **JWT** for authentication. Integration and unit tests are implemented using **Jest** and **Supertest**.

## 🚀 Installation and Setup

### 1️⃣ Prerequisites

- **Node.js** (v16+ recommended)
- **Lumen** (PHP backend)
- **Redis** (for caching)
- **PostgreSQL or MySQL** (database for Lumen)

### 2️⃣ Clone the Project

```sh
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

### 3️⃣ Install Dependencies

```sh
npm install
```

### 4️⃣ Environment Configuration

Create a `.env` file at the root of the project and configure the following environment variables:

```ini
PORT=5000
LUMEN_API_URL=http://localhost:8000
JWT_SECRET=your_secret_key
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 5️⃣ Start Redis (if not already running)

```sh
redis-server
```

### 6️⃣ Start the Node API

```sh
npm start
```

The API should now be running on `http://localhost:5000`. 🎉

---

## 🔄 Restarting the Lumen Backend

To restart Lumen, navigate to its directory and restart the PHP server:

```sh
php -S localhost:8000 -t public
```

If needed, you can also restart the database migrations:

```sh
php artisan migrate:refresh --seed
```

---

## 📋 API Endpoints

### 🔐 Authentication

| Method   | Endpoint            | Description                            |
| -------- | ------------------- | -------------------------------------- |
| `POST`   | `/api/users/login`  | Authenticate user and return JWT token |
| `DELETE` | `/api/users/logout` | Logout and invalidate session          |

### 👥 User Management

| Method   | Endpoint         | Description                                   |
| -------- | ---------------- | --------------------------------------------- |
| `GET`    | `/api/users`     | Get all users (requires authentication)       |
| `GET`    | `/api/users/:id` | Get a user by ID (requires authentication)    |
| `POST`   | `/api/users`     | Register a new user                           |
| `PUT`    | `/api/users/:id` | Update user details (requires authentication) |
| `DELETE` | `/api/users/:id` | Delete a user (requires authentication)       |

---

## 🛠 Running Tests

### 1️⃣ Install Development Dependencies

```sh
npm install --save-dev jest supertest
```

### 2️⃣ Run Tests

```sh
composer test
```

```sh
npm test
```

If you encounter errors with `jest`, make sure your test files are correctly named (`*.test.ts` or `*.test.js`) and ensure that Jest is configured for TypeScript.

---

## 🛠 Troubleshooting

### ❌ `ECONNREFUSED` when trying to log in

- Make sure the **Lumen API** is running (`php artisan serve`).
- Check if **Redis** is running (`redis-cli ping` should return `PONG`).

### ❌ `jwt malformed` error

- Ensure that `JWT_SECRET` in `.env` is set correctly and matches the one in Lumen.
- If the token is stored in Redis, try deleting it and logging in again.

### ❌ `Supertest` cannot find the app instance

- Ensure that `export default app;` is present in `index.ts`.
- Check that Jest is correctly set up in `jest.config.js`.

---

## 📜 License

This project is licensed under the MIT License.

---

## ✨ Contributors

- **Hugo PIAT-LILLO** - [GitHub](https://github.com/hupiat)

---

Happy Coding! 🚀
