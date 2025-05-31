# 🚀 Employee Growth & Performance Platform

A full-stack web application to help organizations nurture employee growth through training, project allocation, and real-time performance rewards.

Built with the **MERN Stack**: MongoDB, Express.js, React.js, and Node.js.

---

## 📁 Project Structure
root/
│
├── backend/       # Express.js server & MongoDB models
│   └── package.json
│
├── frontend/      # React.js client application
│   └── package.json
│
└── README.md
---

## 🛠️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name

2. Install Dependencies

cd backend
npm install

Open a new terminal and run:
cd frontend
npm install

3. Environment Variables

Create a .env file in the backend/ folder and add the following:
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
CLIENT_URL=http://localhost:3000

Create a .env file in the frontend/ folder and add:
REACT_APP_API_URL=http://localhost:5000/api

4. Run the Application

Start Backend 
cd backend
npm start

Start Frontend (Port 3000)
cd frontend
npm start

🧩 Features
	•	👨‍💼 Role-based access: Admin, Manager, Employee
	•	📚 Course creation, enrollment, and tracking
	•	🏆 Badge rewards for course and project completion
	•	📊 Performance metrics and progress tracking
	•	💸 Stripe payment integration for bonuses
	•	📁 Real-time project assignment and status updates

📦 Tech Stack
	•	Frontend: React.js, React Router, Axios
	•	Backend: Express.js, Node.js
	•	Database: MongoDB with Mongoose
	•	Authentication: JWT-based authentication
	•	Payments: Stripe API Integration

💡 Future Enhancements
	•	📈 Analytics dashboards
	•	📧 Email notifications
	•	🗓️ Gantt chart for project timelines
	•	🧠 AI-based skill recommendations

📄 License

This project is licensed under the MIT License.
