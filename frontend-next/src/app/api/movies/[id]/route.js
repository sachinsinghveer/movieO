import connectToMongo from '../../../../lib/connectDB';
import Movie from '../../../../models/Movie';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    try {
        await connectToMongo();
        const { id } = params;

        const movie = await Movie.findOne({ m_id: id });

        if (!movie) {
            return NextResponse.json({ success: false, message: 'Movie not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: movie });
    } catch (error) {
        console.error('Error fetching movie:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
