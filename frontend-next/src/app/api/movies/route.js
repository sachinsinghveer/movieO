import connectToMongo from '../../../../lib/connectDB';
import Movie from '../../../../models/Movie';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        await connectToMongo();
        const body = await request.json();

        console.log("Received Movie Data:", JSON.stringify(body, null, 2));

        // Basic validation
        if (!body.m_id) {
            return NextResponse.json({ success: false, message: 'Movie ID (m_id) is required' }, { status: 400 });
        }

        // Check if exists
        const existing = await Movie.findOne({ m_id: body.m_id });
        if (existing) {
            return NextResponse.json({ success: false, message: 'Movie with this ID already exists' }, { status: 409 });
        }

        // Sanitize Data Types to prevent Schema Cast Errors
        // Decimal128 expects string or number, but float->BigInt cast errors can happen if Mongoose gets confused.
        // We explicitly cast to String for high precision types.
        const movieData = {
            ...body,
            TotalCollection: body.TotalCollection ? String(body.TotalCollection) : undefined,
            budzet: body.budzet ? String(body.budzet) : undefined,
            advanceBookings: body.advanceBookings ? String(body.advanceBookings) : undefined,
        };

        const newMovie = await Movie.create(movieData);

        return NextResponse.json({ success: true, data: newMovie }, { status: 201 });
    } catch (error) {
        console.error('Error creating movie:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function GET(request) {
    try {
        await connectToMongo();
        // Fetch only m_id and title (if we had title, but we don't really have a title field in the schema presented? 
        // Wait, the schema has 'Tags', 'Reviews', etc. but no explicit 'title'?
        // Ah, 'm_id' is the main identifier. Let's just return m_ids.
        const movies = await Movie.find({}, 'm_id createdAt').sort({ createdAt: -1 });
        return NextResponse.json({ success: true, count: movies.length, data: movies });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        await connectToMongo();
        const body = await request.json();

        if (!body.m_id) {
            return NextResponse.json({ success: false, message: 'Movie ID (m_id) is required' }, { status: 400 });
        }

        const existing = await Movie.findOne({ m_id: body.m_id });
        if (!existing) {
            return NextResponse.json({ success: false, message: 'Movie not found' }, { status: 404 });
        }

        // Sanitize Data (Same as POST)
        // Explicitly cast Decimal128 compatible fields to String to avoid Mongoose BigInt casting errors
        const movieData = {
            ...body,
            TotalCollection: body.TotalCollection ? String(body.TotalCollection) : undefined,
            budzet: body.budzet ? String(body.budzet) : undefined,
            advanceBookings: body.advanceBookings ? String(body.advanceBookings) : undefined,
        };

        const updatedMovie = await Movie.findOneAndUpdate(
            { m_id: body.m_id },
            movieData,
            { new: true, runValidators: true }
        );

        return NextResponse.json({ success: true, data: updatedMovie });
    } catch (error) {
        console.error('Error updating movie:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
