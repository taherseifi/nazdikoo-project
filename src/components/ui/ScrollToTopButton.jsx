import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTopButton() {
  const [show, setShow] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;

      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

      setScrollProgress(progress);
      setShow(scrollTop > 200);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div
      className={`fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-50 transition-all duration-300 ${
        show
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-8 pointer-events-none"
      }`}
    >
      <button
        onClick={scrollToTop}
        aria-label="رفتن به بالای صفحه"
        className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg active:scale-95 sm:hover:scale-105 transition"
      >
        {/* حلقه وضعیت */}
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(
              #111111 0% ${scrollProgress}%,
              transparent ${scrollProgress}% 100%
            )`,
          }}
        />

        {/* خود دکمه */}
        <span className="absolute inset-[2px] rounded-full bg-blue-600 flex items-center justify-center">
          <ArrowUp size={18} className="text-white sm:w-5 sm:h-5" />
        </span>
      </button>
    </div>
  );
}