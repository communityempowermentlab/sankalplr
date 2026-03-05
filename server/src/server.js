const app = require('./app');
const pool = require('./config/db');

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  try {
    const connection = await pool.getConnection();
    console.log('Connected to MySQL Database (sankalplr) successfully.');
    connection.release();
  } catch (error) {
    console.error('Failed to connect to the database:', error.message);
  }
});
