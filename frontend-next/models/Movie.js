import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: { type: String },
  comment: { type: String },
  rating: { type: Number }
}, { _id: false });

const movieSchema = new mongoose.Schema({
  m_id: { type: String, required: true, unique: true },
  TotalCollection: { type: mongoose.Schema.Types.Decimal128 },
  LanguageWiseCollection: { type: mongoose.Schema.Types.Mixed },
  CountryWiseCollection: { type: mongoose.Schema.Types.Mixed },
  DayWiseCollection: { type: mongoose.Schema.Types.Mixed },
  Tags: [{ type: String }],
  Reviews: [reviewSchema],
  Popularity: { type: Number },
  OccupancyDayWise: { type: mongoose.Schema.Types.Mixed },
  budzet: { type: mongoose.Schema.Types.BigInt },
  inCinemas: { type: Boolean, default: false },
  isHOTYear: { type: Boolean, default: false },
  isUpcoming: { type: Boolean, default: false },
  carousel: { type: Boolean, default: false },
  advanceBookings: { type: mongoose.Schema.Types.BigInt }
}, { timestamps: true, strict: false });

export default mongoose.models.Movie || mongoose.model('Movie', movieSchema);
