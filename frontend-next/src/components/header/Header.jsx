'use client';

import React, { useRef, useEffect } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

const logo = '/assets/tmovie.png';

const headerNav = [
    {
        display: 'Home',
        path: '/'
    },
    {
        display: 'Movies Collection',
        path: '/movie'
    },
    {
        display: 'TV Series Collection',
        path: '/tv'
    },
    {
        display: 'Admin',
        path: '/manage-data'
    }
];

const Header = () => {

    const pathname = usePathname();

    const headerRef = useRef(null);

    const active = headerNav.findIndex(e => e.path === pathname);

    useEffect(() => {
        const shrinkHeader = () => {
            if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
                headerRef.current.classList.add('bg-body');
                headerRef.current.classList.add('h-[5rem]');
                headerRef.current.classList.add('shadow-lg');
                headerRef.current.classList.remove('h-[8rem]');
                headerRef.current.classList.remove('bg-transparent');
            } else {
                headerRef.current.classList.remove('bg-body');
                headerRef.current.classList.remove('h-[5rem]');
                headerRef.current.classList.remove('shadow-lg');
                headerRef.current.classList.add('h-[8rem]');
                headerRef.current.classList.add('bg-transparent');
            }
        }
        window.addEventListener('scroll', shrinkHeader);
        return () => {
            window.removeEventListener('scroll', shrinkHeader);
        };
    }, []);

    return (
        <div ref={headerRef} className="fixed top-0 left-0 w-full z-[100] transition-all duration-300 ease-in-out h-[8rem] bg-transparent text-text" >
            <div className="flex items-center justify-between h-full container">
                <div className="flex items-center gap-2 font-semibold text-[2.5rem]">
                    <Image src={logo} alt="MovieApp" width={50} height={50} className="mr-2" />
                    <Link href="/">MovieApp</Link>
                </div>
                <ul className="flex items-center gap-8">
                    {
                        headerNav.map((e, i) => (
                            <li key={i} className={`text-xl font-medium cursor-pointer hover:text-main relative ${i === active ? 'text-main after:absolute after:bottom-[-5px] after:left-1/2 after:-translate-x-1/2 after:w-full after:h-[2px] after:bg-main' : ''}`}>
                                <Link href={e.path}>
                                    {e.display}
                                </Link>
                            </li>
                        ))
                    }
                </ul>
            </div>
        </div>
    );
}

export default Header
