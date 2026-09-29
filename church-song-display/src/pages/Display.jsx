import { useEffect, useState } from "react";

export default function Display() {
  const [slide, setSlide] = useState(null);

  useEffect(() => {
    const removeSlideListener = window.churchAPI.display.onSlide(
      (slideData) => {
        setSlide(slideData);
      },
    );

    const removeClearListener = window.churchAPI.display.onClear(() => {
      setSlide(null);
    });

    return () => {
      removeSlideListener();

      removeClearListener();
    };
  }, []);

  if (!slide) {
    return (
      <div className="projection-screen">
        <div className="display-credit">Made with ❤️ by STCM Tech Team</div>
      </div>
    );
  }

  return (
    <div className="projection-screen">
      <div className="projection-title">{slide.title}</div>

      <div className="projection-lyrics">{slide.content}</div>

      <div className="display-credit">Made with ❤️ by STCM Tech Team</div>
    </div>
  );
}
