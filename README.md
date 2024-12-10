# Coy Chatbot with Dynamic Traits and AI Suggestions

This project is a fully interactive chatbot built using React for the frontend and Flask for the backend, powered by the Groq API. The chatbot allows users to select personality traits that affect the chatbot's responses, generate AI-powered dynamic suggestions, and maintain chat history across sessions.

## Features

- **Dynamic Trait-Based Responses:** The chatbot tailors its responses based on selected personality traits.
- **AI Suggestions:** Automatically generate relevant follow-up questions or actions.
- **Feedback System:** Collect feedback on AI responses for continuous improvement.
- **Chat History:** Save and load chats from local storage.
- **Multi-Session Support:** Create and manage multiple chat sessions.
- **Interactive UI:** Icons, avatars, and smooth UI components for better user experience.

## Technologies Used

- **Frontend:** React, Axios, CSS, React Icons
- **Backend:** Flask, Flask-CORS
- **Database:** MySQL (via Prisma)
- **AI Model:** Groq API (Llama-based model)

## Installation

### Prerequisites

- Node.js (for frontend)
- Python 3.x (for backend)
- Groq API Key (to be included in `config.json`)
- Prisma CLI installed globally (run `npm install -g prisma`)

### Clone the Repository

To clone the repository, run the following command:

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### Frontend Setup

1. **Navigate to the Frontend Folder:**

   ```bash
   cd frontend
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Run the React App:**

   ```bash
   npm start
   ```

### Backend Setup

1. **Navigate to the Backend Folder:**

   ```bash
   cd backend
   ```

2. **Create a Virtual Environment (optional):**

   ```bash
   python -m venv venv
   ```

   To activate the virtual environment, use:

   - **On macOS and Linux:**
     ```bash
     source venv/bin/activate
     ```

   - **On Windows:**
     ```bash
     venv\Scripts\activate
     ```

3. **Install Required Packages:**

   ```bash
   pip install -r requirements.txt
   ```

4. **Set Up Environment Variables:**

   Create a `.env` file in the backend folder and set the necessary environment variables. You can use the provided `.env.example` file as a reference:

   ```plaintext
   APP_URL="http://localhost:3000"
   DATABASE_URL="mysql://root:root@127.0.0.1:3306/testauth"
   SECRET="your-secret-key"
   GOOGLE_ID="your-google-id"
   GOOGLE_SECRET="your-google-secret"
   FACEBOOK_CLIENT_ID="your-facebook-client-id"
   FACEBOOK_CLIENT_SECRET="your-facebook-client-secret"
   EMAIL_USERNAME="your-email-username"
   EMAIL_FROM="your-email-from"
   EMAIL_PASSWORD="your-email-password"
   ```

5. **Set Up Prisma:**

   Initialize Prisma and create the database schema:

   ```bash
   npx prisma init
   ```

   This will create a `prisma` folder with a `schema.prisma` file. Replace the content of the `schema.prisma` file with your provided schema:

   ```prisma
   // This is your Prisma schema file,
   // learn more about it in the docs: https://pris.ly/d/prisma-schema

   generator client {
     provider = "prisma-client-js"
   }

   datasource db {
     provider = "mysql"
     url      = env("DATABASE_URL")
   }

   enum Role {
     user
     admin
   }

   model User {
     id                String      @id @default(cuid()) // MySQL doesn't use ObjectId, so we'll use cuid or uuid instead
     name              String?
     email             String?     @unique
     emailVerified     Boolean?
     image             String?
     hashedPassword    String?
     resetToken        String?
     resetTokenExpiry  DateTime?
     role              Role        @default(user)
     createdAt         DateTime    @default(now())
     updatedAt         DateTime    @updatedAt
     accounts          Account[]
   }

   model Account {
     id                 String   @id @default(cuid()) // Replace ObjectId with cuid or uuid
     type               String
     provider           String
     providerAccountId  String
     refresh_token      String?
     access_token       String?
     expires_at         Int?
     token_type         String?
     scope              String?
     id_token           String?
     session_state      String?
     user               User     @relation(fields: [userId], references: [id], onDelete: Cascade)
     userId             String

     @@unique([provider, providerAccountId])
   }
   ```

   Run the following command to create the database:

   ```bash
   npx prisma migrate dev --name init
   ```

6. **Create a `config.json` File:**

   Create a file named `config.json` in the backend folder with the following content:

   ```json
   {
       "GROQ_API_KEY": "your_groq_api_key_here"
   }
   ```

7. **Run the Flask Server:**

   ```bash
   python app.py
   ```

## Usage

1. **Open your Web Browser:** Go to `http://localhost:3000` (or the port specified by your React app).

2. **Interact with the Chatbot:** Type your messages to the chatbot.

3. **Select Traits:** Use the left sidebar to select personality traits that influence the AI's responses.

4. **Utilize AI Suggestions:** Use the suggestions provided by the AI to continue the conversation.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any improvements or bug fixes. When contributing, please ensure to follow these guidelines:

- Ensure your code adheres to the existing code style.
- Write clear, concise commit messages.
- Include tests for any new features or changes.

## License

This project is licensed under the MIT License. For more details, see the LICENSE file.

## Acknowledgments

- Thanks to the creators of the Groq API for providing the AI model.
- Thanks to the React and Flask communities for their incredible resources and support.

---

### Customization Instructions

- Replace `your-username` and `your-repo-name` with your actual GitHub username and repository name.
- Update the `GROQ_API_KEY` in the `config.json` section with your actual API key information.

---