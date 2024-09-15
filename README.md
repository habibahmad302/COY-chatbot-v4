### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/chatbot.git
   ```

2. Navigate to the project directory:

   ```bash
   cd nextjs-chatbot
   ```

3. Install dependencies:

   ```bash
   npm install
   # or
   yarn
   ```

4. Configure your environment variables:

   - Copy `.env.example` to `.env` and fill in your database URL and authentication provider details.

5. Migrate scheme to DB `npx prisma db push` for MingoDB or `npx prisma migrate dev` for MySQL.

6. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```


