import { Schema, model, Document } from 'mongoose';

interface IFishLog extends Document {
  userId: number;
  largeGroup: string;
  specie: string;
  coordenates: [number, number][];
  photo: string;
  lenght: number;
  weight: number;
  reviewed: boolean;
  reviewedBy: number;
  createdAt: Date;
  updatedAt: Date;
  updatedBy: number;
  deletedAt: Date;
  deletedBy: number;
}

const fishLogSchema = new Schema<IFishLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    largeGroup: {
      type: String,
      enum: ['escama', 'couro', 'arraia', 'outros'],
      required: false,
    },
    specie: {
      type: String,
      required: false,
    },
    coordenates: {
      type: [],
      required: false,
    },
    photo: {
      type: String,
      required: false,
    },
    lenght: {
      type: Number,
      required: false,
    },
    weight: {
      type: Number,
      required: false,
    },
    reviewed: {
      type: Boolean,
      default: false,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      required: false,
    },
    updatedBy: {
      type: [Schema.Types.ObjectId],
      required: false,
    },
    deletedAt: {
      type: Date,
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      required: false,
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

export default model<IFishLog>('FishLog', fishLogSchema);
