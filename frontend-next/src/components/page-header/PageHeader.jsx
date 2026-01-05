const bg = '/assets/footer-bg.jpg';


const PageHeader = props => {
    return (
        <div className="pb-8 pt-32 px-0 mb-8 text-center relative bg-top bg-cover bg-no-repeat after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[100px] after:bg-gradient-to-t after:from-body after:to-transparent" style={{ backgroundImage: `url(${bg})` }}>
            <h2 className="relative z-[99] text-white text-[2rem] font-bold">{props.children}</h2>
        </div>
    );
}


export default PageHeader;

