# Aurangabad Flavours API Documentation

Welcome to the API documentation for the Aurangabad Flavours Backend. This API provides resources for managing restaurants, dishes, food trails, articles, and events in the Aurangabad region.

## Base URL

`http://localhost:4000/v1`

## Authentication

The API uses JWT (JSON Web Token) for authentication. Most administrative tasks (POST, PUT, DELETE, PATCH) require a Bearer token.

### How to Authenticate

1.  **Signup**: Create a user using `/auth/signup`.
2.  **Login**: Authenticate with `/auth/login` to receive a token.
3.  **Use Token**: Include the token in the `Authorization` header for protected endpoints:
    `Authorization: Bearer <your_token>`

---

## Auth Endpoints

### Register User

`POST /auth/signup`

Registers a new user (Customer by default).

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "userType": "customer"
}
```

_Note: `userType` can be `customer`, `admin`, or `restaurant_owner`._

**Response (201):**

```json
{
  "message": "User created successfully",
  "token": "eyJhbG..."
}
```

### Login User

`POST /auth/login`

Authenticates a user and returns a JWT token.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

---

## Admin Dashboard (Admin Only)

### Get Dashboard Stats

`GET /admin/stats`

**Response (200):**

```json
{
  "totalHotels": 45,
  "activeEvents": 12,
  "publishedArticles": 28,
  "monthlyViews": 1540
}
```

### Get Recent Activity

`GET /admin/recent-activity`

**Response (200):** List of recent administrative actions.

---

## Settings Endpoints

### Get Site Settings (Public)

`GET /settings`

Returns site-wide configuration like social media links and feature flags.

### Update Site Settings (Admin)

`PUT /settings`

---

## Media Endpoints (Admin Only)

### Get All Media

`GET /media`

### Upload Media

`POST /media`

Uses `multipart/form-data`. Field name: `file`.

---

## Restaurant Endpoints

### Get All Restaurants (Public)

`GET /restaurants`

### Get Restaurant by ID (Public)

`GET /restaurants/:id`

### Create/Update Restaurant (Admin Only)

`POST /restaurants` | `PUT /restaurants/:id`

Uses `multipart/form-data` for image uploads.

**Fields:**

- `name`: string (required)
- `establishmentType`: string (required)
- `cuisine`: string (required)
- `facilities`: array of strings
- `priceRange`: string (required)
- `description`: string (required)
- `area`: string (required)
- `image`: file (required)
- `location[coordinates]`: array of numbers (longitude, latitude)

### Toggle Featured Status (Admin)

`PATCH /restaurants/:id/toggle-featured`

---

## Article Endpoints (Blog/News)

### Get All Articles (Public)

`GET /articles`

### Create Article (Admin Only)

`POST /articles`

**Fields:**

- `title`, `slug`, `content`, `author`, `excerpt`, `image`, `publishedDate`, `readTime`
- `category`: string (required)
- `tags`: array of strings
- `status`: `draft` | `published`
- `featured`: boolean

### Toggle Publication Status (Admin)

`PATCH /articles/:id/toggle-status`

---

## Event Endpoints

### Get All Events (Public)

`GET /events`

### Create/Update Event (Admin Only)

`POST /events` | `PUT /events/:id`

**Fields:**

- `name`, `description`, `date`, `location`, `image`, `organizer`, `price`, `capacity`
- `status`: `upcoming` | `recurring` | `past`
- `featured`: boolean

---

## Food Trail Endpoints

### Get All Food Trails (Public)

`GET /food-trails`

### Create Food Trail (Admin Only)

`POST /food-trails`

---

## Error Codes

| Status Code | Description                             |
| :---------- | :-------------------------------------- |
| 400         | Bad Request (Invalid input)             |
| 401         | Unauthorized (Missing or invalid token) |
| 403         | Forbidden (Insufficient permissions)    |
| 404         | Not Found (Resource doesn't exist)      |
| 500         | Internal Server Error                   |
