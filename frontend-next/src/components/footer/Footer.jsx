import Link from 'next/link';
import Image from 'next/image';

const bg = '/assets/footer-bg.jpg';
const logo = '/assets/tmovie.png';

const Footer = () => {
    return (
        <div className="relative pt-24 pb-16 bg-top bg-cover bg-no-repeat text-white" style={{ backgroundImage: `url(${bg})` }}>

            <div className="max-w-[1000px] w-full mx-auto px-8">
                <div className="flex items-center justify-center mb-12">
                    <div className="flex items-center gap-2 font-semibold text-[2.5rem]">
                        <Image src={logo} alt="MovieApp" width={50} height={50} className="mr-2" />
                        <Link href="/">MovieApp</Link>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                    <div className="flex flex-col items-start text-2xl font-semibold mt-4">
                        <Link href="/" className="hover:text-main mt-4">Home</Link>
                        <Link href="/" className="hover:text-main mt-4">Contact us</Link>
                        <Link href="/" className="hover:text-main mt-4">Term of services</Link>
                        <Link href="/" className="hover:text-main mt-4">About us</Link>
                    </div>
                    <div className="flex flex-col items-start text-2xl font-semibold mt-4">
                        <Link href="/" className="hover:text-main mt-4">Live</Link>
                        <Link href="/" className="hover:text-main mt-4">FAQ</Link>
                        <Link href="/" className="hover:text-main mt-4">Premium</Link>
                        <Link href="/" className="hover:text-main mt-4">Pravacy policy</Link>
                    </div>
                    <div className="flex flex-col items-start text-2xl font-semibold mt-4">
                        <Link href="/" className="hover:text-main mt-4">You must watch</Link>
                        <Link href="/" className="hover:text-main mt-4">Recent release</Link>
                        <Link href="/" className="hover:text-main mt-4">Top IMDB</Link>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Footer;

