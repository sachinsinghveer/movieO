import Link from 'next/link';

import { OutlineButton } from '@/components/button/Button';
import HeroSlide from '@/components/hero-slide/HeroSlide';
import MovieList from '@/components/movie-list/MovieList';

import { category, movieType, tvType } from '@/api/tmdbApi';

export default function Home() {
  return (
    <>
      <HeroSlide />
      <div className="container">
        <div className="section mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Trending Movies</h2>
            <Link href="/movie">
              <OutlineButton className="small">View more</OutlineButton>
            </Link>
          </div>
          <MovieList category={category.movie} type={movieType.popular} />
        </div>

        <div className="section mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Top Rated Movies</h2>
            <Link href="/movie">
              <OutlineButton className="small">View more</OutlineButton>
            </Link>
          </div>
          <MovieList category={category.movie} type={movieType.top_rated} />
        </div>

        <div className="section mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Trending TV</h2>
            <Link href="/tv">
              <OutlineButton className="small">View more</OutlineButton>
            </Link>
          </div>
          <MovieList category={category.tv} type={tvType.popular} />
        </div>

        <div className="section mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Top Rated TV</h2>
            <Link href="/tv">
              <OutlineButton className="small">View more</OutlineButton>
            </Link>
          </div>
          <MovieList category={category.tv} type={tvType.top_rated} />
        </div>
      </div>
    </>
  );
}
