
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());


// Return clean 400 for malformed JSON instead of dumping a stack trace
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ success: false, message: 'Invalid JSON in request body' });
  }
  next(err);
});


// 1. IMPORT ROUTE FILES
const wardRoutes = require('./routes/wards.routes');
const resourceRoutes = require('./routes/resources.routes');
const riskRoutes = require('./routes/risk.routes');
const alertRoutes = require('./routes/alerts.routes');
const simulateRoutes = require('./routes/simulate.routes');
const feedbackRoutes = require('./routes/feedback.routes');
const { startWatcher } = require('./jobs/riskWatcher.cron');


// 2. MOUNT ROUTES TO EXACT URL PATHS
app.use('/api/wards', wardRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/risk', riskRoutes); 
app.use('/api/alerts', alertRoutes);
app.use('/api/simulate', simulateRoutes);
app.use('/api/feedback', feedbackRoutes);

app.use(errorHandler);

app.get('/', (req, res) => {
  res.json({ message: "Urban Heatwave API is running!" });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Local MongoDB Connected successfully");

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    startWatcher();
  })
  .catch((err) => console.error("MongoDB Connection Error:", err));