'use client';

import React from 'react';
import { useParams } from 'next/navigation';

import PageHeader from '@/components/page-header/PageHeader';
import MovieGrid from '@/components/movie-grid/MovieGrid';
import { category as cate } from '../../../public/api/tmdbApi';

const Catalog = () => {
    const { category } = useParams();

    return (
        <>
            <PageHeader>
                {category === cate.movie ? 'Movies' : 'TV Series'}
            </PageHeader>
            <div className="container">
                <div className="section mb-12">
                    {category === cate.tv ? (
                        <div className="flex flex-col items-center justify-center py-40 space-y-4">
                            <div className="text-6xl animate-bounce">🚧</div>
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent uppercase tracking-tighter">
                                Under Development
                            </h2>
                            <p className="text-zinc-500 max-w-md text-center">
                                Our TV Series analytics and collection engine is currently being built. Check back soon for the full catalog!
                            </p>
                        </div>
                    ) : (
                        <MovieGrid category={category} />
                    )}
                </div>
            </div>
        </>
    );
}

export default Catalog;
