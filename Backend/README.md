# School Payment Dashboard – Transaction Management API

A Node.js + Express-based backend application to manage user authentication and school transaction processing with webhook support and JWT-based security.

## Setup & Installation

### Prerequisites

- Node.js (v14 or higher)
- npm
- MongoDB Atlas (or local MongoDB)

### Steps

```bash
# Clone the repository
git clone https://github.com/Meet1306/School-Payment-Dashboard.git

# Navigate into the backend folder
cd backend

# Install dependencies
npm install

# Create a .env file (see below)

# Start the server
node index.js
```

## Environment Variables

Create a `.env` file in the backend root directory:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
API_KEY=your_edviron_api_key
CALLBACK_URL=https://yourfrontend.com/payment-result
pg_key=your_pg_secret_key
```

> ⚠️ Make sure `.env` is listed in your `.gitignore`.

## API Endpoints

### Base URL

```
http://localhost:5000/api/
```

### User Routes

| Method | Endpoint         | Description         |
| ------ | ---------------- | ------------------- |
| POST   | `/user/register` | Register a new user |
| POST   | `/user/login`    | User login & JWT    |

### Transaction Routes (JWT Required)

Set header: `Authorization: Bearer <token>`

| Method | Endpoint                                     | Description                     |
| ------ | -------------------------------------------- | ------------------------------- |
| POST   | `/transactions/create-payment`               | Create new payment request      |
| GET    | `/transactions/`                             | Fetch all transactions          |
| GET    | `/transactions/school/:school_id`            | Fetch transactions by school ID |
| GET    | `/transactions/transaction-status/:order_id` | Get status by custom order ID   |

### Webhook Route (called by Payment Gateway)

| Method | Endpoint   | Description                        |
| ------ | ---------- | ---------------------------------- |
| POST   | `/webhook` | Receives real-time payment updates |

#### Example Webhook Payload

```json
{
  "order_info": {
    "order_id": "abc123",
    "order_amount": 1000,
    "transaction_amount": 1020,
    "payment_mode": "upi",
    "payment_details": "success@ybl",
    "bank_reference": "YESBNK222",
    "payment_message": "Payment Successful",
    "status": "success",
    "error_message": "NA",
    "payment_time": "2025-04-23T08:14:21.945+00:00",
    "gateway": "PhonePe"
  }
}
```

## Sample API Usage

### Create Payment

```http
POST /transactions/create-payment
```

Request:

```json
{
  "school_id": "65b0e6293e9f76a9694d84b4",
  "trustee_id": "608d1f...abc",
  "amount": "1000",
  "gateway_name": "PhonePe",
  "student_id": "meet",
  "student_id": "au1",
  "student_email": "meet@ahduni.edu.in"
}
```

Response:

```json
{
  "collect_request_id": "abc123",
  "collect_request_url": "https://pay.edviron.com/abc123",
  "sign": "eyJhbGciOiJIUzI1NiJ9..."
}
```

### Get Transactions by School

```http
GET /transactions/school/65b0e6293e9f76a9694d84b4
```

Response:

```json
{
  "transactions": [
    {
      "_id": "680fa5bca016a40af15fc160",
      "txId": "680fa5bdd155691054fe306a",
      "trustee_id": "trustee2",
      "student_info": {
        "name": "meet",
        "id": "au1",
        "email": "meet@ahduni.edu.in"
      },
      "status": "Failed"
    },
    {
      "_id": "680faceefa844b80a1c9a852",
      "txId": "680facefd155691054fe308c",
      "trustee_id": "trustee3",
      "student_info": {
        "name": "meet",
        "id": "au1",
        "email": "meet@ahduni.edu.in"
      },
      "status": "Success"
    }
  ],
  "pagination": {
    "totalTransactions": 14,
    "totalPages": 7,
    "currentPage": 2,
    "hasNextPage": true,
    "hasPreviousPage": true
  }
}
```

### Check Transaction Status

```http
GET /transactions/transaction-status/6613abc1234def5678ghi901
```

Response:

```json
{
  "_id": "680fa5daa016a40af15fc163",
  "collect_id": "680fa5bdd155691054fe306a",
  "order_amount": 70,
  "transaction_amount": 70,
  "payment_mode": "Online",
  "payment_details": "failed@gpay",
  "payment_message": "payment success",
  "status": "Failed",
  "error_message": "Bank Server Erre",
  "payment_time": "2025-04-23T08:14:21.945Z",
  "createdAt": "2025-04-28T15:59:22.511Z",
  "updatedAt": "2025-04-28T15:59:22.511Z",
  "__v": 0
}
```

## Postman Collection for Testing

You can test all API endpoints using the Postman collection below:

🔗 [Download Postman Collection](./docs/edviron-postman-collection.json)

Included:

- Create Payment
- Simulate Webhook
- Fetch All Transactions
- Fetch by School ID
- Check Transaction Status

## Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- TailwindCSS (Frontend)
- React.js (Frontend)
- Webhook Integration
- Axios & React Router (Frontend)

## License

This project is licensed under the MIT License.
