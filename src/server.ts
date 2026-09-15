import app from './app';

// Hardcoded default for now — Step 07 introduces validated environment
// configuration (Zod) and this will be replaced by a proper config module.
const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
