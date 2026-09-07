const mongoose = require('mongoose');

const mandiPredictionSchema = new mongoose.Schema(
  {
    mandi: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mandi',
      required: [true, 'Mandi reference is required'],
      index: true
    },
    crop: {
      type: String,
      required: [true, 'Crop name is required'],
      trim: true,
      lowercase: true
    },
    predictionDate: {
      type: Date,
      required: [true, 'Prediction date is required']
    },
    predictedPrice: {
      type: Number,
      required: [true, 'Predicted price is required'],
      min: [0, 'Predicted price cannot be negative']
    },
    predictionMin: {
      type: Number,
      default: null
    },
    predictionMax: {
      type: Number,
      default: null
    },
    modelVersion: {
      type: String,
      default: 'baseline'
    },
    dataSource: {
      type: String,
      enum: {
        values: ['ml_prediction', 'baseline_7d_avg', 'recent_modal', 'demo_data'],
        message: '{VALUE} is not a valid data source'
      },
      default: 'baseline_7d_avg'
    },
    dataSourceLabel: {
      type: String,
      default: 'Recent 7-Day Average (Estimated)'
    }
  },
  {
    timestamps: true
  }
);

mandiPredictionSchema.index({ mandi: 1, crop: 1, predictionDate: -1 });

mandiPredictionSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const MandiPrediction = mongoose.model('MandiPrediction', mandiPredictionSchema);

module.exports = MandiPrediction;
