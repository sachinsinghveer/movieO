import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: { type: String },
  comment: { type: String },
  rating: { type: Number }
}, { _id: false });

const movieSchema = new mongoose.Schema({
  m_id: { type: String, required: true, unique: true },
  slug: { type: String, unique: true, sparse: true }, // For SEO URLs
  title: { type: String }, // Store title in DB for faster slug lookups

  // FIX: Added a getter to convert Decimal128 to String automatically
  TotalCollection: {
    type: mongoose.Schema.Types.Decimal128,
    get: (v) => v ? v.toString() : null
  },

  LanguageWiseCollection: { type: mongoose.Schema.Types.Mixed },
  CountryWiseCollection: { type: mongoose.Schema.Types.Mixed },
  DayWiseCollection: { type: mongoose.Schema.Types.Mixed },

  Tags: [{ type: String }],
  Reviews: [reviewSchema],
  Popularity: { type: Number },
  OccupancyDayWise: { type: mongoose.Schema.Types.Mixed },

  // FIX: Added getters to convert BigInt to String automatically
  budzet: {
    type: mongoose.Schema.Types.BigInt,
    get: (v) => v ? v.toString() : null
  },

  advanceBookings: {
    type: mongoose.Schema.Types.BigInt,
    get: (v) => v ? v.toString() : null
  },

  inCinemas: { type: Boolean, default: false },
  isHOTYear: { type: Boolean, default: false },
  isUpcoming: { type: Boolean, default: false },
  carousel: { type: Boolean, default: false }

}, {
  timestamps: true,
  strict: false,
  // CRITICAL FIX: This ensures the 'get' functions above actually run
  // when converting the document to JSON for the API response.
  toJSON: { getters: true },
  toObject: { getters: true }
});

export default mongoose.models.Movie || mongoose.model('Movie', movieSchema);