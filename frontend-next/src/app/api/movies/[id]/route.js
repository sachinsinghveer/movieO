import { NextResponse } from 'next/server';
import connectToMongo from '@/lib/connectDB';
import Movie from '@/models/Movie';

const sanitizeMongoData = (obj) => {
    return JSON.parse(JSON.stringify(obj, (key, value) => {
        if (typeof value === 'bigint') return value.toString();
        // Handle Decimal128 objects (common when using .lean())
        if (value && typeof value === 'object' && value.$numberDecimal) {
            return value.$numberDecimal;
        }
        return value;
    }));
};

export async function GET(request, { params }) {
    try {
        await connectToMongo();
        const { id } = await params;

        const movie = await Movie.findOne({ m_id: id }).lean(); // Added .lean()

        if (!movie) {
            return NextResponse.json(
                { success: false, message: 'Movie not found' },
                { status: 404 }
            );
        }

        const safeData = sanitizeMongoData(movie);

        return NextResponse.json({
            success: true,
            data: safeData
        });

    } catch (error) {
        console.error('Error fetching movie:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}