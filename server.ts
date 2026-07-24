import { startServer } from './src/backend/server';

startServer().catch((err) => {
  console.error('Failed to launch DairySphere server:', err);
  process.exit(1);
});
