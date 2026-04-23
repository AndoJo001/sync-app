import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Info } from "lucide-react";

export default function Toast({ message, type = "success", onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = setTimeout(() => setVisible(true), 10);
    const hide = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 3000);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);

  const config = {
    success: { bg: "#22c55e", icon: <CheckCircle size={15} /> },
    error: { bg: "#e53e3e", icon: <XCircle size={15} /> },
    info: { bg: "#363b6c", icon: <Info size={15} /> },
  };

  const { bg, icon } = config[type];

  return (
    <div
      className="fixed bottom-6 left-1/2 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-xs font-medium z-50"
      style={{
        background: bg,
        opacity: visible ? 1 : 0,
        transform: `translateX(-50%) translateY(${visible ? "0px" : "20px"})`,
        transition: "opacity 0.25s ease, transform 0.25s ease",
        whiteSpace: "nowrap",
      }}
    >
      {icon}
      {message}
    </div>
  );
}
