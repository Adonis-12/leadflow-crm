
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

const { default: app } = await import('./app.js');

app.listen(PORT, () => {
  console.log(`LeadFlow API running on port ${PORT}`);
});
