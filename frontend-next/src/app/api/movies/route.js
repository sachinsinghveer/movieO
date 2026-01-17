import { NextResponse } from 'next/server';
import connectToMongo from '@/lib/connectDB';
import Movie from '@/models/Movie';

/* =========================
   HELPER: Fix BigInt Serialization
========================= */
// This is required because 'Mixed' types might contain BigInts
// that the Schema getters cannot see.
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

/* =========================
   GET: Fetch All Movies
========================= */
export async function GET() {
    try {
        await connectToMongo();

        // .lean() converts Mongoose docs to Plain Objects immediately
        const movies = await Movie.find({}).lean().sort({ createdAt: 1 });

        // Sanitize to catch BigInts and Decimal128
        const safeData = sanitizeMongoData(movies);

        return NextResponse.json({
            success: true,
            data: safeData
        });

    } catch (error) {
        console.error('Error fetching movies:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

/* =========================
   POST: Create Movie
========================= */
export async function POST(request) {
    try {
        await connectToMongo();
        const body = await request.json();

        if (!body.m_id) {
            return NextResponse.json(
                { success: false, message: 'Movie ID (m_id) is required' },
                { status: 400 }
            );
        }

        const existing = await Movie.findOne({ m_id: body.m_id }).lean();
        if (existing) {
            return NextResponse.json(
                { success: false, message: 'Movie with this ID already exists' },
                { status: 409 }
            );
        }

        const newMovie = await Movie.create(body);

        // Sanitize the result before returning
        const safeData = sanitizeMongoData(newMovie);

        return NextResponse.json(
            { success: true, data: safeData },
            { status: 201 }
        );

    } catch (error) {
        console.error('Error creating movie:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

/* =========================
   PUT: Update Movie
========================= */
export async function PUT(request) {
    try {
        await connectToMongo();
        const body = await request.json();

        if (!body.m_id) {
            return NextResponse.json(
                { success: false, message: 'Movie ID (m_id) is required' },
                { status: 400 }
            );
        }

        const updatedMovie = await Movie.findOneAndUpdate(
            { m_id: body.m_id },
            body,
            { new: true, runValidators: true }
        ).lean(); // Added .lean()

        if (!updatedMovie) {
            return NextResponse.json(
                { success: false, message: 'Movie not found' },
                { status: 404 }
            );
        }

        // Sanitize the result before returning
        const safeData = sanitizeMongoData(updatedMovie);

        return NextResponse.json({
            success: true,
            data: safeData
        });

    } catch (error) {
        console.error('Error updating movie:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

/* =========================
   DELETE: Remove Movie
========================= */
export async function DELETE(request) {
    try {
        await connectToMongo();

        // Extract ID from URL params if possible, or from body
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('m_id');

        if (!id) {
            return NextResponse.json(
                { success: false, message: 'Movie ID (m_id) is required as a query parameter' },
                { status: 400 }
            );
        }

        const deletedMovie = await Movie.findOneAndDelete({ m_id: id });

        if (!deletedMovie) {
            return NextResponse.json(
                { success: false, message: 'Movie not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `Movie with ID ${id} deleted successfully`
        });

    } catch (error) {
        console.error('Error deleting movie:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}